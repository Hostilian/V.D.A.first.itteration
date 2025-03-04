const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking and fixing sharp-cli...');

try {
  // First try to uninstall any existing global sharp-cli
  console.log('Removing any existing global sharp-cli...');
  execSync('npm uninstall -g sharp-cli', { stdio: 'inherit' });

  // Now install the specific version required by Expo
  console.log('Installing sharp-cli@^2.1.0 globally...');
  execSync('npm install -g sharp-cli@^2.1.0', { stdio: 'inherit' });

  // Verify installation
  console.log('Verifying installation...');
  const version = execSync('npx sharp-cli --version').toString().trim();
  console.log(`Installed sharp-cli version: ${version}`);

  console.log('✅ sharp-cli fixed successfully!');
} catch (error) {
  console.error('❌ Error fixing sharp-cli:', error.message);
  process.exit(1);
}
