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
                // Get components available to current user
                $stmt = $db->prepare("
                    SELECT * FROM custom_components 
                    WHERE target_users IS NULL 
                    OR target_users = '[]' 
                    OR JSON_CONTAINS(target_users, JSON_QUOTE(?))
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$user->id]);
                $components = $stmt->fetchAll();
                
                echo json_encode(['components' => $components]);
                break;
                
            case 'get':
                $component_id = $_GET['id'] ?? null;
                if (!$component_id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Component ID required']);
                    exit;
                }
                
                $stmt = $db->prepare("SELECT * FROM custom_components WHERE id = ?");
                $stmt->execute([$component_id]);
                $component = $stmt->fetch();
                
                if (!$component) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Component not found']);
                    exit;
                }
                
                echo json_encode(['component' => $component]);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
        break;
        
    case 'POST':
        if (!$user->canCreateComponents()) {
            http_response_code(403);
            echo json_encode(['error' => 'No permission to create components']);
            exit;
        }
        
        $name = $input['name'] ?? '';
        $html_content = $input['html_content'] ?? '';
        $js_content = $input['js_content'] ?? '';
        $css_content = $input['css_content'] ?? '';
        $target_users = $input['target_users'] ?? [];
        
        if (empty($name) || empty($html_content)) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and HTML content are required']);
            exit;
        }
        
        $stmt = $db->prepare("
            INSERT INTO custom_components (creator_id, name, html_content, js_content, css_content, target_users) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $target_users_json = json_encode($target_users);
        $success = $stmt->execute([
            $user->id, 
            $name, 
            $html_content, 
            $js_content, 
            $css_content, 
            $target_users_json
        ]);
        
        if ($success) {
            echo json_encode(['success' => true, 'id' => $db->getConnection()->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create component']);
        }
        break;
        
    case 'DELETE':
        if (!$user->canCreateComponents()) {
            http_response_code(403);
            echo json_encode(['error' => 'No permission to delete components']);
            exit;
        }
        
        $component_id = $input['id'] ?? null;
        if (!$component_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Component ID required']);
            exit;
        }
        
        // Check if user created this component or is king/admin
        $stmt = $db->prepare("SELECT creator_id FROM custom_components WHERE id = ?");
        $stmt->execute([$component_id]);
        $component = $stmt->fetch();
        
        if (!$component) {
            http_response_code(404);
            echo json_encode(['error' => 'Component not found']);
            exit;
        }
        
        if ($component['creator_id'] != $user->id && !in_array($user->role, ['king', 'admin'])) {
            http_response_code(403);
            echo json_encode(['error' => 'No permission to delete this component']);
            exit;
        }
        
        $stmt = $db->prepare("DELETE FROM custom_components WHERE id = ?");
        $success = $stmt->execute([$component_id]);
        
        if ($success) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete component']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
