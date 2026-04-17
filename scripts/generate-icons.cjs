const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/logo.svg');
  const publicDir = path.join(__dirname, '../public');
  
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 }
  ];

  console.log('Generating icons from SVG...');
  
  for (const { name, size } of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating ${name}:`, error);
    }
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
