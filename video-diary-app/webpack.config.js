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
    mode: env.mode || 'development',
    entry: './index.web.js',
    output: {
      path: path.resolve(__dirname, 'web-build'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        'react-native$': 'react-native-web',
      },
    },
    devServer: {
      static: {
