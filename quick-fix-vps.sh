#!/bin/bash
# Quick Fix for VPS API

echo "🚀 Quick fixing VPS API..."

# Copy the local VPS config
cp .env.vps-local .env

# Set environment variables
export NODE_ENV=production
export HOST_ENV=VPS
export PORT=8081
export MONGODB_URI="mongodb://Toss:Toss%40123@localhost:27017/admin"

# Restart the API
echo "🔄 Restarting API..."
npm start

echo "✅ API should now work with local MongoDB on VPS"
