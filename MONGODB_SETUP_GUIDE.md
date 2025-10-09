# MongoDB Setup Guide for R-GRAM API

## The Problem
You're getting a 500 Internal Server Error because MongoDB is not running on your system. The error "querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net" indicates the API can't connect to the database.

## Solution Options

### Option 1: Install MongoDB Community Edition (Recommended)

#### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select "Windows" and "MSI" package
3. Download and run the installer

#### Step 2: Install MongoDB
1. Run the downloaded MSI file
2. Choose "Complete" installation
3. Install MongoDB Compass (optional but helpful)
4. Keep default settings

#### Step 3: Start MongoDB Service
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. Or use Services.msc and start "MongoDB" service

#### Step 4: Create Database and User
Run this command in Command Prompt:
```bash
mongosh
```
Then in the MongoDB shell:
```javascript
use admin
db.createUser({
  user: "swayamUser",
  pwd: "swayamPass",
  roles: [
    { role: "readWrite", db: "swayam" },
    { role: "dbAdmin", db: "swayam" }
  ]
})
use swayam
db.test.insertOne({message: "Database setup complete"})
```

### Option 2: Use MongoDB Atlas (Cloud Database)

#### Step 1: Create Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Create a free account
3. Create a free cluster

#### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password

#### Step 3: Update .env.local
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/swayam
```

### Option 3: Use Docker (If you have Docker installed)

```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=swayamUser -e MONGO_INITDB_ROOT_PASSWORD=swayamPass mongo:latest
```

## Quick Test

After setting up MongoDB, test the connection:

```bash
node test-follow-request-reject.js
```

## Expected Output
If MongoDB is working correctly, you should see:
```
✅ MongoDB connected successfully
✅ Models loaded successfully
👥 Total users: X
🤝 Total follow relationships: X
```

## Fix the API Error

Once MongoDB is running, your follow request reject API should work properly. The 500 error will be resolved because the API can now connect to the database.

## Troubleshooting

### If MongoDB service won't start:
1. Check if port 27017 is available: `netstat -an | findstr 27017`
2. Run as Administrator
3. Check Windows Event Viewer for errors

### If connection still fails:
1. Verify .env.local has correct MONGODB_URI
2. Check if MongoDB is listening on correct port
3. Ensure firewall allows MongoDB connections

## Next Steps

1. Choose one of the options above
2. Set up MongoDB
3. Test the connection
4. Try your API request again

The follow request reject API should work once MongoDB is properly configured.
