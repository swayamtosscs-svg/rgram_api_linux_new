#!/bin/bash

# Ubuntu Server Startup Script for API Server
# This script will properly start your server on external IP

echo "🚀 Starting API Server on Ubuntu..."
echo "Server IP: 103.14.120.163"
echo "Port: 4000"
echo "=================================="

# Navigate to project directory
cd /var/www/html/api_rgram1

# Stop any existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop api-server 2>/dev/null || true
pm2 delete api-server 2>/dev/null || true

# Kill any process using port 4000
echo "🔍 Checking for processes on port 4000..."
sudo lsof -ti:4000 | xargs sudo kill -9 2>/dev/null || true

# Build the application first
echo "📦 Building Next.js application..."
npm run build

# Start the server using our custom server.js
echo "🚀 Starting server on 103.14.120.163:4000..."
pm2 start server.js --name "api-server"

# Save PM2 configuration
pm2 save

# Show status
echo "📊 Server Status:"
pm2 status

echo ""
echo "✅ Server started successfully!"
echo "🌍 Your API is now accessible at: http://103.14.120.163:4000"
echo ""
echo "📝 Useful commands:"
echo "   pm2 status          - Check server status"
echo "   pm2 logs api-server - View server logs"
echo "   pm2 restart api-server - Restart server"
echo "   pm2 stop api-server - Stop server"
echo ""
echo "🔍 Test your server:"
echo "   curl http://103.14.120.163:4000"
