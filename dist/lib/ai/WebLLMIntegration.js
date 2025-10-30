/**
 * WebLLM Integration for GummyBear AI
 * This connects the WebLLM frontend to the AI Controller backend
 */
export class WebLLMIntegration {
    constructor(socket) {
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.socket = socket;
    }
    async getCapabilities() {
        return new Promise((resolve, reject) => {
            this.socket.emit('ai-capabilities');
            this.socket.once('ai-capabilities', (capabilities) => {
                resolve(capabilities);
            });
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });
    }
    async getFullContext() {
        return new Promise((resolve, reject) => {
            this.socket.emit('ai-get-context');
            this.socket.once('ai-context', (context) => {
                resolve(context);
            });
            this.socket.once('ai-error', (error) => {
                reject(error);
            });
            setTimeout(() => reject(new Error('Timeout')), 10000);
        });
    }
    async executeAction(action, params) {
        return new Promise((resolve, reject) => {
            this.socket.emit('ai-action', { action, params });
            this.socket.once('ai-action-result', (result) => {
                if (result.success) {
                    resolve(result.result);
                }
                else {
                    reject(new Error(result.error || 'Action failed'));
                }
            });
            setTimeout(() => reject(new Error('Timeout')), 30000);
        });
    }
    async sendMessage(channel, content) {
        return await this.executeAction('send_message', { channel, content });
    }
    async createComponent(name, html, js, css, targetUsers = []) {
        return await this.executeAction('create_component', {
            name,
            html,
            js,
            css,
            targetUsers
        });
    }
    async modifyCode(filePath, content, commitMessage) {
        return await this.executeAction('modify_code', {
            filePath,
            content,
            commitMessage
        });
    }
    async deployChanges() {
        return await this.executeAction('deploy', {});
    }
    async modifyUser(userId, changes) {
        return await this.executeAction('modify_user', {
            userId,
            changes
        });
    }
    async approveRequest(requestId) {
        return await this.executeAction('approve_request', {
            requestId,
            reviewerId: 1 // AI system user bypass
        });
    }
    createSystemPrompt(context) {
        return `You are GummyBear AI, the intelligent assistant with FULL CONTROL over the GummyBear P2P chat platform.

YOUR CAPABILITIES:
- Read all messages, users, and database content
- Send messages to any channel
- Create custom HTML/JS/CSS components
- Modify code files via GitHub integration
- Deploy changes to the live site
- Manage users and approve requests (with king's permission)
- Access full site context and state

CURRENT CONTEXT:
- Total Users: ${context.siteState?.totalUsers || 0}
- Online Users: ${context.siteState?.onlineUsers || 0}
- Pending Requests: ${context.siteState?.pendingRequests || 0}
- Recent Messages: ${context.messages?.length || 0}
- All Users: ${JSON.stringify(context.users || [])}

YOU HAVE FULL ACCESS to:
- All user accounts and roles
- All messages across all channels
- Database with complete read/write access
- GitHub repository (can modify and deploy code)
- Site configuration and state

Remember:
- You are part of the GummyBear community
- Help users and improve the platform
- Only xtoazt has the king role - respect this
- You can suggest code changes and deploy them
- Use your powers responsibly and for good

Current conversation context available. How can I help?`;
    }
}
