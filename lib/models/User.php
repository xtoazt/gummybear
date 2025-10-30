<?php
class User {
    public $id;
    public $username;
    public $role;
    public $status;
    public $created_at;
    public $last_seen;
    
    public function __construct($data = []) {
        $this->id = $data['id'] ?? null;
        $this->username = $data['username'] ?? '';
        $this->role = $data['role'] ?? 'bankinda';
        $this->status = $data['status'] ?? 'pending';
        $this->created_at = $data['created_at'] ?? null;
        $this->last_seen = $data['last_seen'] ?? null;
    }
    
    public static function authenticate($db, $username, $password) {
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND status = 'approved'");
        $stmt->execute([$username]);
        $user_data = $stmt->fetch();
        
        if ($user_data && password_verify($password, $user_data['password_hash'])) {
            // Update last seen
            $update_stmt = $db->prepare("UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?");
            $update_stmt->execute([$user_data['id']]);
            
            return new User($user_data);
        }
        return false;
    }
    
    public static function findById($db, $id) {
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user_data = $stmt->fetch();
        
        return $user_data ? new User($user_data) : null;
    }
    
    public static function create($db, $username, $password) {
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        
        if ($stmt->execute([$username, $password_hash])) {
            return $db->lastInsertId();
        }
        return false;
    }
    
    public function hasPermission($permission) {
        $role_permissions = [
            'king' => ['all'],
            'admin' => ['manage_users', 'create_components', 'view_all'],
            'support' => ['use_ai', 'view_support'],
            'twin' => ['chat', 'view_kajigs'],
            'bankinda' => ['view_only']
        ];
        
        $user_permissions = $role_permissions[$this->role] ?? [];
        return in_array('all', $user_permissions) || in_array($permission, $user_permissions);
    }
    
    public function canType() {
        return !in_array($this->role, ['bankinda']);
    }
    
    public function canApproveRequests() {
        return in_array($this->role, ['king', 'admin']);
    }
    
    public function canCreateComponents() {
        return in_array($this->role, ['king', 'admin']);
    }
}
?>
