import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

const iconsDir = 'src-tauri/icons';

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple book icon as SVG
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#2d2d2d"/>
  <g transform="translate(80, 80)">
    <path d="M176 0C96 0 32 20 32 44v280c0 24 64 44 144 44s144-20 144-44V44c0-24-64-44-144-44z" fill="#faf9f7"/>
    <path d="M176 24c-60 0-112 14-112 32v240c0 18 52 32 112 32s112-14 112-32V56c0-18-52-32-112-32z" fill="#e8e6e3"/>
    <line x1="176" y1="56" x2="176" y2="296" stroke="#2d5a3d" stroke-width="4"/>
    <rect x="96" y="80" width="60" height="8" rx="2" fill="#2d5a3d" opacity="0.6"/>
    <rect x="96" y="104" width="160" height="6" rx="2" fill="#666" opacity="0.4"/>
    <rect x="96" y="124" width="140" height="6" rx="2" fill="#666" opacity="0.4"/>
    <rect x="96" y="144" width="150" height="6" rx="2" fill="#666" opacity="0.4"/>
    <rect x="96" y="180" width="160" height="6" rx="2" fill="#666" opacity="0.4"/>
    <rect x="96" y="200" width="130" height="6" rx="2" fill="#666" opacity="0.4"/>
    <rect x="96" y="220" width="155" height="6" rx="2" fill="#666" opacity="0.4"/>
  </g>
</svg>
`;

async function generateIcons() {
  const svgBuffer = Buffer.from(svgIcon);

  // Generate PNG icons at various sizes
  const sizes = [32, 128, 256];

  for (const size of sizes) {
    const filename = size === 256 ? '128x128@2x.png' : `${size}x${size}.png`;
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, filename));
    console.log(`Created ${filename}`);
  }

  // Generate proper ICO for Windows (needs multiple sizes)
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    icoSizes.map(size =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  const icoBuffer = await pngToIco(pngBuffers);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);
  console.log('Created icon.ico');

  // Generate 512x512 PNG for macOS (icns placeholder)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon.icns'));
  console.log('Created icon.icns (PNG placeholder - works for dev)');

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
