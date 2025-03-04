# Android Development Setup Guide

To run your Expo application on Android devices or emulators, follow these steps:

## Step 1: Install Android Studio

1. Download Android Studio from [https://developer.android.com/studio](https://developer.android.com/studio)
2. Run the installer and follow the installation wizard
3. Make sure to select these components during installation:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
   - Performance (Intel HAXM)

## Step 2: Set Environment Variables

After installing Android Studio, you need to set up environment variables:

### On Windows:

1. Search for "Environment Variables" in Windows search
2. Click "Edit the system environment variables"
3. In the System Properties window, click "Environment Variables"
4. Under "User variables", click "New" and add:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\Hostilian\AppData\Local\Android\Sdk`
     (or the path where Android SDK was installed)
5. Under "User variables", find "Path", click "Edit"
6. Click "New" and add: `%ANDROID_HOME%\platform-tools`
7. Click "OK" on all dialogs

## Step 3: Verify the Setup

1. Close and reopen any command prompts
2. Run this command to verify ADB is working:
   ```
   adb version
   ```
   You should see version information for Android Debug Bridge

## Step 4: Create an Android Virtual Device

1. Open Android Studio
2. Click "More Actions" > "Virtual Device Manager"
3. Click "Create Device"
4. Select a device (like Pixel 4) and click "Next"
5. Download a system image (like API 30) and click "Next"
6. Click "Finish" to create the AVD

## Troubleshooting

If you still see errors about missing Android SDK:
1. Open Android Studio
2. Click "More Actions" > "SDK Manager"
3. Note the "Android SDK Location" path
4. Make sure your ANDROID_HOME variable matches this path
