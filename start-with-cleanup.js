const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Baba Pages API with automatic story cleanup...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Start the main Next.js server
console.log('📡 Starting Next.js server...');
const serverProcess = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Start the cleanup service
console.log('🧹 Starting story cleanup service...');
const cleanupProcess = spawn('npm', ['run', 'cleanup-scheduled'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('❌ Server process error:', error);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`📡 Server process exited with code ${code} and signal ${signal}`);
  if (cleanupProcess && !cleanupProcess.killed) {
    console.log('🛑 Stopping cleanup service...');
    cleanupProcess.kill();
  }
  process.exit(code);
});

// Handle cleanup process events
cleanupProcess.on('error', (error) => {
  console.error('❌ Cleanup process error:', error);
});

cleanupProcess.on('exit', (code, signal) => {
  console.log(`🧹 Cleanup process exited with code ${code} and signal ${signal}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down services...');
  
  if (serverProcess && !serverProcess.killed) {
    console.log('🛑 Stopping server...');
    serverProcess.kill('SIGINT');
  }
  
  if (cleanupProcess && !cleanupProcess.killed) {
    console.log('🛑 Stopping cleanup service...');
    cleanupProcess.kill('SIGINT');
  }
  
  setTimeout(() => {
    console.log('✅ Services stopped');
    process.exit(0);
  }, 5000);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down services...');
  
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
  
  if (cleanupProcess && !cleanupProcess.killed) {
    cleanupProcess.kill('SIGTERM');
  }
  
  setTimeout(() => {
    console.log('✅ Services stopped');
    process.exit(0);
  }, 5000);
});

console.log('✅ Both services started successfully');
console.log('📡 Server: http://localhost:3000');
console.log('🧹 Cleanup: Running every hour');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
