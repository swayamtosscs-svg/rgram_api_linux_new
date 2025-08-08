# Instagram-like API Setup Instructions

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with your credentials:

```env
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9vQNPH6kL1jZ2JVsla8czb0WiEngqT7tUuGoYpxwSKyeXhC3A4mMfRBrIDdO5F
EMAIL_USER=swayam.toss.cs@gmail.com
EMAIL_PASS=ozncdubcwsunrkbz
EMAIL_FROM=swayam.toss.cs@gmail.com
PORT=5001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The API will be available at: `http://localhost:5001/api`

### 4. Test the API

```bash
node test-api.js
```

---

## 📁 Project Structure

```
src/
├── api/                    # API endpoints
│   ├── auth/              # Authentication
│   │   ├── login.ts       # User login
│   │   ├── signup.ts      # User signup
│   │   └── otp/           # OTP verification
│   ├── posts/             # Posts management
│   │   ├── index.ts       # CRUD operations
│   │   ├── [id].ts        # Single post operations
│   │   └── feed.ts        # User feed
│   ├── user/              # User management
│   │   ├── profile.ts     # User profile
│   │   └── follow.ts      # Follow/unfollow
│   ├── stories/           # Stories
│   │   └── index.ts       # Story operations
│   ├── search/            # Search functionality
│   │   └── index.ts       # Search users/posts
│   └── notifications/     # Notifications
│       └── index.ts       # Notification management
├── lib/                   # Core libraries
│   ├── database.ts        # MongoDB connection
│   ├── middleware/        # Middleware functions
│   │   └── auth.ts        # JWT authentication
│   ├── models/            # Database models
│   │   ├── User.ts        # User model
│   │   ├── Post.ts        # Post model
│   │   ├── Story.ts       # Story model
│   │   ├── Follow.ts      # Follow model
│   │   ├── Notification.ts # Notification model
│   │   └── OTP.ts         # OTP model
│   └── utils/             # Utility functions
│       ├── email.ts       # Email utilities
│       └── validation.ts  # Input validation
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

---

## 🔧 API Features

### ✅ Core Features
- **User Authentication**: Signup, login, JWT tokens
- **User Profiles**: Create, read, update profiles
- **Posts**: Create, read, update, delete posts
- **Likes & Comments**: Like/unlike posts, add/remove comments
- **Follow System**: Follow/unfollow users
- **User Feed**: Get posts from followed users
- **Stories**: Create and view stories (24-hour expiry)
- **Search**: Search users and posts
- **Notifications**: Real-time notifications
- **Email Support**: Welcome emails, OTP verification

### ✅ Technical Features
- **MongoDB Integration**: Robust database with indexes
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive validation
- **Error Handling**: Consistent error responses
- **Pagination**: Efficient data loading
- **TypeScript**: Full type safety
- **RESTful API**: Standard REST endpoints

---

## 🧪 Testing

### Manual Testing with Postman

1. **Signup**: `POST /api/auth/signup`
2. **Login**: `POST /api/auth/login`
3. **Create Post**: `POST /api/posts`
4. **Get Feed**: `GET /api/posts/feed`
5. **Search Users**: `GET /api/search?q=john&type=users`

### Automated Testing

Run the test script:
```bash
node test-api.js
```

---

## 📊 Database Models

### User Model
- Email, password, username, fullName
- Profile: avatar, bio, website, location
- Stats: followersCount, followingCount, postsCount
- Settings: isPrivate, isEmailVerified, isActive

### Post Model
- Content, images, type (post/reel)
- Engagement: likes, comments, shares, saves
- Metadata: author, timestamps, isActive

### Story Model
- Media (image/video), caption, mentions, hashtags
- Expiry: 24-hour automatic expiration
- Views: track story views

### Follow Model
- Follower and following relationships
- Unique constraints to prevent duplicates

### Notification Model
- Types: follow, like, comment, mention, story_view
- Read status tracking

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Input Validation**: Prevent injection attacks
- **Rate Limiting**: Ready for implementation
- **CORS**: Cross-origin resource sharing
- **Environment Variables**: Secure credential management

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production email settings
- Set secure JWT secret

---

## 📝 API Documentation

See `API_DOCUMENTATION.md` for complete endpoint documentation.

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB URI in `.env.local`
   - Ensure network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

3. **Email Not Sending**
   - Verify email credentials
   - Check email service settings

4. **Port Already in Use**
   - Change PORT in `.env.local`
   - Kill existing processes

---

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Test with the provided test script
4. Verify environment variables

---

## 🎯 Next Steps

1. **Frontend Integration**: Connect to React/Vue/Angular app
2. **File Upload**: Implement image/video upload
3. **Real-time Features**: Add WebSocket support
4. **Advanced Search**: Implement filters and sorting
5. **Analytics**: Add user engagement tracking
6. **Caching**: Implement Redis for performance
7. **Rate Limiting**: Add API rate limiting
8. **Testing**: Add comprehensive unit tests
