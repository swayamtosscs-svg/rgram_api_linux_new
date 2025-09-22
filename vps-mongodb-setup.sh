#!/bin/bash
# VPS MongoDB Setup Script

echo "🔧 Setting up MongoDB on VPS..."

# 1. Install MongoDB if not installed
echo "📦 Installing MongoDB..."
sudo apt update
sudo apt install -y mongodb

# 2. Start MongoDB service
echo "🚀 Starting MongoDB service..."
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 3. Configure MongoDB to accept external connections
echo "⚙️ Configuring MongoDB..."
sudo cp /etc/mongodb.conf /etc/mongodb.conf.backup

# Update MongoDB configuration
sudo tee /etc/mongodb.conf > /dev/null <<EOF
# mongodb.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongodb.log

net:
  port: 27017
  bindIp: 0.0.0.0  # Allow connections from all IPs

processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongodb.pid

security:
  authorization: enabled
EOF

# 4. Restart MongoDB
echo "🔄 Restarting MongoDB..."
sudo systemctl restart mongodb

# 5. Create MongoDB user
echo "👤 Creating MongoDB user..."
mongosh --eval "
use admin
db.createUser({
  user: 'Toss',
  pwd: 'Toss@123',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' },
    { role: 'dbAdminAnyDatabase', db: 'admin' }
  ]
})
"

# 6. Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 27017/tcp
sudo ufw allow 8081/tcp

# 7. Test connection
echo "🧪 Testing MongoDB connection..."
mongosh "mongodb://Toss:Toss%40123@localhost:27017/admin" --eval "db.runCommand({ping: 1})"

echo "✅ MongoDB setup complete!"
echo "🔗 Connection string: mongodb://Toss:Toss%40123@103.14.120.163:27017/admin"
