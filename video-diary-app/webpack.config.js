const path = require('path');
const fs = require('fs');

// Create a simple empty file for the assets if they don't exist
const createEmptyFileIfNeeded = (filePath) => {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, '');
  }
};

module.exports = async function(env, argv) {
  // Create asset files to prevent ENOENT errors
  createEmptyFileIfNeeded(path.resolve(__dirname, './assets/icon.png'));
  createEmptyFileIfNeeded(path.resolve(__dirname, './assets/favicon.png'));
  createEmptyFileIfNeeded(path.resolve(__dirname, './assets/splash.png'));
  createEmptyFileIfNeeded(path.resolve(__dirname, './assets/adaptive-icon.png'));

  return {
    // Very simple webpack config that doesn't try to process the assets
  const config = await createExpoWebpackConfigAsync({
    ...env,
  }, argv);

  // Use a direct entry point for web that doesn't rely on expo-router
  config.entry = [
    path.resolve(__dirname, 'index.web.js')
  ];

  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-screens': false,
    'react-native/Libraries/Components/View/ViewNativeComponent': 'react-native-web/dist/modules/forwardedProps',
    'react-native-safe-area-context': 'react-native-web'
  };

  return config;
};
