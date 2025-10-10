#!/bin/bash

echo "🆓 Setting up Firebase Cloud Messaging - COMPLETELY FREE!"
echo ""

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

# Install Firebase Admin SDK (FREE)
echo "📦 Installing Firebase Admin SDK (FREE)..."
npm install firebase-admin

if [ $? -eq 0 ]; then
    echo "✅ Firebase Admin SDK installed successfully (FREE)"
else
    echo "❌ Failed to install Firebase Admin SDK"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    echo "# Firebase Cloud Messaging - FREE Configuration" > .env.local
    echo "FCM_PROJECT_ID=your-project-id" >> .env.local
    echo "FCM_PRIVATE_KEY_ID=your-private-key-id" >> .env.local
    echo "FCM_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\nYour-Private-Key-Here\\n-----END PRIVATE KEY-----\\n\"" >> .env.local
    echo "FCM_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com" >> .env.local
    echo "FCM_CLIENT_ID=your-client-id" >> .env.local
    echo "✅ .env.local file created"
    echo "⚠️  Please update .env.local with your FREE Firebase credentials"
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "🎉 Firebase Cloud Messaging setup completed - COMPLETELY FREE!"
echo ""
echo "💰 COST BREAKDOWN:"
echo "   📱 Push Notifications: $0.00 (UNLIMITED)"
echo "   🔑 Service Account: $0.00 (FREE)"
echo "   📊 Analytics: $0.00 (FREE)"
echo "   🌐 Cross-platform: $0.00 (FREE)"
echo "   📈 Topic Messaging: $0.00 (FREE)"
echo "   📦 Firebase Admin SDK: $0.00 (FREE)"
echo ""
echo "   💵 TOTAL COST: $0.00"
echo ""
echo "📋 Next Steps (ALL FREE):"
echo "1. 🌐 Go to https://console.firebase.google.com/"
echo "2. 🆕 Create a new project (FREE)"
echo "3. 🔧 Enable Cloud Messaging (FREE)"
echo "4. 🔑 Generate service account key (FREE)"
echo "5. 📝 Update .env.local with your credentials"
echo "6. 🧪 Test: node test-push-notifications.js"
echo ""
echo "📚 FREE Documentation:"
echo "- FIREBASE_FREE_SETUP_GUIDE.md"
echo "- PUSH_NOTIFICATIONS_API_README.md"
echo "- FCM_PUSH_NOTIFICATIONS_ENV_TEMPLATE.txt"
echo ""
echo "🚀 Start sending push notifications - 100% FREE!"
echo ""
echo "💡 Pro Tips:"
echo "- FCM has NO daily/monthly limits"
echo "- NO credit card required"
echo "- NO hidden costs"
echo "- Works on Android, iOS, and Web"
echo ""
echo "Happy coding! 🎉"
