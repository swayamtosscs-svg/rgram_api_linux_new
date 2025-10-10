const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Installing MongoDB Community Server...');

// MongoDB Community Server download URL for Windows
const downloadUrl = 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.8-signed.msi';
const installerPath = path.join(__dirname, 'mongodb-installer.msi');

console.log('📥 Downloading MongoDB installer...');

// Download MongoDB installer
const file = fs.createWriteStream(installerPath);
https.get(downloadUrl, (response) => {
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('✅ Download completed');
    console.log('🔧 Installing MongoDB...');
    
    // Install MongoDB
    const installCommand = `msiexec /i "${installerPath}" /quiet /norestart`;
    
    exec(installCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Installation failed:', error.message);
        console.log('💡 Please run as Administrator or install manually');
        console.log('📋 Manual installation:');
        console.log('1. Run the downloaded installer: mongodb-installer.msi');
        console.log('2. Follow the installation wizard');
        console.log('3. Start MongoDB service');
        return;
      }
      
      console.log('✅ MongoDB installed successfully');
      
      // Clean up installer
      fs.unlink(installerPath, (err) => {
        if (err) console.log('⚠️ Could not remove installer file');
      });
      
      console.log('🔄 Starting MongoDB service...');
      
      // Try to start MongoDB service
      exec('net start MongoDB', (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️ Could not start MongoDB service automatically');
          console.log('💡 Please start it manually:');
          console.log('1. Open Services (services.msc)');
          console.log('2. Find "MongoDB" service');
          console.log('3. Right-click → Start');
        } else {
          console.log('✅ MongoDB service started');
        }
        
        console.log('');
        console.log('🎉 MongoDB installation completed!');
        console.log('📋 Next steps:');
        console.log('1. Test connection: node test-swayam-database.js');
        console.log('2. Start your API: npm run dev');
        console.log('');
        console.log('💡 Database URI: mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin');
      });
    });
  });
}).on('error', (err) => {
  console.error('❌ Download failed:', err.message);
  console.log('💡 Please download manually from: https://www.mongodb.com/try/download/community');
});
