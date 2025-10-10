# 🔧 Local MongoDB Fix Guide

आपको local MongoDB connection में issues आ रहे हैं। यह guide आपको step-by-step fix करने में मदद करेगा।

## 🚨 Current Issues

आपके terminal output से पता चल रहा है:
- MongoDB connection successful है (✅ Connected to MongoDB)
- लेकिन local MongoDB save नहीं हो रहा
- Email sending error (SMTP issue - separate problem)

## 🔍 Diagnosis Steps

### Step 1: Check MongoDB Installation

```bash
# Check if MongoDB is installed
npm run test:local-mongodb --check
```

### Step 2: Test Local Connection

```bash
# Test local MongoDB connection
npm run test:local-mongodb
```

### Step 3: Fix Local MongoDB Setup

```bash
# Run comprehensive fix
npm run fix:local-mongodb
```

## 🛠️ Quick Fix Commands

### Option 1: Automatic Fix
```bash
npm run fix:local-mongodb
```

### Option 2: Manual Fix Steps

#### 1. Install MongoDB Locally

**Windows:**
```bash
# Download MongoDB Community Server
# https://www.mongodb.com/try/download/community
# Install and start service
net start MongoDB
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### 2. Create Data Directory
```bash
mkdir -p data/db
```

#### 3. Start MongoDB Manually
```bash
# Start MongoDB with custom data path
mongod --dbpath ./data/db
```

#### 4. Update Environment
```bash
# Create .env.local with local MongoDB
echo "MONGODB_URI=mongodb://localhost:27017/api_rgram" > .env.local
```

## 🔧 Alternative Solutions

### Option 1: MongoDB Memory Server
```bash
# Use in-memory MongoDB for development
npm run fix:local-mongodb --memory
```

### Option 2: Docker MongoDB
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 3: MongoDB Atlas (Cloud)
```bash
# Use cloud MongoDB (current setup)
# No changes needed - already working
```

## 📋 Environment Configuration

### Create .env.local
```env
# Local MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/api_rgram

# Atlas MongoDB (for migration source)
ATLAS_MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# Other configurations...
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

## 🚀 Complete Setup Process

### Step 1: Fix MongoDB
```bash
# Run automatic fix
npm run fix:local-mongodb
```

### Step 2: Test Connection
```bash
# Test local connection
npm run test:local-mongodb
```

### Step 3: Setup Environment
```bash
# Setup local environment
npm run setup:local
```

### Step 4: Run Migration
```bash
# Migrate data to local MongoDB
npm run migrate:quick
```

## 🔍 Troubleshooting

### Issue: ECONNREFUSED
**Solution:**
```bash
# Check if MongoDB is running
net start MongoDB  # Windows
brew services start mongodb/brew/mongodb-community  # macOS
sudo systemctl start mongodb  # Linux
```

### Issue: Permission Denied
**Solution:**
```bash
# Fix permissions
chmod -R 755 data/
chown -R $USER:$USER data/
```

### Issue: Port Already in Use
**Solution:**
```bash
# Kill existing MongoDB processes
pkill mongod
# Or use different port
mongod --port 27018 --dbpath ./data/db
```

### Issue: Database Not Found
**Solution:**
```bash
# Create database manually
mongosh
use api_rgram
db.createCollection("users")
```

## 📊 Connection Test Results

### Successful Connection Should Show:
```
✅ Connected to Local MongoDB successfully!
📋 Available collections: users, babas, posts, videos, stories
✅ MongoDB ping successful: { ok: 1 }
✅ Test document created: { _id: ..., test: true, ... }
✅ Test document cleaned up
✅ Disconnected from Local MongoDB
```

### Failed Connection Shows:
```
❌ Local MongoDB connection failed: ECONNREFUSED
🔧 Fix suggestions:
1. Make sure MongoDB is installed locally
2. Start MongoDB service
3. Or run MongoDB manually: mongod --dbpath ./data/db
```

## 🎯 Quick Commands Summary

```bash
# Fix MongoDB setup
npm run fix:local-mongodb

# Test connection
npm run test:local-mongodb

# Setup environment
npm run setup:local

# Run migration
npm run migrate:quick

# Test multiple connections
npm run test:local-mongodb --multiple

# Check installation
npm run test:local-mongodb --check
```

## 🚨 Important Notes

### Before Running Fix:
1. **Stop Application** - Stop your current application
2. **Backup Data** - Take backup of current data
3. **Check Space** - Ensure sufficient disk space

### After Fix:
1. **Test Connection** - Verify MongoDB connection
2. **Test Application** - Run your application
3. **Verify Data** - Check if data is saving locally

## 📞 Support

अगर issues persist करते हैं:

1. **Check Logs** - Detailed logs मिलते हैं
2. **Verify Installation** - MongoDB properly installed है या नहीं
3. **Check Permissions** - File permissions correct हैं या नहीं
4. **Test Manually** - MongoDB manually start करके test करें

---

## 🎉 Expected Result

Fix complete होने के बाद आपको यह मिलना चाहिए:

```
✅ MongoDB is installed
✅ MongoDB service is running
✅ Created data directory: ./data/db
✅ Created .env.local file with local MongoDB configuration
✅ MongoDB connection successful!
✅ MongoDB ping successful: {"ok":1}
✅ Local MongoDB setup completed successfully!
```

**Ready to use local MongoDB! 🚀**
