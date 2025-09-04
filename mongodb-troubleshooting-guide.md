# MongoDB Atlas Troubleshooting Guide

## 🚨 Problem: IP Whitelisted but Still Not Working

Your IP `103.14.120.163/32` is whitelisted and shows as "Active" in MongoDB Atlas, but the server still can't connect.

## 🔍 Possible Causes & Solutions

### 1. **Propagation Delay**
- **Issue:** Changes take time to propagate globally
- **Solution:** Wait 10-15 minutes and try again
- **Check:** MongoDB Atlas shows "Active" status

### 2. **Server Environment Issue**
- **Issue:** Server doesn't have correct `.env.local` file
- **Solution:** Check server's environment file

### 3. **MongoDB Atlas Cluster Issue**
- **Issue:** Cluster might be paused or have issues
- **Solution:** Check cluster status in MongoDB Atlas

### 4. **Network/Firewall Issue**
- **Issue:** Server's outbound connections blocked
- **Solution:** Check server's firewall settings

## 🔧 Step-by-Step Troubleshooting

### Step 1: Check MongoDB Atlas Cluster Status
1. Go to MongoDB Atlas Dashboard
2. Check if your cluster is running (not paused)
3. Look for any error messages or warnings

### Step 2: Verify Server Environment
Make sure your server has the correct `.env.local` file with:
```
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority
```

### Step 3: Restart Server
After whitelisting IP, restart your server:
```bash
# On your server
pm2 restart all
# or
npm run dev
```

### Step 4: Check Server Logs
Look at your server logs to see the exact error:
```bash
# Check server logs
pm2 logs
# or
tail -f server.log
```

### Step 5: Test with Different IP Range
Try whitelisting a broader IP range:
- Add `0.0.0.0/0` (allows all IPs)
- This is less secure but helps identify if it's an IP issue

## 🎯 Quick Fix Options

### Option 1: Add 0.0.0.0/0 (All IPs)
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow access from anywhere"
4. Click "Confirm"
5. Wait 5-10 minutes

### Option 2: Check Server IP
Your server might be using a different IP. Check:
```bash
# On your server
curl ifconfig.me
# or
wget -qO- ifconfig.me
```

### Option 3: Verify MongoDB URI
Make sure the server has the exact MongoDB URI:
```
mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority
```

## 📞 Next Steps
1. Try adding `0.0.0.0/0` to whitelist
2. Restart your server
3. Wait 10-15 minutes
4. Test again

If still not working, check server logs for more specific error messages.
