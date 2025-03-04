# Android Development Setup

To run your Expo application on Android devices or emulators, you need to install Android Studio and set up environment variables.

## 1. Install Android Studio

1. Download Android Studio from [https://developer.android.com/studio](https://developer.android.com/studio)
2. Follow the installation instructions
3. During setup, make sure to include:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device

## 2. Set Environment Variables

After installing Android Studio, you need to set two environment variables:

### Set ANDROID_HOME

1. Open Windows search and type "environment variables"
2. Click "Edit the system environment variables"
3. In the System Properties window, click "Environment Variables"
4. Under "User variables", click "New"
5. Set Variable name: `ANDROID_HOME`
6. Set Variable value: `C:\Users\Hostilian\AppData\Local\Android\Sdk` (or your actual SDK path)
7. Click "OK"

### Add platform-tools to PATH

1. Under "User variables", find the "Path" variable and click "Edit"
2. Click "New" and add: `%ANDROID_HOME%\platform-tools`
3. Click "OK" on all dialogs to save

## 3. Verify Setup

Open a new Command Prompt window and run:

