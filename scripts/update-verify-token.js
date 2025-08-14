const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts files in a directory
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to update verifyToken calls in a file
function updateVerifyTokenInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Replace 'const decoded = verifyToken(token);' with 'const decoded = await verifyToken(token);'
  if (content.includes('const decoded = verifyToken(token);')) {
    content = content.replace(/const decoded = verifyToken\(token\);/g, 'const decoded = await verifyToken(token);');
    updated = true;
  }

  // Save the file if it was updated
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Main function
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const pagesApiDir = path.join(rootDir, 'pages', 'api');
  const apiRgramDir = path.join(rootDir, 'api_rgram', 'pages', 'api');
  
  let tsFiles = [];
  
  // Find all .ts files in pages/api
  if (fs.existsSync(pagesApiDir)) {
    tsFiles = tsFiles.concat(findTsFiles(pagesApiDir));
  }
  
  // Find all .ts files in api_rgram/pages/api if it exists
  if (fs.existsSync(apiRgramDir)) {
    tsFiles = tsFiles.concat(findTsFiles(apiRgramDir));
  }

  console.log(`Found ${tsFiles.length} TypeScript files to check`);

  let updatedCount = 0;
  tsFiles.forEach(file => {
    if (updateVerifyTokenInFile(file)) {
      updatedCount++;
    }
  });

  console.log(`Updated ${updatedCount} files`);
}

main();