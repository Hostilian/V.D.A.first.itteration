const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Copy a simple app.config.js that will be used temporarily
const tempConfigContent = `
export default {
  name: "Video Diary",
  slug: "video-diary-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  // Skip image processing by not defining complex configs
  android: {
    package: "com.anonymous.videodiaryapp",
  },
};
`;

const tempAppConfigPath = path.join(__dirname, '../app.config.temp.js');
const originalAppJsonPath = path.join(__dirname, '../app.json');
const backupAppJsonPath = path.join(__dirname, '../app.json.backup');

// Backup app.json
if (fs.existsSync(originalAppJsonPath)) {
  fs.copyFileSync(originalAppJsonPath, backupAppJsonPath);
  console.log('✅ Backed up app.json');
}

// Create temporary app.config.js
fs.writeFileSync(tempAppConfigPath, tempConfigContent);
console.log('✅ Created temporary app.config.js');

try {
  // Run prebuild with the temporary config
  console.log('🔄 Running expo prebuild with simplified config...');
  execSync('npx expo prebuild --no-install --skip-dependency-update', {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_CONFIG_JS_PATH: tempAppConfigPath
    }
  });
  console.log('✅ Prebuild completed successfully');
} catch (error) {
  console.error('❌ Prebuild failed:', error.message);
} finally {
  // Clean up
  if (fs.existsSync(tempAppConfigPath)) {
    fs.unlinkSync(tempAppConfigPath);
    console.log('🧹 Removed temporary app.config.js');
  }

  if (fs.existsSync(backupAppJsonPath)) {
    fs.copyFileSync(backupAppJsonPath, originalAppJsonPath);
    fs.unlinkSync(backupAppJsonPath);
    console.log('🧹 Restored original app.json');
  }
}
