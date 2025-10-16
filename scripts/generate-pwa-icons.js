#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source
 * This script generates PNG icons in various sizes required for PWA installation
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_SOURCE = path.join(__dirname, '../public/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

const SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // iOS
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

async function generateIcons() {
  console.log('📱 Generating PWA icons...\n');

  if (!fs.existsSync(SVG_SOURCE)) {
    console.error(`❌ Error: SVG source not found at ${SVG_SOURCE}`);
    process.exit(1);
  }

  // Read SVG file
  const svgBuffer = fs.readFileSync(SVG_SOURCE);

  // Generate each icon size
  for (const { size, name } of SIZES) {
    try {
      const outputPath = path.join(OUTPUT_DIR, name);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 23, b: 42, alpha: 1 } // Match theme color
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  console.log('\n✨ Icon generation complete!\n');
  console.log('Generated files:');
  SIZES.forEach(({ name }) => console.log(`  - public/${name}`));
}

// Run the script
generateIcons().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
