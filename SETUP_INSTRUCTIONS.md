# 🚀 Story Media API Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (running locally or cloud instance)
3. **Cloudinary Account** (for media storage)

## Step 1: Install Dependencies

```bash
cd api_rgram1
npm install
```

## Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the template
cp env-template.txt .env.local
```

Edit `.env.local` with your actual credentials:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/apigram
# OR for cloud MongoDB:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apigram

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Start MongoDB

### Local MongoDB:
```bash
# Start MongoDB service
mongod
```

### Or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
ready - started server on 0.0.0.0:3000
```

## Step 5: Test the API

### Option 1: Use the simple test script
```bash
node test-story-simple.js
```

### Option 2: Use Postman
1. Import `story-media-api-postman-collection.json`
2. Update the `user_id` variable with a real user ID
3. Test the endpoints

### Option 3: Use cURL
```bash
# Test retrieve endpoint
curl "http://localhost:3000/api/story/retrieve?userId=YOUR_USER_ID&page=1&limit=5"
```

## Step 6: Create a Test User

If you don't have a user in your database, you'll need to create one first. You can:

1. Use your existing user creation API
2. Or manually insert a user document in MongoDB

## Troubleshooting

### ❌ Connection Refused (ECONNREFUSED)
- **Solution**: Make sure `npm run dev` is running
- **Check**: Server should be listening on port 3000

### ❌ MongoDB Connection Error
- **Solution**: Ensure MongoDB is running
- **Check**: `mongod` process or Docker container

### ❌ Cloudinary Configuration Error
- **Solution**: Verify your Cloudinary credentials in `.env.local`
- **Check**: Cloudinary dashboard for correct values

### ❌ User Not Found
- **Solution**: Use a valid user ID from your database
- **Check**: MongoDB for existing users

### ❌ Import Path Errors
- **Solution**: The `@/*` path mapping is already configured in `tsconfig.json`
- **Check**: All imports use `@/lib/...` format

## API Endpoints Available

1. **POST** `/api/story/upload` - Upload story media
2. **GET** `/api/story/retrieve` - Retrieve stories
3. **DELETE** `/api/story/delete` - Delete story
4. **POST** `/api/story/delete` - Bulk delete stories

## Testing with Real Data

1. **Upload a story** using Postman with a real image/video file
2. **Retrieve stories** using the returned story ID
3. **Delete the story** to clean up

## Support

If you still have issues:
1. Check the console output for error messages
2. Verify all environment variables are set
3. Ensure MongoDB and Cloudinary are accessible
4. Check that all required models exist in your database
