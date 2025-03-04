#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Display a warning message about Android SDK
console.log('\n=================================================================');
console.log('⚠️  Android SDK not detected. Starting in web mode instead...');
console.log('ℹ️  Check docs/android-setup-guide.md for Android setup instructions');
console.log('=================================================================\n');

// Wait a moment for the user to read the message
setTimeout(() => {
  // Start the web version with our custom entry point
  console.log('🌐 Starting web version with custom entry point...\n');
  try {
    execSync('npx webpack serve --mode development --entry ./web-entry.js --open', {
      stdio: 'inherit',
      env: {
        ...process.env,
        EXPO_TARGET: 'web'
      }
    });
  } catch (error) {
    console.error('Failed to start web version:', error);
  }
}, 3000);
