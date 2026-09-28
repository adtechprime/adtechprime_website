// Generates optimised, responsive images and copies self-hosted fonts.
// Run with: npm run assets   (only needed when images in assets-src/ change)
import sharp from 'sharp';
import { mkdir, readdir, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets-src';
const IMG = 'assets/img';
const FONTS = 'assets/fonts';
const PHOTO_WIDTHS = [480, 960, 1440];

await mkdir(IMG, { recursive: true });
await mkdir(FONTS, { recursive: true });

const manifest = {};

for (const file of await readdir(SRC)) {
  const name = path.parse(file).name;
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();

  if (name.startsWith('logo')) {
    // Logos: 1x and 2x at a 220px display width.
    for (const w of [220, 440]) {
      await sharp(input).resize({ width: w }).webp({ quality: 90 }).toFile(`${IMG}/${name}-${w}.webp`);
      await sharp(input).resize({ width: w }).png({ compressionLevel: 9, palette: true }).toFile(`${IMG}/${name}-${w}.png`);
    }
    continue;
  }

  const widths = PHOTO_WIDTHS.filter((w) => w < meta.width).concat(meta.width > 1440 ? [] : [meta.width]);
  const unique = [...new Set(widths)].sort((a, b) => a - b);
  for (const w of unique) {
    const img = sharp(input).resize({ width: w });
    await img.clone().webp({ quality: 72, effort: 6 }).toFile(`${IMG}/${name}-${w}.webp`);
    await img.clone().jpeg({ quality: 74, mozjpeg: true, progressive: true }).toFile(`${IMG}/${name}-${w}.jpg`);
  }
  manifest[name] = { widths: unique, ratio: +(meta.height / meta.width).toFixed(4) };
}

// Social share image (1200×630).
await sharp(path.join(SRC, 'hero-main.jpg'))
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile('assets/og-image.jpg');

// Self-hosted variable fonts (latin subset only — keeps the payload small).
await copyFile('node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2', `${FONTS}/sora-latin.woff2`);
await copyFile('node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2', `${FONTS}/instrument-sans-latin.woff2`);

await writeFile(`${IMG}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log('Assets built:', manifest);
