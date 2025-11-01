import bcrypt from 'bcryptjs';
export class UserModel {
    constructor(db) {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = db;
    }
    async authenticate(username, password) {
        try {
            const result = await this.db.query('SELECT * FROM users WHERE username = $1 AND status = $2', [username, 'approved']);
            if (result.rows.length === 0) {
                return null;
            }
            const user = result.rows[0];
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return null;
            }
            // Update last seen
            await this.db.query('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
            return {
                id: user.id,
                username: user.username,
                role: user.role,
                status: user.status,
                created_at: user.created_at,
                last_seen: user.last_seen
            };
        }
        catch (error) {
            console.error('Authentication error:', error);
            return null;
        }
    }
    async findById(id) {
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
        }
        catch (error) {
            console.error('Find user error:', error);
            return null;
        }
    }
    async findByUsername(username) {
        try {
            const result = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
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
        }
        catch (error) {
            console.error('Find user by username error:', error);
            return null;
        }
    }
    async create(username, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await this.db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
            return result.rows[0].id;
        }
        catch (error) {
            console.error('Create user error:', error);
            return null;
        }
    }
    async getAll() {
        try {
            const result = await this.db.query('SELECT id, username, role, status, created_at, last_seen FROM users ORDER BY created_at DESC');
            return result.rows.map((user) => ({
                id: user.id,
                username: user.username,
                role: user.role,
                status: user.status,
                created_at: user.created_at,
                last_seen: user.last_seen
            }));
        }
        catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    }
    async changeRole(userId, role) {
        try {
            await this.db.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
            return true;
        }
        catch (error) {
            console.error('Change role error:', error);
            return false;
        }
    }
    async banUser(userId) {
        try {
            await this.db.query('UPDATE users SET status = $1 WHERE id = $2', ['banned', userId]);
            return true;
        }
        catch (error) {
            console.error('Ban user error:', error);
            return false;
        }
    }
    async unbanUser(userId) {
        try {
            await this.db.query('UPDATE users SET status = $1 WHERE id = $2', ['approved', userId]);
            return true;
        }
        catch (error) {
            console.error('Unban user error:', error);
            return false;
        }
    }
    hasPermission(user, permission) {
        const rolePermissions = {
            'king': ['all'],
            'admin': ['manage_users', 'create_components', 'view_all', 'approve_requests'],
            'support': ['use_ai', 'view_support', 'create_components'],
            'twin': ['chat', 'view_kajigs'],
            'bankinda': ['view_only']
        };
        const userPermissions = rolePermissions[user.role] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }
    canType(user) {
        return !['bankinda'].includes(user.role);
    }
    canApproveRequests(user) {
        return ['king', 'admin'].includes(user.role);
    }
    canCreateComponents(user) {
        return ['king', 'admin', 'support'].includes(user.role);
    }
    canManageUsers(user) {
        return ['king', 'admin'].includes(user.role);
    }
    canChangeRoles(user) {
        return user.role === 'king';
    }
}
