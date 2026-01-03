/**
 * Server Restart Script
 * Kills any existing server on port 5001 and starts a new one
 * Run: node scripts/restartServer.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PORT = process.env.PORT || 5001;

const restartServer = async () => {
  try {
    console.log('🔄 Restarting backend server...\n');

    // Find process using port 5001
    console.log(`1️⃣ Checking for processes on port ${PORT}...`);
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${PORT} | findstr LISTENING`);
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        // Extract PID from the output
        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });

        if (pids.size > 0) {
          console.log(`   Found ${pids.size} process(es) using port ${PORT}`);
          for (const pid of pids) {
            console.log(`   Killing process ${pid}...`);
            try {
              await execAsync(`taskkill /F /PID ${pid}`);
              console.log(`   ✅ Process ${pid} terminated`);
            } catch (err) {
              console.log(`   ⚠️  Could not kill process ${pid}: ${err.message}`);
            }
          }
          // Wait a moment for port to be released
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.log(`   ✅ No processes found on port ${PORT}`);
      }
    } catch (err) {
      // No processes found or error - that's okay
      console.log(`   ✅ Port ${PORT} is available`);
    }

    console.log('\n2️⃣ Starting server...\n');
    
    // Start the server
    const { spawn } = require('child_process');
    const server = spawn('node', ['server.js'], {
      cwd: __dirname + '/..',
      stdio: 'inherit',
      shell: true
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down server...');
      server.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\n🛑 Shutting down server...');
      server.kill('SIGTERM');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Restart failed:', error.message);
    process.exit(1);
  }
};

restartServer();

