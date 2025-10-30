<?php
class Request {
    public $id;
    public $user_id;
    public $message;
    public $status;
    public $reviewed_by;
    public $created_at;
    public $reviewed_at;
    
    public function __construct($data = []) {
        $this->id = $data['id'] ?? null;
        $this->user_id = $data['user_id'] ?? null;
        $this->message = $data['message'] ?? '';
        $this->status = $data['status'] ?? 'pending';
        $this->reviewed_by = $data['reviewed_by'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
        $this->reviewed_at = $data['reviewed_at'] ?? null;
    }
    
    public static function create($db, $user_id, $message) {
        $stmt = $db->prepare("INSERT INTO access_requests (user_id, message) VALUES (?, ?)");
        return $stmt->execute([$user_id, $message]);
    }
    
    public static function getAllPending($db) {
        $stmt = $db->prepare("
            SELECT r.*, u.username 
            FROM access_requests r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.status = 'pending' 
            ORDER BY r.created_at ASC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public static function approve($db, $request_id, $reviewed_by) {
        $db->beginTransaction();
        try {
            // Update request status
            $stmt = $db->prepare("UPDATE access_requests SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$reviewed_by, $request_id]);
            
            // Get user_id from request
            $stmt = $db->prepare("SELECT user_id FROM access_requests WHERE id = ?");
            $stmt->execute([$request_id]);
            $request = $stmt->fetch();
            
            if ($request) {
                // Update user status
                $stmt = $db->prepare("UPDATE users SET status = 'approved' WHERE id = ?");
                $stmt->execute([$request['user_id']]);
            }
            
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollback();
            return false;
        }
    }
    
    public static function reject($db, $request_id, $reviewed_by) {
        $stmt = $db->prepare("UPDATE access_requests SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?");
        return $stmt->execute([$reviewed_by, $request_id]);
    }
}
?>
