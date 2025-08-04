// Build script for production deployment
const esbuild = require('esbuild');
const { execSync } = require('child_process');

async function buildProduction() {
  console.log('Building StreamBridge for production...');
  
  // Build client (React frontend)
  console.log('1. Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Build server (Node.js backend)
  console.log('2. Building backend...');
  await esbuild.build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/server.js',
    external: ['fsevents'], // Exclude native modules
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
  
  console.log('3. Build complete! Files ready for cPanel upload.');
  console.log('   - Frontend: dist/ folder');
  console.log('   - Backend: dist/server.js');
  console.log('   - Copy package.json and node_modules to server');
}

if (require.main === module) {
  buildProduction().catch(console.error);
}

module.exports = { buildProduction };