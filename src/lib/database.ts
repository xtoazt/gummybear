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
        
        -- Pending AI changes table (requires king approval)
        CREATE TABLE IF NOT EXISTS pending_ai_changes (
            id SERIAL PRIMARY KEY,
            change_type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            action_data JSONB NOT NULL,
            requested_by INTEGER REFERENCES users(id),
            status VARCHAR(20) DEFAULT 'pending',
            approved_by INTEGER REFERENCES users(id),
            reviewed_at TIMESTAMP,
            executed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Vulnerability scans table
        CREATE TABLE IF NOT EXISTS vulnerability_scans (
            id SERIAL PRIMARY KEY,
            scan_id VARCHAR(255) UNIQUE NOT NULL,
            system_info JSONB NOT NULL,
            exploits_found JSONB,
            analysis_status VARCHAR(20) DEFAULT 'pending',
            analyzed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- AI Conversations table - stores important AI conversations for cross-session access
        CREATE TABLE IF NOT EXISTS ai_conversations (
            id SERIAL PRIMARY KEY,
            model_id VARCHAR(100) NOT NULL,
            channel VARCHAR(50) DEFAULT 'global',
            user_message TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            summary TEXT,
            importance VARCHAR(20) DEFAULT 'normal',
            category VARCHAR(50),
            tags TEXT[],
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_model ON ai_conversations(model_id);
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_channel ON ai_conversations(channel);
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_importance ON ai_conversations(importance);
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_category ON ai_conversations(category);
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_created ON ai_conversations(created_at DESC);
        
        -- AI Knowledge Base table - stores shared knowledge across all models and users
        CREATE TABLE IF NOT EXISTS ai_knowledge (
            id SERIAL PRIMARY KEY,
            key VARCHAR(255) UNIQUE NOT NULL,
            value TEXT NOT NULL,
            category VARCHAR(50) DEFAULT 'general',
            importance VARCHAR(20) DEFAULT 'normal',
            model_id VARCHAR(100),
            access_count INTEGER DEFAULT 0,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_ai_knowledge_key ON ai_knowledge(key);
        CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge(category);
        CREATE INDEX IF NOT EXISTS idx_ai_knowledge_importance ON ai_knowledge(importance);
        
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
