#!/bin/bash

# Comprehensive Server Connection Test Script
# Run this on your Ubuntu server to test all aspects

echo "🧪 Comprehensive Server Connection Test"
echo "======================================"
echo "Server IP: 103.14.120.163"
echo "Port: 4000"
echo ""

# Function to test connection
test_connection() {
    local url=$1
    local description=$2
    
    echo "Testing: $description"
    echo "URL: $url"
    
    if curl -s --connect-timeout 10 --max-time 30 "$url" > /dev/null 2>&1; then
        echo "✅ SUCCESS: $description works"
        return 0
    else
        echo "❌ FAILED: $description failed"
        return 1
    fi
    echo ""
}

# 1. Check if server process is running
echo "1️⃣ Checking Server Process..."
if pgrep -f "server.js" > /dev/null; then
    echo "✅ Server.js process is running"
    ps aux | grep server.js | grep -v grep
else
    echo "❌ Server.js process is NOT running"
    echo "💡 Start with: pm2 start server.js --name api-server"
    exit 1
fi
echo ""

# 2. Check PM2 status
echo "2️⃣ Checking PM2 Status..."
if command -v pm2 &> /dev/null; then
    pm2 status
    if pm2 list | grep api-server | grep online > /dev/null; then
        echo "✅ PM2 shows server as online"
    else
        echo "❌ PM2 shows server as offline"
        echo "💡 Restart with: pm2 restart api-server"
    fi
else
    echo "❌ PM2 not installed"
fi
echo ""

# 3. Check port binding
echo "3️⃣ Checking Port Binding..."
if netstat -tlnp | grep :4000 > /dev/null; then
    echo "✅ Port 4000 is listening"
    netstat -tlnp | grep :4000
    if netstat -tlnp | grep :4000 | grep "0.0.0.0" > /dev/null; then
        echo "✅ Server is binding to 0.0.0.0:4000 (external access enabled)"
    elif netstat -tlnp | grep :4000 | grep "127.0.0.1" > /dev/null; then
        echo "❌ Server is binding to 127.0.0.1:4000 (localhost only)"
        echo "💡 This is the problem! Server needs to bind to 0.0.0.0:4000"
    else
        echo "⚠️  Server binding unclear"
    fi
else
    echo "❌ Port 4000 is NOT listening"
    echo "💡 Server is not running properly"
fi
echo ""

# 4. Check firewall
echo "4️⃣ Checking Firewall..."
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    ufw status
    if ufw status | grep "4000" > /dev/null; then
        echo "✅ Port 4000 is allowed in UFW"
    else
        echo "❌ Port 4000 is NOT allowed in UFW"
        echo "💡 Allow with: sudo ufw allow 4000"
    fi
else
    echo "❌ UFW not installed"
fi
echo ""

# 5. Test local connections
echo "5️⃣ Testing Local Connections..."
test_connection "http://localhost:4000" "Localhost connection"
test_connection "http://127.0.0.1:4000" "127.0.0.1 connection"
test_connection "http://0.0.0.0:4000" "0.0.0.0 connection"

# 6. Test external IP connection
echo "6️⃣ Testing External IP Connection..."
test_connection "http://103.14.120.163:4000" "External IP connection"

# 7. Test specific API endpoint
echo "7️⃣ Testing API Endpoint..."
test_connection "http://localhost:4000/api/friend-request/list?status=pending&page=1&limit=20" "API endpoint (local)"
test_connection "http://103.14.120.163:4000/api/friend-request/list?status=pending&page=1&limit=20" "API endpoint (external)"

# 8. Check system resources
echo "8️⃣ Checking System Resources..."
echo "Memory usage:"
free -h
echo ""
echo "Disk usage:"
df -h /
echo ""

# 9. Check for errors in logs
echo "9️⃣ Checking Server Logs..."
if command -v pm2 &> /dev/null; then
    echo "PM2 Logs (last 20 lines):"
    pm2 logs api-server --lines 20 2>/dev/null || echo "No PM2 logs found"
fi
echo ""

# 10. Network interface check
echo "🔟 Checking Network Interfaces..."
echo "Available network interfaces:"
ip addr show | grep "inet " | grep -v "127.0.0.1"
echo ""

# Summary and recommendations
echo "📋 SUMMARY & RECOMMENDATIONS"
echo "============================"

if netstat -tlnp | grep :4000 | grep "0.0.0.0" > /dev/null; then
    echo "✅ Server binding: CORRECT (0.0.0.0:4000)"
else
    echo "❌ Server binding: INCORRECT (not binding to 0.0.0.0:4000)"
    echo "💡 Fix: Restart server or check server.js configuration"
fi

if ufw status | grep "4000" > /dev/null; then
    echo "✅ Firewall: CORRECT (port 4000 allowed)"
else
    echo "❌ Firewall: INCORRECT (port 4000 not allowed)"
    echo "💡 Fix: sudo ufw allow 4000"
fi

if curl -s --connect-timeout 5 http://localhost:4000 > /dev/null; then
    echo "✅ Local connection: WORKING"
else
    echo "❌ Local connection: NOT WORKING"
    echo "💡 Fix: Check server logs and restart"
fi

echo ""
echo "🔧 QUICK FIX COMMANDS:"
echo "======================"
echo "1. Restart server: pm2 restart api-server"
echo "2. Allow firewall: sudo ufw allow 4000"
echo "3. Check logs: pm2 logs api-server"
echo "4. Kill and restart: pm2 stop api-server && pm2 start server.js --name api-server"
echo ""
echo "🌐 If still not working, check:"
echo "1. Cloud provider security groups (AWS, DigitalOcean, etc.)"
echo "2. Server provider firewall settings"
echo "3. Network configuration"
