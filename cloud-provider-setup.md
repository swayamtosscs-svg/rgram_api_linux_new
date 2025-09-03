# Cloud Provider Setup Guide

## 🚨 Common Issue: Server Ready but External Access Failed

If your server shows "✅ Server ready at http://103.14.120.163:4000" but external access fails, the issue is likely with cloud provider settings.

## 🔧 Quick Fixes by Provider

### AWS EC2
```bash
# 1. Check Security Groups
# Go to AWS Console → EC2 → Security Groups
# Add inbound rule: Port 4000, Source: 0.0.0.0/0

# 2. Check if instance has public IP
aws ec2 describe-instances --instance-ids i-your-instance-id

# 3. Check route table
aws ec2 describe-route-tables
```

### DigitalOcean Droplet
```bash
# 1. Check Firewall in DigitalOcean Dashboard
# Go to Networking → Firewalls
# Add rule: Port 4000, Protocol: TCP, Sources: All IPv4

# 2. Check if droplet has public IP
curl ifconfig.me
```

### Google Cloud Platform
```bash
# 1. Check Firewall Rules
gcloud compute firewall-rules list
gcloud compute firewall-rules create allow-port-4000 --allow tcp:4000 --source-ranges 0.0.0.0/0

# 2. Check if instance has external IP
gcloud compute instances list
```

### Vultr
```bash
# 1. Check Firewall in Vultr Dashboard
# Go to Firewall → Add Rule
# Port: 4000, Protocol: TCP, Source: Anywhere

# 2. Check server IP
curl ifconfig.me
```

## 🛠️ Universal Fix Commands

### 1. Check if server is actually binding to external interface
```bash
# This should show 0.0.0.0:4000, not 127.0.0.1:4000
netstat -tlnp | grep :4000
```

### 2. Test from server itself
```bash
# Test local connection
curl http://localhost:4000

# Test external IP connection from server
curl http://103.14.120.163:4000
```

### 3. Check if port is open externally
```bash
# From your local machine, test if port is open
telnet 103.14.120.163 4000
# or
nc -zv 103.14.120.163 4000
```

## 🔍 Diagnostic Commands

### Check all listening ports
```bash
netstat -tlnp | grep LISTEN
```

### Check if server is binding to correct interface
```bash
ss -tlnp | grep :4000
```

### Check firewall status
```bash
sudo ufw status verbose
sudo iptables -L
```

### Check if server process is running
```bash
ps aux | grep server.js
pm2 status
```

## 🚨 Most Common Issues

### 1. Server binding to localhost only
**Problem**: Server shows "ready" but binds to 127.0.0.1:4000
**Solution**: Restart server or check server.js configuration

### 2. Cloud provider firewall blocking
**Problem**: Server works locally but not externally
**Solution**: Open port 4000 in cloud provider firewall

### 3. UFW firewall blocking
**Problem**: Ubuntu firewall blocking external access
**Solution**: `sudo ufw allow 4000`

### 4. Server not actually running
**Problem**: Process shows as running but port not listening
**Solution**: Restart server with PM2

## 🎯 Step-by-Step Fix

1. **Run diagnostic script**:
   ```bash
   chmod +x test-server-connection.sh
   ./test-server-connection.sh
   ```

2. **Check cloud provider settings**:
   - AWS: Security Groups
   - DigitalOcean: Firewalls
   - GCP: Firewall Rules
   - Vultr: Firewall

3. **Fix server binding**:
   ```bash
   pm2 stop api-server
   pm2 start server.js --name api-server
   ```

4. **Test connection**:
   ```bash
   curl http://103.14.120.163:4000
   ```

## 📞 Support Commands

```bash
# Full system check
./test-server-connection.sh

# Quick restart
pm2 restart api-server

# Check logs
pm2 logs api-server --lines 50

# Test from external machine
curl -v http://103.14.120.163:4000
```
