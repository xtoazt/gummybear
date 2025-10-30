<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GummyBear - Pending Approval</title>
    <link rel="stylesheet" href="https://unpkg.com/@radix-ui/themes@latest/styles.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .pending-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 3rem;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .logo {
            font-size: 3rem;
            font-weight: bold;
            color: #ff6b6b;
            margin-bottom: 1rem;
        }
        
        .status-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .status-title {
            font-size: 1.5rem;
            color: #e0e0e0;
            margin-bottom: 1rem;
        }
        
        .status-message {
            color: #a0a0a0;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        
        .logout-btn {
            padding: 0.75rem 1.5rem;
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid #ff6b6b;
            border-radius: 8px;
            color: #ff6b6b;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .logout-btn:hover {
            background: #ff6b6b;
            color: white;
        }
    </style>
</head>
<body>
    <div class="pending-container">
        <div class="logo">🍭 GummyBear</div>
        <div class="status-icon">⏳</div>
        <div class="status-title">Request Pending</div>
        <div class="status-message">
            Your access request is currently being reviewed by our administrators. 
            You will be notified once your request has been approved or rejected.
            <br><br>
            Thank you for your patience!
        </div>
        <a href="?action=logout" class="logout-btn">Logout</a>
    </div>
</body>
</html>
