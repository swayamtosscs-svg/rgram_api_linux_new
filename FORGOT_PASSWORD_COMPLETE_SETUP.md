# 🔐 Forgot Password Complete Setup Guide

This guide will help you set up the complete forgot password functionality for R-GRAM, including email configuration and testing.

## 📋 Prerequisites

1. **Gmail Account** with 2-Factor Authentication enabled
2. **MongoDB** database (local or Atlas)
3. **Node.js** and npm installed

## 🚀 Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rgram_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rgram_db

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=R-GRAM
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# OTP Configuration
OTP_EXPIRE_MINUTES=10
```

### 2. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS`

### 3. Install Dependencies

```bash
npm install
```

## 🧪 Testing the Setup

### 1. Test Email Configuration

Run the email configuration check:

```bash
node check-email-config.js
```

This will verify your email settings and send a test email.

### 2. Test Forgot Password API

Run the forgot password test:

```bash
node test-forgot-password.js
```

### 3. Use the Demo Page

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the demo page:
   ```
   http://localhost:3000/forgot-password-demo.html
   ```

3. Enter your email and test the functionality

## 🔄 Complete Password Reset Flow

### Step 1: Request Password Reset

**API Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Step 2: User Receives Email

The user receives an email with:
- Professional R-GRAM branding
- Reset password button
- Alternative link to copy/paste
- 15-minute expiration warning
- Security notice

### Step 3: User Clicks Reset Link

The link format: `http://localhost:3000/reset-password?token=abc123...`

### Step 4: Reset Password Page

The user sees a clean, professional page where they can:
- Enter new password
- Confirm new password
- Submit the form

### Step 5: Password Reset API

**API Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## 📁 File Structure

```
pages/
├── api/auth/
│   ├── forgot-password.ts          # Request password reset
│   ├── reset-password.ts           # Reset password with token
│   └── validate-reset-token.ts     # Validate reset token
├── reset-password.tsx              # Reset password page
└── auth/
    └── forgot-password.js          # Forgot password page

lib/
├── models/
│   └── PasswordResetToken.ts       # Password reset token model
└── utils/
    └── email.ts                     # Email utility functions

public/
└── forgot-password-demo.html       # Demo page for testing
```

## 🔧 API Endpoints

### 1. Forgot Password Request
- **URL:** `/api/auth/forgot-password`
- **Method:** `POST`
- **Body:** `{ "email": "user@example.com" }`

### 2. Validate Reset Token
- **URL:** `/api/auth/validate-reset-token`
- **Method:** `POST`
- **Body:** `{ "token": "abc123..." }`

### 3. Reset Password
- **URL:** `/api/auth/reset-password`
- **Method:** `POST`
- **Body:** `{ "token": "abc123...", "password": "newpassword" }`

## 🎨 Features

### Email Templates
- **Professional Design:** R-GRAM branding with gradient header
- **Responsive:** Works on all devices
- **Dual Format:** HTML and text versions
- **Security:** Clear warnings and instructions

### Security Features
- **Token Expiration:** 15-minute timeout
- **One-time Use:** Tokens are marked as used after password reset
- **Secure Storage:** Passwords are hashed with bcrypt
- **No User Enumeration:** Same response for existing/non-existing emails

### User Experience
- **Clean UI:** Modern, professional design
- **Clear Instructions:** Step-by-step guidance
- **Error Handling:** Helpful error messages
- **Loading States:** Visual feedback during operations

## 🚨 Troubleshooting

### Common Issues

1. **"Email service configuration error"**
   - Check if all email environment variables are set
   - Verify Gmail app password is correct
   - Ensure 2FA is enabled on Gmail

2. **"Database configuration error"**
   - Check if MONGODB_URI is set correctly
   - Verify MongoDB connection string
   - Ensure database is running

3. **"Invalid or expired reset token"**
   - Token may have expired (15 minutes)
   - Token may have been used already
   - Request a new password reset

4. **Email not sending**
   - Check Gmail app password
   - Verify 2FA is enabled on Gmail
   - Check server logs for detailed errors

### Debug Commands

```bash
# Check email configuration
node check-email-config.js

# Test forgot password API
node test-forgot-password.js

# Check environment variables
node check-env.js
```

## 🌐 Production Deployment

### Vercel Configuration

1. **Add Environment Variables** to your Vercel project:
   - Go to Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from the `.env.local` file

2. **Update URLs**:
   - Set `NEXT_PUBLIC_APP_URL` to your production domain
   - Set `NEXTAUTH_URL` to your production domain

3. **Redeploy** your project

### Email Service Alternatives

For production, consider using:
- **SendGrid** (recommended)
- **Mailgun**
- **Amazon SES**
- **Resend**

Update the email configuration accordingly.

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the debug commands
3. Check server logs for detailed error messages
4. Verify all environment variables are set correctly

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Gmail app password generated
- [ ] Email configuration test passes
- [ ] Forgot password API test passes
- [ ] Demo page works correctly
- [ ] Reset password page loads
- [ ] Complete flow works end-to-end
- [ ] Production environment configured (if deploying)

---

**🎉 Congratulations!** Your forgot password functionality is now fully set up and ready to use.
