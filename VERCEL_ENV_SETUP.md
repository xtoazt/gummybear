# 🔧 Vercel Environment Variables Setup Guide

## ⚠️ **Fixed the Issue**

The `vercel.json` file was referencing secrets that didn't exist. Environment variables should be set directly in the Vercel dashboard, not in `vercel.json`.

## 📋 **Required Environment Variables**

You need to set these environment variables in your Vercel project:

### **1. DATABASE_URL** (Required)
Your Neon PostgreSQL connection string:
```
postgresql://neondb_owner:npg_UAkM9yVp6Hwo@ep-withered-hall-a4imj7yf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **2. JWT_SECRET** (Required)
A secret key for JWT token generation (use a strong random string):
```
your-super-secret-jwt-key-here-min-32-chars
```

### **3. GITHUB_TOKEN** (Optional - for AI code modification)
GitHub Personal Access Token with `repo` scope:
```
ghp_your_github_token_here
```

### **4. GITHUB_OWNER** (Optional - for AI code modification)
Your GitHub username:
```
xtoazt
```

### **5. GITHUB_REPO** (Optional - for AI code modification)
Repository name:
```
gummybear
```

### **6. GITHUB_BRANCH** (Optional - for AI code modification)
Branch name (usually `main` or `master`):
```
main
```

## 🚀 **How to Set Environment Variables in Vercel**

### **Method 1: Via Vercel Dashboard (Recommended)**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your database connection string
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. Repeat for each environment variable

### **Method 2: Via Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set environment variables
vercel env add DATABASE_URL production
# Paste your database URL when prompted

vercel env add JWT_SECRET production
# Paste your JWT secret when prompted

# Add GitHub variables (optional)
vercel env add GITHUB_TOKEN production
vercel env add GITHUB_OWNER production
vercel env add GITHUB_REPO production
vercel env add GITHUB_BRANCH production
```

### **Method 3: Using Vercel Secrets (Advanced)**

If you want to use secrets (for sensitive values):

```bash
# Create secrets
vercel secrets add database_url "your-database-url-here"
vercel secrets add jwt_secret "your-jwt-secret-here"
vercel secrets add github_token "your-github-token-here"

# Then in vercel.json, you can reference them:
# "env": {
#   "DATABASE_URL": "@database_url",
#   "JWT_SECRET": "@jwt_secret",
#   "GITHUB_TOKEN": "@github_token"
# }
```

## ✅ **After Setting Environment Variables**

1. **Redeploy your application**:
   ```bash
   vercel --prod
   ```
   
   Or trigger a redeploy from the Vercel dashboard:
   - Go to **Deployments**
   - Click the three dots on your latest deployment
   - Select **Redeploy**

2. **Verify the variables are loaded**:
   - Check the deployment logs
   - Your app should start without the "Secret does not exist" error

## 🔒 **Security Best Practices**

- ✅ Never commit `.env` files to git
- ✅ Use different JWT secrets for production and development
- ✅ Rotate secrets periodically
- ✅ Use Vercel's environment variable encryption for sensitive data
- ✅ Restrict GitHub token permissions (only `repo` scope needed)

## 📝 **Quick Setup Checklist**

- [ ] Set `DATABASE_URL` in Vercel dashboard
- [ ] Set `JWT_SECRET` in Vercel dashboard
- [ ] (Optional) Set `GITHUB_TOKEN` if using AI code modification
- [ ] (Optional) Set `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`
- [ ] Redeploy the application
- [ ] Verify the app starts without errors

## 🐛 **Troubleshooting**

**Issue**: "Environment Variable references Secret which does not exist"
- ✅ **Solution**: Remove `env` section from `vercel.json` and set variables in dashboard

**Issue**: Variables not updating after deployment
- ✅ **Solution**: Redeploy the application after adding/changing variables

**Issue**: Connection refused to database
- ✅ **Solution**: Check `DATABASE_URL` format and ensure it's correct
- ✅ **Solution**: Verify database is accessible (not IP-restricted)

**Issue**: JWT authentication failing
- ✅ **Solution**: Ensure `JWT_SECRET` is set and matches what you expect

## 🎉 **Done!**

Once you've set the environment variables and redeployed, your GummyBear app should work perfectly on Vercel!
