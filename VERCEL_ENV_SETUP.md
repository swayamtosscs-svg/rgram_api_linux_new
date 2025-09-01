# 🚀 Vercel Environment Variables Setup

## 🔧 Required Environment Variables for Vercel

To fix the password reset link issue, you need to add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your `api_rgram1` project

### 2. Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

#### Database Configuration
```
Name: MONGODB_URI
Value: your_mongodb_connection_string
Environment: Production, Preview, Development
```

#### Email Configuration (Gmail)
```
Name: EMAIL_HOST
Value: smtp.gmail.com
Environment: Production, Preview, Development

Name: EMAIL_PORT
Value: 587
Environment: Production, Preview, Development

Name: EMAIL_USER
Value: your_gmail@gmail.com
Environment: Production, Preview, Development

Name: EMAIL_PASS
Value: your_gmail_app_password
Environment: Production, Preview, Development

Name: EMAIL_FROM
Value: your_gmail@gmail.com
Environment: Production, Preview, Development
```

#### App Configuration
```
Name: NEXT_PUBLIC_APP_URL
Value: https://api-rgram1.vercel.app
Environment: Production, Preview, Development

Name: APP_NAME
Value: R-GRAM
Environment: Production, Preview, Development

Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

#### JWT Configuration
```
Name: JWT_SECRET
Value: your_jwt_secret_key_here
Environment: Production, Preview, Development
```

#### OTP Configuration
```
Name: OTP_EXPIRE_MINUTES
Value: 10
Environment: Production, Preview, Development
```

### 3. Redeploy Your Project
After adding all environment variables:
1. Go to **Deployments**
2. Click **Redeploy** on your latest deployment
3. Or trigger a new deployment by pushing to GitHub

## 🔍 How to Check Current Environment Variables

You can check what environment variables are currently set by adding this to any API route temporarily:

```typescript
// Add this to any API route to debug
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
console.log('VERCEL_URL:', process.env.VERCEL_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

## 🧪 Test the Fix

After setting up the environment variables and redeploying:

1. **Test the forgot password API**:
   ```bash
   curl -X POST "https://api-rgram1.vercel.app/api/auth/forgot-password" \
     -H "Content-Type: application/json" \
     -d '{"email": "swayam121july@gmail.com"}'
   ```

2. **Check the email** - the reset link should now point to:
   ```
   https://api-rgram1.vercel.app/reset-password?token=...
   ```

3. **Click the link** - it should work correctly

## 🚨 Troubleshooting

### If the link still shows localhost:
1. Make sure `NEXT_PUBLIC_APP_URL` is set to `https://api-rgram1.vercel.app`
2. Redeploy your project after adding the environment variable
3. Check that the environment variable is applied to Production environment

### If you get "This site can't be reached":
1. Make sure the reset password page exists at `/reset-password`
2. Check that all API routes are working
3. Verify the token is valid and not expired

### If emails are not sending:
1. Check that all email environment variables are set
2. Verify your Gmail app password is correct
3. Ensure 2FA is enabled on your Gmail account

## ✅ Success Checklist

- [ ] All environment variables added to Vercel
- [ ] Project redeployed after adding variables
- [ ] Forgot password API returns success
- [ ] Email received with correct Vercel URL
- [ ] Reset link works and loads the reset password page
- [ ] Password reset completes successfully

---

**🎉 Once you've set up these environment variables, your password reset links will work correctly on Vercel!**
