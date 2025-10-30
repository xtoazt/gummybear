<?php
header('Content-Type: application/json');
session_start();

require_once '../lib/config/database.php';
require_once '../lib/models/User.php';
require_once '../lib/models/Message.php';

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
        $channel = $_GET['channel'] ?? 'global';
        $recipient_id = $_GET['recipient_id'] ?? null;
        
        if ($channel === 'dm' && $recipient_id) {
            $messages = Message::getDirectMessages($db->getConnection(), $user->id, $recipient_id);
        } else {
            $messages = Message::getChannelMessages($db->getConnection(), $channel);
        }
        
        echo json_encode(['messages' => $messages]);
        break;
        
    case 'POST':
        if (!$user->canType()) {
            http_response_code(403);
            echo json_encode(['error' => 'No permission to send messages']);
            exit;
        }
        
        $content = $input['content'] ?? '';
        $channel = $input['channel'] ?? 'global';
        $recipient_id = $input['recipient_id'] ?? null;
        $message_type = $input['message_type'] ?? 'text';
        $metadata = $input['metadata'] ?? [];
        
        if (empty($content)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message content is required']);
            exit;
        }
        
        $success = Message::create($db->getConnection(), $user->id, $content, $channel, $recipient_id, $message_type, $metadata);
        
        if ($success) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
