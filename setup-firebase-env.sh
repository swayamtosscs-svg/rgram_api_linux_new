#!/bin/bash

echo "🔥 Setting up Firebase Cloud Messaging Environment Variables..."
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "📝 .env.local file exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create or update .env.local with Firebase credentials
echo "📝 Adding Firebase credentials to .env.local..."

# Add Firebase credentials
cat >> .env.local << 'EOF'

# Firebase Cloud Messaging - FREE Configuration
FCM_PROJECT_ID=rgram-notifiaction
FCM_PRIVATE_KEY_ID=860d1731d40a5fa3d9279e6e9e9ab94240850f09
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCQbGRWFDkq5BDF\n4RvQbWLmwwg4S3AnKqPh3b4lc8Ww4y0Fe3Gvpl6KCgTKSFlsYpt3va8a+/G50EUE\noCbnkZuMbJwIRs35TebCiqCKPmOisygNW+EZdikzS72r6L+qv3ulsgIGLzOW0/vO\nTWffXSi73C4tRLxT+yGTidaqxYxogJLHh1umf3P+t92zpDU+dN8AmafCNJJf2XHP\nNN4AtegABZcxYXiuGXnn1bO0W87P/Sr8WgLxGd2lRY/pUGsqk/b2ho9r/xDYkoJr\nNTKUZU6S8rOj8sJIVUUjGpB9acC/Hsd9TlcUvErVOKm+rezTPgYEVNTubdFUVIId\n/FZSit67AgMBAAECggEAOdTdnMZ+Wdl3ifVpUN3sg6FHcltq7pQZicFkedTRLdLa\nXV6gGIkTRE1cu6+a91bJEHrJWpHWquRmLsL+sS3STrnTBVFs+06hf/dI7/KprSX2\nfNr02WBCgULsEaGi1nnUxnXwb4+JJfV+2I6QcJX6ULeLWh8zFqHyQQUqC7oNTm7L\ntl0NBpTOyuGmxWWOWGnWWtfsTvAR9HpxRK4RSCw9HAE3DC8U09tjv6pC+/jEeHOW\n0gjYBQXP7y4ceT1l3dIDdaVb1nhqLZF/nYV1R/u1gCqz6dtfVXBUeSQAxkwumDxQ\niadO4Fe/DwXlfu+sWWO0WU+viIQryLKnK6kYwOrncQKBgQDIklMZMrbLsk34Jzid\n42obkiwcG59U9Hndosfg9zErHdkx2JTIvDIjsayftftAWne9FTJlf6jzqBbeQH5T\nlnVnsgBo7trUUQSZzdQ35bbPhcdRiFhCWh2z0tDGkTGg1lwQiFNOn5h8R8bfuUvd\noLOTem7LP5+mQa/k8CeuCMSz6QKBgQC4Vcw/h4UPvkx6oikziv7p0gEKE57XAZsg\nLQR70gHwtZcJbnlPs/AZv+kUPrk0mBKhST6O5lYvj8UjgaVazsv4onJfTbNa75qo\nGFlzR2VeRCMFvgBtfFc2sevUYIw+L0LAQ3X/ye8RR2J4ALVxMgN15OwHZfBCTPu6\nLXKYpBvLAwKBgQCe8Y4WtuCzFW7CS1qLjG9GwBRiheVC7qYwZFIfTeTR9UpsPOTT\nGohlTuSsgAtGmSqwVb7lPkBGLptIrzUsylvpu96lSTty621I8RrO3SR82df1HaZL\nlpxZJ6Q451C704OLumzCLqkpO7w3COE9FZ+ZLHnmaVn756wbMdFQEjTHGQKBgQCP\nQ6d9jJ8e8EDSYuvwskuSgHPsV/lwkz/0TuiYL0zwvsFHREQmbOvjp2LIKEObG8IG\n9j0XpO9BAdUu1lkkbWrbr62CYopN18D0ehAzZz7id8RcdyIv9Z521Os74Vm+Ds8r\nTIMOLOyQGlHugGaENmG4JBZJXbHQZbKTLTVOauVq7wKBgEjYfxHDiLEKUdO0ty6Z\ndZWyDRk9B7VC0ADMRAGhAL4heIcsgRicUxh4mjBRPsKYImE/fVZ2ExaNShPQ6ElZ\nRNS/+lbKKR3Lz/V5fmGZIHFa3VbZI19q+GJFHNwyjqqx80UMwG/w8cpAJ4uwnubn\ns6m8CeoIm/qn0tfPo/zSxB6H\n-----END PRIVATE KEY-----\n"
FCM_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rgram-notifiaction.iam.gserviceaccount.com
FCM_CLIENT_ID=106426579807094702598
EOF

echo "✅ Firebase credentials added to .env.local"
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 What's been added:"
echo "   🔥 FCM_PROJECT_ID=rgram-notifiaction"
echo "   🔑 FCM_PRIVATE_KEY_ID=860d1731d40a5fa3d9279e6e9e9ab94240850f09"
echo "   📧 FCM_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rgram-notifiaction.iam.gserviceaccount.com"
echo "   🆔 FCM_CLIENT_ID=106426579807094702598"
echo ""
echo "🚀 Next Steps:"
echo "1. Test your push notification APIs"
echo "2. Use the Postman collection for testing"
echo "3. Start sending real push notifications!"
echo ""
echo "💰 Cost: $0.00 (Completely FREE!)"
echo ""
echo "Happy coding! 🎉"
