# Privacy Settings API - Instagram-like Social Media Platform

A comprehensive API system for managing user privacy settings in a social media platform, built with Next.js, TypeScript, and MongoDB.

## 🚀 **Features**

### **Privacy Management APIs**
- **Toggle Privacy**: Automatically switch between public/private
- **Set Specific Privacy**: Force public or private status
- **User ID Based**: Change any user's privacy using their ID
- **Authentication Required**: Secure JWT-based authentication
- **Real-time Updates**: Instant privacy status changes

### **Core APIs**
- User authentication (login/signup)
- Profile management
- Media upload and management
- Story and post management
- Follow/unfollow system
- Donation system
- Admin panel

## 📁 **Project Structure**

```
api_rgram1/
├── pages/api/           # API endpoints
│   ├── user/           # User management APIs
│   │   ├── privacy-settings.ts      # Comprehensive privacy management
│   │   ├── toggle-privacy.ts        # Simple privacy toggle
│   │   ├── toggle-privacy-by-id.ts  # Toggle privacy by user ID
│   │   └── set-privacy-by-id.ts     # Set privacy by user ID
│   ├── auth/           # Authentication APIs
│   ├── admin/          # Admin panel APIs
│   └── ...             # Other API endpoints
├── lib/                # Core libraries
│   ├── models/         # Database models
│   ├── middleware/     # Authentication middleware
│   └── utils/          # Utility functions
├── public/             # Static files
└── ...                 # Configuration files
```

## 🔐 **Privacy APIs**

### **1. Toggle Privacy (Simple)**
```bash
PUT /api/user/toggle-privacy
Authorization: Bearer <jwt-token>
```

### **2. Privacy Settings (Comprehensive)**
```bash
GET /api/user/privacy-settings          # Get current settings
PUT /api/user/privacy-settings          # Update settings
Authorization: Bearer <jwt-token>
Body: {"action": "toggle"} or {"action": "set", "isPrivate": true/false}
```

### **3. Toggle Privacy by User ID**
```bash
PUT /api/user/toggle-privacy-by-id
Authorization: Bearer <jwt-token>
Body: {"userId": "user_id_here"}
```

### **4. Set Privacy by User ID**
```bash
PUT /api/user/set-privacy-by-id
Authorization: Bearer <jwt-token>
Body: {"userId": "user_id_here", "isPrivate": true/false}
```

## 🛠️ **Setup Instructions**

### **Prerequisites**
- Node.js 16+ 
- MongoDB
- npm or yarn

### **Installation**
```bash
# Clone the repository
git clone <your-repo-url>
cd api_rgram1

# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **Environment Variables**
Create a `.env` file based on `env-template.txt`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
# Add other required environment variables
```

## 🧪 **Testing the APIs**

### **Get JWT Token**
```bash
# Login to get token
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email", "password": "your_password"}'
```

### **Test Privacy APIs**
```bash
# Toggle privacy
curl -X PUT "http://localhost:3000/api/user/toggle-privacy" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Set specific privacy
curl -X PUT "http://localhost:3000/api/user/set-privacy-by-id" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id", "isPrivate": false}'
```

## 📚 **Documentation**

- **Privacy API**: `PRIVACY_API_README.md`
- **Media Upload**: `MEDIA_UPLOAD_API_README.md`
- **DP API**: `DP_API_README.md`
- **Story API**: `STORY_MEDIA_API_README.md`

## 🔒 **Security Features**

- JWT-based authentication
- User isolation (users can only modify their own data)
- Input validation and sanitization
- Rate limiting support
- Secure password hashing with bcrypt

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

### **Other Platforms**
- Heroku
- DigitalOcean
- AWS
- Google Cloud

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the API examples

## 🔄 **Changelog**

### **Latest Updates**
- ✅ Added comprehensive privacy management APIs
- ✅ User ID based privacy controls
- ✅ Enhanced security and validation
- ✅ Improved error handling
- ✅ Added Postman collections for testing

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
