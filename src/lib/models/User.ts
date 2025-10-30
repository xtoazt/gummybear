import bcrypt from 'bcryptjs';
import Database from '../database.js';

export interface User {
  id: number;
  username: string;
  role: 'king' | 'admin' | 'support' | 'twin' | 'bankinda';
  status: 'pending' | 'approved' | 'banned';
  created_at: string;
  last_seen: string;
}

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE username = $1 AND status = $2',
        [username, 'approved']
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return null;
      }

      // Update last seen
      await this.db.query(
        'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_seen: user.last_seen
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
      
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
      console.error('Find user error:', error);
      return null;
    }
  }

  async create(username: string, password: string): Promise<number | null> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await this.db.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
        [username, hashedPassword]
      );
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const result = await this.db.query(
        'SELECT id, username, role, status, created_at, last_seen FROM users ORDER BY created_at DESC'
      );
      
      return result.rows.map((user: any) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_seen: user.last_seen
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  async changeRole(userId: number, role: string): Promise<boolean> {
    try {
      await this.db.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        [role, userId]
      );
      return true;
    } catch (error) {
      console.error('Change role error:', error);
      return false;
    }
  }

  async banUser(userId: number): Promise<boolean> {
    try {
      await this.db.query(
        'UPDATE users SET status = $1 WHERE id = $2',
        ['banned', userId]
      );
      return true;
    } catch (error) {
      console.error('Ban user error:', error);
      return false;
    }
  }

  async unbanUser(userId: number): Promise<boolean> {
    try {
      await this.db.query(
        'UPDATE users SET status = $1 WHERE id = $2',
        ['approved', userId]
      );
      return true;
    } catch (error) {
      console.error('Unban user error:', error);
      return false;
    }
  }

  hasPermission(user: User, permission: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      'king': ['all'],
      'admin': ['manage_users', 'create_components', 'view_all', 'approve_requests'],
      'support': ['use_ai', 'view_support', 'create_components'],
      'twin': ['chat', 'view_kajigs'],
      'bankinda': ['view_only']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  }

  canType(user: User): boolean {
    return !['bankinda'].includes(user.role);
  }

  canApproveRequests(user: User): boolean {
    return ['king', 'admin'].includes(user.role);
  }

  canCreateComponents(user: User): boolean {
    return ['king', 'admin', 'support'].includes(user.role);
  }

  canManageUsers(user: User): boolean {
    return ['king', 'admin'].includes(user.role);
  }

  canChangeRoles(user: User): boolean {
    return user.role === 'king';
  }
}
