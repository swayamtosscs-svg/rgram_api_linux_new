# Troubleshooting Guide for DP API

## 🚨 **500 Internal Server Error - How to Fix**

### **Step 1: Test Basic API Functionality**

First, test if the basic API is working:

```bash
# Test the simple endpoint
curl -X GET "http://localhost:3000/api/dp/test"

# Test file upload without authentication
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@/path/to/your/image.jpg"
```

### **Step 2: Check Environment Variables**

Make sure you have these environment variables set in your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**To check if they're set:**
```bash
# Test environment check endpoint
curl -X GET "http://localhost:3000/api/dp/test"
```

### **Step 3: Verify Cloudinary Configuration**

1. **Get your Cloudinary credentials:**
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Copy your Cloud Name, API Key, and API Secret

2. **Test Cloudinary connection:**
   ```bash
   # This should return your Cloudinary info
   curl -X GET "http://localhost:3000/api/dp/test"
   ```

### **Step 4: Test File Upload Step by Step**

**Test 1: Basic file upload (no auth)**
```bash
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@/path/to/your/image.jpg"
```

**Test 2: File upload with username**
```bash
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@/path/to/your/image.jpg" \
  -F "username=john_doe"
```

### **Step 5: Common Issues and Solutions**

#### **Issue 1: "Cloudinary not configured"**
**Solution:** Set environment variables in `.env.local` file

#### **Issue 2: "Invalid file type"**
**Solution:** Make sure your image is JPEG, PNG, or WebP format

#### **Issue 3: "File size too large"**
**Solution:** Ensure image is under 5MB

#### **Issue 4: "Authentication required"**
**Solution:** Use the `/upload-simple` endpoint for testing without auth

### **Step 6: Working cURL Commands**

**For testing (no authentication):**
```bash
# Upload to default test user folder
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@./image1.jpg"

# Upload to specific username folder
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@./image1.jpg" \
  -F "username=john_doe"
```

**For production (with authentication):**
```bash
# Upload with JWT token (current user)
curl -X POST "http://localhost:3000/api/dp/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "dp=@./image1.jpg"

# Upload for specific user by username
curl -X POST "http://localhost:3000/api/dp/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "dp=@./image1.jpg" \
  -F "username=john_doe"
```

### **Step 7: Debug Information**

If you still get errors, check the response for:
- **Error details** - Shows exactly what went wrong
- **Required fields** - Lists missing environment variables
- **File validation** - Shows what was received vs expected

### **Step 8: Environment Setup**

Create a `.env.local` file in your project root:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret

# Optional: Database and JWT
MONGODB_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_jwt_secret
```

### **Step 9: Restart Your Development Server**

After setting environment variables:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### **Step 10: Test Again**

```bash
# Test the working endpoint
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@./image1.jpg"
```

## 🔍 **Still Having Issues?**

1. **Check the console logs** in your terminal for detailed error messages
2. **Verify file path** - make sure `image1.jpg` exists in the current directory
3. **Check file format** - ensure it's a valid image file
4. **Verify environment variables** are loaded correctly

## 📞 **Need Help?**

If you're still getting errors, check:
- Console output for detailed error messages
- Network tab in browser dev tools
- Server logs in your terminal
- Environment variable values

## 🆕 **New Username-Based API**

The API now creates folders using usernames instead of user IDs:

**Before (User ID):** `users/123/profile_pictures/`
**Now (Username):** `users/john_doe/profile_pictures/`

**Benefits:**
- More readable folder structure
- Easier to identify users
- Consistent with your existing file structure
- Better organization in Cloudinary
