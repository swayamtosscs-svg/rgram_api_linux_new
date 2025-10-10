@echo off
echo 🚀 MongoDB Quick Setup for R-GRAM API
echo.

echo 📋 Choose an option:
echo 1. Install MongoDB locally (Recommended)
echo 2. Fix MongoDB Atlas IP whitelist
echo 3. Test current connection
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🔧 Installing MongoDB locally...
    echo 💡 This will open PowerShell as Administrator
    powershell -ExecutionPolicy Bypass -File "install-mongodb-windows.ps1"
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo 🌐 Opening MongoDB Atlas Network Access...
    echo 💡 Add your IP address to the whitelist
    start https://cloud.mongodb.com/
    echo.
    echo 📝 Your current IP address:
    curl -s https://api.ipify.org
    echo.
    goto :end
)

if "%choice%"=="3" (
    echo.
    echo 🔍 Testing MongoDB connection...
    node test-mongodb-connection.js
    goto :end
)

if "%choice%"=="4" (
    echo 👋 Goodbye!
    goto :end
)

echo ❌ Invalid choice. Please run the script again.
:end
pause
