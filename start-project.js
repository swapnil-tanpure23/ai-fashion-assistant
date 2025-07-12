const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Fashion AI Project...\n');

// Function to run commands
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function startProject() {
  try {
    console.log('📦 Installing backend dependencies...');
    await runCommand('npm', ['install'], { cwd: './backend' });
    
    console.log('🐳 Starting MongoDB and Backend with Docker...');
    await runCommand('docker-compose', ['up', '-d']);
    
    console.log('⏳ Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📱 Starting React Frontend...');
    await runCommand('npm', ['start'], { cwd: './' });
    
  } catch (error) {
    console.error('❌ Error starting project:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down services...');
  try {
    await runCommand('docker-compose', ['down']);
    console.log('✅ Services stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error stopping services:', error.message);
    process.exit(1);
  }
});

startProject(); 