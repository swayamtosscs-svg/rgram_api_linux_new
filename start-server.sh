#!/bin/bash
# Server startup script for 103.14.120.163:8081

echo "🚀 Starting RGram API Server..."

# Set environment
export NODE_ENV=production
export PORT=8081

# Install dependencies
npm install

# Start the server
npm start

echo "✅ Server started on port 8081"
