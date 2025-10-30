# 🍭 GummyBear - AI-Powered P2P Chat Platform

A sophisticated peer-to-peer chat platform with AI integration, role-based access control, and custom component creation capabilities.

## ✨ Features

### 🤖 AI-Powered
- **WebLLM Integration**: Custom AI model support with full site access
- **Intelligent Responses**: AI can read all messages, users, and database content
- **Component Creation**: AI can create and send custom HTML/JS components
- **Context Awareness**: AI has full context of all conversations and user data

### 🔐 Role-Based Access Control
- **@king (xtoazt only)**: Full control, can change any user's role, approve requests
- **@admin**: Manage users, approve requests, create components
- **@support**: AI interaction, support tasks
- **@twin**: Standard chat access, view kajigs
- **@bankinda**: Read-only access, cannot type

### 💬 Chat Features
- **P2P Messaging**: Direct peer-to-peer communication
- **Multiple Channels**: Global, Support, Kajigs, Finder, DMs
- **Real-time Updates**: Live message synchronization
- **Custom Components**: Interactive elements created by admins/AI

### 🎨 Modern UI
- **TypeScript Frontend**: Fully typed, modern development experience
- **Radix UI Components**: Beautiful, accessible interface
- **Dark Mode**: Sleek dark theme throughout
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Polished user experience

## 🚀 Quick Start

### Option 1: View Demo (No Setup Required)
1. Open `demo.html` in your browser
2. See the beautiful UI and interact with the demo chat

### Option 2: Full Setup

#### Prerequisites
- PHP 7.4 or higher
- Node.js 16+ (for TypeScript build)
- PostgreSQL database (Neon Database recommended)

#### Setup Steps

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd gummybear
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Build the TypeScript frontend**
   ```bash
   npm run build
   ```

4. **Install PHP dependencies**
   ```bash
   composer install
   ```

5. **Initialize the database**
   ```bash
   php setup.php
   ```

6. **Start the development server**
   ```bash
   php -S localhost:8000
   ```

7. **Access the application**
   - Open http://localhost:8000 in your browser
   - Login as king: username `xtoazt`, password `admin123`

## 🏗️ Development

### TypeScript Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Type check only
npm run type-check
```

### Project Structure
```
gummybear/
├── src/                    # TypeScript source files
│   ├── app.ts             # Main application logic
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── styles.css         # Main stylesheet
├── api/                   # PHP API endpoints
├── lib/                   # PHP backend classes
├── dist/                  # Built frontend files
└── demo.html              # Demo page (no PHP required)
```

## Usage

### For New Users
1. Visit the landing page
2. Submit an access request with username, password, and reason
3. Wait for approval from king or admin
4. Once approved, access the full chat platform

### For Administrators
- **Approve Requests**: Use the admin panel to approve/reject user requests
- **Manage Users**: Change roles, ban/unban users
- **Create Components**: Build custom interactive elements
- **Monitor Activity**: View all users and messages

### For AI (Support Role)
- **Full Access**: Read all messages, users, and database content
- **Create Components**: Generate custom HTML/JS elements
- **Send Messages**: Communicate in any channel
- **Assist Users**: Provide intelligent support and responses

## API Endpoints

### Messages
- `GET /api/messages.php?channel={channel}` - Get messages for channel
- `POST /api/messages.php` - Send a message

### Requests
- `GET /api/requests.php` - Get pending requests (admin only)
- `POST /api/requests.php` - Submit or process requests

### AI
- `POST /api/ai.php` - Interact with AI (support role)
- `GET /api/ai.php?action=capabilities` - Get AI capabilities

### Components
- `GET /api/components.php` - List available components
- `POST /api/components.php` - Create new component
- `DELETE /api/components.php` - Delete component

### Users
- `GET /api/users.php` - List all users (admin/king)
- `POST /api/users.php` - Manage users (change roles, ban/unban)

## WebLLM Integration

The platform includes WebLLM integration for advanced AI capabilities:

```javascript
// Initialize AI
await window.gummyBearAI.initialize();

// Process message with AI
const response = await window.gummyBearAI.processMessage("Hello!", "global");
```

## Custom Components

Admins and AI can create custom interactive components:

```javascript
// Create a component via API
fetch('/api/components.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Custom Button',
        html_content: '<button onclick="alert(\'Hello!\')">Click Me</button>',
        js_content: '// Custom JavaScript',
        css_content: 'button { background: #ff6b6b; }',
        target_users: [1, 2, 3] // Specific users, or [] for all
    })
});
```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `password_hash`: Hashed password
- `role`: User role (king, admin, support, twin, bankinda)
- `status`: User status (pending, approved, banned)
- `created_at`: Account creation timestamp
- `last_seen`: Last activity timestamp

### Messages Table
- `id`: Primary key
- `sender_id`: User who sent the message
- `recipient_id`: Direct message recipient (null for channels)
- `channel`: Channel name (global, support, etc.)
- `content`: Message content
- `message_type`: Type of message (text, component, etc.)
- `metadata`: JSON metadata
- `created_at`: Message timestamp

### Access Requests Table
- `id`: Primary key
- `user_id`: User requesting access
- `message`: Request message
- `status`: Request status (pending, approved, rejected)
- `reviewed_by`: Admin who reviewed the request
- `created_at`: Request timestamp
- `reviewed_at`: Review timestamp

### Custom Components Table
- `id`: Primary key
- `creator_id`: User who created the component
- `name`: Component name
- `html_content`: HTML content
- `js_content`: JavaScript content
- `css_content`: CSS content
- `target_users`: JSON array of target user IDs
- `created_at`: Creation timestamp

## Security Features

- **Password Hashing**: All passwords are securely hashed
- **Session Management**: Secure session handling
- **Role-Based Access**: Granular permission system
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Protection**: Prepared statements used throughout

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, contact the development team or create an issue in the repository.

---

**GummyBear** - Where AI meets community! 🍭✨
