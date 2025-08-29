const fs = require('fs');
const path = require('path');

console.log('🚀 Creating minimal build for live streaming API...');

// Create a clean build directory
const buildDir = 'build-live-api';
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir, { recursive: true });

// Copy package.json
fs.copyFileSync('package.json', path.join(buildDir, 'package.json'));

// Copy next.config.js
fs.copyFileSync('next.config.js', path.join(buildDir, 'next.config.js'));

// Copy environment files
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', path.join(buildDir, '.env'));
}

// Copy lib directory
if (fs.existsSync('lib')) {
  fs.cpSync('lib', path.join(buildDir, 'lib'), { recursive: true });
}

// Copy only the live streaming APIs
const liveApiDir = path.join(buildDir, 'app', 'api', 'live');
fs.mkdirSync(liveApiDir, { recursive: true });

// Copy live streaming routes
const liveRoutes = [
  'start',
  'go-live', 
  'end',
  'join',
  'leave',
  'viewers',
  'streams',
  'like',
  'comment',
  'comments',
  'update-settings'
];

liveRoutes.forEach(route => {
  const sourcePath = path.join('app', 'api', 'live', route);
  const destPath = path.join(liveApiDir, route);
  
  if (fs.existsSync(sourcePath)) {
    fs.cpSync(sourcePath, destPath, { recursive: true });
    console.log(`✅ Copied: ${route}`);
  }
});

// Copy stream dynamic route
const streamSource = path.join('app', 'api', 'live', 'stream');
const streamDest = path.join(liveApiDir, 'stream');
if (fs.existsSync(streamSource)) {
  fs.cpSync(streamSource, streamDest, { recursive: true });
  console.log('✅ Copied: stream/[id]');
}

// Copy users API (needed for viewer tracking)
const usersApiDir = path.join(buildDir, 'app', 'api', 'users');
fs.mkdirSync(usersApiDir, { recursive: true });
fs.cpSync(path.join('app', 'api', 'users'), usersApiDir, { recursive: true });
console.log('✅ Copied: users API');

// Create a simple index page
const indexContent = `
export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Live Streaming API</h1>
      <p>This is a minimal build for the live streaming API.</p>
      <p>Use the following endpoints:</p>
      <ul>
        <li>POST /api/live/start - Start a stream</li>
        <li>PUT /api/live/go-live - Go live</li>
        <li>POST /api/live/join - Join as viewer</li>
        <li>GET /api/live/viewers - Get viewer info</li>
        <li>POST /api/live/leave - Leave stream</li>
        <li>GET /api/users - Get users</li>
      </ul>
    </div>
  );
}
`;

fs.writeFileSync(path.join(buildDir, 'app', 'page.tsx'), indexContent);

// Create app layout
const layoutContent = `
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;

fs.mkdirSync(path.join(buildDir, 'app'), { recursive: true });
fs.writeFileSync(path.join(buildDir, 'app', 'layout.tsx'), layoutContent);

console.log('\n🎉 Minimal build created successfully!');
console.log(`📁 Build directory: ${buildDir}`);
console.log('\nTo build and deploy:');
console.log(`1. cd ${buildDir}`);
console.log('2. npm install');
console.log('3. npm run build');
console.log('4. Deploy to Vercel');
