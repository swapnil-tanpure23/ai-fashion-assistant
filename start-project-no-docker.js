const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Fashion AI Project (No Docker)...\n');

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
    
    console.log('⚠️  MongoDB Setup Required:');
    console.log('   Please install MongoDB manually:');
    console.log('   1. Download from: https://www.mongodb.com/try/download/community');
    console.log('   2. Install MongoDB Community Server');
    console.log('   3. Start MongoDB service');
    console.log('   4. Create database: fashion_ai_db');
    console.log('');
    console.log('   Or use MongoDB Atlas (cloud):');
    console.log('   1. Go to: https://www.mongodb.com/atlas');
    console.log('   2. Create free cluster');
    console.log('   3. Get connection string');
    console.log('   4. Update backend/.env file');
    console.log('');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('Have you set up MongoDB? (y/n): ', (answer) => {
        resolve(answer.toLowerCase());
      });
    });

    rl.close();

    if (answer === 'y' || answer === 'yes') {
      console.log('🚀 Starting Backend...');
      await runCommand('npm', ['start'], { cwd: './backend' });
    } else {
      console.log('❌ Please set up MongoDB first, then run: npm run dev:no-docker');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error starting project:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down services...');
  console.log('✅ Services stopped successfully');
  process.exit(0);
});

startProject(); 