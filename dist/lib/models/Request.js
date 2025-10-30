export class RequestModel {
    constructor(db) {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = db;
    }
    async create(userId, message) {
        try {
            await this.db.query('INSERT INTO access_requests (user_id, message) VALUES ($1, $2)', [userId, message]);
            return true;
        }
        catch (error) {
            console.error('Create request error:', error);
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
        }
        catch (error) {
            console.error('Get pending requests error:', error);
            return [];
        }
    }
    async approve(requestId, reviewedBy) {
        try {
            await this.db.query('BEGIN');
            // Update request status
            await this.db.query('UPDATE access_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3', ['approved', reviewedBy, requestId]);
            // Get user_id from request
            const requestResult = await this.db.query('SELECT user_id FROM access_requests WHERE id = $1', [requestId]);
            if (requestResult.rows.length > 0) {
                // Update user status
                await this.db.query('UPDATE users SET status = $1 WHERE id = $2', ['approved', requestResult.rows[0].user_id]);
            }
            await this.db.query('COMMIT');
            return true;
        }
        catch (error) {
            await this.db.query('ROLLBACK');
            console.error('Approve request error:', error);
            return false;
        }
    }
    async reject(requestId, reviewedBy) {
        try {
            await this.db.query('UPDATE access_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3', ['rejected', reviewedBy, requestId]);
            return true;
        }
        catch (error) {
            console.error('Reject request error:', error);
            return false;
        }
    }
}
