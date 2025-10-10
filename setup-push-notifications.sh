#!/bin/bash

echo "🚀 Setting up Push Notifications API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed"

# Install Firebase Admin SDK
echo "📦 Installing Firebase Admin SDK..."
npm install firebase-admin

if [ $? -eq 0 ]; then
    echo "✅ Firebase Admin SDK installed successfully"
else
    echo "❌ Failed to install Firebase Admin SDK"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp FCM_PUSH_NOTIFICATIONS_ENV_TEMPLATE.txt .env.local
    echo "✅ .env.local file created"
    echo "⚠️  Please update .env.local with your Firebase credentials"
else
    echo "✅ .env.local file already exists"
fi

# Create lib/services directory if it doesn't exist
if [ ! -d "lib/services" ]; then
    echo "📁 Creating lib/services directory..."
    mkdir -p lib/services
    echo "✅ lib/services directory created"
else
    echo "✅ lib/services directory already exists"
fi

# Create lib/utils directory if it doesn't exist
if [ ! -d "lib/utils" ]; then
    echo "📁 Creating lib/utils directory..."
    mkdir -p lib/utils
    echo "✅ lib/utils directory created"
else
    echo "✅ lib/utils directory already exists"
fi

echo ""
echo "🎉 Push Notifications API setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up Firebase project at https://console.firebase.google.com/"
echo "2. Generate service account key from Google Cloud Console"
echo "3. Update .env.local with your Firebase credentials"
echo "4. Test the API using the provided Postman collection"
echo "5. Run test script: node test-push-notifications.js"
echo ""
echo "📚 Documentation:"
echo "- PUSH_NOTIFICATIONS_API_README.md"
echo "- FCM_PUSH_NOTIFICATIONS_ENV_TEMPLATE.txt"
echo "- push-notifications-postman-collection.json"
echo ""
echo "🔧 API Endpoints:"
echo "- POST /api/notifications/register-fcm-token"
echo "- POST /api/notifications/send-push"
echo "- POST /api/notifications/create-with-push"
echo "- PUT /api/notifications/settings"
echo "- GET /api/notifications/list"
echo ""
echo "Happy coding! 🚀"
