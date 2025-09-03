const http = require('http');
const next = require('next');

const port = process.env.PORT || 8081;
const hostname = '0.0.0.0'; // Bind to all interfaces for external access
const isDev = process.env.NODE_ENV !== 'production';

const app = next({ 
  dev: isDev,
  hostname: hostname,
  port: port
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    handle(req, res);
  });

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    }
    console.log(`✅ Next.js server ready at http://${hostname}:${port}`);
    console.log(`🌍 External access: http://103.14.120.163:${port}`);
    console.log(`🔧 Environment: ${isDev ? 'development' : 'production'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });
});