const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting Development Server...\n');

// Check if server is running
const checkServer = () => {
    return new Promise((resolve) => {
        const test = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:3000'], {
            stdio: 'pipe',
            shell: true
        });
        
        test.on('close', (code) => {
            resolve(code === 0);
        });
    });
};

// Kill any existing Node processes on port 3000
const killServer = () => {
    return new Promise((resolve) => {
        console.log('🛑 Stopping existing server...');
        
        // For Windows
        const killCmd = process.platform === 'win32' 
            ? 'taskkill /F /IM node.exe 2>nul || echo "No Node processes found"'
            : 'pkill -f "next dev" || echo "No Next.js processes found"';
            
        const kill = spawn(killCmd, { shell: true, stdio: 'pipe' });
        
        kill.on('close', () => {
            setTimeout(resolve, 2000); // Wait 2 seconds
        });
    });
};

// Start the server
const startServer = () => {
    console.log('🚀 Starting development server...');
    
    const server = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
    });
    
    server.on('error', (err) => {
        console.error('❌ Error starting server:', err.message);
    });
    
    server.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });
    
    return server;
};

// Main restart process
async function restartServer() {
    try {
        await killServer();
        console.log('✅ Server stopped');
        
        console.log('\n📋 Environment Variables Status:');
        console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID || 'NOT SET');
        console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
        
        console.log('\n🔄 Starting server with updated environment...');
        startServer();
        
    } catch (error) {
        console.error('❌ Error restarting server:', error.message);
    }
}

restartServer();
