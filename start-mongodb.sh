#!/bin/bash
# MongoDB Startup Script

echo "🚀 Starting MongoDB..."

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "📡 Starting MongoDB..."
    mongod --dbpath ./data/db --logpath ./data/mongodb.log --fork
    echo "✅ MongoDB started"
fi

echo "🔍 Testing connection..."
mongosh --eval "db.runCommand('ping')" api_rgram

echo "🎉 MongoDB is ready!"
