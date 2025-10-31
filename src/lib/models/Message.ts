import Database from '../database.js';

export interface Message {
  id: number;
  sender_id: number;
  recipient_id?: number;
  channel: string;
  content: string;
  message_type: 'text' | 'component' | 'ai';
  metadata: Record<string, any>;
  created_at: string;
  username: string;
  role: string;
}

export class MessageModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async create(
    senderId: number,
    content: string,
    channel: string = 'global',
    recipientId?: number,
    messageType: string = 'text',
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      await this.db.query(
        `INSERT INTO messages (sender_id, recipient_id, channel, content, message_type, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [senderId, recipientId, channel, content, messageType, JSON.stringify(metadata)]
      );
      return true;
    } catch (error) {
      console.error('Create message error:', error);
      return false;
    }
  }

  async getChannelMessages(channel: string, limit: number = 50): Promise<Message[]> {
    try {
      const result = await this.db.query(
        `SELECT m.*, u.username, u.role 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id 
         WHERE m.channel = $1 
         ORDER BY m.created_at DESC 
         LIMIT $2`,
        [channel, limit]
      );

      return result.rows.reverse().map((row: any) => ({
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
    } catch (error) {
      console.error('Get channel messages error:', error);
      return [];
    }
  }

  async getDirectMessages(user1Id: number, user2Id: number, limit: number = 50): Promise<Message[]> {
    try {
      const result = await this.db.query(
        `SELECT m.*, u.username, u.role 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id 
         WHERE ((m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1))
         AND m.channel = 'dm'
         ORDER BY m.created_at DESC 
         LIMIT $3`,
        [user1Id, user2Id, limit]
      );

      return result.rows.reverse().map((row: any) => ({
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
    } catch (error) {
      console.error('Get direct messages error:', error);
      return [];
    }
  }

  async getRecentChannels(userId: number): Promise<Array<{ channel: string; last_message: string }>> {
    try {
      const result = await this.db.query(
        `SELECT DISTINCT channel, MAX(created_at) as last_message
         FROM messages 
         WHERE sender_id = $1 OR recipient_id = $1 OR channel = 'global'
         GROUP BY channel 
         ORDER BY last_message DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get recent channels error:', error);
      return [];
    }
  }
}
