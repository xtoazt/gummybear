import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import Database from './lib/database';
import { UserModel } from './lib/models/User';
import { MessageModel } from './lib/models/Message';
// import { RequestModel } from './lib/models/Request';
import jwt from 'jsonwebtoken';
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/chat/socket.io/'
});
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
// Initialize database and models
const db = new Database();
const userModel = new UserModel(db);
const messageModel = new MessageModel(db);
// const requestModel = new RequestModel(db);
// Store active users
const activeUsers = new Map();
const userSockets = new Map(); // username -> socketId
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'gummybear-secret-key';
// Middleware to authenticate socket connections
io.use(async (socket, next) => {
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
io.on('connection', (socket) => {
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
                io.to('global').emit('chat-message', {
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
                io.to(targetSocketId).emit('dm-message', {
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
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User ${user.username} disconnected`);
        // Remove from active users
        activeUsers.delete(user.username);
        userSockets.delete(user.username);
        // Broadcast updated online users
        broadcastOnlineUsers();
    });
});
// Helper function to broadcast online users
function broadcastOnlineUsers() {
    const onlineUsers = Array.from(activeUsers.keys());
    io.emit('online-users', onlineUsers);
}
// API Routes
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Serve the main app
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});
// Initialize database and start server
async function startServer() {
    try {
        // Create tables
        await db.createTables();
        console.log('✅ Database tables created successfully');
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`🍭 GummyBear server running on port ${PORT}`);
            console.log(`🔗 Socket.IO available at /chat/socket.io/`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
export { app, server, io };
