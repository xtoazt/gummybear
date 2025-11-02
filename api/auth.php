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
        // Determine action: check URL path or action parameter
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        $hasAction = !empty($input['action']);
        $hasCredentials = !empty($input['username']) && !empty($input['password']);
        
        // Check URL path first
        if (strpos($requestUri, '/register') !== false) {
            $action = 'register';
        } elseif (strpos($requestUri, '/login') !== false) {
            $action = 'login';
        } elseif (strpos($requestUri, '/logout') !== false) {
            $action = 'logout';
        } elseif ($hasAction) {
            // Use action parameter if provided
            $action = $input['action'];
        } elseif ($hasCredentials) {
            // Default: if no action but has credentials, assume register
            // (login endpoint should specify /login in URL)
            $action = 'register';
        } else {
            // Default: if no action specified and no credentials, default to empty
            $action = '';
        }
        
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
                
            case 'register':
                $username = $input['username'] ?? '';
                $password = $input['password'] ?? '';
                
                if (empty($username) || empty($password)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Username and password are required']);
                    exit;
                }
                
                if (strlen($username) < 3) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Username must be at least 3 characters']);
                    exit;
                }
                
                if (strlen($password) < 6) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Password must be at least 6 characters']);
                    exit;
                }
                
                // Check if user already exists
                $check_stmt = $db->getConnection()->prepare("SELECT id FROM users WHERE username = ?");
                $check_stmt->execute([$username]);
                if ($check_stmt->fetch()) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Username already exists']);
                    exit;
                }
                
                // Create new user
                $userId = User::create($db->getConnection(), $username, $password);
                
                if ($userId) {
                    $newUser = User::findById($db->getConnection(), $userId);
                    if ($newUser) {
                        $_SESSION['user_id'] = $newUser->id;
                        echo json_encode([
                            'success' => true,
                            'user' => $newUser,
                            'message' => 'Account created successfully'
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => 'Failed to create user account']);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to create user account']);
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
