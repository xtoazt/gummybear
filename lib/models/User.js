const bcrypt = require('bcryptjs');

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.role = data.role || 'bankinda';
    this.status = data.status || 'pending';
    this.created_at = data.created_at || null;
    this.last_seen = data.last_seen || null;
  }

  static async authenticate(db, username, password) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE username = $1 AND status = $2',
        [username, 'approved']
      );
      
      if (result.rows.length === 0) return false;
      
      const userData = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, userData.password_hash);
      
      if (isValidPassword) {
        // Update last seen
        await db.query(
          'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
          [userData.id]
        );
        
        return new User(userData);
      }
      
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  static async findById(db, id) {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Find user error:', error);
      return null;
    }
  }

  static async create(db, username, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
        [username, hashedPassword]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error('Create user error:', error);
      return false;
    }
  }

  hasPermission(permission) {
    const rolePermissions = {
      'king': ['all'],
      'admin': ['manage_users', 'create_components', 'view_all', 'approve_requests'],
      'support': ['use_ai', 'view_support', 'create_components'],
      'twin': ['chat', 'view_kajigs'],
      'bankinda': ['view_only']
    };
    
    const userPermissions = rolePermissions[this.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  }

  canType() {
    return !['bankinda'].includes(this.role);
  }

  canApproveRequests() {
    return ['king', 'admin'].includes(this.role);
  }

  canCreateComponents() {
    return ['king', 'admin', 'support'].includes(this.role);
  }

  canManageUsers() {
    return ['king', 'admin'].includes(this.role);
  }

  canChangeRoles() {
    return this.role === 'king';
  }
}

module.exports = User;
