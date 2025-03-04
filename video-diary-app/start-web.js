#!/usr/bin/env node

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const fs = require('fs');
const getConfig = require('./webpack.config');
const net = require('net');

// Function to find an available port
const findAvailablePort = (startPort, callback) => {
  const server = net.createServer();

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Port is in use, try the next one
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(err);
    }
  });

  server.once('listening', () => {
    // Found an available port
    server.close(() => {
      callback(null, startPort);
    });
  });

  server.listen(startPort);
};

// Create actual image files instead of empty files
const createPlaceholderImage = (filePath) => {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create a simple 1x1 transparent PNG (proper PNG format)
    const transparentPNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );

    fs.writeFileSync(filePath, transparentPNG);
    console.log(`Created placeholder image: ${filePath}`);
  }
};

// Special function to directly create all missing assets
const ensureAssetsExist = () => {
  const assetFiles = [
    'icon.png',
    'favicon.png',
    'splash.png',
    'adaptive-icon.png'
  ];

  const assetsDir = path.resolve(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  assetFiles.forEach(file => {
    const filePath = path.resolve(assetsDir, file);
    createPlaceholderImage(filePath);
  });
};

async function startWeb() {
  console.log('Starting web development server...');

  // Create placeholder assets
  ensureAssetsExist();

  try {
    // Get webpack config
    const config = await getConfig({ mode: 'development' }, { mode: 'development' });

    // Create compiler
    const compiler = webpack(config);

    // Find available port starting from 19006
    findAvailablePort(19006, async (err, port) => {
      if (err) {
        console.error('Error finding available port:', err);
        process.exit(1);
      }

      // Create server with dynamic port
      const server = new WebpackDevServer({
        open: true,
        historyApiFallback: true,
        port,
        static: [
          {
            directory: path.join(__dirname, 'web-template'),
            watch: true,
          },
          {
            directory: path.join(__dirname, 'assets'),
            publicPath: '/assets',
          }
        ],
        devMiddleware: {
          publicPath: '/',
          writeToDisk: true,
        },
        client: {
          overlay: {
            errors: true,
            warnings: false,
          },
        },
        hot: true,
      }, compiler);

      // Start server
      await server.start();
      console.log(`Web server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting web server:', error);
    process.exit(1);
  }
}

startWeb();
