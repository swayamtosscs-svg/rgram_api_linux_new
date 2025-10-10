# 🔧 Forgot Password API Fix Guide

## 🚨 Problem
The forgot password API is returning a **500 Internal Server Error** when you try to send a POST request to:
```
POST http://localhost:3000/api/auth/forgot-password
```

## 🔍 Root Causes
The 500 error is typically caused by:

1. **Missing Environment Variables** - Required configuration not set
2. **Database Connection Issues** - MongoDB not accessible
3. **SMTP Configuration Problems** - Email service not configured
4. **Missing Dependencies** - Required packages not installed

## 🛠️ Step-by-Step Fix

### 1. Create Environment Configuration File

Create a `.env.local` file in your project root with the following content:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/rgram

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=RGram

# Security Settings
PASSWORD_RESET_TOKEN_EXPIRY=900000

# Development vs Production
NODE_ENV=development
```

### 2. Configure MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
```bash
# Replace MONGODB_URI with your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

### 3. Configure Email Service (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the App Password** as `SMTP_PASS` in `.env.local`

### 4. Install Required Dependencies

```bash
npm install dotenv
```

### 5. Restart Development Server

```bash
npm run dev
```

## 🧪 Testing the Fix

### Run Setup Script
```bash
node setup-forgot-password.js
```

### Test Database Connection
```bash
node test-db-connection.js
```

### Test API Endpoint
```bash
node test-forgot-password.js
```

### Manual Testing with Postman
```
POST http://localhost:3000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 🔍 Troubleshooting

### Common Error Messages

**"Database configuration error"**
- Check if `MONGODB_URI` is set in `.env.local`
- Verify MongoDB is running and accessible

**"Email service configuration error"**
- Check if `SMTP_USER` and `SMTP_PASS` are set
- Verify Gmail app password is correct

**"Database connection error"**
- MongoDB service not running
- Wrong connection string
- Network/firewall issues

**"Email service error"**
- Invalid SMTP credentials
- Gmail security settings blocking access
- Network connectivity issues

### Debug Steps

1. **Check Console Logs** - Look for specific error messages
2. **Verify Environment Variables** - Use the setup script
3. **Test Database Connection** - Use the database test script
4. **Check Network** - Ensure ports are accessible
5. **Verify Dependencies** - All required packages installed

## 📋 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/rgram` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password/app password | `your-app-password` |
| `NEXT_PUBLIC_APP_URL` | Your app's base URL | `http://localhost:3000` |
| `APP_NAME` | Application name | `RGram` |

## 🚀 Production Considerations

1. **Use Environment-Specific Files**:
   - `.env.local` for development
   - `.env.production` for production
   - `.env.staging` for staging

2. **Secure SMTP Configuration**:
   - Use OAuth2 instead of app passwords
   - Consider using email service providers (SendGrid, Mailgun)

3. **Database Security**:
   - Use connection pooling
   - Implement proper authentication
   - Use SSL connections

4. **Rate Limiting**:
   - Implement request throttling
   - Prevent abuse of password reset endpoints

## 📞 Support

If you're still experiencing issues:

1. Check the console logs for specific error messages
2. Run the diagnostic scripts provided
3. Verify all environment variables are set correctly
4. Ensure all services (MongoDB, email) are accessible

## ✅ Success Indicators

When the API is working correctly, you should see:

- ✅ Status: 200 OK
- ✅ Response: `{"success": true, "message": "If an account with that email exists, a password reset link has been sent."}`
- ✅ No 500 errors in console
- ✅ Database connection successful
- ✅ Email service accessible
