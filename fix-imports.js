const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix imports in a file
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix database import
    if (content.includes("import connectDB from '../../../lib/database';")) {
      content = content.replace(
        "import connectDB from '../../../lib/database';",
        "import connectDB from '@/lib/database';"
      );
      modified = true;
    }
    
    // Fix other lib imports
    const libImports = [
      'User', 'Follow', 'Post', 'Comment', 'Like', 'Notification', 
      'Admin', 'Verification', 'UserAssets', 'BabaPage', 'BabaPost',
      'BabaVideo', 'BabaStory', 'OTP', 'PasswordResetToken', 'BlacklistedToken',
      'Chat', 'LiveStream', 'LiveComment', 'Donation', 'PaymentOrder',
      'Story', 'Page', 'PageFollow', 'BabaPageFollow', 'FriendRequest',
      'ReligiousReel', 'EnhancedPost', 'PhoneOTP'
    ];
    
    libImports.forEach(model => {
      const oldImport = `import ${model} from '../../../lib/models/${model}';`;
      const newImport = `import ${model} from '@/lib/models/${model}';`;
      
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        modified = true;
      }
    });
    
    // Fix middleware imports
    if (content.includes("import { verifyToken } from '../../../lib/middleware/auth';")) {
      content = content.replace(
        "import { verifyToken } from '../../../lib/middleware/auth';",
        "import { verifyToken } from '@/lib/middleware/auth';"
      );
      modified = true;
    }
    
    if (content.includes("import { adminAuth } from '../../../lib/middleware/adminAuth';")) {
      content = content.replace(
        "import { adminAuth } from '../../../lib/middleware/adminAuth';",
        "import { adminAuth } from '@/lib/middleware/adminAuth';"
      );
      modified = true;
    }
    
    // Fix utils imports
    const utilsImports = [
      'email', 'validation', 'auth', 'googleAuth', 'objectId', 'sms', 'videoFetcher'
    ];
    
    utilsImports.forEach(util => {
      const oldImport = `import { ${util === 'email' ? 'sendWelcomeEmail, sendOTPEmail' : util === 'validation' ? 'validateEmail, validatePassword' : util === 'auth' ? 'generateToken' : util} } from '../../../lib/utils/${util}';`;
      const newImport = `import { ${util === 'email' ? 'sendWelcomeEmail, sendOTPEmail' : util === 'validation' ? 'validateEmail, validatePassword' : util === 'auth' ? 'generateToken' : util} } from '@/lib/utils/${util}';`;
      
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing import paths in TypeScript files...');
console.log('==============================================');

const tsFiles = findTsFiles('./pages');
let fixedCount = 0;

tsFiles.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed imports in ${fixedCount} files`);
console.log('✅ All import paths have been updated to use @/lib/ prefix');
