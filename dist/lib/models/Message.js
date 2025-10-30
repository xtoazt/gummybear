export class MessageModel {
    constructor(db) {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = db;
    }
    async create(senderId, content, channel = 'global', recipientId, messageType = 'text', metadata = {}) {
        try {
            await this.db.query(`INSERT INTO messages (sender_id, recipient_id, channel, content, message_type, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)`, [senderId, recipientId, channel, content, messageType, JSON.stringify(metadata)]);
            return true;
        }
        catch (error) {
            console.error('Create message error:', error);
            return false;
        }
    }
    async getChannelMessages(channel, limit = 50) {
        try {
            const result = await this.db.query(`SELECT m.*, u.username, u.role 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id 
         WHERE m.channel = $1 
         ORDER BY m.created_at DESC 
         LIMIT $2`, [channel, limit]);
            return result.rows.reverse().map((row) => ({
                id: row.id,
                sender_id: row.sender_id,
                recipient_id: row.recipient_id,
                channel: row.channel,
                content: row.content,
                message_type: row.message_type,
                metadata: row.metadata || {},
                created_at: row.created_at,
                username: row.username,
                role: row.role
            }));
        }
        catch (error) {
            console.error('Get channel messages error:', error);
            return [];
        }
    }
    async getDirectMessages(user1Id, user2Id, limit = 50) {
        try {
            const result = await this.db.query(`SELECT m.*, u.username, u.role 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id 
         WHERE ((m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1))
         AND m.channel = 'dm'
         ORDER BY m.created_at DESC 
         LIMIT $3`, [user1Id, user2Id, limit]);
            return result.rows.reverse().map((row) => ({
                id: row.id,
                sender_id: row.sender_id,
                recipient_id: row.recipient_id,
                channel: row.channel,
                content: row.content,
                message_type: row.message_type,
                metadata: row.metadata || {},
                created_at: row.created_at,
                username: row.username,
                role: row.role
            }));
        }
        catch (error) {
            console.error('Get direct messages error:', error);
            return [];
        }
    }
    async getRecentChannels(userId) {
        try {
            const result = await this.db.query(`SELECT DISTINCT channel, MAX(created_at) as last_message
         FROM messages 
         WHERE sender_id = $1 OR recipient_id = $1 OR channel = 'global'
         GROUP BY channel 
         ORDER BY last_message DESC`, [userId]);
            return result.rows;
        }
        catch (error) {
            console.error('Get recent channels error:', error);
            return [];
        }
    }
}
