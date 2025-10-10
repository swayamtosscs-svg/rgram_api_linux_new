const fs = require('fs');

console.log('🔧 Fixing Firebase Environment Variables...\n');

// Read current .env.local
const envPath = '.env.local';
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📝 Current .env.local content read');

// Fix FCM_PRIVATE_KEY formatting
const fixedPrivateKey = '"-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCQbGRWFDkq5BDF\\n4RvQbWLmwwg4S3AnKqPh3b4lc8Ww4y0Fe3Gvpl6KCgTKSFlsYpt3va8a+/G50EUE\\noCbnkZuMbJwIRs35TebCiqCKPmOisygNW+EZdikzS72r6L+qv3ulsgIGLzOW0/vO\\nTWffXSi73C4tRLxT+yGTidaqxYxogJLHh1umf3P+t92zpDU+dN8AmafCNJJf2XHP\\nNN4AtegABZcxYXiuGXnn1bO0W87P/Sr8WgLxGd2lRY/pUGsqk/b2ho9r/xDYkoJr\\nNTKUZU6S8rOj8sJIVUUjGpB9acC/Hsd9TlcUvErVOKm+rezTPgYEVNTubdFUVIId\\n/FZSit67AgMBAAECggEAOdTdnMZ+Wdl3ifVpUN3sg6FHcltq7pQZicFkedTRLdLa\\nXV6gGIkTRE1cu6+a91bJEHrJWpHWquRmLsL+sS3STrnTBVFs+06hf/dI7/KprSX2\\nfNr02WBCgULsEaGi1nnUxnXwb4+JJfV+2I6QcJX6ULeLWh8zFqHyQQUqC7oNTm7L\\ntl0NBpTOyuGmxWWOWGnWWtfsTvAR9HpxRK4RSCw9HAE3DC8U09tjv6pC+/jEeHOW\\n0gjYBQXP7y4ceT1l3dIDdaVb1nhqLZF/nYV1R/u1gCqz6dtfVXBUeSQAxkwumDxQ\\niadO4Fe/DwXlfu+sWWO0WU+viIQryLKnK6kYwOrncQKBgQDIklMZMrbLsk34Jzid\\n42obkiwcG59U9Hndosfg9zErHdkx2JTIvDIjsayftftAWne9FTJlf6jzqBbeQH5T\\nlnVnsgBo7trUUQSZzdQ35bbPhcdRiFhCWh2z0tDGkTGg1lwQiFNOn5h8R8bfuUvd\\noLOTem7LP5+mQa/k8CeuCMSz6QKBgQC4Vcw/h4UPvkx6oikziv7p0gEKE57XAZsg\\nLQR70gHwtZcJbnlPs/AZv+kUPrk0mBKhST6O5lYvj8UjgaVazsv4onJfTbNa75qo\\nGFlzR2VeRCMFvgBtfFc2sevUYIw+L0LAQ3X/ye8RR2J4ALVxMgN15OwHZfBCTPu6\\nLXKYpBvLAwKBgQCe8Y4WtuCzFW7CS1qLjG9GwBRiheVC7qYwZFIfTeTR9UpsPOTT\\nGohlTuSsgAtGmSqwVb7lPkBGLptIrzUsylvpu96lSTty621I8RrO3SR82df1HaZL\\nlpxZJ6Q451C704OLumzCLqkpO7w3COE9FZ+ZLHnmaVn756wbMdFQEjTHGQKBgQCP\\nQ6d9jJ8e8EDSYuvwskuSgHPsV/lwkz/0TuiYL0zwvsFHREQmbOvjp2LIKEObG8IG\\n9j0XpO9BAdUu1lkkbWrbr62CYopN18D0ehAzZz7id8RcdyIv9Z521Os74Vm+Ds8r\\nTIMOLOyQGlHugGaENmG4JBZJXbHQZbKTLTVOauVq7wKBgEjYfxHDiLEKUdO0ty6Z\\ndZWyDRk9B7VC0ADMRAGhAL4heIcsgRicUxh4mjBRPsKYImE/fVZ2ExaNShPQ6ElZ\\nRNS/+lbKKR3Lz/V5fmGZIHFa3VbZI19q+GJFHNwyjqqx80UMwG/w8cpAJ4uwnubn\\ns6m8CeoIm/qn0tfPo/zSxB6H\\n-----END PRIVATE KEY-----\\n"';

// Replace the FCM_PRIVATE_KEY line
envContent = envContent.replace(
  /FCM_PRIVATE_KEY=.*?(?=\n# Firebase Cloud Messaging|$)/s,
  `FCM_PRIVATE_KEY=${fixedPrivateKey}`
);

// Write the fixed content
fs.writeFileSync(envPath, envContent);

console.log('✅ Fixed FCM_PRIVATE_KEY formatting');
console.log('✅ Added proper quotes and newlines');

console.log('\n🔄 Next Steps:');
console.log('1. Restart your Next.js server (npm run dev)');
console.log('2. Test the API again');
console.log('3. The 500 error should be resolved');

console.log('\n🧪 Test Command:');
console.log('curl -X POST http://localhost:3000/api/notifications/register-fcm-token \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"fcmToken": "test-mock-token-12345", "deviceType": "android", "appVersion": "1.0.0"}\'');

console.log('\n🎉 Firebase environment variables fixed!');
