#!/bin/bash

# Complete Firewall Fix Script for External Browser Access
# This script will fix all firewall issues to allow external access

echo "🔥 FIXING FIREWALL FOR EXTERNAL BROWSER ACCESS"
echo "=============================================="
echo "Server IP: 103.14.120.163"
echo "Port: 4000"
echo ""

# Function to run command and show result
run_command() {
    local cmd=$1
    local description=$2
    
    echo "🔧 $description"
    echo "Command: $cmd"
    
    if eval "$cmd"; then
        echo "✅ SUCCESS: $description"
    else
        echo "❌ FAILED: $description"
    fi
    echo ""
}

# 1. Stop existing server
echo "1️⃣ Stopping existing server..."
pm2 stop api-server 2>/dev/null || true
pm2 delete api-server 2>/dev/null || true
sudo lsof -ti:4000 | xargs sudo kill -9 2>/dev/null || true
echo "✅ Server stopped"
echo ""

# 2. Configure UFW Firewall
echo "2️⃣ Configuring UFW Firewall..."
run_command "sudo ufw --force enable" "Enable UFW firewall"
run_command "sudo ufw allow 22" "Allow SSH (port 22)"
run_command "sudo ufw allow 80" "Allow HTTP (port 80)"
run_command "sudo ufw allow 443" "Allow HTTPS (port 443)"
run_command "sudo ufw allow 4000" "Allow API Server (port 4000)"
run_command "sudo ufw allow 27017" "Allow MongoDB (port 27017)"

# Show firewall status
echo "📊 Current Firewall Status:"
sudo ufw status verbose
echo ""

# 3. Configure iptables (backup firewall)
echo "3️⃣ Configuring iptables..."
run_command "sudo iptables -A INPUT -p tcp --dport 4000 -j ACCEPT" "Allow port 4000 in iptables"
run_command "sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT" "Allow SSH in iptables"
run_command "sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT" "Allow HTTP in iptables"
run_command "sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT" "Allow HTTPS in iptables"

# Save iptables rules
run_command "sudo iptables-save > /etc/iptables/rules.v4" "Save iptables rules"

echo "📊 Current iptables rules:"
sudo iptables -L | grep -E "(4000|22|80|443)"
echo ""

# 4. Navigate to project and build
echo "4️⃣ Building application..."
cd /var/www/html/api_rgram1
run_command "npm run build" "Build Next.js application"
echo ""

# 5. Start server with proper configuration
echo "5️⃣ Starting server with external access..."
run_command "pm2 start server.js --name api-server" "Start server with PM2"
run_command "pm2 save" "Save PM2 configuration"
run_command "pm2 startup" "Setup PM2 auto-start"

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# 6. Verify server is running
echo "6️⃣ Verifying server status..."
if pm2 list | grep api-server | grep online > /dev/null; then
    echo "✅ Server is running with PM2"
else
    echo "❌ Server failed to start with PM2"
    echo "💡 Trying direct start..."
    node server.js &
    sleep 3
fi

# 7. Check port binding
echo "7️⃣ Checking port binding..."
if netstat -tlnp | grep :4000 > /dev/null; then
    echo "✅ Port 4000 is listening"
    netstat -tlnp | grep :4000
    
    if netstat -tlnp | grep :4000 | grep "0.0.0.0" > /dev/null; then
        echo "✅ Server is binding to 0.0.0.0:4000 (external access enabled)"
    else
        echo "❌ Server is NOT binding to 0.0.0.0:4000"
        echo "💡 This is the main issue!"
    fi
else
    echo "❌ Port 4000 is NOT listening"
fi
echo ""

# 8. Test local connections
echo "8️⃣ Testing local connections..."
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

# 9. Test external IP connection
echo "9️⃣ Testing external IP connection..."
if curl -s --connect-timeout 10 http://103.14.120.163:4000 > /dev/null; then
    echo "✅ External IP connection works"
else
    echo "❌ External IP connection failed"
    echo "💡 This means external access is blocked"
fi
echo ""

# 10. Show final status
echo "📊 FINAL STATUS"
echo "==============="
echo "PM2 Status:"
pm2 status
echo ""
echo "Port Status:"
netstat -tlnp | grep :4000
echo ""
echo "Firewall Status:"
sudo ufw status
echo ""

# 11. Provide next steps
echo "🎯 NEXT STEPS"
echo "============="
echo "1. Test from external browser: http://103.14.120.163:4000"
echo "2. If still not working, check cloud provider settings:"
echo "   - AWS: Security Groups"
echo "   - DigitalOcean: Firewalls"
echo "   - Google Cloud: Firewall Rules"
echo "   - Vultr: Firewall"
echo ""
echo "3. Test from external machine:"
echo "   curl http://103.14.120.163:4000"
echo "   telnet 103.14.120.163 4000"
echo ""
echo "4. Check server logs:"
echo "   pm2 logs api-server"
echo ""

# 12. Cloud provider specific commands
echo "☁️ CLOUD PROVIDER COMMANDS"
echo "=========================="
echo "If you're using a cloud provider, run these commands:"
echo ""
echo "AWS EC2:"
echo "  - Go to AWS Console → EC2 → Security Groups"
echo "  - Add inbound rule: Port 4000, Source: 0.0.0.0/0"
echo ""
echo "DigitalOcean:"
echo "  - Go to Networking → Firewalls"
echo "  - Add rule: Port 4000, Protocol: TCP, Sources: All IPv4"
echo ""
echo "Google Cloud:"
echo "  gcloud compute firewall-rules create allow-port-4000 --allow tcp:4000 --source-ranges 0.0.0.0/0"
echo ""
echo "Vultr:"
echo "  - Go to Firewall → Add Rule"
echo "  - Port: 4000, Protocol: TCP, Source: Anywhere"
echo ""

echo "🎉 Firewall fix completed!"
echo "Your server should now be accessible at: http://103.14.120.163:4000"
