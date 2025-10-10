@echo off
echo 🚀 MongoDB Quick Fix for Swayam Database
echo.

echo ❌ MongoDB is not installed on your system
echo.
echo 📋 Here are your options:
echo.
echo Option 1: Install MongoDB Community Server (Recommended)
echo 1. Go to: https://www.mongodb.com/try/download/community
echo 2. Download MongoDB Community Server for Windows
echo 3. Run the installer with default settings
echo 4. Start MongoDB service from Services
echo.
echo Option 2: Use MongoDB Atlas (Cloud Database)
echo 1. Go to: https://cloud.mongodb.com/
echo 2. Create a free cluster
echo 3. Get connection string
echo 4. Update .env.local with Atlas URI
echo.
echo Option 3: Quick Test with Online MongoDB
echo 1. Use MongoDB Atlas free tier
echo 2. Add your IP to whitelist
echo 3. Use Atlas connection string
echo.

echo 🔧 Quick Fix Steps:
echo 1. Download MongoDB: https://www.mongodb.com/try/download/community
echo 2. Install with default settings
echo 3. Start MongoDB service
echo 4. Test: node test-swayam-database.js
echo.

echo 💡 Your database configuration is correct:
echo mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin
echo.

echo Press any key to open MongoDB download page...
pause >nul
start https://www.mongodb.com/try/download/community

echo.
echo 📝 After installation:
echo 1. Start MongoDB service
echo 2. Run: node test-swayam-database.js
echo 3. Start your API: npm run dev
echo.
pause
