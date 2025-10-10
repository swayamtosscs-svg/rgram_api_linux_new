# Production Setup Guide for Next.js App

## 🚀 Complete Production Deployment

This guide sets up a production-ready Next.js application with Nginx reverse proxy on Ubuntu server `103.14.120.163`.

## 📋 What This Setup Includes

1. **Next.js App** - Running on port 3000 with proper binding
2. **Nginx Reverse Proxy** - Serving on port 80, proxying to port 3000
3. **PM2 Process Manager** - Auto-restart, clustering, monitoring
4. **Systemd Service** - Backup service management
5. **UFW Firewall** - Secure port configuration
6. **Production Optimizations** - Security headers, compression, rate limiting

## 🎯 Final Result

- **Main URL**: http://103.14.120.163 (port 80)
- **Direct App**: http://103.14.120.163:3000 (port 3000)
- **Health Check**: http://103.14.120.163/health

## 🛠️ Quick Deployment

### Option 1: Automated Deployment (Recommended)
```bash
# Make script executable
chmod +x production-deploy.sh

# Run complete deployment
./production-deploy.sh
```

### Option 2: Manual Step-by-Step

#### 1. Update System
```bash
apt update && apt upgrade -y
```

#### 2. Install Dependencies
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# PM2
npm install -g pm2

# Nginx
apt install -y nginx
```

#### 3. Configure Firewall
```bash
ufw --force enable
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw allow 3000    # Direct app access
```

#### 4. Setup Application
```bash
cd /var/www/html/api_rgram1
npm install
npm run build
```

#### 5. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 6. Configure Nginx
```bash
# Copy configuration
cp nginx-nextjs.conf /etc/nginx/sites-available/nextjs-api

# Enable site
ln -sf /etc/nginx/sites-available/nextjs-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx
systemctl enable nginx
```

#### 7. Setup Systemd Service (Backup)
```bash
cp nextjs-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable nextjs-api
```

## 🔧 Configuration Files

### server.js
- ✅ Binds to `0.0.0.0:3000` for external access
- ✅ Production optimizations
- ✅ Security headers
- ✅ Graceful shutdown
- ✅ Environment-based configuration

### nginx-nextjs.conf
- ✅ Reverse proxy to port 3000
- ✅ Security headers
- ✅ Gzip compression
- ✅ Rate limiting
- ✅ Static file caching
- ✅ Health check endpoint

### ecosystem.config.js
- ✅ PM2 cluster mode
- ✅ Auto-restart on crash
- ✅ Memory limit monitoring
- ✅ Log management
- ✅ Production environment

### nextjs-api.service
- ✅ Systemd service configuration
- ✅ Auto-start on boot
- ✅ Security restrictions
- ✅ Proper logging

## 📊 Monitoring & Management

### PM2 Commands
```bash
pm2 status              # Check app status
pm2 logs nextjs-api     # View logs
pm2 restart nextjs-api  # Restart app
pm2 stop nextjs-api     # Stop app
pm2 delete nextjs-api   # Remove from PM2
```

### Nginx Commands
```bash
systemctl status nginx   # Check Nginx status
systemctl restart nginx  # Restart Nginx
nginx -t                 # Test configuration
```

### Systemd Commands (Backup)
```bash
systemctl status nextjs-api    # Check service status
systemctl restart nextjs-api   # Restart service
systemctl stop nextjs-api      # Stop service
```

## 🔍 Troubleshooting

### Check Application Status
```bash
# PM2 status
pm2 status

# Check if port 3000 is listening
netstat -tlnp | grep :3000

# Check if port 80 is listening (Nginx)
netstat -tlnp | grep :80

# Test local connections
curl http://localhost:3000
curl http://localhost
```

### Check Logs
```bash
# PM2 logs
pm2 logs nextjs-api

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nextjs-api -f
```

### Common Issues

1. **Port 3000 not listening**
   ```bash
   pm2 restart nextjs-api
   ```

2. **Nginx not proxying**
   ```bash
   nginx -t
   systemctl restart nginx
   ```

3. **Firewall blocking**
   ```bash
   ufw status
   ufw allow 80
ufw allow 3000
   ```

## 🔒 Security Features

- ✅ UFW firewall configured
- ✅ Security headers in Nginx
- ✅ Rate limiting
- ✅ File access restrictions
- ✅ Systemd security options
- ✅ Process isolation

## 🚀 Performance Optimizations

- ✅ PM2 cluster mode (uses all CPU cores)
- ✅ Nginx gzip compression
- ✅ Static file caching
- ✅ Connection pooling
- ✅ Buffer optimization

## 📈 Scaling

### Horizontal Scaling
- Add more servers behind a load balancer
- Use PM2 cluster mode on each server

### Vertical Scaling
- Increase server resources
- PM2 will automatically use more CPU cores

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
git pull origin main
npm install
npm run build
pm2 restart nextjs-api
```

### Backup
```bash
# Backup application
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/html/api_rgram1

# Backup configuration
cp /etc/nginx/sites-available/nextjs-api backup-nginx.conf
```

## 📞 Support

If you encounter issues:

1. Check logs: `pm2 logs nextjs-api`
2. Verify configuration: `nginx -t`
3. Test connectivity: `curl http://localhost:3000`
4. Check firewall: `ufw status`

## 🎉 Success!

Your Next.js app is now running in production with:
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ Auto-restart capabilities
- ✅ Security hardening
- ✅ Performance optimization

**Access your app at: http://103.14.120.163**
