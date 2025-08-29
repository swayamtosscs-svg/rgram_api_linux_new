const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing TypeScript errors in live streaming API...');

// Function to fix error.message issues
function fixErrorDetails(content) {
  // Replace error.message with proper type checking
  return content.replace(
    /details:\s*error\.message/g,
    "details: error instanceof Error ? error.message : 'Unknown error'"
  );
}

// Function to fix specific error.message patterns
function fixSpecificErrors(content) {
  // Fix various error.message patterns
  content = content.replace(
    /error\.message\s*\|\|\s*"([^"]+)"/g,
    "error instanceof Error ? error.message : '$1'"
  );
  
  content = content.replace(
    /error\.message\s*&&\s*error\.message\.includes\(/g,
    "error instanceof Error && error.message && error.message.includes("
  );
  
  return content;
}

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix error.message issues
    content = fixErrorDetails(content);
    content = fixSpecificErrors(content);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to process directory recursively
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let fixedCount = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
      if (processFile(fullPath)) {
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

// Process the live API directory
const liveApiDir = path.join('app', 'api', 'live');
if (fs.existsSync(liveApiDir)) {
  console.log(`\n📁 Processing: ${liveApiDir}`);
  const fixedCount = processDirectory(liveApiDir);
  console.log(`\n🎉 Fixed ${fixedCount} files in live API directory`);
} else {
  console.log(`❌ Directory not found: ${liveApiDir}`);
}

// Process the users API directory
const usersApiDir = path.join('app', 'api', 'users');
if (fs.existsSync(usersApiDir)) {
  console.log(`\n📁 Processing: ${usersApiDir}`);
  const fixedCount = processDirectory(usersApiDir);
  console.log(`\n🎉 Fixed ${fixedCount} files in users API directory`);
} else {
  console.log(`❌ Directory not found: ${usersApiDir}`);
}

console.log('\n✨ TypeScript error fixing completed!');
console.log('Now try building again with: npm run build');
