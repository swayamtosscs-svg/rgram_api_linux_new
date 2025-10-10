# OTP-Based Forget Password API - Complete Implementation

This document provides a comprehensive guide to the newly created OTP-based forget password functionality in the R-GRAM application.

## 🚀 Features

- **OTP-Based Security**: Uses 6-digit OTP instead of email links for enhanced security
- **Real Email Sending**: Actual SMTP email delivery with professional templates
- **Secure Password Reset**: Multi-step verification process
- **Password Strength**: Enforces strong password requirements
- **Security Measures**: OTP expiration (10 minutes), attempt limiting, and audit logging
- **User Experience**: Clean, responsive API endpoints
- **Email Templates**: Professional HTML email templates with R-GRAM branding

## 📁 File Structure

```
├── pages/api/auth/
│   ├── forgot-password-otp.ts          # Request password reset OTP
│   ├── verify-password-reset-otp.ts     # Verify OTP for password reset
│   └── reset-password-otp.ts            # Reset password with OTP
├── lib/models/
│   └── OTP.ts                           # OTP model (already exists)
├── lib/utils/
│   └── email.ts                         # Email utility functions (already exists)
└── FORGOT_PASSWORD_OTP_API_README.md    # This file
```

## 🔧 API Endpoints

### 1. Request Password Reset OTP
**POST** `/api/auth/forgot-password-otp`

Request a password reset OTP to be sent to the user's email.

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
  "message": "If an account with that email exists, a password reset OTP has been sent.",
  "data": {
    "email": "user@example.com",
    "expiresAt": "2024-01-01T12:10:00.000Z",
    "expiresInMinutes": 10
  }
}
```

**Features:**
- Validates email format
- Finds user by email
- Generates secure 6-digit OTP
- Removes old OTPs for security
- Sends professional email with OTP
- Doesn't reveal if user exists (security)

### 2. Verify Password Reset OTP
**POST** `/api/auth/verify-password-reset-otp`

Verify the OTP before allowing password reset.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "email": "user@example.com",
    "username": "username",
    "fullName": "Full Name",
    "canResetPassword": true
  }
}
```

**Features:**
- Validates OTP format (6 digits)
- Checks OTP expiration and attempts
- Returns user information for display
- Handles invalid/expired OTPs gracefully

### 3. Reset Password with OTP
**POST** `/api/auth/reset-password-otp`

Reset password using the verified OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password.",
  "data": {
    "email": "user@example.com",
    "username": "username",
    "passwordChangedAt": "2024-01-01T12:15:00.000Z"
  }
}
```

**Features:**
- Validates OTP again for security
- Enforces password strength requirements
- Hashes new password securely
- Marks OTP as used
- Sends confirmation email
- Updates password change timestamp

## 🎯 Complete User Flow

### Step 1: User Requests Password Reset
1. User calls `/api/auth/forgot-password-otp` with email
2. System validates email format
3. If user exists, generates secure 6-digit OTP
4. Sends professional email with OTP
5. Returns success message (doesn't reveal if user exists)

### Step 2: User Receives Email
The user receives an email with:
- Professional R-GRAM branding
- 6-digit OTP code prominently displayed
- 10-minute expiration warning
- Security notice

### Step 3: User Verifies OTP
1. User calls `/api/auth/verify-password-reset-otp` with email and OTP
2. System validates OTP format and expiration
3. Checks attempt limits
4. Returns user information if valid

### Step 4: User Resets Password
1. User calls `/api/auth/reset-password-otp` with email, OTP, and new password
2. System verifies OTP again for security
3. Updates password and marks OTP as used
4. Sends confirmation email
5. Returns success message

## 🧪 Testing with cURL

### Test 1: Request Password Reset OTP
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test 2: Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-password-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Test 3: Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","newPassword":"newpassword123"}'
```

## 🔒 Security Features

- **OTP Expiration**: Reset OTPs expire in 10 minutes
- **One-time Use**: OTPs are marked as used after password reset
- **Email Validation**: OTPs are tied to specific email addresses
- **Password Strength**: Minimum 6 characters required
- **Secure Generation**: Cryptographically secure random OTPs
- **Attempt Limiting**: Maximum 5 attempts per OTP
- **Rate Limiting**: Built-in protection against abuse

## 📧 Email Configuration

The API uses **real email sending** with professional templates. Make sure your environment variables are properly configured:

```env
# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Email Templates

The email templates include:
- R-GRAM branding with gradient header
- Professional styling
- Mobile-responsive design
- Clear OTP display
- Security warnings
- Expiration notices

## 🚀 Deployment Notes

1. **Environment Variables**: Ensure all email configuration is set
2. **SMTP Settings**: Use proper SMTP credentials
3. **Database**: Ensure MongoDB connection is working
4. **Email Service**: Test email delivery before production
5. **OTP Expiration**: Configure appropriate expiration time

## 🔧 Troubleshooting

### Email Not Sending
1. Check SMTP credentials
2. Verify email service configuration
3. Check server logs for errors
4. Test with a simple email first

### OTP Issues
1. Check OTP expiration (10 minutes)
2. Verify OTP format (6 digits)
3. Check database connection
4. Ensure OTP hasn't been used
5. Check attempt limits

### Password Reset Fails
1. Check password strength requirements
2. Verify OTP is still valid
3. Check email matches OTP
4. Review server logs

## 📊 Success Indicators

- ✅ OTPs are actually sent (not just logged)
- ✅ OTP verification works properly
- ✅ OTPs expire correctly
- ✅ Password updates successfully
- ✅ Confirmation emails sent
- ✅ Professional email templates
- ✅ Security measures enforced

## 🎯 Advantages of OTP-Based System

1. **Enhanced Security**: No clickable links that can be intercepted
2. **Better UX**: Users don't need to check email for links
3. **Mobile Friendly**: OTP can be easily entered on mobile devices
4. **Real-time**: Immediate verification without email client dependency
5. **Audit Trail**: Clear tracking of OTP usage and attempts

## 🔄 Integration with Existing System

This OTP-based system works alongside your existing token-based system:
- Uses the same OTP model and email utilities
- Maintains the same security standards
- Compatible with existing user management
- Can be used as an alternative or primary method

The OTP-based forget password API is now fully functional with real email sending capabilities and enhanced security!
