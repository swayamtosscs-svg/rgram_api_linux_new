# Swayam Database Setup Guide

## ✅ **Your Database Configuration**
- **Database**: `swayam`
- **Username**: `swayamUser`
- **Password**: `swayamPass`
- **Auth Source**: `admin`
- **Connection String**: `mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin`

## 🔧 **Current Status**
- ✅ Database configuration is correct
- ✅ Code updated to use your database
- ❌ MongoDB service is not running locally

## 🚀 **Quick Fix - Start MongoDB Service**

### **Option 1: Start MongoDB Service (Easiest)**
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Find "MongoDB" service
4. Right-click → Start
5. Test: `node test-swayam-database.js`

### **Option 2: Command Line**
```bash
# Start MongoDB service
net start MongoDB

# Or start mongod directly
mongod
```

### **Option 3: PowerShell (Run as Administrator)**
```powershell
Start-Service -Name "MongoDB"
```

## 🔍 **Verify Setup**

### **Test Connection**
```bash
node test-swayam-database.js
```

### **Expected Output**
```
✅ Successfully connected to Swayam database!
📊 Database name: swayam
📋 Available collections: X
🎉 Your database is ready to use!
```

## 🛠️ **If MongoDB is Not Installed**

### **Install MongoDB Community Server**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service
4. Test connection

### **Or Use the Setup Script**
```bash
mongodb-setup.bat
```

## 🔐 **Database Authentication**

Your database uses authentication with:
- **User**: `swayamUser` (in admin database)
- **Password**: `swayamPass`
- **Target Database**: `swayam`

Make sure this user exists in your MongoDB admin database.

## 📁 **Files Updated**
- `lib/database.ts` - Uses your database URI
- `test-swayam-database.js` - Tests your specific database
- `.env.local` - Contains your database configuration

## 🎯 **Next Steps**
1. **Start MongoDB service** (choose any option above)
2. **Test connection**: `node test-swayam-database.js`
3. **Start your API**: `npm run dev`

## 🚨 **Troubleshooting**

### **If Authentication Fails**
```bash
# Connect to MongoDB shell
mongo

# Switch to admin database
use admin

# Create user if needed
db.createUser({
  user: "swayamUser",
  pwd: "swayamPass",
  roles: [
    { role: "readWrite", db: "swayam" },
    { role: "dbAdmin", db: "swayam" }
  ]
})
```

### **If Service Won't Start**
1. Check Windows Event Viewer for errors
2. Verify MongoDB is installed correctly
3. Check if port 27017 is available
4. Run as Administrator

Your database configuration is perfect! Just need to start MongoDB service.
