#!/usr/bin/env node

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
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

async function startWeb() {
  console.log('Starting web development server...');

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

      // Create server with dynamic port - simplified config
      const server = new WebpackDevServer({
        open: true,
        port,
        static: {
          directory: path.join(__dirname, 'web-template'),
        },
        historyApiFallback: true,
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
