# iOS Development Setup Guide

This guide will help you set up Xcode and the iOS development environment, which are required to run your Expo application on iOS devices or simulators.

## Step 1: Download and Install Xcode

1. Visit the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
2. Download and install Xcode
3. Open Xcode and complete the initial setup

## Step 2: Install Xcode Command Line Tools

1. Open Terminal
2. Run the following command:
   ```bash
   xcode-select --install
   ```
3. Follow the prompts to complete the installation

## Step 3: Set Up Xcode for Development

1. Open Xcode
2. Go to `Preferences` > `Locations`
3. Ensure the Command Line Tools dropdown is set to the latest version of Xcode

## Step 4: Verify Installation

1. Open Terminal
2. Run the following command to verify Xcode installation:
   ```bash
   xcodebuild -version
   ```
3. You should see the version information for Xcode

## Step 5: Install CocoaPods

1. CocoaPods is a dependency manager for Swift and Objective-C Cocoa projects
2. Open Terminal
3. Run the following command to install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

## Step 6: Initialize CocoaPods in Your Project

1. Navigate to your project directory in Terminal
2. Run the following command to initialize CocoaPods:
   ```bash
   npx pod-install
   ```

## Step 7: Run Your Expo Project on iOS

1. Ensure your iOS device or simulator is connected
2. Run the following command to start your project on iOS:
   ```bash
   npx expo start --ios
   ```

## Troubleshooting

If you encounter any issues:

- **Xcode not found**: Ensure Xcode is installed and the Command Line Tools are set correctly
- **CocoaPods issues**: Ensure CocoaPods is installed and initialized in your project

## Alternative: Run Web Version

While setting up Xcode, you can continue development using the web version:

