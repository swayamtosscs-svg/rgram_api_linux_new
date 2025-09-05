#!/bin/bash

echo "🔧 Fixing server upload issues..."

# 1. Check if we're on the server
if [ ! -f "package.json" ]; then
    echo "❌ Not in project directory. Please run from project root."
    exit 1
fi

# 2. Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/assets
mkdir -p public/assets/images
mkdir -p public/assets/videos
mkdir -p public/assets/audio
mkdir -p public/assets/documents
mkdir -p public/assets/general

# 3. Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 public/assets
chown -R www-data:www-data public/assets 2>/dev/null || echo "⚠️  Could not set ownership (run as root if needed)"

# 4. Check .env.local
echo "🔍 Checking environment..."
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cat > .env.local << EOF
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority
JWT_SECRET=rgram_jwt_secret_key_2024_secure_random_string_12345
NODE_ENV=production
PORT=3000
EOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local exists"
fi

# 5. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 6. Build the project
echo "🔨 Building project..."
npm run build

# 7. Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart all

# 8. Check PM2 status
echo "📊 PM2 Status:"
pm2 status

# 9. Test upload endpoint
echo "🧪 Testing upload endpoint..."
curl -X POST "http://localhost:3000/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/dev/null" 2>/dev/null || echo "⚠️  Upload test failed (this is expected with empty file)"

echo ""
echo "✅ Server upload fix complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check PM2 logs: pm2 logs"
echo "2. Test with real file upload"
echo "3. Check MongoDB Atlas IP whitelist"
