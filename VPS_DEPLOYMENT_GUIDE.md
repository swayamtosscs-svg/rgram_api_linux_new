# VPS Deployment Guide for OTP-Based Forget Password API

## 🚀 VPS Deployment Checklist

### ✅ **Files Already Created:**
- `pages/api/auth/forgot-password-otp.ts` - Request OTP endpoint
- `pages/api/auth/verify-password-reset-otp.ts` - Verify OTP endpoint  
- `pages/api/auth/reset-password-otp.ts` - Reset password endpoint

### 🔧 **Environment Configuration:**

Your `.env.production` is already configured correctly:
```env
# VPS Environment Configuration
NODE_ENV=production
HOST_ENV=VPS

# MongoDB Connection for VPS
MONGODB_URI=mongodb://Toss:Toss%40123@103.14.120.163:27017/admin

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=swayam.toss.cs@gmail.com
EMAIL_PASS=yawq uwvk pode lmpc
EMAIL_FROM=swayam.toss.cs@gmail.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://103.14.120.163:8081
APP_NAME=RGram
PORT=8081
```

### 📋 **Deployment Steps:**

1. **Upload Files to VPS:**
   ```bash
   # Upload the new API files
   scp pages/api/auth/forgot-password-otp.ts user@103.14.120.163:/path/to/your/app/
   scp pages/api/auth/verify-password-reset-otp.ts user@103.14.120.163:/path/to/your/app/
   scp pages/api/auth/reset-password-otp.ts user@103.14.120.163:/path/to/your/app/
   ```

2. **Restart Your Application:**
   ```bash
   # SSH into your VPS
   ssh user@103.14.120.163
   
   # Navigate to your app directory
   cd /path/to/your/app
   
   # Restart the application
   pm2 restart your-app-name
   # OR
   npm run build && npm start
   ```

3. **Test the API Endpoints:**
   ```bash
   # Test OTP Request
   curl -X POST http://103.14.120.163:8081/api/auth/forgot-password-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "swayam.toss.cs@gmail.com"}'
   
   # Test OTP Verification
   curl -X POST http://103.14.120.163:8081/api/auth/verify-password-reset-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "swayam.toss.cs@gmail.com", "otp": "123456"}'
   
   # Test Password Reset
   curl -X POST http://103.14.120.163:8081/api/auth/reset-password-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "swayam.toss.cs@gmail.com", "otp": "123456", "newPassword": "newpassword123"}'
   ```

### 🔍 **Troubleshooting:**

1. **VPS Not Responding:**
   - Check if VPS is running: `ssh user@103.14.120.163`
   - Check if port 8081 is open: `netstat -tlnp | grep 8081`
   - Check firewall: `ufw status`

2. **API Not Working:**
   - Check application logs: `pm2 logs your-app-name`
   - Check if MongoDB is running: `systemctl status mongod`
   - Check email configuration: Test SMTP connection

3. **Email Issues:**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail
   - Test email sending manually

### 📧 **Expected API Responses:**

**Success Response (OTP Request):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset OTP has been sent.",
  "data": {
    "email": "swayam.toss.cs@gmail.com",
    "expiresAt": "2024-01-01T12:10:00.000Z",
    "expiresInMinutes": 10
  }
}
```

**Success Response (OTP Verification):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "email": "swayam.toss.cs@gmail.com",
    "username": "username",
    "fullName": "Full Name",
    "canResetPassword": true
  }
}
```

**Success Response (Password Reset):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password.",
  "data": {
    "email": "swayam.toss.cs@gmail.com",
    "username": "username",
    "passwordChangedAt": "2024-01-01T12:15:00.000Z"
  }
}
```

### 🎯 **Complete User Flow:**

1. **User visits your app** → Clicks "Forgot Password"
2. **Enters email** → `swayam.toss.cs@gmail.com`
3. **Receives OTP** → 6-digit code in email
4. **Enters OTP** → Verifies with API
5. **Sets new password** → Password updated successfully

### 🔐 **Security Features:**

- ✅ 6-digit OTP with 10-minute expiration
- ✅ Maximum 5 attempts per OTP
- ✅ Email validation and user verification
- ✅ Password strength requirements (min 6 characters)
- ✅ Professional email templates
- ✅ Secure password hashing with bcrypt

### 📱 **Frontend Integration:**

Your frontend can now use these endpoints:
- `POST /api/auth/forgot-password-otp` - Request OTP
- `POST /api/auth/verify-password-reset-otp` - Verify OTP
- `POST /api/auth/reset-password-otp` - Reset password

The OTP-based forget password system is ready for VPS deployment! 🚀
