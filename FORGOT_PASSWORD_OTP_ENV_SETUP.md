# OTP-Based Forget Password API - Environment Setup

## 🔧 Required Environment Variables

Add these variables to your `.env.local` file:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rgram

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

## 📧 Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

## 🚀 Quick Test Setup

For testing without real email, you can:

1. **Use a test email service** like Mailtrap or MailHog
2. **Mock the email service** in development
3. **Use a real email** for full testing

## ✅ Verification Steps

1. **Check Database Connection**:
   ```bash
   node -e "require('dotenv').config({path:'.env.local'}); console.log('MongoDB:', process.env.MONGODB_URI)"
   ```

2. **Check Email Configuration**:
   ```bash
   node -e "require('dotenv').config({path:'.env.local'}); console.log('Email:', process.env.EMAIL_USER)"
   ```

3. **Test API Endpoints**:
   ```bash
   node test-forgot-password-otp.js
   ```

## 🔍 Troubleshooting

### Email Not Sending
- Check Gmail app password
- Verify SMTP settings
- Check firewall/network restrictions

### Database Issues
- Ensure MongoDB is running
- Check connection string
- Verify database permissions

### OTP Issues
- Check OTP expiration time
- Verify OTP model is working
- Check database indexes
