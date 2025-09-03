#!/bin/bash

# Ubuntu Server Deployment Script for IP: 103.14.120.163
# This script will deploy your API server to your Ubuntu server

SERVER_IP="103.14.120.163"
SERVER_USER="root"  # Change this to your actual username
PROJECT_NAME="api_rgram1"
PORT="4000"

echo "🚀 Deploying API Server to Ubuntu Server: $SERVER_IP"
echo "=================================================="

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "⚠️  SSH key not found. Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo "📋 Copy this public key to your server:"
    cat ~/.ssh/id_rsa.pub
    echo ""
    echo "🔑 Add this key to your server's ~/.ssh/authorized_keys file"
    echo "Press Enter when done..."
    read
fi

echo "📦 Uploading project files to server..."
# Upload project files (excluding node_modules and .git)
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' ./ $SERVER_USER@$SERVER_IP:/home/$SERVER_USER/$PROJECT_NAME/

echo "🔧 Setting up server environment..."
# Connect to server and run setup commands
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js if not installed
    if ! command -v node &> /dev/null; then
        echo "📦 Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installing PM2..."
        npm install -g pm2
    fi
    
    # Navigate to project directory
    cd /home/root/api_rgram1
    
    # Install dependencies
    echo "📦 Installing project dependencies..."
    npm install
    
    # Make firewall script executable
    chmod +x setup-ubuntu-firewall.sh
    
    # Configure firewall
    echo "🔥 Configuring firewall..."
    ./setup-ubuntu-firewall.sh
    
    # Stop existing PM2 process if running
    pm2 stop api-server 2>/dev/null || true
    pm2 delete api-server 2>/dev/null || true
    
    # Start application with PM2
    echo "🚀 Starting API server..."
    pm2 start server.js --name "api-server"
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    
    echo "✅ Deployment completed!"
    echo "🌍 Your API server is now running at: http://103.14.120.163:4000"
    echo ""
    echo "📊 Server Status:"
    pm2 status
    echo ""
    echo "📝 To view logs: pm2 logs api-server"
    echo "🔄 To restart: pm2 restart api-server"
    echo "⏹️  To stop: pm2 stop api-server"
EOF

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌍 Your API server is accessible at: http://103.14.120.163:4000"
echo ""
echo "🔍 Test your server:"
echo "curl http://103.14.120.163:4000"
echo ""
echo "📊 To check server status, SSH into your server and run:"
echo "ssh $SERVER_USER@$SERVER_IP"
echo "pm2 status"
