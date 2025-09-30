# Forgot Password API - CURL Commands

## Base URL
```bash
BASE_URL="http://103.14.120.163:8081"
```

## 1. Request Password Reset
```bash
curl -X POST "${BASE_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

## 2. Validate Reset Token
```bash
curl -X POST "${BASE_URL}/api/auth/validate-reset-token" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token-here"
  }'
```

**Expected Response:**
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

## 3. Reset Password
```bash
curl -X POST "${BASE_URL}/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token-here",
    "password": "newpassword123",
    "email": "user@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Complete Test Flow

### Step 1: Request Password Reset
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Step 2: Check Email
- Check the email inbox for the reset link
- Extract the token from the URL: `http://103.14.120.163:8081/reset-password?token=ABC123...&email=test@example.com`

### Step 3: Validate Token (Optional)
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/validate-reset-token" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABC123..."
  }'
```

### Step 4: Reset Password
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABC123...",
    "password": "newpassword123",
    "email": "test@example.com"
  }'
```

## Error Examples

### Invalid Email Format
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

### Missing Email
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": false,
  "message": "Email is required"
}
```

### Weak Password
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "valid-token",
    "password": "123",
    "email": "test@example.com"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

### Invalid Token
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token",
    "password": "newpassword123",
    "email": "test@example.com"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Testing with Real Data

Replace `test@example.com` with an actual email address that exists in your database:

```bash
# Request reset for real user
curl -X POST "http://103.14.120.163:8081/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "swayam.toss.cs@gmail.com"
  }'
```

## One-liner Commands

### Quick Forgot Password Request
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/forgot-password" -H "Content-Type: application/json" -d '{"email":"user@example.com"}'
```

### Quick Token Validation
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/validate-reset-token" -H "Content-Type: application/json" -d '{"token":"your-token"}'
```

### Quick Password Reset
```bash
curl -X POST "http://103.14.120.163:8081/api/auth/reset-password" -H "Content-Type: application/json" -d '{"token":"your-token","password":"newpass123","email":"user@example.com"}'
```

## Notes

1. **Token Expiration**: Reset tokens expire in 15 minutes
2. **Email Required**: Make sure the email exists in your database
3. **Password Strength**: Minimum 6 characters required
4. **Real Email**: The API now sends actual emails (not mock)
5. **Check Logs**: Monitor server logs for email sending status

## Troubleshooting

If emails are not being sent:
1. Check SMTP configuration in `.env.local`
2. Verify email credentials
3. Check server logs for errors
4. Test with a simple email first
