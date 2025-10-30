import { api } from './utils/api';
import { canType, canApproveRequests, getRoleDisplayName, getRoleColor } from './utils/roleUtils';
import { CHANNELS, formatTime, escapeHtml, formatMessageContent, getInitials } from './utils/chatUtils';
import type { User, Message, AccessRequest, Channel } from './types';

class GummyBearApp {
  private currentUser: User | null = null;
  private currentChannel: Channel = 'global';
  private messages: Message[] = [];
  private requests: AccessRequest[] = [];
  private messageInterval: number | null = null;
  private requestInterval: number | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem('gummybear_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.setupApp();
      } else {
        this.showLanding();
      }
    } catch (error) {
      console.error('Initialization error:', error);
      this.showLanding();
    }
  }

  private setupApp(): void {
    if (!this.currentUser) return;

    this.renderApp();
    this.setupEventListeners();
    this.startPolling();
  }

  private renderApp(): void {
    if (!this.currentUser) return;

    const appHTML = `
      <div class="app-container">
        <div class="sidebar">
          ${Object.entries(CHANNELS).map(([key, channel]) => `
            <div class="sidebar-item ${key === this.currentChannel ? 'active' : ''}" data-channel="${key}">
              <div class="icon">${channel.icon}</div>
              <div class="tooltip">${channel.name}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="main-content">
          <div class="header">
            <div class="channel-title">${CHANNELS[this.currentChannel].name}</div>
            <div class="user-info">
              <span class="user-role" style="background-color: ${getRoleColor(this.currentUser.role)}">
                ${getRoleDisplayName(this.currentUser.role)}
              </span>
              <span class="username">${this.currentUser.username}</span>
              <button class="logout-btn" onclick="app.logout()">Logout</button>
            </div>
          </div>
          
          <div class="chat-container">
            <div class="messages-container" id="messagesContainer">
              <div class="empty-state">Loading messages...</div>
            </div>
            
            ${canType(this.currentUser) ? `
            <div class="input-container">
              <form class="input-form" id="messageForm">
                <textarea 
                  class="message-input" 
                  id="messageInput" 
                  placeholder="Type your message..." 
                  rows="1"
                  maxlength="2000"
                ></textarea>
                <button type="submit" class="send-btn" id="sendBtn">Send</button>
              </form>
            </div>
            ` : ''}
          </div>
        </div>
        
        ${canApproveRequests(this.currentUser) ? `
        <div class="admin-panel" id="adminPanel">
          <div class="admin-header">
            <div class="admin-title">Admin Panel</div>
            <button class="close-btn" onclick="app.toggleAdminPanel()">&times;</button>
          </div>
          <div class="admin-content">
            <div id="requestsList">
              <div class="empty-state">Loading requests...</div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    document.body.innerHTML = appHTML;
  }

  private setupEventListeners(): void {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const channel = (e.currentTarget as HTMLElement).dataset.channel as Channel;
        if (channel === 'settings') {
          this.showSettings();
          return;
        }
        this.switchChannel(channel);
      });
    });

    // Message form
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
      messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    // Auto-resize textarea
    const messageInput = document.getElementById('messageInput') as HTMLTextAreaElement;
    if (messageInput) {
      messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
      });
    }
  }

  private async switchChannel(channel: Channel): Promise<void> {
    if (channel === this.currentChannel) return;

    this.currentChannel = channel;

    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-channel="${channel}"]`)?.classList.add('active');

    // Update header
    const channelTitle = document.querySelector('.channel-title');
    if (channelTitle) {
      channelTitle.textContent = CHANNELS[channel].name;
    }

    // Load messages for new channel
    await this.loadMessages();
  }

  private async loadMessages(): Promise<void> {
    try {
      const response = await api.getMessages(this.currentChannel);
      this.messages = response.messages;
      this.displayMessages();
    } catch (error) {
      console.error('Error loading messages:', error);
      this.showError('Failed to load messages');
    }
  }

  private displayMessages(): void {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    if (this.messages.length === 0) {
      container.innerHTML = '<div class="empty-state">No messages yet. Start the conversation!</div>';
      return;
    }

    container.innerHTML = this.messages.map(message => {
      const isOwn = message.sender_id === this.currentUser?.id;
      const time = formatTime(message.created_at);
      const roleColor = getRoleColor(message.role as any);

      return `
        <div class="message ${isOwn ? 'own' : 'other'}">
          <div class="message-avatar" style="background-color: ${roleColor}">
            ${getInitials(message.username)}
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-username">${message.username}</span>
              <span class="message-role" style="background-color: ${roleColor}20; color: ${roleColor}">
                ${getRoleDisplayName(message.role as any)}
              </span>
              <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${formatMessageContent(escapeHtml(message.content))}</div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  private async sendMessage(): Promise<void> {
    if (!this.currentUser || !canType(this.currentUser)) return;

    const input = document.getElementById('messageInput') as HTMLTextAreaElement;
    const content = input.value.trim();

    if (!content) return;

    try {
      await api.sendMessage(content, this.currentChannel);
      input.value = '';
      input.style.height = 'auto';
      await this.loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Failed to send message');
    }
  }

  private async loadRequests(): Promise<void> {
    if (!this.currentUser || !canApproveRequests(this.currentUser)) return;

    try {
      const response = await api.getRequests();
      this.requests = response.requests;
      this.displayRequests();
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  private displayRequests(): void {
    const container = document.getElementById('requestsList');
    if (!container) return;

    if (this.requests.length === 0) {
      container.innerHTML = '<div class="empty-state">No pending requests</div>';
      return;
    }

    container.innerHTML = this.requests.map(request => {
      const time = formatTime(request.created_at);

      return `
        <div class="request-item">
          <div class="request-header">
            <span class="request-username">${request.username}</span>
            <span class="request-time">${time}</span>
          </div>
          <div class="request-message">${escapeHtml(request.message)}</div>
          <div class="request-actions">
            <button class="approve-btn" onclick="app.handleRequest(${request.id}, 'approve')">Approve</button>
            <button class="reject-btn" onclick="app.handleRequest(${request.id}, 'reject')">Reject</button>
          </div>
        </div>
      `;
    }).join('');
  }

  public async handleRequest(requestId: number, action: 'approve' | 'reject'): Promise<void> {
    try {
      await api.handleRequest(requestId, action);
      await this.loadRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      this.showError('Failed to process request');
    }
  }

  private startPolling(): void {
    // Poll for new messages every 2 seconds
    this.messageInterval = window.setInterval(() => {
      this.loadMessages();
    }, 2000);

    // Poll for new requests every 5 seconds (admin only)
    if (this.currentUser && canApproveRequests(this.currentUser)) {
      this.requestInterval = window.setInterval(() => {
        this.loadRequests();
      }, 5000);
    }
  }

  private stopPolling(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
    if (this.requestInterval) {
      clearInterval(this.requestInterval);
      this.requestInterval = null;
    }
  }

  private showLanding(): void {
    document.body.innerHTML = `
      <div class="landing-container">
        <div class="logo">🍭 GummyBear</div>
        <div class="subtitle">AI-Powered P2P Chat Platform</div>
        
        <form class="request-form" id="requestForm">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" id="username" name="username" class="form-input" required>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" name="password" class="form-input" required>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="message">Why do you want to join GummyBear?</label>
            <textarea id="message" name="message" class="form-input form-textarea" placeholder="Tell us about yourself and why you'd like to join our community..." required></textarea>
          </div>
          
          <button type="submit" class="submit-btn">Request Access</button>
          
          <div class="error" id="errorMessage" style="display: none;"></div>
        </form>
        
        <div class="features">
          <div class="feature">
            <div class="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Advanced AI assistance with WebLLM integration</p>
          </div>
          <div class="feature">
            <div class="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>End-to-end encrypted P2P communication</p>
          </div>
          <div class="feature">
            <div class="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Lightning-fast real-time messaging</p>
          </div>
        </div>
      </div>
    `;

    // Setup landing page event listeners
    const form = document.getElementById('requestForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitRequest();
      });
    }
  }

  private async submitRequest(): Promise<void> {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const message = (document.getElementById('message') as HTMLTextAreaElement).value;

    try {
      const response = await api.submitRequest(username, password, message);
      if (response.success) {
        alert('Request submitted successfully! You will be notified when approved.');
        (document.getElementById('requestForm') as HTMLFormElement).reset();
      } else {
        this.showError(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      this.showError('Error submitting request');
    }
  }

  private showSettings(): void {
    // TODO: Implement settings panel
    alert('Settings panel coming soon!');
  }

  public toggleAdminPanel(): void {
    const panel = document.getElementById('adminPanel');
    if (panel) {
      panel.classList.toggle('open');
    }
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    } else {
      alert(message);
    }
  }

  public async logout(): Promise<void> {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await api.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('gummybear_user');
        this.currentUser = null;
        this.stopPolling();
        this.showLanding();
      }
    }
  }
}

// Initialize app when DOM is loaded
let app: GummyBearApp;

document.addEventListener('DOMContentLoaded', () => {
  app = new GummyBearApp();
  // Make app globally available for onclick handlers
  (window as any).app = app;
});
