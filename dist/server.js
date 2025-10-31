import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import Database from './lib/database.js';
import { UserModel } from './lib/models/User.js';
import { MessageModel } from './lib/models/Message.js';
// RequestModel is used inside AIController
import { AIController } from './lib/ai/AIController.js';
import { PendingChangeModel } from './lib/models/PendingChange.js';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
// Socket.IO setup (disabled for serverless - requires persistent connections)
// In serverless environments, Socket.IO won't work properly
// Consider using a separate WebSocket service or polling-based alternatives
let server = null;
let io = null;
// Only initialize Socket.IO if not in serverless environment
// Check if we're in a serverless context
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
// Initialize Socket.IO server if not in serverless
function initializeSocketIO() {
    if (!isServerless) {
        // For local development or non-serverless deployments
        server = createServer(app);
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            path: '/chat/socket.io/'
        });
        // Setup Socket.IO handlers
        if (io) {
            setupSocketIO(io);
        }
    }
}
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
// Initialize database and models
const db = new Database();
const userModel = new UserModel(db);
const messageModel = new MessageModel(db);
const pendingChangeModel = new PendingChangeModel(db);
// requestModel is created inside AIController
const aiController = new AIController(db);
// Store active users (only used when Socket.IO is active)
const activeUsers = new Map();
const userSockets = new Map(); // username -> socketId
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'gummybear-secret-key';
// Setup Socket.IO (only when not in serverless)
function setupSocketIO(socketIO) {
    // Middleware to authenticate socket connections
    socketIO.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user || user.status !== 'approved') {
                return next(new Error('User not found or not approved'));
            }
            socket.data.user = user;
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    });
    // Socket.IO connection handling
    socketIO.on('connection', (socket) => {
        const user = socket.data.user;
        console.log(`User ${user.username} connected`);
        // Store user as active
        activeUsers.set(user.username, {
            socketId: socket.id,
            user: user,
            lastSeen: new Date()
        });
        userSockets.set(user.username, socket.id);
        // Join user to their personal room
        socket.join(`user:${user.username}`);
        // Join global chat room
        socket.join('global');
        // Send online users list to all clients
        broadcastOnlineUsers();
        // Handle setting username (for initial login)
        socket.on('set-username', async (data) => {
            try {
                const { username, password } = data;
                // Try to authenticate
                const authenticatedUser = await userModel.authenticate(username, password);
                if (authenticatedUser) {
                    // Generate JWT token
                    const token = jwt.sign({ userId: authenticatedUser.id, username: authenticatedUser.username }, JWT_SECRET, { expiresIn: '24h' });
                    socket.emit('username-accepted', authenticatedUser.username);
                    socket.emit('token', token);
                    socket.emit('user-data', {
                        id: authenticatedUser.id,
                        username: authenticatedUser.username,
                        role: authenticatedUser.role,
                        status: authenticatedUser.status,
                        created_at: authenticatedUser.created_at,
                        last_seen: authenticatedUser.last_seen || new Date().toISOString()
                    });
                }
                else {
                    // Check if user exists but password is wrong
                    // const existingUser = await userModel.findById(0); // This is a hack, we need a better way
                    socket.emit('username-error', 'Invalid username or password');
                }
            }
            catch (error) {
                console.error('Username setting error:', error);
                socket.emit('username-error', 'Authentication failed');
            }
        });
        // Handle chat messages
        socket.on('chat-message', async (message) => {
            try {
                if (!user || !message.trim())
                    return;
                // Check if user can type
                if (!userModel.canType(user)) {
                    socket.emit('error', 'You do not have permission to send messages');
                    return;
                }
                // Save message to database
                const success = await messageModel.create(user.id, message, 'global');
                if (success) {
                    // Broadcast to all users in global chat
                    socketIO.to('global').emit('chat-message', {
                        username: user.username,
                        message: message,
                        timestamp: new Date().toISOString(),
                        role: user.role
                    });
                }
            }
            catch (error) {
                console.error('Chat message error:', error);
                socket.emit('error', 'Failed to send message');
            }
        });
        // Handle direct messages
        socket.on('dm-message', async (data) => {
            try {
                const { targetUsername, message } = data;
                if (!user || !message.trim())
                    return;
                // Check if user can type
                if (!userModel.canType(user)) {
                    socket.emit('error', 'You do not have permission to send messages');
                    return;
                }
                // Check if target user exists and is online
                const targetSocketId = userSockets.get(targetUsername);
                if (!targetSocketId) {
                    socket.emit('dm-error', 'User not found or offline');
                    return;
                }
                // Save DM to database
                const success = await messageModel.create(user.id, message, 'dm', undefined, // We'll need to get the target user's ID
                'text');
                if (success) {
                    // Send to target user
                    socketIO.to(targetSocketId).emit('dm-message', {
                        from: user.username,
                        to: targetUsername,
                        message: message,
                        timestamp: new Date().toISOString()
                    });
                    // Send confirmation to sender
                    socket.emit('dm-message', {
                        from: user.username,
                        to: targetUsername,
                        message: message,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            catch (error) {
                console.error('DM message error:', error);
                socket.emit('dm-error', 'Failed to send message');
            }
        });
        // Handle getting online users
        socket.on('get-online-users', () => {
            const onlineUsers = Array.from(activeUsers.keys());
            socket.emit('online-users', onlineUsers);
        });
        // AI Control Handlers (only for support/king/admin roles)
        if (user.role === 'support' || user.role === 'king' || user.role === 'admin') {
            // AI can get full context
            socket.on('ai-get-context', async () => {
                try {
                    const context = await aiController.getFullContext();
                    socket.emit('ai-context', context);
                }
                catch (error) {
                    console.error('AI context error:', error);
                    socket.emit('ai-error', 'Failed to get context');
                }
            });
            // AI can execute actions
            socket.on('ai-action', async (data) => {
                try {
                    const isKing = user.role === 'king';
                    const result = await aiController.executeAction(data.action, data.params, user.id, isKing);
                    // Broadcast result
                    socket.emit('ai-action-result', {
                        action: data.action,
                        success: true,
                        result
                    });
                    // If change is pending, notify king
                    if (result.pending && isKing === false) {
                        // Notify all king users
                        activeUsers.forEach((userData, username) => {
                            if (userData.user.role === 'king') {
                                const kingSocket = socketIO.sockets.sockets.get(userSockets.get(username));
                                if (kingSocket) {
                                    kingSocket.emit('pending-change-created', result);
                                }
                            }
                        });
                    }
                    // If action was to send a message, broadcast it
                    if (data.action === 'send_message') {
                        socketIO.to('global').emit('chat-message', {
                            username: 'GummyBear AI',
                            message: data.params.content,
                            timestamp: new Date().toISOString(),
                            role: 'support'
                        });
                    }
                }
                catch (error) {
                    console.error('AI action error:', error);
                    socket.emit('ai-action-result', {
                        action: data.action,
                        success: false,
                        error: error.message
                    });
                }
            });
            // AI can get capabilities
            socket.on('ai-capabilities', () => {
                socket.emit('ai-capabilities', aiController.getCapabilities());
            });
        }
        // King-only handlers
        if (user.role === 'king') {
            // Get pending changes
            socket.on('get-pending-changes', async () => {
                try {
                    const changes = await pendingChangeModel.getAllPending();
                    socket.emit('pending-changes', changes);
                }
                catch (error) {
                    console.error('Get pending changes error:', error);
                    socket.emit('error', 'Failed to get pending changes');
                }
            });
            // Approve pending change
            socket.on('approve-change', async (data) => {
                try {
                    await pendingChangeModel.approve(data.changeId, user.id);
                    await aiController.executeApprovedChange(data.changeId);
                    socket.emit('change-approved', { changeId: data.changeId });
                    // Notify all clients about updated pending changes
                    socketIO.emit('pending-changes-updated');
                }
                catch (error) {
                    console.error('Approve change error:', error);
                    socket.emit('error', 'Failed to approve change');
                }
            });
            // Reject pending change
            socket.on('reject-change', async (data) => {
                try {
                    await pendingChangeModel.reject(data.changeId, user.id);
                    socket.emit('change-rejected', { changeId: data.changeId });
                    // Notify all clients about updated pending changes
                    socketIO.emit('pending-changes-updated');
                }
                catch (error) {
                    console.error('Reject change error:', error);
                    socket.emit('error', 'Failed to reject change');
                }
            });
        }
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User ${user.username} disconnected`);
            // Remove from active users
            activeUsers.delete(user.username);
            userSockets.delete(user.username);
            // Broadcast updated online users
            broadcastOnlineUsers();
        });
    }
    // Helper function to broadcast online users (only when Socket.IO is active)
    , 
    // Helper function to broadcast online users (only when Socket.IO is active)
    function broadcastOnlineUsers() {
        if (io) {
            const onlineUsers = Array.from(activeUsers.keys());
            io.emit('online-users', onlineUsers);
        }
    }
    // Initialize Socket.IO after setupSocketIO is defined
    , 
    // Initialize Socket.IO after setupSocketIO is defined
    initializeSocketIO());
    // API Routes
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // AI Control API Endpoints
    app.post('/api/ai/action', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user || !['support', 'king', 'admin'].includes(user.role)) {
                return res.status(403).json({ error: 'AI access restricted' });
            }
            const { action, params } = req.body;
            const isKing = user.role === 'king';
            const result = await aiController.executeAction(action, params, user.id, isKing);
            res.json({ success: true, result });
        }
        catch (error) {
            console.error('AI API error:', error);
            res.status(500).json({ error: 'Failed to execute AI action' });
        }
    });
    app.get('/api/ai/context', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user || !['support', 'king', 'admin'].includes(user.role)) {
                return res.status(403).json({ error: 'AI access restricted' });
            }
            const context = await aiController.getFullContext();
            res.json(context);
        }
        catch (error) {
            console.error('AI context error:', error);
            res.status(500).json({ error: 'Failed to get context' });
        }
    });
    app.get('/api/ai/capabilities', (_req, res) => {
        res.json(aiController.getCapabilities());
    });
    // King-only API endpoints for pending changes
    app.get('/api/pending-changes', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user || user.role !== 'king') {
                return res.status(403).json({ error: 'King access only' });
            }
            const changes = await pendingChangeModel.getAllPending();
            res.json(changes);
        }
        catch (error) {
            console.error('Get pending changes error:', error);
            res.status(500).json({ error: 'Failed to get pending changes' });
        }
    });
    app.post('/api/pending-changes/:id/approve', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user || user.role !== 'king') {
                return res.status(403).json({ error: 'King access only' });
            }
            const changeId = parseInt(req.params.id);
            await pendingChangeModel.approve(changeId, user.id);
            await aiController.executeApprovedChange(changeId);
            res.json({ success: true, message: 'Change approved and executed' });
        }
        catch (error) {
            console.error('Approve change error:', error);
            res.status(500).json({ error: 'Failed to approve change' });
        }
    });
    app.post('/api/pending-changes/:id/reject', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userModel.findById(decoded.userId);
            if (!user || user.role !== 'king') {
                return res.status(403).json({ error: 'King access only' });
            }
            const changeId = parseInt(req.params.id);
            await pendingChangeModel.reject(changeId, user.id);
            res.json({ success: true, message: 'Change rejected' });
        }
        catch (error) {
            console.error('Reject change error:', error);
            res.status(500).json({ error: 'Failed to reject change' });
        }
    });
    // Serve static files from React build (adjust path for serverless)
    const staticPath = isServerless
        ? path.join(__dirname, '../client')
        : path.join(__dirname, '../client');
    app.use(express.static(staticPath));
    // Serve the main app (React)
    app.get('*', (_req, res) => {
        try {
            res.sendFile(path.join(__dirname, '../client/index.html'));
        }
        catch (error) {
            console.error('Error serving index.html:', error);
            res.status(404).json({ error: 'Frontend not found. Please build the frontend first.' });
        }
    });
    // Initialize database tables (run once on cold start)
    let dbInitialized = false;
    async function ensureDbInitialized() {
        if (!dbInitialized) {
            try {
                await db.createTables();
                dbInitialized = true;
                console.log('✅ Database tables initialized');
            }
            catch (error) {
                console.error('❌ Failed to initialize database:', error);
                // Don't throw - allow function to continue
            }
        }
    }
    // Database initialization will happen in the handler on first request
    // Note: Socket.IO has limitations in serverless environments
    // WebSocket connections require persistent connections which serverless doesn't support
    // Consider using polling transport or a separate service for Socket.IO
    // Vercel serverless function handler
    // Vercel's @vercel/node builder automatically handles Express apps
    // but we export a handler for explicit control
    export default async function handler(req, res) {
        // Initialize database on first request
        await ensureDbInitialized();
        // Handle all requests through Express
        return app(req, res, () => {
            // Fallback if no route matches
            if (!res.headersSent) {
                res.status(404).json({ error: 'Not found' });
            }
        });
    }
    // Export app for direct use (Vercel's builder also accepts this)
    export { app };
}
