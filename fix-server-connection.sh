#!/bin/bash

# Quick Fix Script for Server Connection Issues
# Run this on your Ubuntu server to fix common connection problems

echo "🔧 Fixing Server Connection Issues"
echo "=================================="

# Stop any existing processes
echo "1️⃣ Stopping existing processes..."
pm2 stop api-server 2>/dev/null || true
pm2 delete api-server 2>/dev/null || true

# Kill any process using port 4000
echo "2️⃣ Freeing port 4000..."
sudo lsof -ti:4000 | xargs sudo kill -9 2>/dev/null || true

# Ensure firewall allows port 4000
echo "3️⃣ Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 4000
sudo ufw allow 27017

# Navigate to project directory
cd /var/www/html/api_rgram1

# Build the application
echo "4️⃣ Building application..."
npm run build

# Start server with PM2
echo "5️⃣ Starting server..."
pm2 start server.js --name "api-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo ""
echo "6️⃣ Verifying server status..."
sleep 3

# Check if server is running
if pm2 list | grep api-server | grep online > /dev/null; then
    echo "✅ Server is running successfully!"
else
    echo "❌ Server failed to start"
    echo "📝 Check logs: pm2 logs api-server"
    exit 1
fi

# Check if port is listening
if netstat -tlnp | grep :4000 > /dev/null; then
    echo "✅ Port 4000 is listening"
else
    echo "❌ Port 4000 is not listening"
    exit 1
fi

# Check firewall
if ufw status | grep "4000" > /dev/null; then
    echo "✅ Firewall allows port 4000"
else
    echo "❌ Firewall issue detected"
    exit 1
fi

# Test local connection
echo "7️⃣ Testing local connection..."
if curl -s --connect-timeout 5 http://localhost:4000 > /dev/null; then
    echo "✅ Local connection works"
else
    echo "❌ Local connection failed"
    echo "📝 Server might have issues"
fi

echo ""
echo "🎉 Server Fix Complete!"
echo "======================"
echo "🌍 Your server should now be accessible at:"
echo "   http://103.14.120.163:4000"
echo ""
echo "📊 Server Status:"
pm2 status
echo ""
echo "🔍 Test from external machine:"
echo "curl http://103.14.120.163:4000"
echo ""
echo "📝 If still not working, check:"
echo "1. Cloud provider firewall settings"
echo "2. Server provider security groups"
echo "3. Network configuration"
