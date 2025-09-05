const { cleanupExpiredStories } = require('./cleanup-expired-stories');

// Configuration
const CLEANUP_INTERVAL = 60 * 60 * 1000; // Run every hour (in milliseconds)
const INITIAL_DELAY = 5 * 60 * 1000; // Start after 5 minutes

console.log('🕒 Starting scheduled story cleanup service...');
console.log(`⏰ Cleanup interval: ${CLEANUP_INTERVAL / 1000 / 60} minutes`);
console.log(`⏰ Initial delay: ${INITIAL_DELAY / 1000 / 60} minutes`);

let cleanupInterval;

async function runCleanup() {
  try {
    console.log('\n🔄 Running scheduled cleanup...');
    console.log('⏰ Time:', new Date().toISOString());
    
    await cleanupExpiredStories();
    
    console.log('✅ Scheduled cleanup completed successfully');
  } catch (error) {
    console.error('❌ Scheduled cleanup failed:', error);
  }
}

// Start cleanup after initial delay
setTimeout(() => {
  console.log('🚀 Starting initial cleanup...');
  runCleanup();
  
  // Set up recurring cleanup
  cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL);
  console.log('✅ Scheduled cleanup service started');
}, INITIAL_DELAY);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down cleanup service...');
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('✅ Cleanup interval cleared');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down cleanup service...');
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('✅ Cleanup interval cleared');
  }
  process.exit(0);
});

// Keep the process alive
console.log('🔄 Cleanup service is running... Press Ctrl+C to stop');