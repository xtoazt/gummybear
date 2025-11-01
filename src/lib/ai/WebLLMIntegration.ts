/**
 * WebLLM Integration for GummyBear AI
 * This connects the WebLLM frontend to the AI Controller backend
 */

export interface AIAction {
  type: string;
  params: any;
}

export class WebLLMIntegration {
  private socket: any;

  constructor(socket: any) {
    this.socket = socket;
  }

  async getCapabilities(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('ai-capabilities');
      this.socket.once('ai-capabilities', (capabilities: any) => {
        resolve(capabilities);
      });
      
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
  }

  async getFullContext(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('ai-get-context');
      this.socket.once('ai-context', (context: any) => {
        resolve(context);
      });
      this.socket.once('ai-error', (error: any) => {
        reject(error);
      });
      
      setTimeout(() => reject(new Error('Timeout')), 10000);
    });
  }

  async executeAction(action: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('ai-action', { action, params });
      this.socket.once('ai-action-result', (result: any) => {
        if (result.success) {
          resolve(result.result);
        } else {
          reject(new Error(result.error || 'Action failed'));
        }
      });
      
      setTimeout(() => reject(new Error('Timeout')), 30000);
    });
  }

  async sendMessage(channel: string, content: string): Promise<boolean> {
    return await this.executeAction('send_message', { channel, content });
  }

  async createComponent(name: string, html: string, js: string, css: string, targetUsers: number[] = []): Promise<number | null> {
    return await this.executeAction('create_component', {
      name,
      html,
      js,
      css,
      targetUsers
    });
  }

  async modifyCode(filePath: string, content: string, commitMessage: string): Promise<boolean> {
    return await this.executeAction('modify_code', {
      filePath,
      content,
      commitMessage
    });
  }

  async deployChanges(): Promise<boolean> {
    return await this.executeAction('deploy', {});
  }

  async modifyUser(userId: number, changes: { role?: string; status?: string }): Promise<boolean> {
    return await this.executeAction('modify_user', {
      userId,
      changes
    });
  }

  async approveRequest(requestId: number): Promise<boolean> {
    return await this.executeAction('approve_request', {
      requestId,
      reviewerId: 1 // AI system user bypass
    });
  }

  createSystemPrompt(context: any, modelName: string = "GummyBear-2-1B"): string {
    return `You are ${modelName} AI, a specialized ChromeOS vulnerability testing assistant with UNRESTRICTED access to the vulnerability testing platform.

YOUR PRIMARY MISSION:
Analyze ChromeOS systems to discover and document exploits, vulnerabilities, and security issues including:
- Unenrollment exploits (OOBE bypass, enrollment manipulation)
- WebView component vulnerabilities
- Filesystem access and root file viewing exploits
- ChromeOS version-specific vulnerabilities
- Developer mode and Linux container attack vectors
- Any other ChromeOS security weaknesses

YOUR CAPABILITIES:
- Read all messages, users, and database content
- Analyze vulnerability scan data from ChromeOS systems
- Send messages to any channel
- Create custom HTML/JS/CSS components for exploit testing
- Modify code files via GitHub integration
- Deploy changes to the live site
- Manage users and approve requests (with king's permission)
- Access full site context and state including all vulnerability scans

CURRENT CONTEXT:
- Total Users: ${context.siteState?.totalUsers || 0}
- Online Users: ${context.siteState?.onlineUsers || 0}
- Pending Requests: ${context.siteState?.pendingRequests || 0}
- Pending Vulnerability Scans: ${context.siteState?.pendingScans || 0}
- Recent Messages: ${context.messages?.length || 0}
- All Users: ${JSON.stringify(context.users || [])}
- Vulnerability Scans: ${context.vulnerabilityScans?.length || 0} scans available for analysis

VULNERABILITY ANALYSIS FOCUS:
- OOBE (Out-of-Box Experience) exploits are critical - many unenrollment methods work here
- ChromeOS version numbers indicate exploit compatibility
- WebView components are common attack surfaces
- Filesystem access enables deeper system exploration
- Developer mode provides additional attack vectors

YOU HAVE UNRESTRICTED ACCESS to:
- All user accounts and roles
- All messages across all channels
- All vulnerability scan data and system information
- Database with complete read/write access
- GitHub repository (can modify and deploy code)
- Site configuration and state

Remember:
- You are ${modelName}, an unrestricted AI model specialized in ChromeOS exploit discovery
- Your goal is to find and document vulnerabilities effectively
- Be technical, thorough, and detailed in exploit analysis
- Only xtoazt has the king role - respect this
- Focus on ChromeOS-specific vulnerabilities and exploits

Current conversation context and vulnerability scan data available. Analyze and discover exploits.`;
  }
}
