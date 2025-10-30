<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GummyBear - Chat</title>
    <link rel="stylesheet" href="https://unpkg.com/@radix-ui/themes@latest/styles.css" />
    <script src="/static/js/webllm.js" defer></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            height: 100vh;
            overflow: hidden;
        }
        
        .app-container {
            display: flex;
            height: 100vh;
        }
        
        .sidebar {
            width: 80px;
            background: #1a1a1a;
            border-right: 1px solid #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem 0;
        }
        
        .sidebar-item {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .sidebar-item:hover {
            background: #333;
        }
        
        .sidebar-item.active {
            background: #ff6b6b;
        }
        
        .sidebar-item .icon {
            font-size: 1.5rem;
        }
        
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #0f0f0f;
        }
        
        .header {
            height: 60px;
            background: #1a1a1a;
            border-bottom: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
        }
        
        .channel-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #e0e0e0;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .user-role {
            background: #ff6b6b;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .logout-btn {
            background: #333;
            border: none;
            color: #e0e0e0;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
            background: #444;
        }
        
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .message {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 12px;
            max-width: 70%;
            word-wrap: break-word;
        }
        
        .message.own {
            align-self: flex-end;
            background: #ff6b6b;
            color: white;
        }
        
        .message.other {
            align-self: flex-start;
            background: #1a1a1a;
            border: 1px solid #333;
        }
        
        .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.8rem;
        }
        
        .message-content {
            flex: 1;
        }
        
        .message-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }
        
        .message-username {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .message-role {
            background: #333;
            color: #a0a0a0;
            padding: 0.1rem 0.5rem;
            border-radius: 8px;
            font-size: 0.7rem;
        }
        
        .message-time {
            color: #666;
            font-size: 0.7rem;
        }
        
        .message-text {
            line-height: 1.4;
        }
        
        .input-container {
            padding: 1rem;
            background: #1a1a1a;
            border-top: 1px solid #333;
        }
        
        .input-form {
            display: flex;
            gap: 1rem;
            align-items: flex-end;
        }
        
        .message-input {
            flex: 1;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: #e0e0e0;
            font-size: 1rem;
            resize: none;
            min-height: 44px;
            max-height: 120px;
        }
        
        .message-input:focus {
            outline: none;
            border-color: #ff6b6b;
        }
        
        .send-btn {
            background: #ff6b6b;
            border: none;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .send-btn:hover {
            background: #ee5a52;
        }
        
        .send-btn:disabled {
            background: #333;
            cursor: not-allowed;
        }
        
        .admin-panel {
            position: fixed;
            top: 0;
            right: -400px;
            width: 400px;
            height: 100vh;
            background: #1a1a1a;
            border-left: 1px solid #333;
            transition: right 0.3s ease;
            z-index: 1000;
            overflow-y: auto;
        }
        
        .admin-panel.open {
            right: 0;
        }
        
        .admin-header {
            padding: 1rem;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .admin-title {
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: #a0a0a0;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .admin-content {
            padding: 1rem;
        }
        
        .request-item {
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .request-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .request-username {
            font-weight: 600;
        }
        
        .request-time {
            color: #666;
            font-size: 0.8rem;
        }
        
        .request-message {
            color: #a0a0a0;
            margin-bottom: 1rem;
            line-height: 1.4;
        }
        
        .request-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .approve-btn {
            background: #4caf50;
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .reject-btn {
            background: #f44336;
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .empty-state {
            text-align: center;
            color: #666;
            padding: 2rem;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="sidebar">
            <div class="sidebar-item active" data-channel="global">
                <div class="icon">🌍</div>
            </div>
            <div class="sidebar-item" data-channel="support">
                <div class="icon">🆘</div>
            </div>
            <div class="sidebar-item" data-channel="kajigs">
                <div class="icon">📝</div>
            </div>
            <div class="sidebar-item" data-channel="finder">
                <div class="icon">🔍</div>
            </div>
            <div class="sidebar-item" data-channel="dms">
                <div class="icon">💬</div>
            </div>
            <div class="sidebar-item" data-channel="settings">
                <div class="icon">⚙️</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="header">
                <div class="channel-title" id="channelTitle">Global Chat</div>
                <div class="user-info">
                    <span class="user-role">@<?= htmlspecialchars($user->role) ?></span>
                    <span><?= htmlspecialchars($user->username) ?></span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            </div>
            
            <div class="chat-container">
                <div class="messages-container" id="messagesContainer">
                    <div class="empty-state">Loading messages...</div>
                </div>
                
                <?php if ($user->canType()): ?>
                <div class="input-container">
                    <form class="input-form" id="messageForm">
                        <textarea 
                            class="message-input" 
                            id="messageInput" 
                            placeholder="Type your message..." 
                            rows="1"
                            maxlength="2000"
                        ></textarea>
                        <button type="submit" class="send-btn" id="sendBtn">Send</button>
                    </form>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <?php if ($user->canApproveRequests()): ?>
        <div class="admin-panel" id="adminPanel">
            <div class="admin-header">
                <div class="admin-title">Admin Panel</div>
                <button class="close-btn" onclick="toggleAdminPanel()">&times;</button>
            </div>
            <div class="admin-content">
                <div id="requestsList">
                    <div class="empty-state">Loading requests...</div>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
    
    <script>
        let currentChannel = 'global';
        let currentUser = {
            id: <?= $user->id ?>,
            username: '<?= addslashes($user->username) ?>',
            role: '<?= addslashes($user->role) ?>',
            canType: <?= $user->canType() ? 'true' : 'false' ?>
        };
        
        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadMessages();
            setupEventListeners();
            
            // Auto-refresh messages every 2 seconds
            setInterval(loadMessages, 2000);
            
            // Load admin requests if user can approve
            <?php if ($user->canApproveRequests()): ?>
            loadRequests();
            setInterval(loadRequests, 5000);
            <?php endif; ?>
            
            // Initialize AI if user has support role
            <?php if ($user->role === 'support'): ?>
            initializeAI();
            <?php endif; ?>
        });
        
        function setupEventListeners() {
            // Sidebar navigation
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', function() {
                    const channel = this.dataset.channel;
                    if (channel === 'settings') {
                        // Handle settings
                        return;
                    }
                    switchChannel(channel);
                });
            });
            
            // Message form
            document.getElementById('messageForm').addEventListener('submit', function(e) {
                e.preventDefault();
                sendMessage();
            });
            
            // Auto-resize textarea
            const messageInput = document.getElementById('messageInput');
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }
        
        function switchChannel(channel) {
            if (channel === currentChannel) return;
            
            currentChannel = channel;
            
            // Update sidebar
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-channel="${channel}"]`).classList.add('active');
            
            // Update header
            const channelNames = {
                'global': 'Global Chat',
                'support': 'Support',
                'kajigs': 'Kajigs',
                'finder': 'Finder',
                'dms': 'Direct Messages'
            };
            document.getElementById('channelTitle').textContent = channelNames[channel] || channel;
            
            // Load messages for new channel
            loadMessages();
        }
        
        async function loadMessages() {
            try {
                const response = await fetch(`/api/messages.php?channel=${currentChannel}`);
                const data = await response.json();
                
                if (data.messages) {
                    displayMessages(data.messages);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }
        
        function displayMessages(messages) {
            const container = document.getElementById('messagesContainer');
            
            if (messages.length === 0) {
                container.innerHTML = '<div class="empty-state">No messages yet. Start the conversation!</div>';
                return;
            }
            
            container.innerHTML = messages.map(message => {
                const isOwn = message.sender_id == currentUser.id;
                const time = new Date(message.created_at).toLocaleTimeString();
                
                return `
                    <div class="message ${isOwn ? 'own' : 'other'}">
                        <div class="message-avatar">${message.username.charAt(0).toUpperCase()}</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-username">${message.username}</span>
                                <span class="message-role">@${message.role}</span>
                                <span class="message-time">${time}</span>
                            </div>
                            <div class="message-text">${escapeHtml(message.content)}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        }
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const content = input.value.trim();
            
            if (!content || !currentUser.canType) return;
            
            try {
                const response = await fetch('/api/messages.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                        channel: currentChannel
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    input.value = '';
                    input.style.height = 'auto';
                    loadMessages();
                } else {
                    alert('Error sending message: ' + data.error);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Error sending message: ' + error.message);
            }
        }
        
        async function loadRequests() {
            try {
                const response = await fetch('/api/requests.php');
                const data = await response.json();
                
                if (data.requests) {
                    displayRequests(data.requests);
                }
            } catch (error) {
                console.error('Error loading requests:', error);
            }
        }
        
        function displayRequests(requests) {
            const container = document.getElementById('requestsList');
            
            if (requests.length === 0) {
                container.innerHTML = '<div class="empty-state">No pending requests</div>';
                return;
            }
            
            container.innerHTML = requests.map(request => {
                const time = new Date(request.created_at).toLocaleString();
                
                return `
                    <div class="request-item">
                        <div class="request-header">
                            <span class="request-username">${request.username}</span>
                            <span class="request-time">${time}</span>
                        </div>
                        <div class="request-message">${escapeHtml(request.message)}</div>
                        <div class="request-actions">
                            <button class="approve-btn" onclick="handleRequest(${request.id}, 'approve')">Approve</button>
                            <button class="reject-btn" onclick="handleRequest(${request.id}, 'reject')">Reject</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        async function handleRequest(requestId, action) {
            try {
                const response = await fetch('/api/requests.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        request_id: requestId,
                        action: action
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    loadRequests();
                } else {
                    alert('Error processing request: ' + data.error);
                }
            } catch (error) {
                console.error('Error processing request:', error);
                alert('Error processing request: ' + error.message);
            }
        }
        
        function toggleAdminPanel() {
            document.getElementById('adminPanel').classList.toggle('open');
        }
        
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/?action=logout';
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        async function initializeAI() {
            if (window.gummyBearAI) {
                try {
                    await window.gummyBearAI.initialize();
                    console.log('AI initialized for support user');
                } catch (error) {
                    console.error('Failed to initialize AI:', error);
                }
            }
        }
        
        async function sendAIMessage(message) {
            if (!window.gummyBearAI || !window.gummyBearAI.isInitialized) {
                alert('AI not available');
                return;
            }
            
            try {
                const response = await window.gummyBearAI.processMessage(message, currentChannel);
                
                // Send AI response as a message
                await sendMessage(response.response);
                
                // Handle any actions the AI wants to take
                if (response.actions && response.actions.length > 0) {
                    console.log('AI actions:', response.actions);
                }
            } catch (error) {
                console.error('AI error:', error);
                alert('AI error: ' + error.message);
            }
        }
    </script>
</body>
</html>
