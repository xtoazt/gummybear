import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from './lib/database.js';
import { UserModel } from './lib/models/User.js';
import { MessageModel } from './lib/models/Message.js';
import { AIController } from './lib/ai/AIController.js';
import { PendingChangeModel } from './lib/models/PendingChange.js';
import jwt from 'jsonwebtoken';
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
// Initialize database and models
const db = new Database();
const userModel = new UserModel(db);
const messageModel = new MessageModel(db);
const pendingChangeModel = new PendingChangeModel(db);
const aiController = new AIController(db);
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
// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for theme
}));
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Middleware to ensure database is initialized on first request
app.use(async (_req, _res, next) => {
    await ensureDbInitialized();
    next();
});
// Static files are served from client directory
// Store active peers for WebRTC signaling
// Format: { peerId: { userId, username, role, lastSeen, signalingData } }
const activePeers = new Map();
// Cleanup inactive peers (older than 30 seconds)
setInterval(() => {
    const now = new Date();
    for (const [peerId, peer] of activePeers.entries()) {
        if (now.getTime() - peer.lastSeen.getTime() > 30000) {
            activePeers.delete(peerId);
        }
    }
}, 10000);
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'gummybear-secret-key';
// Middleware to authenticate requests
async function authenticateRequest(req) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') ||
            req.body.token ||
            req.query.token;
        if (!token) {
            return null;
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        if (!user || user.status !== 'approved') {
            return null;
        }
        return user;
    }
    catch (err) {
        return null;
    }
}
// API Routes
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const authenticatedUser = await userModel.authenticate(username, password);
        if (authenticatedUser) {
            // Generate JWT token
            const token = jwt.sign({ userId: authenticatedUser.id, username: authenticatedUser.username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({
                success: true,
                token,
                user: {
                    id: authenticatedUser.id,
                    username: authenticatedUser.username,
                    role: authenticatedUser.role,
                    status: authenticatedUser.status,
                    created_at: authenticatedUser.created_at,
                    last_seen: authenticatedUser.last_seen || new Date().toISOString()
                }
            });
        }
        else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});
// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        // Check if user already exists
        const existingUser = await userModel.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        // Create new user (status will be 'pending' by default)
        const userId = await userModel.create(username, password);
        if (userId) {
            // Auto-approve for now (can be changed to require admin approval)
            const newUser = await userModel.findById(userId);
            if (newUser) {
                // Generate JWT token
                const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
                res.json({
                    success: true,
                    token,
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        role: newUser.role,
                        status: newUser.status,
                        created_at: newUser.created_at,
                        last_seen: newUser.last_seen || new Date().toISOString()
                    },
                    message: 'Account created successfully'
                });
            }
            else {
                res.status(500).json({ error: 'Failed to create user account' });
            }
        }
        else {
            res.status(500).json({ error: 'Failed to create user account' });
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            res.status(409).json({ error: 'Username already exists' });
        }
        else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});
// WebRTC Signaling Endpoints
// Register/update peer presence
app.post('/api/signaling/register', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { peerId } = req.body;
        if (!peerId) {
            return res.status(400).json({ error: 'peerId required' });
        }
        activePeers.set(peerId, {
            userId: user.id,
            username: user.username,
            role: user.role,
            lastSeen: new Date()
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Register peer error:', error);
        res.status(500).json({ error: 'Failed to register peer' });
    }
});
// Get list of online peers
app.get('/api/signaling/peers', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const peers = Array.from(activePeers.entries()).map(([peerId, peer]) => ({
            peerId,
            username: peer.username,
            role: peer.role,
            userId: peer.userId
        }));
        res.json({ peers });
    }
    catch (error) {
        console.error('Get peers error:', error);
        res.status(500).json({ error: 'Failed to get peers' });
    }
});
// Store signaling offer
app.post('/api/signaling/offer', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { peerId, targetPeerId, offer } = req.body;
        if (!peerId || !targetPeerId || !offer) {
            return res.status(400).json({ error: 'peerId, targetPeerId, and offer required' });
        }
        const targetPeer = activePeers.get(targetPeerId);
        if (!targetPeer) {
            return res.status(404).json({ error: 'Target peer not found' });
        }
        // Store offer temporarily (in production, use Redis or database)
        targetPeer.signalingData = { type: 'offer', from: peerId, offer };
        activePeers.set(targetPeerId, targetPeer);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Store offer error:', error);
        res.status(500).json({ error: 'Failed to store offer' });
    }
});
// Store signaling answer
app.post('/api/signaling/answer', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { peerId, targetPeerId, answer } = req.body;
        if (!peerId || !targetPeerId || !answer) {
            return res.status(400).json({ error: 'peerId, targetPeerId, and answer required' });
        }
        const targetPeer = activePeers.get(targetPeerId);
        if (!targetPeer) {
            return res.status(404).json({ error: 'Target peer not found' });
        }
        // Store answer temporarily
        targetPeer.signalingData = { type: 'answer', from: peerId, answer };
        activePeers.set(targetPeerId, targetPeer);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Store answer error:', error);
        res.status(500).json({ error: 'Failed to store answer' });
    }
});
// Store ICE candidate
app.post('/api/signaling/ice-candidate', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { peerId, targetPeerId, candidate } = req.body;
        if (!peerId || !targetPeerId || !candidate) {
            return res.status(400).json({ error: 'peerId, targetPeerId, and candidate required' });
        }
        const targetPeer = activePeers.get(targetPeerId);
        if (!targetPeer) {
            return res.status(404).json({ error: 'Target peer not found' });
        }
        // Store ICE candidate
        if (!targetPeer.signalingData) {
            targetPeer.signalingData = { type: 'ice-candidate', candidates: [] };
        }
        if (!targetPeer.signalingData.candidates) {
            targetPeer.signalingData.candidates = [];
        }
        targetPeer.signalingData.candidates.push({ from: peerId, candidate });
        activePeers.set(targetPeerId, targetPeer);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Store ICE candidate error:', error);
        res.status(500).json({ error: 'Failed to store ICE candidate' });
    }
});
// Poll for signaling data (for serverless compatibility)
app.get('/api/signaling/poll/:peerId', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { peerId } = req.params;
        const peer = activePeers.get(peerId);
        if (peer && peer.signalingData) {
            const data = peer.signalingData;
            // Clear signaling data after retrieval
            peer.signalingData = undefined;
            activePeers.set(peerId, peer);
            res.json({ data });
        }
        else {
            res.json({ data: null });
        }
    }
    catch (error) {
        console.error('Poll signaling error:', error);
        res.status(500).json({ error: 'Failed to poll signaling data' });
    }
});
// Chat message endpoint (messages go through database, then peers sync via WebRTC)
app.post('/api/chat/message', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!userModel.canType(user)) {
            return res.status(403).json({ error: 'You do not have permission to send messages' });
        }
        const { message, channel = 'global' } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message required' });
        }
        // Save message to database
        const success = await messageModel.create(user.id, message, channel);
        if (success) {
            res.json({
                success: true,
                message: {
                    username: user.username,
                    message: message,
                    timestamp: new Date().toISOString(),
                    role: user.role
                }
            });
        }
        else {
            res.status(500).json({ error: 'Failed to save message' });
        }
    }
    catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
// Get recent messages
app.get('/api/chat/messages', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const channel = req.query.channel || 'global';
        const limit = parseInt(req.query.limit) || 50;
        // Get messages from database
        const messages = await messageModel.getChannelMessages(channel, limit);
        res.json({ messages });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});
// Vulnerability Scan API Endpoints
app.post('/api/vulnerability/scan', async (req, res) => {
    try {
        const systemInfo = req.body;
        // Generate scan ID
        const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Store scan data (in production, use database)
        // For now, we'll store it in memory and potentially save to database
        try {
            // Store scan data in database if possible
            await db.query(`INSERT INTO vulnerability_scans (scan_id, system_info, created_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (scan_id) DO UPDATE SET system_info = $2`, [scanId, JSON.stringify(systemInfo)]);
            // Automatically trigger vulnerability analysis
            try {
                await aiController.analyzeVulnerabilityScan(scanId);
                console.log(`✅ Vulnerability scan ${scanId} analyzed`);
            }
            catch (analysisError) {
                console.log('Could not auto-analyze scan:', analysisError);
                // Analysis can be done later, that's ok
            }
        }
        catch (dbError) {
            // Table might not exist yet, that's ok
            console.log('Could not store scan in database:', dbError);
        }
        res.json({
            success: true,
            scanId,
            message: 'System scan data received and queued for analysis'
        });
    }
    catch (error) {
        console.error('Vulnerability scan error:', error);
        res.status(500).json({ error: 'Failed to process scan' });
    }
});
app.post('/api/vulnerability/verify', async (req, res) => {
    try {
        const { scanId } = req.body;
        if (!scanId) {
            return res.status(400).json({ verified: false, error: 'Scan ID required' });
        }
        // Check if scan exists
        try {
            const result = await db.query('SELECT scan_id FROM vulnerability_scans WHERE scan_id = $1', [scanId]);
            res.json({ verified: result.rows.length > 0 });
        }
        catch (dbError) {
            // If table doesn't exist, check localStorage on client side
            res.json({ verified: true }); // Allow if client has it in localStorage
        }
    }
    catch (error) {
        console.error('Verify scan error:', error);
        res.json({ verified: false });
    }
});
// AI Control API Endpoints
app.post('/api/ai/action', async (req, res) => {
    try {
        const user = await authenticateRequest(req);
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
        const user = await authenticateRequest(req);
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
        const user = await authenticateRequest(req);
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
        const user = await authenticateRequest(req);
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
        const user = await authenticateRequest(req);
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
// Serve static files from React build
// Use process.cwd() to get project root, then navigate to dist/client
// In Vercel: process.cwd() = /var/task, so client is at /var/task/dist/client
// Try multiple possible paths for flexibility
const possiblePaths = [
    path.join(process.cwd(), 'dist', 'client'),
    path.join(__dirname, '..', 'client'),
    path.join(process.cwd(), 'client'),
    path.join(__dirname, 'client')
];
let clientPath = possiblePaths[0];
let indexPath = null;
// Find the first path that exists
try {
    for (const testPath of possiblePaths) {
        const testIndexPath = path.join(testPath, 'index.html');
        try {
            if (fs.existsSync(testIndexPath)) {
                clientPath = testPath;
                indexPath = testIndexPath;
                console.log('✅ Found client files at:', clientPath);
                break;
            }
        }
        catch {
            // Continue to next path
        }
    }
    // If no path found, default to the first one (will error later if needed)
    if (!indexPath) {
        console.warn('⚠️ Could not find index.html in any of the expected paths, defaulting to:', clientPath);
        indexPath = path.join(clientPath, 'index.html');
    }
}
catch (error) {
    console.error('⚠️ Error finding client path:', error);
    // Default to first path - express.static will handle 404s gracefully
    indexPath = path.join(clientPath, 'index.html');
}
// Debug: Log paths on startup
console.log('Client path:', clientPath);
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Index path:', indexPath);
// Handle OPTIONS preflight requests for CORS - must be before static files
app.options('*', (_req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});
// Serve static files - but only for non-API routes
app.use((req, res, next) => {
    // Skip static file serving for API routes
    if (req.path.startsWith('/api')) {
        return next();
    }
    express.static(clientPath, {
        dotfiles: 'ignore',
        index: false,
        maxAge: '1y',
        etag: true
    })(req, res, next);
});
// Serve the main app (React) - this must be after all API routes
app.get('*', (_req, res) => {
    // Skip API routes - they should have been handled above
    if (_req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Try to serve index.html
    if (indexPath) {
        try {
            return res.sendFile(indexPath);
        }
        catch (error) {
            console.error('Error serving index.html:', error);
        }
    }
    // Fallback: try to construct path
    try {
        const fallbackPath = path.join(clientPath, 'index.html');
        return res.sendFile(fallbackPath);
    }
    catch (error) {
        console.error('Error serving index.html (fallback):', error);
        console.error('Current working directory:', process.cwd());
        console.error('Client path:', clientPath);
        res.status(404).json({
            error: 'Frontend not found. Please build the frontend first.',
            debug: {
                cwd: process.cwd(),
                clientPath,
                __dirname
            }
        });
    }
});
// Vercel serverless function handler
// Vercel's @vercel/node builder automatically wraps Express apps
export default app;
