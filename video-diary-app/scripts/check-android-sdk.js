#!/usr/bin/env node

/**
 * This script checks if Android SDK is properly installed and configured
 * It helps diagnose issues with Android development setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`${colors.blue}${colors.bold}Android SDK Setup Checker${colors.reset}\n`);

// Check environment variables
const checkEnvironmentVariables = () => {
  console.log(`${colors.blue}Checking environment variables...${colors.reset}`);

  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  if (androidHome) {
    console.log(`${colors.green}✓ ANDROID_HOME is set to:${colors.reset} ${androidHome}`);

    // Check if the directory exists
    if (fs.existsSync(androidHome)) {
      console.log(`${colors.green}✓ Android SDK directory exists${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Android SDK directory does not exist at: ${androidHome}${colors.reset}`);
      return false;
    }

    // Check for platform-tools
    const platformTools = path.join(androidHome, 'platform-tools');
    if (fs.existsSync(platformTools)) {
      console.log(`${colors.green}✓ platform-tools directory exists${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ platform-tools not found in SDK${colors.reset}`);
      return false;
    }

    return true;
  } else {
    console.log(`${colors.red}✗ ANDROID_HOME environment variable is not set${colors.reset}`);

    // Try to find Android SDK in the default location
    const username = os.userInfo().username;
    const defaultSdkPath = path.join('C:', 'Users', username, 'AppData', 'Local', 'Android', 'Sdk');

    if (fs.existsSync(defaultSdkPath)) {
      console.log(`${colors.yellow}! Found Android SDK at default location: ${defaultSdkPath}${colors.reset}`);
      console.log(`${colors.yellow}! Please set ANDROID_HOME environment variable to this path${colors.reset}`);
    }

    return false;
  }
};

// Check for ADB in PATH
const checkAdb = () => {
  console.log(`\n${colors.blue}Checking for ADB in PATH...${colors.reset}`);

  try {
    const output = execSync('adb version', { encoding: 'utf8' });
    console.log(`${colors.green}✓ ADB is in PATH:${colors.reset} ${output.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ADB not found in PATH${colors.reset}`);

    // Check if platform-tools is in PATH
    const paths = process.env.PATH.split(path.delimiter);
    const hasPlatformTools = paths.some(p => p.includes('platform-tools'));

    if (hasPlatformTools) {
      console.log(`${colors.yellow}! platform-tools is in PATH but ADB command failed${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! platform-tools is not in PATH${colors.reset}`);
    }

    return false;
  }
};

// Look for Android Studio installation
const checkAndroidStudio = () => {
  console.log(`\n${colors.blue}Looking for Android Studio installation...${colors.reset}`);

  const commonPaths = [
    path.join('C:', 'Program Files', 'Android', 'Android Studio'),
    path.join('C:', 'Program Files (x86)', 'Android', 'Android Studio'),
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'android-studio')
  ];

  for (const studioPath of commonPaths) {
    if (fs.existsSync(studioPath)) {
      console.log(`${colors.green}✓ Android Studio found at:${colors.reset} ${studioPath}`);
      return true;
    }
  }

  console.log(`${colors.yellow}! Android Studio not found in common locations${colors.reset}`);
  return false;
};

// Main check function
const runChecks = () => {
  const envVarsOk = checkEnvironmentVariables();
  const adbOk = checkAdb();
  const studioFound = checkAndroidStudio();

  console.log('\n----------------------------------------');
  if (envVarsOk && adbOk) {
    console.log(`${colors.green}${colors.bold}✓ Android SDK setup looks good!${colors.reset}`);
    console.log('You should be able to run Expo projects on Android.');
    return true;
  } else {
    console.log(`${colors.red}${colors.bold}✗ Android SDK setup is incomplete.${colors.reset}`);
    console.log('Please follow the setup instructions in docs/android-installation-guide.md');

    if (!studioFound) {
      console.log(`\n${colors.yellow}First step: Install Android Studio from:${colors.reset}`);
      console.log('https://developer.android.com/studio');
    } else if (!envVarsOk) {
      console.log(`\n${colors.yellow}Next step: Set up environment variables${colors.reset}`);
    }

    console.log(`\n${colors.blue}Alternative: Use web version for now:${colors.reset}`);
    console.log('npm run web:standalone');

    return false;
  }
};

// Run all checks
runChecks();
