<?php
header('Content-Type: application/json');
session_start();

require_once '../lib/config/database.php';
require_once '../lib/models/User.php';

$db = new Database();
$user = null;

if (isset($_SESSION['user_id'])) {
    $user = User::findById($db->getConnection(), $_SESSION['user_id']);
}

if (!$user || $user->status !== 'approved') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        
        switch ($action) {
            case 'list':
                // Get all users (for admin/king)
                if (!in_array($user->role, ['king', 'admin'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'No permission to view all users']);
                    exit;
                }
                
                $stmt = $db->prepare("SELECT id, username, role, status, created_at, last_seen FROM users ORDER BY created_at DESC");
                $stmt->execute();
                $users = $stmt->fetchAll();
                
                echo json_encode(['users' => $users]);
                break;
                
            case 'get':
                $user_id = $_GET['id'] ?? null;
                if (!$user_id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                    exit;
                }
                
                $target_user = User::findById($db->getConnection(), $user_id);
                if (!$target_user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }
                
                echo json_encode(['user' => $target_user]);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
        break;
        
    case 'POST':
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'change_role':
                // Only king can change roles
                if ($user->role !== 'king') {
                    http_response_code(403);
                    echo json_encode(['error' => 'Only king can change user roles']);
                    exit;
                }
                
                $target_user_id = $input['user_id'] ?? null;
                $new_role = $input['role'] ?? null;
                
                if (!$target_user_id || !$new_role) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID and role are required']);
                    exit;
                }
                
                $valid_roles = ['king', 'admin', 'support', 'twin', 'bankinda'];
                if (!in_array($new_role, $valid_roles)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid role']);
                    exit;
                }
                
                $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
                $success = $stmt->execute([$new_role, $target_user_id]);
                
                if ($success) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to change role']);
                }
                break;
                
            case 'ban_user':
                // Only king and admin can ban users
                if (!in_array($user->role, ['king', 'admin'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'No permission to ban users']);
                    exit;
                }
                
                $target_user_id = $input['user_id'] ?? null;
                if (!$target_user_id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                    exit;
                }
                
                $stmt = $db->prepare("UPDATE users SET status = 'banned' WHERE id = ?");
                $success = $stmt->execute([$target_user_id]);
                
                if ($success) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to ban user']);
                }
                break;
                
            case 'unban_user':
                // Only king and admin can unban users
                if (!in_array($user->role, ['king', 'admin'])) {
                    http_response_code(403);
                    echo json_encode(['error' => 'No permission to unban users']);
                    exit;
                }
                
                $target_user_id = $input['user_id'] ?? null;
                if (!$target_user_id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'User ID required']);
                    exit;
                }
                
                $stmt = $db->prepare("UPDATE users SET status = 'approved' WHERE id = ?");
                $success = $stmt->execute([$target_user_id]);
                
                if ($success) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to unban user']);
                }
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
