export class PendingChangeModel {
    constructor(db) {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.db = db;
    }
    async create(changeType, title, description, actionData, requestedBy) {
        try {
            const result = await this.db.query(`INSERT INTO pending_ai_changes (change_type, title, description, action_data, requested_by) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`, [changeType, title, description || '', JSON.stringify(actionData), requestedBy]);
            return result.rows[0]?.id || null;
        }
        catch (error) {
            console.error('Create pending change error:', error);
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
        }
        catch (error) {
            console.error('Get pending changes error:', error);
            return [];
        }
    }
    async getById(id) {
        try {
            const result = await this.db.query('SELECT * FROM pending_ai_changes WHERE id = $1', [id]);
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
        }
        catch (error) {
            console.error('Get pending change by id error:', error);
            return null;
        }
    }
    async approve(changeId, approvedBy) {
        try {
            await this.db.query(`UPDATE pending_ai_changes 
         SET status = 'approved', approved_by = $1, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = $2`, [approvedBy, changeId]);
            return true;
        }
        catch (error) {
            console.error('Approve change error:', error);
            return false;
        }
    }
    async reject(changeId, approvedBy) {
        try {
            await this.db.query(`UPDATE pending_ai_changes 
         SET status = 'rejected', approved_by = $1, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = $2`, [approvedBy, changeId]);
            return true;
        }
        catch (error) {
            console.error('Reject change error:', error);
            return false;
        }
    }
    async markExecuted(changeId) {
        try {
            await this.db.query(`UPDATE pending_ai_changes 
         SET status = 'executed', executed_at = CURRENT_TIMESTAMP 
         WHERE id = $1`, [changeId]);
            return true;
        }
        catch (error) {
            console.error('Mark executed error:', error);
            return false;
        }
    }
}
