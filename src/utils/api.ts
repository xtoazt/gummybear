import type { User, Message, AccessRequest, CustomComponent, AIResponse } from '../types';

const API_BASE = '/api';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(): Promise<{ success: boolean }> {
    return request('/auth/logout', { method: 'POST' });
  },

  // Messages
  async getMessages(channel: string, recipientId?: number): Promise<{ messages: Message[] }> {
    const params = new URLSearchParams({ channel });
    if (recipientId) params.append('recipient_id', recipientId.toString());
    return request(`/messages.php?${params}`);
  },

  async sendMessage(content: string, channel: string, recipientId?: number, messageType = 'text', metadata = {}): Promise<{ success: boolean }> {
    return request('/messages.php', {
      method: 'POST',
      body: JSON.stringify({
        content,
        channel,
        recipient_id: recipientId,
        message_type: messageType,
        metadata,
      }),
    });
  },

  async editMessage(messageId: number, content: string): Promise<{ success: boolean }> {
    return request('/messages.php', {
      method: 'PUT',
      body: JSON.stringify({
        id: messageId,
        content,
      }),
    });
  },

  async deleteMessage(messageId: number): Promise<{ success: boolean }> {
    return request('/messages.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: messageId }),
    });
  },

  async addReaction(messageId: number, emoji: string): Promise<{ success: boolean }> {
    return request('/messages.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_reaction',
        message_id: messageId,
        emoji,
      }),
    });
  },

  // Requests
  async getRequests(): Promise<{ requests: AccessRequest[] }> {
    return request('/requests.php');
  },

  async submitRequest(username: string, password: string, message: string): Promise<{ success: boolean; message?: string }> {
    return request('/requests.php', {
      method: 'POST',
      body: JSON.stringify({ username, password, message }),
    });
  },

  async handleRequest(requestId: number, action: 'approve' | 'reject'): Promise<{ success: boolean }> {
    return request('/requests.php', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, action }),
    });
  },

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    return request('/users.php');
  },

  async changeUserRole(userId: number, role: string): Promise<{ success: boolean }> {
    return request('/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'change_role', user_id: userId, role }),
    });
  },

  async banUser(userId: number): Promise<{ success: boolean }> {
    return request('/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'ban_user', user_id: userId }),
    });
  },

  async unbanUser(userId: number): Promise<{ success: boolean }> {
    return request('/users.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'unban_user', user_id: userId }),
    });
  },

  // Components
  async getComponents(): Promise<{ components: CustomComponent[] }> {
    return request('/components.php');
  },

  async createComponent(
    name: string,
    htmlContent: string,
    jsContent = '',
    cssContent = '',
    targetUsers: number[] = []
  ): Promise<{ success: boolean; id?: number }> {
    return request('/components.php', {
      method: 'POST',
      body: JSON.stringify({
        name,
        html_content: htmlContent,
        js_content: jsContent,
        css_content: cssContent,
        target_users: targetUsers,
      }),
    });
  },

  async deleteComponent(componentId: number): Promise<{ success: boolean }> {
    return request('/components.php', {
      method: 'DELETE',
      body: JSON.stringify({ id: componentId }),
    });
  },

  // AI
  async processAIMessage(message: string, channel: string): Promise<AIResponse> {
    return request('/ai.php', {
      method: 'POST',
      body: JSON.stringify({ message, channel }),
    });
  },

  async getAICapabilities(): Promise<Record<string, boolean>> {
    return request('/ai.php?action=capabilities');
  },

  async getAIContext(channel: string): Promise<any> {
    return request(`/ai.php?action=context&channel=${channel}`);
  },
};

export { APIError };
