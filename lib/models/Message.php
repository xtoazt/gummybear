<?php
class Message {
    public $id;
    public $sender_id;
    public $recipient_id;
    public $channel;
    public $content;
    public $message_type;
    public $metadata;
    public $created_at;
    
    public function __construct($data = []) {
        $this->id = $data['id'] ?? null;
        $this->sender_id = $data['sender_id'] ?? null;
        $this->recipient_id = $data['recipient_id'] ?? null;
        $this->channel = $data['channel'] ?? 'global';
        $this->content = $data['content'] ?? '';
        $this->message_type = $data['message_type'] ?? 'text';
        $this->metadata = $data['metadata'] ? json_decode($data['metadata'], true) : [];
        $this->created_at = $data['created_at'] ?? null;
    }
    
    public static function create($db, $sender_id, $content, $channel = 'global', $recipient_id = null, $message_type = 'text', $metadata = []) {
        $stmt = $db->prepare("
            INSERT INTO messages (sender_id, recipient_id, channel, content, message_type, metadata) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $metadata_json = json_encode($metadata);
        return $stmt->execute([$sender_id, $recipient_id, $channel, $content, $message_type, $metadata_json]);
    }
    
    public static function getChannelMessages($db, $channel, $limit = 50) {
        $stmt = $db->prepare("
            SELECT m.*, u.username, u.role 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.channel = ? 
            ORDER BY m.created_at DESC 
            LIMIT ?
        ");
        $stmt->execute([$channel, $limit]);
        return array_reverse($stmt->fetchAll());
    }
    
    public static function getDirectMessages($db, $user1_id, $user2_id, $limit = 50) {
        $stmt = $db->prepare("
            SELECT m.*, u.username, u.role 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE ((m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?))
            AND m.channel = 'dm'
            ORDER BY m.created_at DESC 
            LIMIT ?
        ");
        $stmt->execute([$user1_id, $user2_id, $user2_id, $user1_id, $limit]);
        return array_reverse($stmt->fetchAll());
    }
    
    public static function getRecentChannels($db, $user_id) {
        $stmt = $db->prepare("
            SELECT DISTINCT channel, MAX(created_at) as last_message
            FROM messages 
            WHERE sender_id = ? OR recipient_id = ? OR channel = 'global'
            GROUP BY channel 
            ORDER BY last_message DESC
        ");
        $stmt->execute([$user_id, $user_id]);
        return $stmt->fetchAll();
    }
}
?>
