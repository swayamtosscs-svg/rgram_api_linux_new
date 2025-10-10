#!/bin/bash

# Ubuntu Server Firewall Configuration Script
# This script configures UFW (Uncomplicated Firewall) to allow traffic on port 4000

echo "🔧 Setting up Ubuntu Firewall for API Server..."

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    echo "❌ UFW is not installed. Installing UFW..."
    sudo apt update
    sudo apt install -y ufw
fi

# Enable UFW if not already enabled
echo "🔐 Enabling UFW firewall..."
sudo ufw --force enable

# Allow SSH (port 22) - IMPORTANT: Don't lock yourself out!
echo "🔑 Allowing SSH (port 22)..."
sudo ufw allow 22

# Allow HTTP (port 80) - for web traffic
echo "🌐 Allowing HTTP (port 80)..."
sudo ufw allow 80

# Allow HTTPS (port 443) - for secure web traffic
echo "🔒 Allowing HTTPS (port 443)..."
sudo ufw allow 443

# Allow your API server port (4000)
echo "🚀 Allowing API Server (port 4000)..."
sudo ufw allow 4000

# Allow MongoDB port if you're using MongoDB locally
echo "🍃 Allowing MongoDB (port 27017)..."
sudo ufw allow 27017

# Show current firewall status
echo "📊 Current Firewall Status:"
sudo ufw status verbose

echo ""
echo "✅ Firewall configuration completed!"
echo "🌍 Your API server should now be accessible from external connections on port 4000"
echo ""
echo "📝 To check if your server is running and accessible:"
echo "   curl http://YOUR_SERVER_IP:4000"
echo ""
echo "🔍 To check firewall status anytime:"
echo "   sudo ufw status"
echo ""
echo "⚠️  If you need to disable firewall temporarily:"
echo "   sudo ufw disable"
echo ""
echo "🔄 To reload firewall rules:"
echo "   sudo ufw reload"
