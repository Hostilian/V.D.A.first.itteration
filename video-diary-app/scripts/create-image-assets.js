const fs = require('fs');
const path = require('path');

// Base64 encoded transparent PNG (1x1 pixel)
const BASE64_TRANSPARENT_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Required asset files
const REQUIRED_ASSETS = [
  'icon.png',
  'adaptive-icon.png',
  'splash.png',
  'favicon.png'
];

// Create assets directory if it doesn't exist
const assetsDir = path.resolve(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create each asset with proper PNG data
REQUIRED_ASSETS.forEach(filename => {
  const filePath = path.join(assetsDir, filename);
  console.log(`Creating ${filePath}...`);

  // Write a real PNG file
  fs.writeFileSync(filePath, Buffer.from(BASE64_TRANSPARENT_PNG, 'base64'));
});

console.log('All image assets created successfully!');
