# Forgot Password API - Vercel Environment Variables

## Required Environment Variables for Vercel

Add these environment variables to your Vercel project settings:

### Database Configuration
```
MONGODB_URI=your_mongodb_connection_string
```

### Email Configuration (Gmail Example)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://api-rgram1.vercel.app
APP_NAME=R-GRAM
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS`

## Vercel Deployment Steps

1. **Add Environment Variables**:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add all the variables listed above

2. **Redeploy**:
   - Trigger a new deployment after adding environment variables
   - Or use: `vercel --prod`

## Testing the API

```bash
curl -X POST "https://api-rgram1.vercel.app/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Expected Response

```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

## Troubleshooting

### Common Issues:

1. **"Email service configuration error"**:
   - Check if all email environment variables are set
   - Verify Gmail app password is correct

2. **"Database configuration error"**:
   - Check if MONGODB_URI is set correctly
   - Verify MongoDB connection string

3. **Email not sending**:
   - Check Gmail app password
   - Verify 2FA is enabled on Gmail
   - Check Vercel function logs for detailed errors

### Vercel Function Logs:
- Go to Vercel dashboard → Functions → View Function Logs
- Look for detailed error messages
