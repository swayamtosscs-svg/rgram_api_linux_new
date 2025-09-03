# 🚀 Quick Deployment Guide - Ubuntu Server 103.14.120.163

## ⚡ One-Click Deployment

### Option 1: Automated Deployment (Recommended)
```bash
# Make deployment script executable
chmod +x deploy-to-ubuntu.sh

# Run automated deployment
./deploy-to-ubuntu.sh
```

### Option 2: Manual Deployment

#### Step 1: Upload Code
```bash
# Upload your project to Ubuntu server
scp -r . root@103.14.120.163:/home/root/api_rgram1
```

#### Step 2: SSH into Server
```bash
ssh root@103.14.120.163
```

#### Step 3: Install Dependencies
```bash
cd /home/root/api_rgram1
npm install
```

#### Step 4: Configure Firewall
```bash
chmod +x setup-ubuntu-firewall.sh
./setup-ubuntu-firewall.sh
```

#### Step 5: Start Server
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name "api-server"
pm2 save
pm2 startup
```

## 🎯 Your API Server URLs

- **Main API**: http://103.14.120.163:4000
- **Local Test**: http://localhost:4000 (on server)

## 🔧 Quick Commands

```bash
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

# Test API
curl http://103.14.120.163:4000
```

## 🚨 Troubleshooting

### Server Not Accessible?
```bash
# Check if port is listening
sudo netstat -tlnp | grep :4000

# Check firewall
sudo ufw status

# Check PM2 status
pm2 status
```

### Permission Issues?
```bash
# Fix file permissions
sudo chown -R root:root /home/root/api_rgram1
chmod +x setup-ubuntu-firewall.sh
```

## ✅ Success Indicators

1. ✅ Server binds to `0.0.0.0:4000`
2. ✅ Firewall allows port 4000
3. ✅ PM2 process running
4. ✅ External access working: `curl http://103.14.120.163:4000`

## 📞 Support Commands

```bash
# Full system check
pm2 status && sudo ufw status && sudo netstat -tlnp | grep :4000

# View all logs
pm2 logs api-server --lines 50

# Restart everything
pm2 restart api-server && sudo ufw reload
```
