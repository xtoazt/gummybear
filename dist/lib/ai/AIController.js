import { UserModel } from '../models/User.js';
import { MessageModel } from '../models/Message.js';
import { RequestModel } from '../models/Request.js';
import { PendingChangeModel } from '../models/PendingChange.js';
import { Octokit } from '@octokit/rest';
export class AIController {
    constructor(db) {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "userModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "messageModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "requestModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pendingChangeModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "githubClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        // Actions that don't require approval
        Object.defineProperty(this, "NO_APPROVAL_NEEDED", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ['send_message', 'get_context']
        });
        this.db = db;
        this.userModel = new UserModel(db);
        this.messageModel = new MessageModel(db);
        this.requestModel = new RequestModel(db);
        this.pendingChangeModel = new PendingChangeModel(db);
        // Initialize GitHub client if token is available
        const githubToken = process.env.GITHUB_TOKEN;
        if (githubToken) {
            this.githubClient = new Octokit({
                auth: githubToken
            });
        }
    }
    getCapabilities() {
        return {
            canReadAllMessages: true,
            canReadAllUsers: true,
            canReadDatabaseESP: true,
            canWriteDatabase: true,
            canCreateComponents: true,
            canSendMessages: true,
            canManageUsers: true, // AI can suggest user changes (king still approves)
            canModifyCode: this.githubClient !== null,
            canDeployChanges: this.githubClient !== null
        };
    }
    async getFullContext() {
        try {
            // Get all users
            const users = await this.userModel.getAll();
            // Get recent messages from all channels
            const globalMessages = await this.messageModel.getChannelMessages('global', 100);
            const supportMessages = await this.messageModel.getChannelMessages('support', 50);
            const kajigsMessages = await this.messageModel.getChannelMessages('kajigs', 50);
            // Get all pending requests
            const requests = await this.requestModel.getAllPending();
            // Get database schema info
            const dbInfo = await this.getDatabaseInfo();
            // Get recent vulnerability scans for analysis
            let vulnerabilityScans = [];
            try {
                const scansResult = await this.db.query(`SELECT scan_id, system_info, exploits_found, analysis_status, created_at 
           FROM vulnerability_scans 
           ORDER BY created_at DESC 
           LIMIT 20`);
                vulnerabilityScans = scansResult.rows || [];
            }
            catch (error) {
                // Table might not exist yet
                console.log('Could not fetch vulnerability scans:', error);
            }
            return {
                users,
                messages: [...globalMessages, ...supportMessages, ...kajigsMessages],
                requests,
                database: dbInfo,
                vulnerabilityScans,
                siteState: {
                    totalUsers: users.length,
                    onlineUsers: 0, // Will be updated from socket
                    pendingRequests: requests.length,
                    recentActivity: 'active',
                    pendingScans: vulnerabilityScans.filter((s) => s.analysis_status === 'pending').length
                }
            };
        }
        catch (error) {
            console.error('Error getting AI context:', error);
            throw error;
        }
    }
    async analyzeVulnerabilityScan(scanId) {
        try {
            // Get scan data
            const result = await this.db.query('SELECT * FROM vulnerability_scans WHERE scan_id = $1', [scanId]);
            if (result.rows.length === 0) {
                throw new Error('Scan not found');
            }
            const scan = result.rows[0];
            const systemInfo = scan.system_info;
            // Analyze for ChromeOS exploits
            const exploits = await this.findExploits(systemInfo);
            // Update scan with results
            await this.db.query(`UPDATE vulnerability_scans 
         SET exploits_found = $1, analysis_status = $2, analyzed_at = NOW()
         WHERE scan_id = $3`, [JSON.stringify(exploits), 'completed', scanId]);
            return exploits;
        }
        catch (error) {
            console.error('Error analyzing vulnerability scan:', error);
            throw error;
        }
    }
    async findExploits(systemInfo) {
        const exploits = [];
        // Check for ChromeOS version vulnerabilities
        if (systemInfo.chromeOSInfo?.chromeOSVersion) {
            const version = systemInfo.chromeOSInfo.chromeOSVersion;
            // Known unenrollment exploit patterns
            if (version.match(/^(100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120)/)) {
                exploits.push({
                    type: 'unenrollment',
                    severity: 'high',
                    description: 'Potential unenrollment exploit - OOBE bypass possible in ChromeOS versions 100-120',
                    method: 'OOBE (Out-of-Box Experience) manipulation',
                    details: 'These versions have known vulnerabilities in the enrollment process'
                });
            }
        }
        // Check for webview vulnerabilities
        if (systemInfo.chromeOSInfo?.chromeVersion) {
            const chromeVersion = parseInt(systemInfo.chromeOSInfo.chromeVersion.split('.')[0]);
            if (chromeVersion >= 90 && chromeVersion < 120) {
                exploits.push({
                    type: 'webview',
                    severity: 'medium',
                    description: 'WebView vulnerability detected',
                    method: 'WebView component manipulation',
                    details: 'ChromeOS WebView components in this version range have known security issues'
                });
            }
        }
        // Check file system access capabilities
        if (systemInfo.fileSystemAccess?.supported) {
            exploits.push({
                type: 'filesystem',
                severity: 'high',
                description: 'File System Access API available',
                method: 'Direct file system manipulation',
                details: 'Browser has access to file system, enabling deeper system exploration'
            });
        }
        // Check for developer mode indicators
        if (systemInfo.platform && systemInfo.platform.includes('Linux')) {
            exploits.push({
                type: 'dev_mode',
                severity: 'low',
                description: 'Potential developer mode or Linux container access',
                method: 'Linux container exploitation',
                details: 'ChromeOS Linux environment may provide additional attack vectors'
            });
        }
        // Check ChromeOS specific identifiers
        if (systemInfo.chromeOSInfo?.isChromeOS) {
            exploits.push({
                type: 'chromeos_environment',
                severity: 'info',
                description: 'Confirmed ChromeOS environment detected',
                method: 'OS-specific exploitation',
                details: 'System is running ChromeOS, enabling targeted exploit research'
            });
        }
        return exploits;
    }
    async getDatabaseInfo() {
        try {
            const tables = ['users', 'messages', 'access_requests', 'kajigs', 'custom_components'];
            const info = {};
            for (const table of tables) {
                const result = await this.db.query(`SELECT COUNT(*) as count FROM ${table}`);
                info[table] = {
                    count: result.rows[0]?.count || 0,
                    table: table
                };
            }
            return info;
        }
        catch (error) {
            console.error('Error getting database info:', error);
            return {};
        }
    }
    async sendMessageAsAI(channel, content, userId) {
        // AI always uses user ID 0 or a special AI user
        const aiUserId = userId || 1; // Default to system user
        return await this.messageModel.create(aiUserId, content, channel, undefined, 'ai');
    }
    async createComponent(name, html, js, css, targetUsers) {
        try {
            const result = await this.db.query(`INSERT INTO custom_components (creator_id, name, html_content, js_content, css_content, target_users) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [1, name, html, js, css, JSON.stringify(targetUsers)]);
            return result.rows[0]?.id || null;
        }
        catch (error) {
            console.error('Error creating component:', error);
            return null;
        }
    }
    async modifyCode(filePath, content, commitMessage) {
        if (!this.githubClient) {
            throw new Error('GitHub integration not configured');
        }
        try {
            const owner = process.env.GITHUB_OWNER || 'xtoazt';
            const repo = process.env.GITHUB_REPO || 'gummybear';
            const branch = process.env.GITHUB_BRANCH || 'main';
            // Get current file content
            let sha;
            try {
                const { data } = await this.githubClient.repos.getContent({
                    owner,
                    repo,
                    path: filePath,
                    ref: branch
                });
                if ('sha' in data && data.sha) {
                    sha = data.sha;
                }
            }
            catch (error) {
                // File might not exist, that's ok for new files
                if (error.status !== 404)
                    throw error;
            }
            // Encode content to base64
            const encodedContent = Buffer.from(content).toString('base64');
            // Create or update file
            await this.githubClient.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: filePath,
                message: commitMessage,
                content: encodedContent,
                branch,
                sha
            });
            return true;
        }
        catch (error) {
            console.error('Error modifying code:', error);
            throw error;
        }
    }
    async deployChanges() {
        if (!this.githubClient) {
            throw new Error('GitHub integration not configured');
        }
        try {
            // Trigger Vercel deployment via GitHub webhook or API
            // This would typically be handled by Vercel automatically on push
            // But we can also trigger it manually if needed
            // const owner = process.env.GITHUB_OWNER || 'xtoazt';
            // const repo = process.env.GITHUB_REPO || 'gummybear';
            // If using GitHub Actions for deployment
            // We could trigger a workflow dispatch here
            return true;
        }
        catch (error) {
            console.error('Error deploying changes:', error);
            return false;
        }
    }
    async modifyUser(userId, changes) {
        try {
            if (changes.role) {
                await this.userModel.changeRole(userId, changes.role);
            }
            if (changes.status) {
                if (changes.status === 'banned') {
                    await this.userModel.banUser(userId);
                }
                else if (changes.status === 'approved') {
                    await this.userModel.unbanUser(userId);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Error modifying user:', error);
            return false;
        }
    }
    async approveRequest(requestId, reviewerId = 1) {
        return await this.requestModel.approve(requestId, reviewerId);
    }
    async executeAction(action, params, userId, isKing = false) {
        // If action doesn't need approval, execute immediately
        if (this.NO_APPROVAL_NEEDED.includes(action)) {
            return await this.executeActionDirect(action, params);
        }
        // If king, execute immediately
        if (isKing) {
            return await this.executeActionDirect(action, params);
        }
        // Otherwise, create pending change
        const changeType = action;
        const title = this.getActionTitle(action, params);
        const description = this.getActionDescription(action, params);
        const pendingId = await this.pendingChangeModel.create(changeType, title, description, { action, params }, userId || 1);
        return { pending: true, pendingChangeId: pendingId, message: 'Change pending king approval' };
    }
    async executeActionDirect(action, params) {
        switch (action) {
            case 'send_message':
                return await this.sendMessageAsAI(params.channel, params.content, params.userId);
            case 'create_component':
                return await this.createComponent(params.name, params.html, params.js || '', params.css || '', params.targetUsers || []);
            case 'modify_code':
                return await this.modifyCode(params.filePath, params.content, params.commitMessage);
            case 'deploy':
                return await this.deployChanges();
            case 'modify_user':
                return await this.modifyUser(params.userId, params.changes);
            case 'approve_request':
                return await this.approveRequest(params.requestId, params.reviewerId);
            case 'get_context':
                return await this.getFullContext();
            case 'analyze_scan':
                return await this.analyzeVulnerabilityScan(params.scanId);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    async executeApprovedChange(changeId) {
        try {
            const change = await this.pendingChangeModel.getById(changeId);
            if (!change || change.status !== 'approved') {
                throw new Error('Change not found or not approved');
            }
            const { action, params } = change.action_data;
            await this.executeActionDirect(action, params);
            await this.pendingChangeModel.markExecuted(changeId);
            return true;
        }
        catch (error) {
            console.error('Error executing approved change:', error);
            return false;
        }
    }
    getActionTitle(action, params) {
        switch (action) {
            case 'modify_code':
                return `Modify ${params.filePath}`;
            case 'create_component':
                return `Create component: ${params.name}`;
            case 'deploy':
                return 'Deploy changes';
            case 'modify_user':
                return `Modify user ${params.userId}`;
            default:
                return `AI Action: ${action}`;
        }
    }
    getActionDescription(action, params) {
        switch (action) {
            case 'modify_code':
                return `Commit message: ${params.commitMessage || 'AI requested change'}`;
            case 'create_component':
                return `Component for users: ${params.targetUsers?.join(', ') || 'all users'}`;
            case 'deploy':
                return 'Deploy latest changes to production';
            case 'modify_user':
                return `Change: ${JSON.stringify(params.changes)}`;
            default:
                return `Action: ${action}`;
        }
    }
}
