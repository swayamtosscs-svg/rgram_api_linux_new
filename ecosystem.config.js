// PM2 Production Configuration
module.exports = {
  apps: [
    {
      name: 'nextjs-api',
      script: 'server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOSTNAME: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOSTNAME: '0.0.0.0'
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart settings
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Monitoring
      watch: false, // Don't watch files in production
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Advanced settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Environment variables
      env_file: '.env'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'root',
      host: '103.14.120.163',
      ref: 'origin/main',
      repo: 'https://github.com/IT-TOSS/api_rgram1.git',
      path: '/var/www/html/api_rgram1',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
