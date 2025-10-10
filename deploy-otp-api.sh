#!/bin/bash

# VPS Deployment Script for OTP-Based Forget Password API
echo "🚀 Deploying OTP-Based Forget Password API to VPS..."

# Check if the API files exist
if [ ! -f "pages/api/auth/forgot-password-otp.ts" ]; then
    echo "❌ Error: forgot-password-otp.ts not found!"
    exit 1
fi

if [ ! -f "pages/api/auth/verify-password-reset-otp.ts" ]; then
    echo "❌ Error: verify-password-reset-otp.ts not found!"
    exit 1
fi

if [ ! -f "pages/api/auth/reset-password-otp.ts" ]; then
    echo "❌ Error: reset-password-otp.ts not found!"
    exit 1
fi

echo "✅ All OTP API files found!"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found!"
    exit 1
fi

echo "✅ Environment configuration found!"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Restart the application
echo "🔄 Restarting application..."
pm2 restart all

if [ $? -eq 0 ]; then
    echo "✅ Application restarted successfully!"
else
    echo "❌ Failed to restart application!"
    exit 1
fi

# Test the API endpoints
echo "🧪 Testing API endpoints..."

# Test OTP Request
echo "📧 Testing OTP Request..."
curl -X POST http://localhost:8081/api/auth/forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "swayam.toss.cs@gmail.com"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Summary:"
echo "- VPS URL: http://103.14.120.163:8081"
echo "- Email: swayam.toss.cs@gmail.com"
echo "- All OTP endpoints deployed"
echo ""
echo "🔧 Test Commands:"
echo "curl -X POST http://103.14.120.163:8081/api/auth/forgot-password-otp \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\": \"swayam.toss.cs@gmail.com\"}'"
echo ""
echo "curl -X POST http://103.14.120.163:8081/api/auth/verify-password-reset-otp \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\": \"swayam.toss.cs@gmail.com\", \"otp\": \"YOUR_OTP\"}'"
echo ""
echo "curl -X POST http://103.14.120.163:8081/api/auth/reset-password-otp \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\": \"swayam.toss.cs@gmail.com\", \"otp\": \"YOUR_OTP\", \"newPassword\": \"newpassword123\"}'"
