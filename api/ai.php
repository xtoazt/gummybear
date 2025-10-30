<?php
header('Content-Type: application/json');
session_start();

require_once '../lib/config/database.php';
require_once '../lib/models/User.php';
require_once '../lib/ai/WebLLM.php';

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

// Only support role can directly interact with AI
if ($user->role !== 'support' && $user->role !== 'king' && $user->role !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'AI access restricted to support role']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$ai = new WebLLM($db->getConnection());

switch ($method) {
    case 'POST':
        $message = $input['message'] ?? '';
        $channel = $input['channel'] ?? 'global';
        
        if (empty($message)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message is required']);
            exit;
        }
        
        $response = $ai->generateResponse($channel, $user->id, $message);
        echo json_encode($response);
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'capabilities':
                echo json_encode($ai->getAICapabilities());
                break;
            case 'context':
                $channel = $_GET['channel'] ?? 'global';
                $context = $ai->getContext($channel, $user->id);
                echo json_encode($context);
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
