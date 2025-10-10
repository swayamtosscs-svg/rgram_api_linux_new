# MongoDB Setup Guide for R-GRAM API

## Current Issue
Your MongoDB Atlas connection is failing because your IP address is not whitelisted.

## Solution Options

### Option 1: Install MongoDB Locally (Recommended for Development)

#### Step 1: Download and Install MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select "Windows" and "MSI" package
3. Download and run the installer
4. Choose "Complete" installation
5. Install MongoDB as a Windows Service

#### Step 2: Start MongoDB Service
1. Open Services (services.msc)
2. Find "MongoDB" service
3. Right-click → Start
4. Or run: `mongod` in command prompt

#### Step 3: Verify Installation
```bash
node test-mongodb-connection.js
```

### Option 2: Fix MongoDB Atlas IP Whitelist

#### Step 1: Get Your Public IP
1. Go to: https://whatismyipaddress.com/
2. Copy your public IP address

#### Step 2: Update Atlas IP Whitelist
1. Go to: https://cloud.mongodb.com/
2. Sign in to your account
3. Select your cluster
4. Go to "Network Access" tab
5. Click "Add IP Address"
6. Add your current IP address
7. Or add `0.0.0.0/0` for all IPs (less secure)

#### Step 3: Update .env.local
```bash
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority
```

### Option 3: Use MongoDB Atlas with Dynamic IP (Advanced)

If your IP changes frequently, you can:
1. Use MongoDB Atlas Data API
2. Set up a VPN with static IP
3. Use MongoDB Atlas with `0.0.0.0/0` whitelist (not recommended for production)

## Current Configuration

✅ **Database.ts Updated**: Now uses local MongoDB by default
✅ **Environment File**: Created .env.local with local MongoDB URI
✅ **Test Script**: Created test-mongodb-connection.js

## Next Steps

1. **Choose your preferred option** (local MongoDB recommended)
2. **Install/configure MongoDB** based on your choice
3. **Test connection**: `node test-mongodb-connection.js`
4. **Start your API**: `npm run dev`

## Troubleshooting

### If Local MongoDB Fails:
- Check if MongoDB service is running
- Verify port 27017 is not blocked
- Check Windows Firewall settings

### If Atlas Still Fails:
- Verify IP whitelist includes your current IP
- Check username/password in connection string
- Ensure cluster is running and accessible

## Files Modified
- `lib/database.ts` - Updated to use local MongoDB by default
- `.env.local` - Created with local MongoDB configuration
- `test-mongodb-connection.js` - Created for testing connections