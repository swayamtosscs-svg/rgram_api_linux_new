# 🚀 Local MongoDB Migration Guide

यह guide आपको MongoDB Atlas से local MongoDB में data migrate करने में मदद करेगा और सभी media files को organized folder structure में save करेगा।

## 📋 Requirements

- Node.js (v16 या higher)
- MongoDB (local installation)
- Internet connection (media files download के लिए)

## 🛠️ Setup Process

### Step 1: Environment Setup

```bash
# Setup script run करें
node setup-local-mongodb.js
```

यह script:
- `.env.local` file create करेगा
- Required dependencies check करेगा
- Directory structure create करेगा
- `.gitignore` update करेगा

### Step 2: MongoDB Local Installation

#### Windows:
```bash
# MongoDB download करें और install करें
# फिर MongoDB service start करें
net start MongoDB
```

#### macOS:
```bash
# Homebrew के साथ
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu):
```bash
# MongoDB install करें
sudo apt-get install mongodb
# Service start करें
sudo systemctl start mongodb
```

### Step 3: Environment Configuration

`.env.local` file को edit करें:

```env
# Local MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/api_rgram

# Atlas MongoDB (migration source)
ATLAS_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/api_rgram

# Other configurations...
```

## 🔄 Migration Process

### Complete Migration

```bash
# Complete migration run करें
node migrate-to-local-mongodb.js
```

यह script:
1. **Data Migration**: Atlas से local MongoDB में सभी data copy करेगा
2. **Media Download**: सभी images, videos, thumbnails download करेगा
3. **File Organization**: Files को organized folder structure में save करेगा
4. **Path Updates**: Database में local file paths update करेगा

### Folder Structure

Migration के बाद यह structure create होगा:

```
public/
└── assets/
    ├── images/
    │   ├── user_2024-01-15T10-30-00-123Z_abc12345.jpg
    │   ├── baba_2024-01-15T10-30-00-123Z_def67890.jpg
    │   └── ...
    ├── videos/
    │   ├── baba_2024-01-15T10-30-00-123Z_ghi11111.mp4
    │   └── ...
    ├── thumbnails/
    │   ├── video_2024-01-15T10-30-00-123Z_jkl22222.jpg
    │   └── ...
    └── users/
        ├── user123/
        │   ├── avatar.jpg
        │   └── posts/
        └── ...
```

### File Naming Convention

Files unique IDs के साथ save होते हैं:
- Format: `{userId}_{timestamp}_{uniqueId}.{extension}`
- Example: `user123_2024-01-15T10-30-00-123Z_abc12345.jpg`

## 🗑️ Delete Operations

### User Delete
```bash
# User और उसके सभी data delete करें
node delete-media-and-data.js user <userId>
```

### Baba Delete
```bash
# Baba और उसके सभी posts, videos, stories delete करें
node delete-media-and-data.js baba <babaId>
```

### Post Delete
```bash
# Regular post delete करें
node delete-media-and-data.js post <postId>

# Baba post delete करें
node delete-media-and-data.js babapost <postId>
```

### Video Delete
```bash
# Video और उसका thumbnail delete करें
node delete-media-and-data.js video <videoId>
```

### Story Delete
```bash
# Story और उसका media delete करें
node delete-media-and-data.js story <storyId>
```

### Cleanup Orphaned Files
```bash
# Database में reference नहीं है ऐसे files delete करें
node delete-media-and-data.js cleanup
```

## 📊 Migration Features

### ✅ What Gets Migrated

1. **User Data**: सभी users, profiles, settings
2. **Baba Data**: सभी babas, spiritual information
3. **Posts**: Regular posts और baba posts
4. **Videos**: सभी videos with metadata
5. **Stories**: सभी stories with media
6. **Media Files**: Images, videos, thumbnails
7. **Relationships**: Followers, likes, comments counts

### 🔄 Data Consistency

- **File Paths**: Database में local file paths update होते हैं
- **URLs**: Public URLs local server के लिए update होते हैं
- **Timestamps**: Original creation dates preserve होते हैं
- **Unique IDs**: सभी files unique IDs के साथ save होते हैं

### 📁 Media Organization

- **User Media**: `public/assets/users/{userId}/`
- **Baba Media**: `public/assets/babas/{babaId}/`
- **Posts**: `public/assets/posts/`
- **Videos**: `public/assets/videos/`
- **Stories**: `public/assets/stories/`
- **Thumbnails**: `public/assets/thumbnails/`

## 🚨 Important Notes

### Before Migration

1. **Backup**: Atlas database का backup लें
2. **Space**: Local storage में sufficient space हो
3. **Network**: Stable internet connection हो
4. **MongoDB**: Local MongoDB running हो

### During Migration

1. **Don't Interrupt**: Migration process को interrupt न करें
2. **Monitor Logs**: Console logs monitor करें
3. **Check Space**: Disk space check करते रहें

### After Migration

1. **Verify Data**: Data integrity check करें
2. **Test APIs**: सभी APIs test करें
3. **Update Configs**: Application configs update करें

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# MongoDB service check करें
# Windows: net start MongoDB
# Linux: sudo systemctl status mongodb
# macOS: brew services list | grep mongodb
```

#### Permission Denied
```bash
# Directory permissions check करें
chmod -R 755 public/assets/
```

#### Download Failed
```bash
# Network connection check करें
# URLs manually test करें
# Firewall settings check करें
```

#### Out of Space
```bash
# Disk space check करें
df -h
# Unnecessary files delete करें
```

### Log Analysis

Migration logs में यह information मिलती है:
- ✅ Successfully processed files
- ⚠️ Warnings (non-critical issues)
- ❌ Errors (critical issues)
- 📊 Summary statistics

## 📈 Performance Tips

### For Large Datasets

1. **Batch Processing**: Script automatically batches large datasets
2. **Memory Management**: Large files को process करते समय memory monitor करें
3. **Network Optimization**: Download timeout adjust करें
4. **Storage**: SSD use करें better performance के लिए

### Optimization Settings

```javascript
// migrate-to-local-mongodb.js में
const CONFIG = {
  BATCH_SIZE: 10,        // Increase for faster processing
  DOWNLOAD_TIMEOUT: 30000, // Increase for slow connections
  // ...
};
```

## 🔐 Security Considerations

### File Permissions
```bash
# Secure file permissions
chmod 644 public/assets/**/*.jpg
chmod 644 public/assets/**/*.mp4
```

### Environment Variables
- `.env.local` को `.gitignore` में add करें
- Sensitive data को environment variables में store करें
- Production में proper access controls implement करें

## 📞 Support

अगर कोई issues आते हैं:

1. **Check Logs**: Console logs में error messages देखें
2. **Verify Setup**: MongoDB और Node.js versions check करें
3. **Test Connections**: Database connections manually test करें
4. **Check Permissions**: File और directory permissions verify करें

## 🎯 Next Steps

Migration complete होने के बाद:

1. **Update Application**: Application को local MongoDB use करने के लिए configure करें
2. **Test Functionality**: सभी features test करें
3. **Performance Monitoring**: Local setup की performance monitor करें
4. **Backup Strategy**: Local database के लिए backup strategy implement करें

---

**Happy Migration! 🚀**

यह setup आपको completely local MongoDB environment provide करेगा जहाँ आप freely data manage कर सकते हैं और सभी media files organized structure में store होंगे।
