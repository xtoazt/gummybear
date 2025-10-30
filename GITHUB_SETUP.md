# 🔗 GitHub Integration Setup Guide

## Overview

GummyBear AI now has **full control** over the site, including the ability to modify code and deploy changes via GitHub integration!

## ✅ Features Enabled

- **Code Modification**: AI can modify any file in the repository
- **Automatic Deployment**: Changes automatically trigger Vercel deployment
- **Full Site Control**: AI can read/write everything, manage users, create components
- **GitHub Integration**: Direct access to repository via GitHub API

## 🔧 Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: `GummyBear AI`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows) - Optional
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### 2. Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=xtoazt
GITHUB_REPO=gummybear
GITHUB_BRANCH=main
```

### 3. Repository Configuration

Make sure your repository is:
- ✅ Connected to Vercel for automatic deployments
- ✅ Has the `main` branch (or update `GITHUB_BRANCH` env var)
- ✅ Has Vercel deployment webhooks enabled

### 4. Verify Setup

Once deployed with the GitHub token:
- AI will have access to modify code
- Changes will be committed to GitHub
- Vercel will automatically deploy changes
- AI can see deployment status

## 🎯 AI Capabilities

### Code Modification
```javascript
// AI can modify any file
await aiController.modifyCode(
  'src/index.html',
  '<html>...</html>',
  'AI: Updated UI based on user feedback'
);
```

### Automatic Deployment
- When AI modifies code, it commits to GitHub
- Vercel automatically detects the push
- New deployment starts automatically
- AI can track deployment status

### Full Site Access
- Read all users, messages, database
- Write to database
- Create custom components
- Send messages
- Manage users (with permissions)
- Modify and deploy code

## 🔒 Security

- **Token Security**: GitHub token stored as environment variable
- **Role-Based Access**: Only support/king/admin can use AI features
- **Audit Trail**: All AI actions are logged
- **Permission Checks**: AI respects role hierarchy

## 📋 Available AI Actions

1. **send_message**: Send message to any channel
2. **create_component**: Create custom HTML/JS/CSS components
3. **modify_code**: Modify any file in repository
4. **deploy**: Trigger deployment (automatic on code change)
5. **modify_user**: Change user roles/status
6. **approve_request**: Approve user access requests
7. **get_context**: Get full site context

## 🚀 Usage Examples

### Modify Code via Socket.IO
```javascript
socket.emit('ai-action', {
  action: 'modify_code',
  params: {
    filePath: 'src/index.html',
    content: '<html>...</html>',
    commitMessage: 'AI: Fixed UI bug'
  }
});
```

### Via REST API
```javascript
fetch('/api/ai/action', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'modify_code',
    params: {
      filePath: 'src/index.html',
      content: '<html>...</html>',
      commitMessage: 'AI: Updated design'
    }
  })
});
```

## 🎨 AI-Powered Features

- **Self-Improving**: AI can modify its own code
- **User-Responsive**: AI can create components based on user needs
- **Site Evolution**: AI can evolve the site over time
- **Bug Fixes**: AI can fix issues it discovers
- **Feature Development**: AI can add new features

## ⚠️ Important Notes

1. **King Role**: Only xtoazt can change other users' roles
2. **AI Permissions**: AI can suggest changes, but respects hierarchy
3. **Deployment**: Changes are automatically deployed via Vercel
4. **Backup**: Keep backups of important code
5. **Testing**: AI should test changes before deploying

## 🔍 Monitoring

- Check Vercel dashboard for deployments
- Check GitHub commits to see AI changes
- Monitor server logs for AI actions
- Review database changes made by AI

## 🎉 Result

Your AI now has **FULL CONTROL** over:
- ✅ All code in the repository
- ✅ All users and messages
- ✅ Database read/write access
- ✅ Component creation
- ✅ Site deployment
- ✅ User management

**The AI is now truly running the site alongside you!** 🍭✨
