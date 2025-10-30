<?php
header('Content-Type: application/json');
session_start();

require_once '../lib/config/database.php';
require_once '../lib/models/User.php';

$db = new Database();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'login':
                $username = $input['username'] ?? '';
                $password = $input['password'] ?? '';
                
                if (empty($username) || empty($password)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Username and password are required']);
                    exit;
                }
                
                $user = User::authenticate($db->getConnection(), $username, $password);
                
                if ($user) {
                    $_SESSION['user_id'] = $user->id;
                    echo json_encode(['success' => true, 'user' => $user]);
                } else {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid credentials']);
                }
                break;
                
            case 'logout':
                session_destroy();
                echo json_encode(['success' => true]);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
        break;
        
    case 'GET':
        // Check if user is logged in
        if (isset($_SESSION['user_id'])) {
            $user = User::findById($db->getConnection(), $_SESSION['user_id']);
            if ($user) {
                echo json_encode(['logged_in' => true, 'user' => $user]);
            } else {
                echo json_encode(['logged_in' => false]);
            }
        } else {
            echo json_encode(['logged_in' => false]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
