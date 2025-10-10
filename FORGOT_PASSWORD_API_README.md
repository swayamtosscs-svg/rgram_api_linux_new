# Forgot Password API - Complete Implementation

This document provides a comprehensive guide to the newly recreated forgot password functionality in the R-GRAM application.

## 🚀 Features

- **Real Email Sending**: Actual SMTP email delivery (no more mock service)
- **Secure Password Reset**: Generate cryptographically secure reset tokens
- **Token Validation**: Validate reset tokens before allowing password changes
- **Password Strength**: Enforce strong password requirements
- **Security Measures**: Token expiration (15 minutes), rate limiting, and audit logging
- **User Experience**: Clean, responsive frontend interfaces
- **Email Templates**: Professional HTML email templates with R-GRAM branding

## 📁 File Structure

```
├── pages/api/auth/
│   ├── forgot-password.ts          # Request password reset
│   ├── reset-password.ts           # Reset password with token
│   └── validate-reset-token.ts     # Validate reset token
├── pages/
│   ├── forgot-password.tsx         # Forgot password form
│   └── reset-password.tsx          # Reset password form
├── lib/utils/
│   └── email.ts                    # Email utility functions (updated)
├── lib/models/
│   └── PasswordResetToken.ts       # Password reset token model
├── forgot-password-api-postman-collection.json # API testing
└── FORGOT_PASSWORD_API_README.md   # This file
```

## 🔧 API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

Request a password reset link to be sent to the user's email.

**Request Body:**
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

### 2. Validate Reset Token
**POST** `/api/auth/validate-reset-token`

Validate a password reset token before allowing password reset.

**Request Body:**
```json
{
  "token": "your-reset-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "email": "user@example.com",
    "username": "username",
    "fullName": "Full Name"
  }
}
```

### 3. Reset Password
**POST** `/api/auth/reset-password`

Reset password using the reset token.

**Request Body:**
```json
{
  "token": "your-reset-token-here",
  "password": "newpassword123",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## 📧 Email Configuration

The API now uses **real email sending** instead of mock service. Make sure your environment variables are properly configured:

```env
# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://103.14.120.163:8081
```

## 🔄 Complete Password Reset Flow

### Step 1: Request Password Reset

1. User visits `/forgot-password`
2. Enters their email address
3. API generates a secure token and sends email
4. User receives professional email with reset link

### Step 2: User Receives Email

The user receives an email with:
- Professional R-GRAM branding
- Reset password button
- Alternative link to copy/paste
- 15-minute expiration warning
- Security notice

### Step 3: User Clicks Reset Link

The link format: `http://103.14.120.163:8081/reset-password?token=abc123...&email=user@example.com`

### Step 4: Reset Password Page

The user sees a clean, professional page where they can:
- Enter new password
- Confirm new password
- Submit the form

### Step 5: Password Reset API

The system validates the token and updates the password.

## 🧪 Testing with Postman

1. Import the `forgot-password-api-postman-collection.json` file
2. Set the `base_url` variable to your server URL
3. Test each endpoint:

### Test Forgot Password Request
```json
POST {{base_url}}/api/auth/forgot-password
{
  "email": "test@example.com"
}
```

### Test Token Validation
```json
POST {{base_url}}/api/auth/validate-reset-token
{
  "token": "token-from-email"
}
```

### Test Password Reset
```json
POST {{base_url}}/api/auth/reset-password
{
  "token": "token-from-email",
  "password": "newpassword123",
  "email": "test@example.com"
}
```

## 🔒 Security Features

- **Token Expiration**: Reset tokens expire in 15 minutes
- **One-time Use**: Tokens are marked as used after password reset
- **Email Validation**: Tokens are tied to specific email addresses
- **Password Strength**: Minimum 6 characters required
- **Secure Generation**: Cryptographically secure random tokens
- **Rate Limiting**: Built-in protection against abuse

## 🎨 Frontend Pages

### Forgot Password Page (`/forgot-password`)
- Clean, responsive design
- Email validation
- Loading states
- Error handling
- Success messages

### Reset Password Page (`/reset-password`)
- Token validation
- Password confirmation
- Real-time validation
- Professional UI

## 📱 Email Templates

The email templates include:
- R-GRAM branding with gradient header
- Professional styling
- Mobile-responsive design
- Clear call-to-action buttons
- Security warnings
- Alternative text links

## 🚀 Deployment Notes

1. **Environment Variables**: Ensure all email configuration is set
2. **SMTP Settings**: Use proper SMTP credentials
3. **URL Configuration**: Set correct `NEXT_PUBLIC_APP_URL`
4. **Database**: Ensure MongoDB connection is working
5. **Email Service**: Test email delivery before production

## 🔧 Troubleshooting

### Email Not Sending
1. Check SMTP credentials
2. Verify email service configuration
3. Check server logs for errors
4. Test with a simple email first

### Token Issues
1. Check token expiration (15 minutes)
2. Verify token format
3. Check database connection
4. Ensure token hasn't been used

### Password Reset Fails
1. Check password strength requirements
2. Verify token is still valid
3. Check email matches token
4. Review server logs

## 📊 Success Indicators

- ✅ Emails are actually sent (not just logged)
- ✅ Reset links work properly
- ✅ Tokens expire correctly
- ✅ Password updates successfully
- ✅ Confirmation emails sent
- ✅ Professional UI/UX

## 🎯 Next Steps

1. Test the complete flow with Postman
2. Verify email delivery
3. Test frontend pages
4. Check security measures
5. Monitor for any issues

The forgot password API is now fully functional with real email sending capabilities!