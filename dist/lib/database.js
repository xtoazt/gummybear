import { Pool } from 'pg';
class Database {
    constructor() {
        Object.defineProperty(this, "pool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_UAkM9yVp6Hwo@ep-withered-hall-a4imj7yf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    async getConnection() {
        return await this.pool.connect();
    }
    async query(text, params) {
        const client = await this.getConnection();
        try {
            const result = await client.query(text, params);
            return result;
        }
        finally {
            client.release();
        }
    }
    async createTables() {
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
        
        -- Insert default king user (xtoazt gets king role)
        INSERT INTO users (username, password_hash, role, status) 
        VALUES ('xtoazt', $1, 'king', 'approved')
        ON CONFLICT (username) DO NOTHING;
      `;
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await this.query(sql, [hashedPassword]);
            return true;
        }
        catch (error) {
            console.error('Table creation error:', error);
            return false;
        }
    }
    async close() {
        await this.pool.end();
    }
}
export default Database;
