import { Pool, PoolClient } from 'pg';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_UAkM9yVp6Hwo@ep-withered-hall-a4imj7yf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async getConnection(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getConnection();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async createTables(): Promise<boolean> {
    try {
      const sql = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'bankinda',
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Access requests table
        CREATE TABLE IF NOT EXISTS access_requests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            message TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            reviewed_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP
        );
        
        -- Messages table
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_id INTEGER REFERENCES users(id),
            recipient_id INTEGER REFERENCES users(id),
            channel VARCHAR(50) DEFAULT 'global',
            content TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT 'text',
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Kajigs table (custom content)
        CREATE TABLE IF NOT EXISTS kajigs (
            id SERIAL PRIMARY KEY,
            creator_id INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'text',
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Custom components table
        CREATE TABLE IF NOT EXISTS custom_components (
            id SERIAL PRIMARY KEY,
            creator_id INTEGER REFERENCES users(id),
            name VARCHAR(255) NOT NULL,
            html_content TEXT NOT NULL,
            js_content TEXT,
            css_content TEXT,
            target_users JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default king user (xtoazt gets king role)
        INSERT INTO users (username, password_hash, role, status) 
        VALUES ('xtoazt', $1, 'king', 'approved')
        ON CONFLICT (username) DO NOTHING;
      `;

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await this.query(sql, [hashedPassword]);
      return true;
    } catch (error) {
      console.error('Table creation error:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Database;
