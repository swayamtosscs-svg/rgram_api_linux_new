#!/bin/bash

echo "🔧 Fixing server build issues..."

# Set environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI environment variable is not set"
    echo "Please set it with: export MONGODB_URI='your_mongodb_connection_string'"
    exit 1
fi

echo "📋 Testing MongoDB connection..."
node fix-mongodb-connection.js

if [ $? -eq 0 ]; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ MongoDB connection failed"
    echo "Please fix MongoDB connection before building"
    exit 1
fi

echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building application..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🚀 You can now start the server with: npm start"
else
    echo "❌ Build failed"
    exit 1
fi
