<?php
header('Content-Type: application/json');
session_start();

require_once '../lib/config/database.php';
require_once '../lib/models/User.php';
require_once '../lib/models/Request.php';

$db = new Database();
$user = null;

if (isset($_SESSION['user_id'])) {
    $user = User::findById($db->getConnection(), $_SESSION['user_id']);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        if (!$user || !$user->canApproveRequests()) {
            http_response_code(403);
            echo json_encode(['error' => 'No permission to view requests']);
            exit;
        }
        
        $requests = Request::getAllPending($db->getConnection());
        echo json_encode(['requests' => $requests]);
        break;
        
    case 'POST':
        if (!$user) {
            // Create new user and request
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            $message = $input['message'] ?? '';
            
            if (empty($username) || empty($password) || empty($message)) {
                http_response_code(400);
                echo json_encode(['error' => 'Username, password, and message are required']);
                exit;
            }
            
            $user_id = User::create($db->getConnection(), $username, $password);
            if ($user_id) {
                Request::create($db->getConnection(), $user_id, $message);
                echo json_encode(['success' => true, 'message' => 'Request submitted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user']);
            }
        } else {
            // Approve or reject request
            if (!$user->canApproveRequests()) {
                http_response_code(403);
                echo json_encode(['error' => 'No permission to approve requests']);
                exit;
            }
            
            $request_id = $input['request_id'] ?? null;
            $action = $input['action'] ?? '';
            
            if (!$request_id || !in_array($action, ['approve', 'reject'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request']);
                exit;
            }
            
            $success = false;
            if ($action === 'approve') {
                $success = Request::approve($db->getConnection(), $request_id, $user->id);
            } else {
                $success = Request::reject($db->getConnection(), $request_id, $user->id);
            }
            
            if ($success) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to process request']);
            }
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
