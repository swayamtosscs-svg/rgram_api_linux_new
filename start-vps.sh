#!/bin/bash
# VPS Startup Script

echo "🚀 Starting RGram API on VPS..."

# Set environment
export NODE_ENV=production
export HOST_ENV=VPS
export PORT=8081

# Load environment variables
source .env.production

# Install dependencies
npm install --production

# Start the server
npm start

echo "✅ Server started on port 8081"
