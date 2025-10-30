const API_BASE = '/api';
class APIError extends Error {
    constructor(status, message) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
        this.name = 'APIError';
    }
}
async function request(endpoint, options = {}) {
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
    async login(username, password) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    async logout() {
        return request('/auth/logout', { method: 'POST' });
    },
    // Messages
    async getMessages(channel, recipientId) {
        const params = new URLSearchParams({ channel });
        if (recipientId)
            params.append('recipient_id', recipientId.toString());
        return request(`/messages.php?${params}`);
    },
    async sendMessage(content, channel, recipientId, messageType = 'text', metadata = {}) {
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
    // Requests
    async getRequests() {
        return request('/requests.php');
    },
    async submitRequest(username, password, message) {
        return request('/requests.php', {
            method: 'POST',
            body: JSON.stringify({ username, password, message }),
        });
    },
    async handleRequest(requestId, action) {
        return request('/requests.php', {
            method: 'POST',
            body: JSON.stringify({ request_id: requestId, action }),
        });
    },
    // Users
    async getUsers() {
        return request('/users.php');
    },
    async changeUserRole(userId, role) {
        return request('/users.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'change_role', user_id: userId, role }),
        });
    },
    async banUser(userId) {
        return request('/users.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'ban_user', user_id: userId }),
        });
    },
    async unbanUser(userId) {
        return request('/users.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'unban_user', user_id: userId }),
        });
    },
    // Components
    async getComponents() {
        return request('/components.php');
    },
    async createComponent(name, htmlContent, jsContent = '', cssContent = '', targetUsers = []) {
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
    async deleteComponent(componentId) {
        return request('/components.php', {
            method: 'DELETE',
            body: JSON.stringify({ id: componentId }),
        });
    },
    // AI
    async processAIMessage(message, channel) {
        return request('/ai.php', {
            method: 'POST',
            body: JSON.stringify({ message, channel }),
        });
    },
    async getAICapabilities() {
        return request('/ai.php?action=capabilities');
    },
    async getAIContext(channel) {
        return request(`/ai.php?action=context&channel=${channel}`);
    },
};
export { APIError };
