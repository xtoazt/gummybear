import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// dist/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// dist/lib/database.js
import { Pool } from "pg";
var Database = class {
  constructor() {
    Object.defineProperty(this, "pool", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_UAkM9yVp6Hwo@ep-withered-hall-a4imj7yf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
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
    } finally {
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
      const bcrypt2 = __require("bcryptjs");
      const hashedPassword = await bcrypt2.hash("admin123", 10);
      await this.query(sql, [hashedPassword]);
      return true;
    } catch (error) {
      console.error("Table creation error:", error);
      return false;
    }
  }
  async close() {
    await this.pool.end();
  }
};
var database_default = Database;

// dist/lib/models/User.js
import bcrypt from "bcryptjs";
var UserModel = class {
  constructor(db2) {
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.db = db2;
  }
  async authenticate(username, password) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE username = $1 AND status = $2", [username, "approved"]);
      if (result.rows.length === 0) {
        return null;
      }
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return null;
      }
      await this.db.query("UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_seen: user.last_seen
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  }
  async findById(id) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_seen: user.last_seen
      };
    } catch (error) {
      console.error("Find user error:", error);
      return null;
    }
  }
  async findByUsername(username) {
    try {
      const result = await this.db.query("SELECT * FROM users WHERE username = $1", [username]);
      if (result.rows.length === 0) {
        return null;
      }
      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_seen: user.last_seen
      };
    } catch (error) {
      console.error("Find user by username error:", error);
      return null;
    }
  }
  async create(username, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await this.db.query("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id", [username, hashedPassword]);
      return result.rows[0].id;
    } catch (error) {
      console.error("Create user error:", error);
      return null;
    }
  }
  async getAll() {
    try {
      const result = await this.db.query("SELECT id, username, role, status, created_at, last_seen FROM users ORDER BY created_at DESC");
      return result.rows.map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_seen: user.last_seen
      }));
    } catch (error) {
      console.error("Get all users error:", error);
      return [];
    }
  }
  async changeRole(userId, role) {
    try {
      await this.db.query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);
      return true;
    } catch (error) {
      console.error("Change role error:", error);
      return false;
    }
  }
  async banUser(userId) {
    try {
      await this.db.query("UPDATE users SET status = $1 WHERE id = $2", ["banned", userId]);
      return true;
    } catch (error) {
      console.error("Ban user error:", error);
      return false;
    }
  }
  async unbanUser(userId) {
    try {
      await this.db.query("UPDATE users SET status = $1 WHERE id = $2", ["approved", userId]);
      return true;
    } catch (error) {
      console.error("Unban user error:", error);
      return false;
    }
  }
  hasPermission(user, permission) {
    const rolePermissions = {
      "king": ["all"],
      "admin": ["manage_users", "create_components", "view_all", "approve_requests"],
      "support": ["use_ai", "view_support", "create_components"],
      "twin": ["chat", "view_kajigs"],
      "bankinda": ["view_only"]
    };
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes("all") || userPermissions.includes(permission);
  }
  canType(user) {
    return !["bankinda"].includes(user.role);
  }
  canApproveRequests(user) {
    return ["king", "admin"].includes(user.role);
  }
  canCreateComponents(user) {
    return ["king", "admin", "support"].includes(user.role);
  }
  canManageUsers(user) {
    return ["king", "admin"].includes(user.role);
  }
  canChangeRoles(user) {
    return user.role === "king";
  }
};

// dist/lib/models/Message.js
var MessageModel = class {
  constructor(db2) {
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.db = db2;
  }
  async create(senderId, content, channel = "global", recipientId, messageType = "text", metadata = {}) {
    try {
      await this.db.query(`INSERT INTO messages (sender_id, recipient_id, channel, content, message_type, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)`, [senderId, recipientId, channel, content, messageType, JSON.stringify(metadata)]);
      return true;
    } catch (error) {
      console.error("Create message error:", error);
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
    } catch (error) {
      console.error("Get channel messages error:", error);
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
    } catch (error) {
      console.error("Get direct messages error:", error);
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
    } catch (error) {
      console.error("Get recent channels error:", error);
      return [];
    }
  }
};

// dist/lib/models/Request.js
var RequestModel = class {
  constructor(db2) {
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.db = db2;
  }
  async create(userId, message) {
    try {
      await this.db.query("INSERT INTO access_requests (user_id, message) VALUES ($1, $2)", [userId, message]);
      return true;
    } catch (error) {
      console.error("Create request error:", error);
      return false;
    }
  }
  async getAllPending() {
    try {
      const result = await this.db.query(`SELECT r.*, u.username 
         FROM access_requests r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.status = 'pending' 
         ORDER BY r.created_at ASC`);
      return result.rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        message: row.message,
        status: row.status,
        reviewed_by: row.reviewed_by,
        created_at: row.created_at,
        reviewed_at: row.reviewed_at,
        username: row.username
      }));
    } catch (error) {
      console.error("Get pending requests error:", error);
      return [];
    }
  }
  async approve(requestId, reviewedBy) {
    try {
      await this.db.query("BEGIN");
      await this.db.query("UPDATE access_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3", ["approved", reviewedBy, requestId]);
      const requestResult = await this.db.query("SELECT user_id FROM access_requests WHERE id = $1", [requestId]);
      if (requestResult.rows.length > 0) {
        await this.db.query("UPDATE users SET status = $1 WHERE id = $2", ["approved", requestResult.rows[0].user_id]);
      }
      await this.db.query("COMMIT");
      return true;
    } catch (error) {
      await this.db.query("ROLLBACK");
      console.error("Approve request error:", error);
      return false;
    }
  }
  async reject(requestId, reviewedBy) {
    try {
      await this.db.query("UPDATE access_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3", ["rejected", reviewedBy, requestId]);
      return true;
    } catch (error) {
      console.error("Reject request error:", error);
      return false;
    }
  }
};

// dist/lib/models/PendingChange.js
var PendingChangeModel = class {
  constructor(db2) {
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.db = db2;
  }
  async create(changeType, title, description, actionData, requestedBy) {
    try {
      const result = await this.db.query(`INSERT INTO pending_ai_changes (change_type, title, description, action_data, requested_by) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`, [changeType, title, description || "", JSON.stringify(actionData), requestedBy]);
      return result.rows[0]?.id || null;
    } catch (error) {
      console.error("Create pending change error:", error);
      return null;
    }
  }
  async getAllPending() {
    try {
      const result = await this.db.query(`SELECT * FROM pending_ai_changes 
         WHERE status = 'pending' 
         ORDER BY created_at DESC`);
      return result.rows.map((row) => ({
        id: row.id,
        change_type: row.change_type,
        title: row.title,
        description: row.description,
        action_data: row.action_data || {},
        requested_by: row.requested_by,
        status: row.status,
        approved_by: row.approved_by,
        reviewed_at: row.reviewed_at,
        executed_at: row.executed_at,
        created_at: row.created_at
      }));
    } catch (error) {
      console.error("Get pending changes error:", error);
      return [];
    }
  }
  async getById(id) {
    try {
      const result = await this.db.query("SELECT * FROM pending_ai_changes WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        id: row.id,
        change_type: row.change_type,
        title: row.title,
        description: row.description,
        action_data: row.action_data || {},
        requested_by: row.requested_by,
        status: row.status,
        approved_by: row.approved_by,
        reviewed_at: row.reviewed_at,
        executed_at: row.executed_at,
        created_at: row.created_at
      };
    } catch (error) {
      console.error("Get pending change by id error:", error);
      return null;
    }
  }
  async approve(changeId, approvedBy) {
    try {
      await this.db.query(`UPDATE pending_ai_changes 
         SET status = 'approved', approved_by = $1, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = $2`, [approvedBy, changeId]);
      return true;
    } catch (error) {
      console.error("Approve change error:", error);
      return false;
    }
  }
  async reject(changeId, approvedBy) {
    try {
      await this.db.query(`UPDATE pending_ai_changes 
         SET status = 'rejected', approved_by = $1, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = $2`, [approvedBy, changeId]);
      return true;
    } catch (error) {
      console.error("Reject change error:", error);
      return false;
    }
  }
  async markExecuted(changeId) {
    try {
      await this.db.query(`UPDATE pending_ai_changes 
         SET status = 'executed', executed_at = CURRENT_TIMESTAMP 
         WHERE id = $1`, [changeId]);
      return true;
    } catch (error) {
      console.error("Mark executed error:", error);
      return false;
    }
  }
};

// dist/lib/ai/AIController.js
import { Octokit } from "@octokit/rest";
var AIController = class {
  constructor(db2) {
    Object.defineProperty(this, "db", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "userModel", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "messageModel", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "requestModel", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "pendingChangeModel", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "githubClient", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    Object.defineProperty(this, "NO_APPROVAL_NEEDED", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["send_message", "get_context"]
    });
    this.db = db2;
    this.userModel = new UserModel(db2);
    this.messageModel = new MessageModel(db2);
    this.requestModel = new RequestModel(db2);
    this.pendingChangeModel = new PendingChangeModel(db2);
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      this.githubClient = new Octokit({
        auth: githubToken
      });
    }
  }
  getCapabilities() {
    return {
      canReadAllMessages: true,
      canReadAllUsers: true,
      canReadDatabaseESP: true,
      canWriteDatabase: true,
      canCreateComponents: true,
      canSendMessages: true,
      canManageUsers: true,
      // AI can suggest user changes (king still approves)
      canModifyCode: this.githubClient !== null,
      canDeployChanges: this.githubClient !== null
    };
  }
  async getFullContext() {
    try {
      const users = await this.userModel.getAll();
      const globalMessages = await this.messageModel.getChannelMessages("global", 100);
      const supportMessages = await this.messageModel.getChannelMessages("support", 50);
      const kajigsMessages = await this.messageModel.getChannelMessages("kajigs", 50);
      const requests = await this.requestModel.getAllPending();
      const dbInfo = await this.getDatabaseInfo();
      let vulnerabilityScans = [];
      try {
        const scansResult = await this.db.query(`SELECT scan_id, system_info, exploits_found, analysis_status, created_at 
           FROM vulnerability_scans 
           ORDER BY created_at DESC 
           LIMIT 20`);
        vulnerabilityScans = scansResult.rows || [];
      } catch (error) {
        console.log("Could not fetch vulnerability scans:", error);
      }
      return {
        users,
        messages: [...globalMessages, ...supportMessages, ...kajigsMessages],
        requests,
        database: dbInfo,
        vulnerabilityScans,
        siteState: {
          totalUsers: users.length,
          onlineUsers: 0,
          // Will be updated from socket
          pendingRequests: requests.length,
          recentActivity: "active",
          pendingScans: vulnerabilityScans.filter((s) => s.analysis_status === "pending").length
        }
      };
    } catch (error) {
      console.error("Error getting AI context:", error);
      throw error;
    }
  }
  async analyzeVulnerabilityScan(scanId) {
    try {
      const result = await this.db.query("SELECT * FROM vulnerability_scans WHERE scan_id = $1", [scanId]);
      if (result.rows.length === 0) {
        throw new Error("Scan not found");
      }
      const scan = result.rows[0];
      const systemInfo = scan.system_info;
      const exploits = await this.findExploits(systemInfo);
      await this.db.query(`UPDATE vulnerability_scans 
         SET exploits_found = $1, analysis_status = $2, analyzed_at = NOW()
         WHERE scan_id = $3`, [JSON.stringify(exploits), "completed", scanId]);
      return exploits;
    } catch (error) {
      console.error("Error analyzing vulnerability scan:", error);
      throw error;
    }
  }
  async findExploits(systemInfo) {
    const exploits = [];
    if (systemInfo.chromeOSInfo?.chromeOSVersion) {
      const version = systemInfo.chromeOSInfo.chromeOSVersion;
      if (version.match(/^(100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120)/)) {
        exploits.push({
          type: "unenrollment",
          severity: "high",
          description: "Potential unenrollment exploit - OOBE bypass possible in ChromeOS versions 100-120",
          method: "OOBE (Out-of-Box Experience) manipulation",
          details: "These versions have known vulnerabilities in the enrollment process"
        });
      }
    }
    if (systemInfo.chromeOSInfo?.chromeVersion) {
      const chromeVersion = parseInt(systemInfo.chromeOSInfo.chromeVersion.split(".")[0]);
      if (chromeVersion >= 90 && chromeVersion < 120) {
        exploits.push({
          type: "webview",
          severity: "medium",
          description: "WebView vulnerability detected",
          method: "WebView component manipulation",
          details: "ChromeOS WebView components in this version range have known security issues"
        });
      }
    }
    if (systemInfo.fileSystemAccess?.supported) {
      exploits.push({
        type: "filesystem",
        severity: "high",
        description: "File System Access API available",
        method: "Direct file system manipulation",
        details: "Browser has access to file system, enabling deeper system exploration"
      });
    }
    if (systemInfo.platform && systemInfo.platform.includes("Linux")) {
      exploits.push({
        type: "dev_mode",
        severity: "low",
        description: "Potential developer mode or Linux container access",
        method: "Linux container exploitation",
        details: "ChromeOS Linux environment may provide additional attack vectors"
      });
    }
    if (systemInfo.chromeOSInfo?.isChromeOS) {
      exploits.push({
        type: "chromeos_environment",
        severity: "info",
        description: "Confirmed ChromeOS environment detected",
        method: "OS-specific exploitation",
        details: "System is running ChromeOS, enabling targeted exploit research"
      });
    }
    return exploits;
  }
  async getDatabaseInfo() {
    try {
      const tables = ["users", "messages", "access_requests", "kajigs", "custom_components"];
      const info = {};
      for (const table of tables) {
        const result = await this.db.query(`SELECT COUNT(*) as count FROM ${table}`);
        info[table] = {
          count: result.rows[0]?.count || 0,
          table
        };
      }
      return info;
    } catch (error) {
      console.error("Error getting database info:", error);
      return {};
    }
  }
  async sendMessageAsAI(channel, content, userId) {
    const aiUserId = userId || 1;
    return await this.messageModel.create(aiUserId, content, channel, void 0, "ai");
  }
  async createComponent(name, html, js, css, targetUsers) {
    try {
      const result = await this.db.query(`INSERT INTO custom_components (creator_id, name, html_content, js_content, css_content, target_users) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`, [1, name, html, js, css, JSON.stringify(targetUsers)]);
      return result.rows[0]?.id || null;
    } catch (error) {
      console.error("Error creating component:", error);
      return null;
    }
  }
  async modifyCode(filePath, content, commitMessage) {
    if (!this.githubClient) {
      throw new Error("GitHub integration not configured");
    }
    try {
      const owner = process.env.GITHUB_OWNER || "xtoazt";
      const repo = process.env.GITHUB_REPO || "gummybear";
      const branch = process.env.GITHUB_BRANCH || "main";
      let sha;
      try {
        const { data } = await this.githubClient.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branch
        });
        if ("sha" in data && data.sha) {
          sha = data.sha;
        }
      } catch (error) {
        if (error.status !== 404)
          throw error;
      }
      const encodedContent = Buffer.from(content).toString("base64");
      await this.githubClient.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        content: encodedContent,
        branch,
        sha
      });
      return true;
    } catch (error) {
      console.error("Error modifying code:", error);
      throw error;
    }
  }
  async deployChanges() {
    if (!this.githubClient) {
      throw new Error("GitHub integration not configured");
    }
    try {
      return true;
    } catch (error) {
      console.error("Error deploying changes:", error);
      return false;
    }
  }
  async modifyUser(userId, changes) {
    try {
      if (changes.role) {
        await this.userModel.changeRole(userId, changes.role);
      }
      if (changes.status) {
        if (changes.status === "banned") {
          await this.userModel.banUser(userId);
        } else if (changes.status === "approved") {
          await this.userModel.unbanUser(userId);
        }
      }
      return true;
    } catch (error) {
      console.error("Error modifying user:", error);
      return false;
    }
  }
  async approveRequest(requestId, reviewerId = 1) {
    return await this.requestModel.approve(requestId, reviewerId);
  }
  async executeAction(action, params, userId, isKing = false) {
    if (this.NO_APPROVAL_NEEDED.includes(action)) {
      return await this.executeActionDirect(action, params);
    }
    if (isKing) {
      return await this.executeActionDirect(action, params);
    }
    const changeType = action;
    const title = this.getActionTitle(action, params);
    const description = this.getActionDescription(action, params);
    const pendingId = await this.pendingChangeModel.create(changeType, title, description, { action, params }, userId || 1);
    return { pending: true, pendingChangeId: pendingId, message: "Change pending king approval" };
  }
  async executeActionDirect(action, params) {
    switch (action) {
      case "send_message":
        return await this.sendMessageAsAI(params.channel, params.content, params.userId);
      case "create_component":
        return await this.createComponent(params.name, params.html, params.js || "", params.css || "", params.targetUsers || []);
      case "modify_code":
        return await this.modifyCode(params.filePath, params.content, params.commitMessage);
      case "deploy":
        return await this.deployChanges();
      case "modify_user":
        return await this.modifyUser(params.userId, params.changes);
      case "approve_request":
        return await this.approveRequest(params.requestId, params.reviewerId);
      case "get_context":
        return await this.getFullContext();
      case "analyze_scan":
        return await this.analyzeVulnerabilityScan(params.scanId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  async executeApprovedChange(changeId) {
    try {
      const change = await this.pendingChangeModel.getById(changeId);
      if (!change || change.status !== "approved") {
        throw new Error("Change not found or not approved");
      }
      const { action, params } = change.action_data;
      await this.executeActionDirect(action, params);
      await this.pendingChangeModel.markExecuted(changeId);
      return true;
    } catch (error) {
      console.error("Error executing approved change:", error);
      return false;
    }
  }
  getActionTitle(action, params) {
    switch (action) {
      case "modify_code":
        return `Modify ${params.filePath}`;
      case "create_component":
        return `Create component: ${params.name}`;
      case "deploy":
        return "Deploy changes";
      case "modify_user":
        return `Modify user ${params.userId}`;
      default:
        return `AI Action: ${action}`;
    }
  }
  getActionDescription(action, params) {
    switch (action) {
      case "modify_code":
        return `Commit message: ${params.commitMessage || "AI requested change"}`;
      case "create_component":
        return `Component for users: ${params.targetUsers?.join(", ") || "all users"}`;
      case "deploy":
        return "Deploy latest changes to production";
      case "modify_user":
        return `Change: ${JSON.stringify(params.changes)}`;
      default:
        return `Action: ${action}`;
    }
  }
};

// dist/server.js
import jwt from "jsonwebtoken";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
dotenv.config();
var app = express();
var db = new database_default();
var userModel = new UserModel(db);
var messageModel = new MessageModel(db);
var pendingChangeModel = new PendingChangeModel(db);
var aiController = new AIController(db);
var dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await db.createTables();
      dbInitialized = true;
      console.log("\u2705 Database tables initialized");
    } catch (error) {
      console.error("\u274C Failed to initialize database:", error);
    }
  }
}
app.use(helmet({
  contentSecurityPolicy: false
  // Allow inline scripts for theme
}));
app.use(cors({
  origin: true,
  // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(async (_req, _res, next) => {
  await ensureDbInitialized();
  next();
});
var activePeers = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = /* @__PURE__ */ new Date();
  for (const [peerId, peer] of activePeers.entries()) {
    if (now.getTime() - peer.lastSeen.getTime() > 3e4) {
      activePeers.delete(peerId);
    }
  }
}, 1e4);
var JWT_SECRET = process.env.JWT_SECRET || "gummybear-secret-key";
async function authenticateRequest(req) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.body.token || req.query.token;
    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user || user.status !== "approved") {
      return null;
    }
    return user;
  } catch (err) {
    return null;
  }
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const authenticatedUser = await userModel.authenticate(username, password);
    if (authenticatedUser) {
      const token = jwt.sign({ userId: authenticatedUser.id, username: authenticatedUser.username }, JWT_SECRET, { expiresIn: "24h" });
      res.json({
        success: true,
        token,
        user: {
          id: authenticatedUser.id,
          username: authenticatedUser.username,
          role: authenticatedUser.role,
          status: authenticatedUser.status,
          created_at: authenticatedUser.created_at,
          last_seen: authenticatedUser.last_seen || (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    const userId = await userModel.create(username, password);
    if (userId) {
      const newUser = await userModel.findById(userId);
      if (newUser) {
        const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: "24h" });
        res.json({
          success: true,
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            status: newUser.status,
            created_at: newUser.created_at,
            last_seen: newUser.last_seen || (/* @__PURE__ */ new Date()).toISOString()
          },
          message: "Account created successfully"
        });
      } else {
        res.status(500).json({ error: "Failed to create user account" });
      }
    } else {
      res.status(500).json({ error: "Failed to create user account" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === "23505") {
      res.status(409).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Registration failed" });
    }
  }
});
app.post("/api/signaling/register", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { peerId } = req.body;
    if (!peerId) {
      return res.status(400).json({ error: "peerId required" });
    }
    activePeers.set(peerId, {
      userId: user.id,
      username: user.username,
      role: user.role,
      lastSeen: /* @__PURE__ */ new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Register peer error:", error);
    res.status(500).json({ error: "Failed to register peer" });
  }
});
app.get("/api/signaling/peers", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const peers = Array.from(activePeers.entries()).map(([peerId, peer]) => ({
      peerId,
      username: peer.username,
      role: peer.role,
      userId: peer.userId
    }));
    res.json({ peers });
  } catch (error) {
    console.error("Get peers error:", error);
    res.status(500).json({ error: "Failed to get peers" });
  }
});
app.post("/api/signaling/offer", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { peerId, targetPeerId, offer } = req.body;
    if (!peerId || !targetPeerId || !offer) {
      return res.status(400).json({ error: "peerId, targetPeerId, and offer required" });
    }
    const targetPeer = activePeers.get(targetPeerId);
    if (!targetPeer) {
      return res.status(404).json({ error: "Target peer not found" });
    }
    targetPeer.signalingData = { type: "offer", from: peerId, offer };
    activePeers.set(targetPeerId, targetPeer);
    res.json({ success: true });
  } catch (error) {
    console.error("Store offer error:", error);
    res.status(500).json({ error: "Failed to store offer" });
  }
});
app.post("/api/signaling/answer", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { peerId, targetPeerId, answer } = req.body;
    if (!peerId || !targetPeerId || !answer) {
      return res.status(400).json({ error: "peerId, targetPeerId, and answer required" });
    }
    const targetPeer = activePeers.get(targetPeerId);
    if (!targetPeer) {
      return res.status(404).json({ error: "Target peer not found" });
    }
    targetPeer.signalingData = { type: "answer", from: peerId, answer };
    activePeers.set(targetPeerId, targetPeer);
    res.json({ success: true });
  } catch (error) {
    console.error("Store answer error:", error);
    res.status(500).json({ error: "Failed to store answer" });
  }
});
app.post("/api/signaling/ice-candidate", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { peerId, targetPeerId, candidate } = req.body;
    if (!peerId || !targetPeerId || !candidate) {
      return res.status(400).json({ error: "peerId, targetPeerId, and candidate required" });
    }
    const targetPeer = activePeers.get(targetPeerId);
    if (!targetPeer) {
      return res.status(404).json({ error: "Target peer not found" });
    }
    if (!targetPeer.signalingData) {
      targetPeer.signalingData = { type: "ice-candidate", candidates: [] };
    }
    if (!targetPeer.signalingData.candidates) {
      targetPeer.signalingData.candidates = [];
    }
    targetPeer.signalingData.candidates.push({ from: peerId, candidate });
    activePeers.set(targetPeerId, targetPeer);
    res.json({ success: true });
  } catch (error) {
    console.error("Store ICE candidate error:", error);
    res.status(500).json({ error: "Failed to store ICE candidate" });
  }
});
app.get("/api/signaling/poll/:peerId", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { peerId } = req.params;
    const peer = activePeers.get(peerId);
    if (peer && peer.signalingData) {
      const data = peer.signalingData;
      peer.signalingData = void 0;
      activePeers.set(peerId, peer);
      res.json({ data });
    } else {
      res.json({ data: null });
    }
  } catch (error) {
    console.error("Poll signaling error:", error);
    res.status(500).json({ error: "Failed to poll signaling data" });
  }
});
app.post("/api/chat/message", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!userModel.canType(user)) {
      return res.status(403).json({ error: "You do not have permission to send messages" });
    }
    const { message, channel = "global" } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message required" });
    }
    const success = await messageModel.create(user.id, message, channel);
    if (success) {
      res.json({
        success: true,
        message: {
          username: user.username,
          message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          role: user.role
        }
      });
    } else {
      res.status(500).json({ error: "Failed to save message" });
    }
  } catch (error) {
    console.error("Chat message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});
app.get("/api/chat/messages", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const channel = req.query.channel || "global";
    const limit = parseInt(req.query.limit) || 50;
    const messages = await messageModel.getChannelMessages(channel, limit);
    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});
app.post("/api/vulnerability/scan", async (req, res) => {
  try {
    const systemInfo = req.body;
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await db.query(`INSERT INTO vulnerability_scans (scan_id, system_info, created_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (scan_id) DO UPDATE SET system_info = $2`, [scanId, JSON.stringify(systemInfo)]);
      try {
        await aiController.analyzeVulnerabilityScan(scanId);
        console.log(`\u2705 Vulnerability scan ${scanId} analyzed`);
      } catch (analysisError) {
        console.log("Could not auto-analyze scan:", analysisError);
      }
    } catch (dbError) {
      console.log("Could not store scan in database:", dbError);
    }
    res.json({
      success: true,
      scanId,
      message: "System scan data received and queued for analysis"
    });
  } catch (error) {
    console.error("Vulnerability scan error:", error);
    res.status(500).json({ error: "Failed to process scan" });
  }
});
app.post("/api/vulnerability/verify", async (req, res) => {
  try {
    const { scanId } = req.body;
    if (!scanId) {
      return res.status(400).json({ verified: false, error: "Scan ID required" });
    }
    try {
      const result = await db.query("SELECT scan_id FROM vulnerability_scans WHERE scan_id = $1", [scanId]);
      res.json({ verified: result.rows.length > 0 });
    } catch (dbError) {
      res.json({ verified: true });
    }
  } catch (error) {
    console.error("Verify scan error:", error);
    res.json({ verified: false });
  }
});
app.post("/api/ai/action", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user || !["support", "king", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "AI access restricted" });
    }
    const { action, params } = req.body;
    const isKing = user.role === "king";
    const result = await aiController.executeAction(action, params, user.id, isKing);
    res.json({ success: true, result });
  } catch (error) {
    console.error("AI API error:", error);
    res.status(500).json({ error: "Failed to execute AI action" });
  }
});
app.post("/api/ai/conversations", async (req, res) => {
  try {
    const { model_id, channel, user_message, ai_response, summary, importance, category, tags } = req.body;
    if (!model_id || !user_message || !ai_response) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await db.query(`INSERT INTO ai_conversations 
       (model_id, channel, user_message, ai_response, summary, importance, category, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`, [
      model_id,
      channel || "global",
      user_message,
      ai_response,
      summary || null,
      importance || "normal",
      category || null,
      tags || [],
      JSON.stringify({ stored_at: (/* @__PURE__ */ new Date()).toISOString() })
    ]);
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Store conversation error:", error);
    res.status(500).json({ error: "Failed to store conversation" });
  }
});
app.get("/api/ai/conversations", async (req, res) => {
  try {
    const { model_id, channel, importance, category, limit, search } = req.query;
    let query = "SELECT * FROM ai_conversations WHERE 1=1";
    const params = [];
    let paramCount = 1;
    if (model_id) {
      query += ` AND model_id = $${paramCount++}`;
      params.push(model_id);
    }
    if (channel) {
      query += ` AND channel = $${paramCount++}`;
      params.push(channel);
    }
    if (importance) {
      query += ` AND importance = $${paramCount++}`;
      params.push(importance);
    }
    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }
    if (search) {
      query += ` AND (user_message ILIKE $${paramCount} OR ai_response ILIKE $${paramCount} OR summary ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    query += " ORDER BY created_at DESC";
    const queryLimit = limit ? parseInt(limit) : 20;
    query += ` LIMIT $${paramCount++}`;
    params.push(queryLimit);
    const result = await db.query(query, params);
    res.json({ conversations: result.rows });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});
app.post("/api/ai/knowledge", async (req, res) => {
  try {
    const { key, value, category, importance, model_id } = req.body;
    if (!key || !value) {
      return res.status(400).json({ error: "Missing required fields: key and value" });
    }
    const result = await db.query(`INSERT INTO ai_knowledge (key, value, category, importance, model_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (key) 
       DO UPDATE SET 
         value = EXCLUDED.value,
         category = EXCLUDED.category,
         importance = EXCLUDED.importance,
         access_count = ai_knowledge.access_count + 1,
         updated_at = CURRENT_TIMESTAMP,
         metadata = EXCLUDED.metadata
       RETURNING id, access_count`, [
      key,
      value,
      category || "general",
      importance || "normal",
      model_id || null,
      JSON.stringify({ stored_at: (/* @__PURE__ */ new Date()).toISOString() })
    ]);
    res.json({ success: true, id: result.rows[0].id, access_count: result.rows[0].access_count });
  } catch (error) {
    console.error("Store knowledge error:", error);
    res.status(500).json({ error: "Failed to store knowledge" });
  }
});
app.get("/api/ai/knowledge", async (req, res) => {
  try {
    const { key, category, importance, limit, search } = req.query;
    let query = "SELECT * FROM ai_knowledge WHERE 1=1";
    const params = [];
    let paramCount = 1;
    if (key) {
      query += ` AND key = $${paramCount++}`;
      params.push(key);
    }
    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }
    if (importance) {
      query += ` AND importance = $${paramCount++}`;
      params.push(importance);
    }
    if (search) {
      query += ` AND (key ILIKE $${paramCount} OR value ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    query += " ORDER BY importance DESC, access_count DESC, updated_at DESC";
    const queryLimit = limit ? parseInt(limit) : 50;
    query += ` LIMIT $${paramCount++}`;
    params.push(queryLimit);
    const result = await db.query(query, params);
    res.json({ knowledge: result.rows });
  } catch (error) {
    console.error("Get knowledge error:", error);
    res.status(500).json({ error: "Failed to get knowledge" });
  }
});
app.get("/api/ai/context", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user || !["support", "king", "admin"].includes(user.role)) {
      return res.status(403).json({ error: "AI access restricted" });
    }
    const context = await aiController.getFullContext();
    res.json(context);
  } catch (error) {
    console.error("AI context error:", error);
    res.status(500).json({ error: "Failed to get context" });
  }
});
app.get("/api/ai/capabilities", (_req, res) => {
  res.json(aiController.getCapabilities());
});
app.get("/api/pending-changes", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user || user.role !== "king") {
      return res.status(403).json({ error: "King access only" });
    }
    const changes = await pendingChangeModel.getAllPending();
    res.json(changes);
  } catch (error) {
    console.error("Get pending changes error:", error);
    res.status(500).json({ error: "Failed to get pending changes" });
  }
});
app.post("/api/pending-changes/:id/approve", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user || user.role !== "king") {
      return res.status(403).json({ error: "King access only" });
    }
    const changeId = parseInt(req.params.id);
    await pendingChangeModel.approve(changeId, user.id);
    await aiController.executeApprovedChange(changeId);
    res.json({ success: true, message: "Change approved and executed" });
  } catch (error) {
    console.error("Approve change error:", error);
    res.status(500).json({ error: "Failed to approve change" });
  }
});
app.post("/api/pending-changes/:id/reject", async (req, res) => {
  try {
    const user = await authenticateRequest(req);
    if (!user || user.role !== "king") {
      return res.status(403).json({ error: "King access only" });
    }
    const changeId = parseInt(req.params.id);
    await pendingChangeModel.reject(changeId, user.id);
    res.json({ success: true, message: "Change rejected" });
  } catch (error) {
    console.error("Reject change error:", error);
    res.status(500).json({ error: "Failed to reject change" });
  }
});
var possiblePaths = [
  path.join(process.cwd(), "dist", "client"),
  path.join(__dirname, "..", "client"),
  path.join(process.cwd(), "client"),
  path.join(__dirname, "client")
];
var clientPath = possiblePaths[0];
var indexPath = null;
try {
  for (const testPath of possiblePaths) {
    const testIndexPath = path.join(testPath, "index.html");
    try {
      if (fs.existsSync(testIndexPath)) {
        clientPath = testPath;
        indexPath = testIndexPath;
        console.log("\u2705 Found client files at:", clientPath);
        break;
      }
    } catch {
    }
  }
  if (!indexPath) {
    console.warn("\u26A0\uFE0F Could not find index.html in any of the expected paths, defaulting to:", clientPath);
    indexPath = path.join(clientPath, "index.html");
  }
} catch (error) {
  console.error("\u26A0\uFE0F Error finding client path:", error);
  indexPath = path.join(clientPath, "index.html");
}
console.log("Client path:", clientPath);
console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);
console.log("Index path:", indexPath);
app.options("*", (_req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});
app.use("/assets", express.static(path.join(clientPath, "assets"), {
  maxAge: "1y",
  etag: true
}));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }
  if (req.path.startsWith("/assets")) {
    return next();
  }
  const staticMiddleware = express.static(clientPath, {
    dotfiles: "ignore",
    index: false,
    maxAge: "1y",
    etag: true
  });
  staticMiddleware(req, res, next);
});
app.get("*", (_req, res) => {
  if (_req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  if (indexPath) {
    try {
      return res.sendFile(indexPath);
    } catch (error) {
      console.error("Error serving index.html:", error);
    }
  }
  try {
    const fallbackPath = path.join(clientPath, "index.html");
    return res.sendFile(fallbackPath);
  } catch (error) {
    console.error("Error serving index.html (fallback):", error);
    console.error("Current working directory:", process.cwd());
    console.error("Client path:", clientPath);
    res.status(404).json({
      error: "Frontend not found. Please build the frontend first.",
      debug: {
        cwd: process.cwd(),
        clientPath,
        __dirname
      }
    });
  }
});
var server_default = app;
export {
  server_default as default
};
