# Forgot Password API - Complete Implementation

This document provides a comprehensive guide to the forgot password functionality implemented in the RGram application.

## 🚀 Features

- **Secure Password Reset**: Generate cryptographically secure reset tokens
- **Email Integration**: Send password reset emails via SMTP
- **Token Validation**: Validate reset tokens before allowing password changes
- **Password Strength**: Enforce strong password requirements
- **Security Measures**: Token expiration, rate limiting, and audit logging
- **User Experience**: Clean, responsive frontend interfaces

## 📁 File Structure

```
├── pages/api/auth/
│   ├── forgot-password.ts          # Request password reset
│   ├── reset-password.ts           # Reset password with token
│   └── validate-reset-token.ts     # Validate reset token
├── pages/auth/
│   ├── forgot-password.js          # Forgot password form
│   └── reset-password.js           # Reset password form
├── FORGOT_PASSWORD_ENV_TEMPLATE.txt # Environment variables
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
  "data": {
    "userId": "user_id_here",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Reset Password
**POST** `/api/auth/reset-password`

Reset the user's password using a valid reset token.

**Request Body:**
```json
{
  "token": "your-reset-token-here",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install nodemailer bcryptjs
npm install --save-dev @types/nodemailer @types/bcryptjs
```

### 2. Environment Configuration

Copy `FORGOT_PASSWORD_ENV_TEMPLATE.txt` to `.env.local` and configure:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=RGram
```

### 3. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password as `SMTP_PASS`

### 4. Alternative: Gmail OAuth2

For production, use OAuth2 instead of app passwords:

```bash
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security
- 32-byte cryptographically secure random tokens
- 15-minute expiration
- Single-use tokens
- Automatic cleanup of expired tokens

### Rate Limiting
- Prevents abuse of the forgot password endpoint
- Configurable limits per hour and per IP

## 📧 Email Configuration

### SMTP Settings
The system supports various SMTP providers:

- **Gmail**: `smtp.gmail.com:587`
- **Outlook**: `smtp-mail.outlook.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Custom**: Configure your own SMTP server

### Email Template
The system sends beautifully formatted HTML emails with:
- Professional branding
- Clear call-to-action button
- Direct reset link
- Security information
- Responsive design

## 🧪 Testing

### 1. Postman Collection
Import `forgot-password-api-postman-collection.json` into Postman for easy testing.

### 2. Manual Testing
1. Navigate to `/auth/forgot-password`
2. Enter a valid email address
3. Check email for reset link
4. Click link to go to reset page
5. Enter new password
6. Verify login with new password

### 3. Test Cases
- Valid email address
- Invalid email format
- Non-existent email
- Expired token
- Invalid token
- Weak password
- Password mismatch

## 🚀 Frontend Usage

### Forgot Password Page
```javascript
// Navigate to forgot password
router.push('/auth/forgot-password');

// Or use Link component
<Link href="/auth/forgot-password">Forgot Password?</Link>
```

### Reset Password Page
```javascript
// Navigate with token
router.push(`/auth/reset-password?token=${resetToken}`);
```

## 🔧 Customization

### Email Template
Customize the email HTML in `forgot-password.ts`:

```typescript
const mailOptions = {
  // ... other options
  html: `
    <div style="font-family: Arial, sans-serif;">
      <!-- Your custom HTML here -->
    </div>
  `
};
```

### Token Expiration
Modify token expiration in environment variables:

```bash
PASSWORD_RESET_TOKEN_EXPIRY=1800000  # 30 minutes
```

### Password Requirements
Update password validation in `reset-password.ts`:

```typescript
// Customize password requirements
if (newPassword.length < 10) {  // Change from 8 to 10
  // ... error handling
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify firewall settings
   - Check spam folder

2. **Token validation failing**
   - Ensure token hasn't expired
   - Check token format
   - Verify server time synchronization

3. **Password reset not working**
   - Validate password requirements
   - Check database connection
   - Verify user exists

### Debug Mode
Enable debug logging:

```bash
LOG_PASSWORD_RESETS=true
LOG_EMAIL_SENDS=true
```

## 📊 Monitoring & Analytics

### Logs
The system logs important events:
- Password reset requests
- Email sends
- Password changes
- Failed attempts

### Metrics
Track usage patterns:
- Reset requests per day
- Success/failure rates
- Email delivery rates

## 🔄 Production Considerations

### 1. Database Storage
Replace in-memory token storage with Redis or database:

```typescript
// Example: Redis implementation
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Store token
await redis.setex(`reset:${token}`, 900, JSON.stringify(tokenData));

// Retrieve token
const tokenData = await redis.get(`reset:${token}`);
```

### 2. Rate Limiting
Implement proper rate limiting middleware:

```typescript
import rateLimit from 'express-rate-limit';

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many password reset requests from this IP'
});
```

### 3. Email Service
Use professional email services for production:
- SendGrid
- Mailgun
- Amazon SES
- Postmark

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Setup](https://support.google.com/mail/answer/7126229)
- [Password Security Best Practices](https://owasp.org/www-project-cheat-sheets/cheatsheets/Authentication_Cheat_Sheet.html)
- [Email Template Design](https://www.emailonacid.com/blog/)

## 🤝 Contributing

To contribute to this feature:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This implementation is part of the RGram application and follows the same licensing terms.

---

**Note**: This forgot password system is designed with security and user experience in mind. Always test thoroughly in a development environment before deploying to production.
