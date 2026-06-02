// One-off icon + OG image generator for Tinubu Support Group.
// Run: node scripts/gen-icons.mjs   (sharp is already a dependency)
// Safe to delete after the generated assets are committed.
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public/assets/img/tsg_logo.png');

async function loadLogo() {
  return await sharp(SRC).png().toBuffer();
}

// Square icon: the logo cropped edge-to-edge (its own light background fills the
// tile) so there is no awkward inner box, flattened to drop transparency.
async function squareIcon(logo, size) {
  return sharp(logo)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer();
}

// Build a PNG-in-ICO container from {size, buffer} entries.
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const blobs = [];
  entries.forEach((e, i) => {
    const o = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o + 0);
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o + 1);
    dir.writeUInt8(0, o + 2); // palette
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // planes
    dir.writeUInt16LE(32, o + 6); // bpp
    dir.writeUInt32LE(e.buffer.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.buffer.length;
    blobs.push(e.buffer);
  });
  return Buffer.concat([header, dir, ...blobs]);
}

function ogSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#063d23"/>
      <stop offset="0.55" stop-color="#0a4d2e"/>
      <stop offset="1" stop-color="#0c5a36"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.18" r="0.6">
      <stop offset="0" stop-color="#c9a14a" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#c9a14a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <!-- eyebrow -->
  <rect x="80" y="92" width="48" height="5" rx="2.5" fill="#c9a14a"/>
  <text x="142" y="102" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="5" fill="#e6cf94">TINUBU SUPPORT GROUP</text>
  <!-- headline -->
  <text x="78" y="232" font-family="Georgia, 'Times New Roman', serif" font-size="80" font-weight="700" fill="#ffffff">Renewed Hope.</text>
  <text x="78" y="326" font-family="Georgia, 'Times New Roman', serif" font-size="80" font-weight="700" fill="#c9a14a">Stronger Nigeria.</text>
  <text x="80" y="392" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="#dfeee5">Join the movement for a better Nigeria.</text>
  <!-- badge ring for the logo (logo composited on top in code) -->
  <circle cx="1058" cy="288" r="116" fill="#f7f4ec"/>
  <circle cx="1058" cy="288" r="126" fill="none" stroke="#c9a14a" stroke-width="6"/>
  <!-- bottom flag rule -->
  <rect x="0" y="600" width="600" height="30" fill="#0a4d2e"/>
  <rect x="600" y="600" width="600" height="30" fill="#c9a14a"/>
  <text x="80" y="556" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" letter-spacing="2" fill="#9fc4ad">tinubusupportgroup.com</text>
</svg>`);
}

async function makeOg(logo) {
  const badge = await sharp(logo)
    .resize(176, 176, { fit: 'inside' })
    .toBuffer();
  return sharp(ogSvg())
    .composite([{ input: badge, top: 288 - 88, left: 1058 - 88 }])
    .png()
    .toBuffer();
}

async function main() {
  const logo = await loadLogo();
  await mkdir(join(ROOT, 'src/app'), { recursive: true });
  await mkdir(join(ROOT, 'public'), { recursive: true });

  const icon512 = await squareIcon(logo, 512);
  const icon192 = await squareIcon(logo, 192);
  const apple = await squareIcon(logo, 180, 0.7);
  const ico32 = await squareIcon(logo, 32, 0.84);
  const ico16 = await squareIcon(logo, 16, 0.9);
  const og = await makeOg(logo);

  await writeFile(join(ROOT, 'src/app/icon.png'), icon512);
  await writeFile(join(ROOT, 'src/app/apple-icon.png'), apple);
  await writeFile(join(ROOT, 'src/app/favicon.ico'), buildIco([
    { size: 16, buffer: ico16 },
    { size: 32, buffer: ico32 },
  ]));
  await writeFile(join(ROOT, 'public/icon-192.png'), icon192);
  await writeFile(join(ROOT, 'public/icon-512.png'), icon512);
  await writeFile(join(ROOT, 'public/og-image.png'), og);

  console.log('Generated:');
  console.log('  src/app/icon.png        512x512');
  console.log('  src/app/apple-icon.png  180x180');
  console.log('  src/app/favicon.ico     16+32');
  console.log('  public/icon-192.png     192x192');
  console.log('  public/icon-512.png     512x512');
  console.log('  public/og-image.png     1200x630');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
