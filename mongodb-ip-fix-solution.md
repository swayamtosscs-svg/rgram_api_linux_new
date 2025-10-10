# MongoDB Atlas IP Whitelist Fix - Server IP Changed

## 🚨 Problem
Your server IP has changed and is not whitelisted in MongoDB Atlas, causing connection failures.

**Current Server IP:** `103.14.120.163`
**MongoDB Atlas URI:** `mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority`

## 🔧 Solution Steps

### Step 1: Access MongoDB Atlas Dashboard
1. Go to: **https://cloud.mongodb.com/**
2. Login with your account credentials
3. Select your project

### Step 2: Navigate to Network Access
1. In the left sidebar, click **"Network Access"**
2. You'll see a list of currently whitelisted IP addresses

### Step 3: Add Your New Server IP
1. Click **"Add IP Address"** button
2. Choose one of these options:

   **Option A (Quick Fix - Recommended):**
   - Select **"Allow access from anywhere"**
   - This adds `0.0.0.0/0` (allows all IPs)
   - Click **"Confirm"**

   **Option B (More Secure):**
   - Select **"Add IP address"**
   - Enter: `103.14.120.163`
   - Add comment: "Production Server - Updated IP"
   - Click **"Confirm"**

### Step 4: Wait for Changes
- Changes take **2-3 minutes** to take effect
- You'll see a status indicator showing "Pending" then "Active"

### Step 5: Test Your API
After whitelisting, test your assets API:

```bash
curl -X POST "http://103.14.120.163:8081/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.jpg" \
  -F "folder=images"
```

## 📋 Your MongoDB Atlas Details
- **Cluster:** cluster0.tpk0nle.mongodb.net
- **Database:** api_rgram
- **New Server IP:** 103.14.120.163
- **Connection String:** mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

## ✅ Expected Result
After whitelisting the new IP, your assets API will work perfectly on the server!

## 🚨 Important Notes
- Make sure your server has the correct `.env.local` file with the MongoDB URI
- The server should restart after any environment changes
- If you still get errors after whitelisting, check if the server's `.env.local` file has the correct MongoDB URI

## 🔄 Alternative: Use 0.0.0.0/0 (All IPs)
If your server IP changes frequently, you can whitelist `0.0.0.0/0` to allow access from any IP address. This is less secure but more convenient for development.
