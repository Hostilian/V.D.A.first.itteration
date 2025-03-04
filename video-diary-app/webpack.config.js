const createExpoWebpackConfigAsync = require('@expo/webpack-config');
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

  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        'expo-router',
      ]
    }
  }, argv);

  // Add module aliases to resolve the missing modules
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo/dom': path.resolve(__dirname, './expo-dom-polyfill.js'),
    'expo/dom/global': path.resolve(__dirname, './expo-dom-polyfill.js')
  };

  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-screens': false,
    'react-native/Libraries/Components/View/ViewNativeComponent': 'react-native-web/dist/modules/forwardedProps',
    'react-native-safe-area-context': 'react-native-web'
  };

  return config;
};
