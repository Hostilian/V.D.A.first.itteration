const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './web-entry.js',
  output: {
    path: path.resolve(__dirname, 'web-standalone'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules[/\\](?!react-native-)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
              ['@babel/plugin-transform-class-properties', { loose: true }]
            ]
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.web.js', '.js', '.web.jsx', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-safe-area-context': 'react-native-web',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './web-template/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'web-template'),
    },
    port: 8083, // Changed port to 8083
    historyApiFallback: true,
    hot: true,
  },
};
