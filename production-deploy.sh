#!/bin/bash

# Production Deployment Script for Next.js App
# This script sets up a complete production environment

set -e  # Exit on any error

echo "🚀 PRODUCTION DEPLOYMENT SCRIPT"
echo "================================"
echo "Server IP: 103.14.120.163"
echo "App will be accessible at: http://103.14.120.163"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Update system packages
echo "1️⃣ Updating system packages..."
apt update && apt upgrade -y
print_status "System packages updated"

# 2. Install Node.js (if not installed)
echo ""
echo "2️⃣ Installing Node.js..."
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    print_status "Node.js installed"
else
    print_info "Node.js already installed: $(node --version)"
fi

# 3. Install PM2 globally
echo ""
echo "3️⃣ Installing PM2..."
if ! command_exists pm2; then
    npm install -g pm2
    print_status "PM2 installed"
else
    print_info "PM2 already installed: $(pm2 --version)"
fi

# 4. Install Nginx (if not installed)
echo ""
echo "4️⃣ Installing Nginx..."
if ! command_exists nginx; then
    apt install -y nginx
    print_status "Nginx installed"
else
    print_info "Nginx already installed"
fi

# 5. Configure UFW Firewall
echo ""
echo "5️⃣ Configuring UFW Firewall..."
ufw --force enable
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw allow 4000    # Next.js app (for direct access if needed)
print_status "UFW firewall configured"

# Show firewall status
print_info "Firewall status:"
ufw status

# 6. Navigate to project directory
echo ""
echo "6️⃣ Setting up project directory..."
cd /var/www/html/api_rgram1

# Create logs directory
mkdir -p logs
print_status "Project directory ready"

# 7. Install dependencies
echo ""
echo "7️⃣ Installing dependencies..."
npm install
print_status "Dependencies installed"

# 8. Build the application
echo ""
echo "8️⃣ Building Next.js application..."
npm run build
print_status "Application built"

# 9. Stop any existing processes
echo ""
echo "9️⃣ Stopping existing processes..."
pm2 stop nextjs-api 2>/dev/null || true
pm2 delete nextjs-api 2>/dev/null || true
systemctl stop nextjs-api 2>/dev/null || true
print_status "Existing processes stopped"

# 10. Start with PM2
echo ""
echo "🔟 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
print_status "Application started with PM2"

# 11. Configure Nginx
echo ""
echo "1️⃣1️⃣ Configuring Nginx..."
# Copy nginx configuration
cp nginx-nextjs.conf /etc/nginx/sites-available/nextjs-api

# Enable the site
ln -sf /etc/nginx/sites-available/nextjs-api /etc/nginx/sites-enabled/

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t
print_status "Nginx configuration valid"

# Restart nginx
systemctl restart nginx
systemctl enable nginx
print_status "Nginx restarted and enabled"

# 12. Setup systemd service (as backup)
echo ""
echo "1️⃣2️⃣ Setting up systemd service..."
cp nextjs-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable nextjs-api
print_status "Systemd service configured"

# 13. Create environment file if it doesn't exist
echo ""
echo "1️⃣3️⃣ Setting up environment..."
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=4000
HOSTNAME=0.0.0.0
# Add your other environment variables here
EOF
    print_status "Environment file created"
else
    print_info "Environment file already exists"
fi

# 14. Set proper permissions
echo ""
echo "1️⃣4️⃣ Setting permissions..."
chown -R root:root /var/www/html/api_rgram1
chmod +x server.js
chmod +x production-deploy.sh
print_status "Permissions set"

# 15. Final verification
echo ""
echo "1️⃣5️⃣ Final verification..."

# Check PM2 status
print_info "PM2 Status:"
pm2 status

# Check if port 4000 is listening
if netstat -tlnp | grep :4000 > /dev/null; then
    print_status "Port 4000 is listening"
else
    print_error "Port 4000 is not listening"
fi

# Check if port 80 is listening (Nginx)
if netstat -tlnp | grep :80 > /dev/null; then
    print_status "Port 80 is listening (Nginx)"
else
    print_error "Port 80 is not listening"
fi

# Test local connections
if curl -s --connect-timeout 5 http://localhost:4000 > /dev/null; then
    print_status "Local app connection works"
else
    print_error "Local app connection failed"
fi

if curl -s --connect-timeout 5 http://localhost > /dev/null; then
    print_status "Local Nginx connection works"
else
    print_error "Local Nginx connection failed"
fi

# 16. Show final status
echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Access URLs:"
echo "   Main site: http://103.14.120.163"
echo "   Direct app: http://103.14.120.163:4000"
echo "   Health check: http://103.14.120.163/health"
echo ""
echo "🔧 Management Commands:"
echo "   PM2 status: pm2 status"
echo "   PM2 logs: pm2 logs nextjs-api"
echo "   PM2 restart: pm2 restart nextjs-api"
echo "   Nginx status: systemctl status nginx"
echo "   Nginx restart: systemctl restart nginx"
echo ""
echo "📝 Log Files:"
echo "   PM2 logs: /var/www/html/api_rgram1/logs/"
echo "   Nginx logs: /var/log/nginx/"
echo "   System logs: journalctl -u nextjs-api"
echo ""
echo "🛡️ Security:"
echo "   Firewall: ufw status"
echo "   SSL: Consider setting up Let's Encrypt for HTTPS"
echo ""
echo "✅ Your Next.js app is now running in production!"
echo "   Access it at: http://103.14.120.163"
