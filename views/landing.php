<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GummyBear - P2P Chat</title>
    <link rel="stylesheet" href="https://unpkg.com/@radix-ui/themes@latest/styles.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .landing-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .logo {
            font-size: 4rem;
            font-weight: bold;
            color: #ff6b6b;
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #a0a0a0;
            margin-bottom: 3rem;
            text-align: center;
        }
        
        .request-form {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            display: block;
            color: #e0e0e0;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-input {
            width: 100%;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #ff6b6b;
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .form-textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .submit-btn {
            width: 100%;
            padding: 0.875rem;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        }
        
        .error {
            color: #ff6b6b;
            margin-top: 1rem;
            text-align: center;
        }
        
        .features {
            margin-top: 3rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            width: 100%;
            max-width: 800px;
        }
        
        .feature {
            text-align: center;
            color: #a0a0a0;
        }
        
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="landing-container">
        <div class="logo">🍭 GummyBear</div>
        <div class="subtitle">AI-Powered P2P Chat Platform</div>
        
        <form class="request-form" method="POST" action="/api/requests.php">
            <div class="form-group">
                <label class="form-label" for="username">Username</label>
                <input type="text" id="username" name="username" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="password">Password</label>
                <input type="password" id="password" name="password" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="message">Why do you want to join GummyBear?</label>
                <textarea id="message" name="message" class="form-input form-textarea" placeholder="Tell us about yourself and why you'd like to join our community..." required></textarea>
            </div>
            
            <button type="submit" class="submit-btn">Request Access</button>
            
            <?php if (isset($error)): ?>
                <div class="error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
        </form>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🤖</div>
                <h3>AI-Powered</h3>
                <p>Advanced AI assistance with WebLLM integration</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>End-to-end encrypted P2P communication</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Fast</h3>
                <p>Lightning-fast real-time messaging</p>
            </div>
        </div>
    </div>
    
    <script>
        document.querySelector('.request-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                username: formData.get('username'),
                password: formData.get('password'),
                message: formData.get('message')
            };
            
            try {
                const response = await fetch('/api/requests.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Request submitted successfully! You will be notified when approved.');
                    this.reset();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error submitting request: ' + error.message);
            }
        });
    </script>
</body>
</html>
