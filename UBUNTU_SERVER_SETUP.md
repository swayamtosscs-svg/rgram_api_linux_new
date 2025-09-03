# Ubuntu Server Setup Guide for API Server
## Server IP: 103.14.120.163

## 🚀 Complete Setup Instructions

### 1. Upload Your Code to Ubuntu Server

```bash
# Upload your project files to Ubuntu server
# You can use SCP, SFTP, or Git clone
scp -r /path/to/your/project root@103.14.120.163:/home/root/api_rgram1
```

### 2. Install Node.js and Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest version)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Navigate to your project directory
cd /home/user/api_rgram1

# Install project dependencies
npm install
```

### 3. Configure Firewall

```bash
# Make the firewall script executable
chmod +x setup-ubuntu-firewall.sh

# Run the firewall configuration script
./setup-ubuntu-firewall.sh
```

**Manual Firewall Commands (if script doesn't work):**
```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 4000  # Your API server
sudo ufw allow 27017 # MongoDB (if using local MongoDB)

# Check status
sudo ufw status
```

### 4. Set Up Environment Variables

```bash
# Create .env file with your configuration
nano .env

# Add your environment variables:
# DATABASE_URL=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# SMTP_HOST=your_smtp_host
# etc.
```

### 5. Start Your Server

#### Option A: Direct Start (for testing)
```bash
# Start the server
node server.js
```

#### Option B: Using PM2 (Recommended for production)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your application with PM2
pm2 start server.js --name "api-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above

# Monitor your application
pm2 status
pm2 logs api-server
```

### 6. Test Your Server

```bash
# Test locally on server
curl http://localhost:4000

# Test from external machine
curl http://103.14.120.163:4000
```

### 7. Configure Nginx (Optional - for better performance)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/api-server

# Add this configuration:
server {
    listen 80;
    server_name 103.14.120.163;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/api-server /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔧 Troubleshooting

### Check if Port is Listening
```bash
# Check if your server is listening on port 4000
sudo netstat -tlnp | grep :4000
# or
sudo ss -tlnp | grep :4000
```

### Check Firewall Status
```bash
# Check UFW status
sudo ufw status verbose

# Check if port 4000 is allowed
sudo ufw status | grep 4000
```

### Check Server Logs
```bash
# If using PM2
pm2 logs api-server

# If running directly
# Check the terminal where you started the server
```

### Common Issues and Solutions

1. **Server not accessible from outside:**
   - Check firewall: `sudo ufw status`
   - Check if server is binding to 0.0.0.0: `sudo netstat -tlnp | grep :4000`

2. **Permission denied errors:**
   - Make sure your user has proper permissions
   - Check file ownership: `ls -la`

3. **Port already in use:**
   - Find process using port: `sudo lsof -i :4000`
   - Kill process: `sudo kill -9 PID`

## 📝 Important Notes

- Your server is now configured to bind to `0.0.0.0:4000` which means it will accept connections from any IP address
- Make sure your `.env` file has all the correct configuration for your production environment
- Consider using HTTPS in production by setting up SSL certificates
- Monitor your server logs regularly for any errors
- Keep your system and dependencies updated

## 🎯 Quick Commands Summary

```bash
# Start server with PM2
pm2 start server.js --name "api-server"

# Check server status
pm2 status

# View logs
pm2 logs api-server

# Restart server
pm2 restart api-server

# Stop server
pm2 stop api-server

# Check firewall
sudo ufw status

# Check if port is listening
sudo netstat -tlnp | grep :4000
```
