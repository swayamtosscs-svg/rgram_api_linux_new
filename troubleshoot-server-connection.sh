#!/bin/bash

# Ubuntu Server Connection Troubleshooting Script
# Run this on your Ubuntu server to diagnose connection issues

echo "🔍 Ubuntu Server Connection Troubleshooting"
echo "Server IP: 103.14.120.163"
echo "Port: 4000"
echo "=============================================="

# Check if server is running
echo "1️⃣ Checking if server is running..."
if pgrep -f "server.js" > /dev/null; then
    echo "✅ Server.js process is running"
    ps aux | grep server.js | grep -v grep
else
    echo "❌ Server.js process is NOT running"
    echo "💡 Start server with: pm2 start server.js --name api-server"
fi

echo ""

# Check PM2 status
echo "2️⃣ Checking PM2 status..."
if command -v pm2 &> /dev/null; then
    pm2 status
else
    echo "❌ PM2 is not installed"
    echo "💡 Install with: npm install -g pm2"
fi

echo ""

# Check if port 4000 is listening
echo "3️⃣ Checking if port 4000 is listening..."
if netstat -tlnp | grep :4000 > /dev/null; then
    echo "✅ Port 4000 is listening"
    netstat -tlnp | grep :4000
else
    echo "❌ Port 4000 is NOT listening"
    echo "💡 Check server configuration"
fi

echo ""

# Check firewall status
echo "4️⃣ Checking firewall status..."
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    ufw status
    echo ""
    if ufw status | grep "4000" > /dev/null; then
        echo "✅ Port 4000 is allowed in firewall"
    else
        echo "❌ Port 4000 is NOT allowed in firewall"
        echo "💡 Allow with: sudo ufw allow 4000"
    fi
else
    echo "❌ UFW firewall is not installed"
fi

echo ""

# Check if server is binding to correct interface
echo "5️⃣ Checking server binding..."
if netstat -tlnp | grep :4000 | grep "0.0.0.0" > /dev/null; then
    echo "✅ Server is binding to 0.0.0.0:4000 (external access enabled)"
elif netstat -tlnp | grep :4000 | grep "127.0.0.1" > /dev/null; then
    echo "❌ Server is binding to 127.0.0.1:4000 (localhost only)"
    echo "💡 Fix server.js to bind to 0.0.0.0:4000"
else
    echo "❌ Server binding not found"
fi

echo ""

# Test local connection
echo "6️⃣ Testing local connection..."
if curl -s --connect-timeout 5 http://localhost:4000 > /dev/null; then
    echo "✅ Local connection works"
else
    echo "❌ Local connection failed"
    echo "💡 Server might not be running properly"
fi

echo ""

# Check system resources
echo "7️⃣ Checking system resources..."
echo "Memory usage:"
free -h
echo ""
echo "Disk usage:"
df -h /
echo ""

# Check for any error logs
echo "8️⃣ Checking for error logs..."
if command -v pm2 &> /dev/null; then
    echo "PM2 Logs (last 10 lines):"
    pm2 logs api-server --lines 10 2>/dev/null || echo "No PM2 logs found"
fi

echo ""
echo "🔧 Quick Fix Commands:"
echo "======================"
echo "1. Start server: pm2 start server.js --name api-server"
echo "2. Allow firewall: sudo ufw allow 4000"
echo "3. Check status: pm2 status"
echo "4. View logs: pm2 logs api-server"
echo "5. Restart server: pm2 restart api-server"
echo ""
echo "🌍 Test from external machine:"
echo "curl http://103.14.120.163:4000"
