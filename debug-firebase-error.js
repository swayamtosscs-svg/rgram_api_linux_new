const admin = require('firebase-admin');

console.log('🔍 Debugging Firebase Push Notification Error...\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('FCM_PROJECT_ID:', process.env.FCM_PROJECT_ID || '❌ NOT SET');
console.log('FCM_PRIVATE_KEY_ID:', process.env.FCM_PRIVATE_KEY_ID || '❌ NOT SET');
console.log('FCM_CLIENT_EMAIL:', process.env.FCM_CLIENT_EMAIL || '❌ NOT SET');
console.log('FCM_CLIENT_ID:', process.env.FCM_CLIENT_ID || '❌ NOT SET');
console.log('FCM_PRIVATE_KEY:', process.env.FCM_PRIVATE_KEY ? '✅ SET' : '❌ NOT SET');

console.log('\n🔧 Firebase Initialization Check:');

try {
  // Check if Firebase is already initialized
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin SDK already initialized');
    console.log('📱 Apps count:', admin.apps.length);
  } else {
    console.log('❌ Firebase Admin SDK not initialized');
    
    // Try to initialize with environment variables
    if (process.env.FCM_PROJECT_ID && process.env.FCM_PRIVATE_KEY && process.env.FCM_CLIENT_EMAIL) {
      console.log('🔄 Attempting to initialize Firebase...');
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FCM_PROJECT_ID,
        private_key_id: process.env.FCM_PRIVATE_KEY_ID,
        private_key: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FCM_CLIENT_EMAIL,
        client_id: process.env.FCM_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FCM_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FCM_PROJECT_ID
      });
      
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.log('❌ Missing required environment variables');
    }
  }
} catch (error) {
  console.log('❌ Firebase initialization error:', error.message);
}

console.log('\n📋 Solution Steps:');
console.log('1. Create .env.local file in your project root');
console.log('2. Add the following environment variables:');
console.log('');
console.log('FCM_PROJECT_ID=rgram-notifiaction');
console.log('FCM_PRIVATE_KEY_ID=860d1731d40a5fa3d9279e6e9e9ab94240850f09');
console.log('FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCQbGRWFDkq5BDF\\n4RvQbWLmwwg4S3AnKqPh3b4lc8Ww4y0Fe3Gvpl6KCgTKSFlsYpt3va8a+/G50EUE\\noCbnkZuMbJwIRs35TebCiqCKPmOisygNW+EZdikzS72r6L+qv3ulsgIGLzOW0/vO\\nTWffXSi73C4tRLxT+yGTidaqxYxogJLHh1umf3P+t92zpDU+dN8AmafCNJJf2XHP\\nNN4AtegABZcxYXiuGXnn1bO0W87P/Sr8WgLxGd2lRY/pUGsqk/b2ho9r/xDYkoJr\\nNTKUZU6S8rOj8sJIVUUjGpB9acC/Hsd9TlcUvErVOKm+rezTPgYEVNTubdFUVIId\\n/FZSit67AgMBAAECggEAOdTdnMZ+Wdl3ifVpUN3sg6FHcltq7pQZicFkedTRLdLa\\nXV6gGIkTRE1cu6+a91bJEHrJWpHWquRmLsL+sS3STrnTBVFs+06hf/dI7/KprSX2\\nfNr02WBCgULsEaGi1nnUxnXwb4+JJfV+2I6QcJX6ULeLWh8zFqHyQQUqC7oNTm7L\\ntl0NBpTOyuGmxWWOWGnWWtfsTvAR9HpxRK4RSCw9HAE3DC8U09tjv6pC+/jEeHOW\\n0gjYBQXP7y4ceT1l3dIDdaVb1nhqLZF/nYV1R/u1gCqz6dtfVXBUeSQAxkwumDxQ\\niadO4Fe/DwXlfu+sWWO0WU+viIQryLKnK6kYwOrncQKBgQDIklMZMrbLsk34Jzid\\n42obkiwcG59U9Hndosfg9zErHdkx2JTIvDIjsayftftAWne9FTJlf6jzqBbeQH5T\\nlnVnsgBo7trUUQSZzdQ35bbPhcdRiFhCWh2z0tDGkTGg1lwQiFNOn5h8R8bfuUvd\\noLOTem7LP5+mQa/k8CeuCMSz6QKBgQC4Vcw/h4UPvkx6oikziv7p0gEKE57XAZsg\\nLQR70gHwtZcJbnlPs/AZv+kUPrk0mBKhST6O5lYvj8UjgaVazsv4onJfTbNa75qo\\nGFlzR2VeRCMFvgBtfFc2sevUYIw+L0LAQ3X/ye8RR2J4ALVxMgN15OwHZfBCTPu6\\nLXKYpBvLAwKBgQCe8Y4WtuCzFW7CS1qLjG9GwBRiheVC7qYwZFIfTeTR9UpsPOTT\\nGohlTuSsgAtGmSqwVb7lPkBGLptIrzUsylvpu96lSTty621I8RrO3SR82df1HaZL\\nlpxZJ6Q451C704OLumzCLqkpO7w3COE9FZ+ZLHnmaVn756wbMdFQEjTHGQKBgQCP\\nQ6d9jJ8e8EDSYuvwskuSgHPsV/lwkz/0TuiYL0zwvsFHREQmbOvjp2LIKEObG8IG\\n9j0XpO9BAdUu1lkkbWrbr62CYopN18D0ehAzZz7id8RcdyIv9Z521Os74Vm+Ds8r\\nTIMOLOyQGlHugGaENmG4JBZJXbHQZbKTLTVOauVq7wKBgEjYfxHDiLEKUdO0ty6Z\\ndZWyDRk9B7VC0ADMRAGhAL4heIcsgRicUxh4mjBRPsKYImE/fVZ2ExaNShPQ6ElZ\\nRNS/+lbKKR3Lz/V5fmGZIHFa3VbZI19q+GJFHNwyjqqx80UMwG/w8cpAJ4uwnubn\\ns6m8CeoIm/qn0tfPo/zSxB6H\\n-----END PRIVATE KEY-----\\n"');
console.log('FCM_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rgram-notifiaction.iam.gserviceaccount.com');
console.log('FCM_CLIENT_ID=106426579807094702598');
console.log('');
console.log('3. Restart your Next.js server');
console.log('4. Test the API again');
console.log('');
console.log('💡 Alternative: Use the setup script:');
console.log('node setup-firebase-env.js');
