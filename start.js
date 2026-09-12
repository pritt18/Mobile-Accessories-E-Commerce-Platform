const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 Starting Mobixia Mobile Accessories Platform...\n');

// Start backend
const backend = spawn(npmCmd, ['start'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true
});

function shutdown() {
  console.log('\n🛑 Shutting down services...');
  if (backend) backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
