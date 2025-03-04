# Android SDK Installation Guide

This guide will help you set up Android Studio and the Android SDK, which are required to run your Expo application on Android devices or emulators.

## Step 1: Download and Install Android Studio

1. Visit [Android Studio's official download page](https://developer.android.com/studio)
2. Download the Android Studio installer for Windows
3. Run the installer and follow these steps:
   - Choose "Standard" installation when prompted
   - Complete the installation process

## Step 2: First Launch Setup

When you first launch Android Studio:

1. It will download additional components
2. Accept all license agreements when prompted
3. Let Android Studio complete the initial setup

## Step 3: Install Required SDK Components

1. In Android Studio, click on "More Actions" or the three dots in the welcome screen
2. Select "SDK Manager"
3. In the "SDK Platforms" tab, make sure at least one Android version is selected (recommended: Android 13.0/API Level 33)
4. In the "SDK Tools" tab, ensure these components are installed:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator
   - Android SDK Platform-Tools
5. Click "Apply" and wait for the installation to complete

## Step 4: Set Environment Variables

1. Search for "environment variables" in Windows search
2. Select "Edit the system environment variables"
3. Click the "Environment Variables" button
4. Under "User variables" section, click "New"
5. Add a variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: Path to your Android SDK (typically `C:\Users\USERNAME\AppData\Local\Android\Sdk`)
     - You can find this path in Android Studio: Settings > Languages & Frameworks > Android SDK > Android SDK Location
6. Click "OK"
7. Find the "Path" variable in the user variables list and select it
8. Click "Edit"
9. Click "New"
10. Add: `%ANDROID_HOME%\platform-tools`
11. Click "OK" on all dialogs

## Step 5: Verify Installation

1. Close and reopen any command prompts
2. Run: `adb --version`
3. If properly installed, you'll see version information for Android Debug Bridge

## Step 6: Create an Android Virtual Device

1. In Android Studio, click "More Actions" > "Virtual Device Manager"
2. Click "Create Device"
3. Select a phone (like Pixel 6) and click "Next"
4. Download a system image (like API 33) and click "Next"
5. Click "Finish"

## Troubleshooting

If you still encounter issues:

- **Android Studio can't find JDK**: Install JDK 11 or newer manually
- **ANDROID_HOME not working**: Try setting it to exact SDK location or restart your computer
- **ADB not found**: Make sure platform-tools is included in your PATH

## Alternative: Run Web Version

While setting up Android SDK, you can continue development using the web version:

