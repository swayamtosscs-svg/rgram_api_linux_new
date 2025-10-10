@echo off
echo 🚀 Quick MongoDB Fix for R-GRAM API
echo ====================================

echo.
echo Checking if MongoDB is installed...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not installed
    echo.
    echo 📥 Please download and install MongoDB Community Edition:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo ✅ MongoDB is installed

echo.
echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB service started successfully
) else (
    echo ⚠️ MongoDB service might already be running or failed to start
)

echo.
echo Testing MongoDB connection...
mongosh --eval "db.runCommand({ping: 1})" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running and accessible
) else (
    echo ❌ MongoDB is not accessible
    echo.
    echo 🔧 Trying to start MongoDB manually...
    start mongod --dbpath C:\data\db
    timeout /t 5 /nobreak >nul
)

echo.
echo Setting up database and user...
mongosh --eval "
use admin
try {
    db.createUser({
        user: 'swayamUser',
        pwd: 'swayamPass',
        roles: [
            { role: 'readWrite', db: 'swayam' },
            { role: 'dbAdmin', db: 'swayam' }
        ]
    })
    print('✅ User created successfully')
} catch (e) {
    if (e.code === 51003) {
        print('✅ User already exists')
    } else {
        print('❌ Error creating user: ' + e.message)
    }
}
use swayam
db.test.insertOne({message: 'Database setup complete', timestamp: new Date()})
print('✅ Database setup complete')
" 2>nul

echo.
echo Testing API connection...
node test-follow-request-reject.js

echo.
echo 🎉 Setup complete! Your API should now work.
echo.
pause
