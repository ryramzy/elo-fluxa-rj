import sharp from 'sharp';
import { readFileSync } from 'fs';

const wordmark = readFileSync('./public/icon-wordmark.svg');
const mark = readFileSync('./public/icon-mark.svg');

const sizes = [
  { src: wordmark, out: 'public/apple-touch-icon.png', size: 180 },
  { src: wordmark, out: 'public/icon-192.png', size: 192 },
  { src: wordmark, out: 'public/icon-512.png', size: 512 },
  { src: mark, out: 'public/favicon-32x32.png', size: 32 },
  { src: mark, out: 'public/favicon-16x16.png', size: 16 },
];

for (const { src, out, size } of sizes) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`Generated ${out}`);
}

console.log('All icons generated successfully!');
