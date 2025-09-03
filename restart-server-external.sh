#!/bin/bash

# Server Restart Script with External Access
# This script ensures server binds to 0.0.0.0:4000 for external access

echo "🚀 RESTARTING SERVER FOR EXTERNAL ACCESS"
echo "========================================"
echo "Server IP: 103.14.120.163"
echo "Port: 4000"
echo ""

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ SUCCESS: $1"
    else
        echo "❌ FAILED: $1"
    fi
}

# 1. Stop all existing processes
echo "1️⃣ Stopping existing server processes..."
pm2 stop api-server 2>/dev/null || true
pm2 delete api-server 2>/dev/null || true
sudo lsof -ti:4000 | xargs sudo kill -9 2>/dev/null || true
echo "✅ All processes stopped"
echo ""

# 2. Navigate to project directory
echo "2️⃣ Navigating to project directory..."
cd /var/www/html/api_rgram1
check_success "Changed to project directory"
echo ""

# 3. Verify server.js configuration
echo "3️⃣ Verifying server.js configuration..."
if grep -q "hostname = '0.0.0.0'" server.js; then
    echo "✅ Server.js is configured for external access (0.0.0.0)"
else
    echo "❌ Server.js is NOT configured for external access"
    echo "💡 Server.js should have: hostname = '0.0.0.0'"
    echo "🔧 Fixing server.js configuration..."
    
    # Backup original file
    cp server.js server.js.backup
    
    # Fix the configuration
    sed -i "s/hostname = '.*'/hostname = '0.0.0.0'/" server.js
    check_success "Fixed server.js configuration"
fi
echo ""

# 4. Build the application
echo "4️⃣ Building Next.js application..."
npm run build
check_success "Application built"
echo ""

# 5. Start server with PM2
echo "5️⃣ Starting server with PM2..."
pm2 start server.js --name api-server
check_success "Server started with PM2"
echo ""

# 6. Save PM2 configuration
echo "6️⃣ Saving PM2 configuration..."
pm2 save
check_success "PM2 configuration saved"
echo ""

# 7. Setup PM2 auto-start
echo "7️⃣ Setting up PM2 auto-start..."
pm2 startup
check_success "PM2 auto-start configured"
echo ""

# 8. Wait for server to start
echo "8️⃣ Waiting for server to start..."
sleep 5
echo "✅ Wait completed"
echo ""

# 9. Verify server is running
echo "9️⃣ Verifying server status..."
if pm2 list | grep api-server | grep online > /dev/null; then
    echo "✅ Server is running with PM2"
else
    echo "❌ Server failed to start with PM2"
    echo "💡 Trying direct start..."
    nohup node server.js > server.log 2>&1 &
    sleep 3
    if pgrep -f "server.js" > /dev/null; then
        echo "✅ Server started directly"
    else
        echo "❌ Server failed to start"
        echo "📝 Check server.log for errors"
        exit 1
    fi
fi
echo ""

# 10. Check port binding
echo "🔟 Checking port binding..."
if netstat -tlnp | grep :4000 > /dev/null; then
    echo "✅ Port 4000 is listening"
    netstat -tlnp | grep :4000
    
    if netstat -tlnp | grep :4000 | grep "0.0.0.0" > /dev/null; then
        echo "✅ Server is binding to 0.0.0.0:4000 (external access enabled)"
    else
        echo "❌ Server is NOT binding to 0.0.0.0:4000"
        echo "💡 This is the main issue!"
        echo "🔧 Restarting server..."
        pm2 restart api-server
        sleep 3
        netstat -tlnp | grep :4000
    fi
else
    echo "❌ Port 4000 is NOT listening"
    echo "💡 Server is not running properly"
    exit 1
fi
echo ""

# 11. Test local connections
echo "1️⃣1️⃣ Testing local connections..."
if curl -s --connect-timeout 5 http://localhost:4000 > /dev/null; then
    echo "✅ Local connection works"
else
    echo "❌ Local connection failed"
fi

if curl -s --connect-timeout 5 http://127.0.0.1:4000 > /dev/null; then
    echo "✅ 127.0.0.1 connection works"
else
    echo "❌ 127.0.0.1 connection failed"
fi

if curl -s --connect-timeout 5 http://0.0.0.0:4000 > /dev/null; then
    echo "✅ 0.0.0.0 connection works"
else
    echo "❌ 0.0.0.0 connection failed"
fi
echo ""

# 12. Test external IP connection
echo "1️⃣2️⃣ Testing external IP connection..."
if curl -s --connect-timeout 10 http://103.14.120.163:4000 > /dev/null; then
    echo "✅ External IP connection works"
else
    echo "❌ External IP connection failed"
    echo "💡 This means external access is blocked"
    echo "🔧 Run firewall fix script: ./fix-firewall-access.sh"
fi
echo ""

# 13. Show final status
echo "📊 FINAL STATUS"
echo "==============="
echo "PM2 Status:"
pm2 status
echo ""
echo "Port Status:"
netstat -tlnp | grep :4000
echo ""
echo "Server Logs (last 10 lines):"
pm2 logs api-server --lines 10 2>/dev/null || echo "No PM2 logs found"
echo ""

# 14. Provide next steps
echo "🎯 NEXT STEPS"
echo "============="
echo "1. Test from external browser: http://103.14.120.163:4000"
echo "2. If still not working, run: ./fix-firewall-access.sh"
echo "3. Check cloud provider firewall settings"
echo "4. Test from external machine: curl http://103.14.120.163:4000"
echo ""
echo "🔍 TROUBLESHOOTING:"
echo "==================="
echo "If external access still fails:"
echo "1. Check cloud provider firewall (AWS, DigitalOcean, etc.)"
echo "2. Verify server is binding to 0.0.0.0:4000"
echo "3. Check if server has public IP address"
echo "4. Test with: telnet 103.14.120.163 4000"
echo ""
echo "📞 SUPPORT COMMANDS:"
echo "===================="
echo "pm2 status"
echo "netstat -tlnp | grep :4000"
echo "pm2 logs api-server"
echo "curl http://localhost:4000"
echo "curl http://103.14.120.163:4000"
echo ""
echo "🎉 Server restart completed!"
echo "Your server should now be accessible at: http://103.14.120.163:4000"
