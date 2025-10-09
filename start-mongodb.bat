@echo off
echo 🚀 Starting MongoDB...

net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB service started
) else (
    echo 📡 Starting MongoDB manually...
    mongod --dbpath ./data/db --logpath ./data/mongodb.log --fork
)

echo 🔍 Testing connection...
mongosh --eval "db.runCommand('ping')" api_rgram

echo 🎉 MongoDB is ready!
pause
