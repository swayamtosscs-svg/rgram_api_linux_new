#!/bin/bash
# VPS Environment Setup Script for Forget Password

echo "🚀 Setting up VPS environment for Forget Password System..."

# Create .env.local file
cat > .env.local << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rgram

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@rgram.com

# App URL - VPS IP Address
NEXT_PUBLIC_APP_URL=http://103.14.120.163:8081

# Node Environment
NODE_ENV=production
EOF

echo "✅ Environment variables set successfully!"
echo "📧 Email reset links will now use: http://103.14.120.163:8081"
echo ""
echo "🔧 Next steps:"
echo "1. Update EMAIL_USER and EMAIL_PASS with your actual email credentials"
echo "2. Restart your server: npm run dev"
echo "3. Test the forget password API"
echo ""
echo "🧪 Test command:"
echo "curl -X POST http://103.14.120.163:8081/api/auth/forgot-password \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"test@example.com\"}'"
