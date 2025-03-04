#!/usr/bin/env node

/**
 * This script checks if Xcode and iOS development tools are properly installed and configured
 * It helps diagnose issues with iOS development setup
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

console.log(`${colors.blue}${colors.bold}iOS SDK Setup Checker${colors.reset}\n`);

// Check if Xcode is installed
const checkXcode = () => {
  console.log(`${colors.blue}Checking Xcode installation...${colors.reset}`);

  try {
    const output = execSync('xcodebuild -version', { encoding: 'utf8' });
    console.log(`${colors.green}✓ Xcode is installed:${colors.reset} ${output.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Xcode not found${colors.reset}`);
    return false;
  }
};

// Check if Xcode Command Line Tools are installed
const checkXcodeCommandLineTools = () => {
  console.log(`${colors.blue}Checking Xcode Command Line Tools...${colors.reset}`);

  try {
    const output = execSync('xcode-select --print-path', { encoding: 'utf8' });
    console.log(`${colors.green}✓ Xcode Command Line Tools are installed:${colors.reset} ${output.trim()}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Xcode Command Line Tools not found${colors.reset}`);
    return false;
  }
};

// Check if CocoaPods is installed
const checkCocoaPods = () => {
  console.log(`${colors.blue}Checking CocoaPods installation...${colors.reset}`);

  try {
    const output = execSync('pod --version', { encoding: 'utf8' });
    console.log(`${colors.green}✓ CocoaPods is installed:${colors.reset} ${output.trim()}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ CocoaPods not found${colors.reset}`);
    return false;
  }
};

// Main check function
const runChecks = () => {
  const xcodeOk = checkXcode();
  const xcodeCLTOk = checkXcodeCommandLineTools();
  const cocoaPodsOk = checkCocoaPods();

  console.log('\n----------------------------------------');
  if (xcodeOk && xcodeCLTOk && cocoaPodsOk) {
    console.log(`${colors.green}${colors.bold}✓ iOS SDK setup looks good!${colors.reset}`);
    console.log('You should be able to run Expo projects on iOS.');
    return true;
  } else {
    console.log(`${colors.red}${colors.bold}✗ iOS SDK setup is incomplete.${colors.reset}`);
    console.log('Please follow the setup instructions in docs/ios-installation-guide.md');

    if (!xcodeOk) {
      console.log(`\n${colors.yellow}First step: Install Xcode from:${colors.reset}`);
      console.log('https://apps.apple.com/us/app/xcode/id497799835?mt=12');
    } else if (!xcodeCLTOk) {
      console.log(`\n${colors.yellow}Next step: Install Xcode Command Line Tools${colors.reset}`);
    } else if (!cocoaPodsOk) {
      console.log(`\n${colors.yellow}Next step: Install CocoaPods${colors.reset}`);
    }

    console.log(`\n${colors.blue}Alternative: Use web version for now:${colors.reset}`);
    console.log('npm run web:standalone');

    return false;
  }
};

// Run all checks
runChecks();
