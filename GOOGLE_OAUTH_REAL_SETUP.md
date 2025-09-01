# 🔐 Real Google OAuth Setup Guide

## 🎯 **Goal: Real Google OAuth with Real User Data**

You want to use real Google OAuth for signup and login, and automatically fetch the name and username from your Google account. Here's how to set it up:

## 📋 **Step-by-Step Setup**

### **Step 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it: "RGram OAuth"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name: "RGram Web Client"

5. **Configure OAuth Consent Screen**
   - Add your app name: "RGram"
   - Add your email
   - Add authorized domains: `localhost` (for development)
   - Save and continue

6. **Add Authorized Redirect URIs**
   - Add: `http://localhost:3000/api/auth/google/callback`
   - Add: `https://api-rgram1.vercel.app/api/auth/google/callback` (for production)
   - Click "Create"

7. **Copy Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

### **Step 2: Environment Variables Setup**

Create or update your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Disable Mock Mode
MOCK_GOOGLE_AUTH=false

# Other required variables
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string
```

### **Step 3: Test Real Google OAuth**

#### **1. Test OAuth Init**
```bash
curl -X GET "http://localhost:3000/api/auth/google/init"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "isMock": false,
    "message": "Real Google OAuth URL generated - will fetch real user data from Google"
  }
}
```

#### **2. Complete OAuth Flow**
1. Open the `authUrl` in your browser
2. Sign in with your Google account
3. Grant permissions
4. You'll be redirected to: `http://localhost:3000/api/auth/google/callback?code=...`

#### **3. Test Callback**
```bash
curl -X GET "http://localhost:3000/api/auth/google/callback?code=YOUR_AUTH_CODE"
```

## 🔄 **How Real Google OAuth Works**

### **1. User Clicks "Sign in with Google"**
- Frontend calls `/api/auth/google/init`
- Gets real Google OAuth URL
- Redirects to Google login page

### **2. User Authenticates with Google**
- User enters Google credentials
- Google shows consent screen
- User grants permissions
- Google redirects back with authorization code

### **3. Backend Processes OAuth**
- Backend receives authorization code
- Exchanges code for access token
- Fetches user profile from Google
- Creates/updates user in database
- Returns JWT token

### **4. User Data Fetched from Google**
```javascript
// Real user data from Google
const userData = {
  email: "swayam121july@gmail.com",        // From Google
  name: "Swayam",                          // From Google
  googleId: "123456789",                   // From Google
  avatar: "https://lh3.googleusercontent.com/..." // From Google
};
```

## 🧪 **Testing Commands**

### **1. Test OAuth Init (Real Mode)**
```bash
curl -X GET "http://localhost:3000/api/auth/google/init"
```

### **2. Test with Browser**
1. Copy the `authUrl` from the response
2. Open in browser
3. Complete Google login
4. Check the callback URL for the authorization code

### **3. Test Callback with Code**
```bash
curl -X GET "http://localhost:3000/api/auth/google/callback?code=AUTH_CODE_FROM_BROWSER"
```

### **4. Test User Info**
```bash
curl -X GET "http://localhost:3000/api/auth/user" \
  -H "Authorization: Bearer JWT_TOKEN_FROM_CALLBACK"
```

## 🎯 **Expected Results**

### **Real Google OAuth Response:**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "user": {
    "id": "user_id",
    "email": "swayam121july@gmail.com",     // Real from Google
    "username": "swayam121july123",         // Generated from email
    "fullName": "Swayam",                  // Real from Google
    "avatar": "https://lh3.googleusercontent.com/...", // Real from Google
    "isEmailVerified": true,
    "googleId": "123456789"                // Real from Google
  },
  "token": "jwt_token_here"
}
```

## 🛠️ **Troubleshooting**

### **Error: "Google OAuth configuration is missing"**
- Check your `.env.local` file
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CALLBACK_URL` are set
- Restart your development server

### **Error: "redirect_uri_mismatch"**
- Add `http://localhost:3000/api/auth/google/callback` to authorized redirect URIs
- Make sure the URL matches exactly

### **Error: "invalid_client"**
- Check your Client ID and Client Secret
- Ensure they're copied correctly from Google Cloud Console

### **Error: "access_denied"**
- User denied permissions
- Try again and grant all requested permissions

## 🚀 **Production Deployment**

### **For Vercel:**
1. Add environment variables in Vercel dashboard:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   MOCK_GOOGLE_AUTH=false
   ```

2. Add production redirect URI in Google Cloud Console:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

## 🎉 **Benefits of Real Google OAuth**

- ✅ **Real User Data**: Fetches actual name, email, and avatar from Google
- ✅ **Secure**: Uses Google's secure OAuth 2.0 flow
- ✅ **Verified**: Email is automatically verified
- ✅ **Professional**: Users trust Google login
- ✅ **Consistent**: Same account across all Google services

## 📱 **Frontend Integration**

### **React Component Example:**
```javascript
const handleGoogleLogin = async () => {
  try {
    // Get OAuth URL
    const response = await fetch('/api/auth/google/init');
    const data = await response.json();
    
    if (data.success) {
      // Redirect to Google OAuth
      window.location.href = data.data.authUrl;
    }
  } catch (error) {
    console.error('Google login error:', error);
  }
};
```

### **Handle Callback:**
```javascript
// In your callback page
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    // Exchange code for token
    fetch(`/api/auth/google/callback?code=${code}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Store token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      });
  }
}, []);
```

## 🎯 **Summary**

With real Google OAuth:
- Users sign in with their actual Google account
- System automatically fetches real name, email, and avatar
- No more "undefined" accounts
- Professional and secure authentication
- Works seamlessly across all devices

Follow the setup guide above to enable real Google OAuth and start fetching real user data from Google accounts!
