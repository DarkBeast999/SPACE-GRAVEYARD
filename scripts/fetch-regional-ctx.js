import fs from 'fs';
import path from 'path';

/**
 * fetch-regional-ctx.js
 * 
 * Fetches authentic georeferenced MRO Context Camera (CTX) mosaic tiles
 * from the official USGS Astrogeology / Caltech Bruce Murray Lab service:
 * https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer
 * 
 * Target 1: Jezero Crater (Perseverance & Ingenuity) - Tile (6, 25, 91)
 * Target 2: Gale Crater (Curiosity) - Tile (6, 33, 112)
 */

const OUT_DIR = path.resolve('src/assets/mars/regional');

const JEZERO_TILE_URL = 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/6/25/91';
const GALE_TILE_URL = 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/6/33/112';

async function downloadTile(url, destPath) {
  console.log(`Downloading: ${url} -> ${destPath}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buf));
  console.log(`Saved ${destPath} (${buf.byteLength} bytes)`);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const jezeroPath = path.join(OUT_DIR, 'jezero-ctx.png');
  const galePath = path.join(OUT_DIR, 'gale-ctx.png');

  await downloadTile(JEZERO_TILE_URL, jezeroPath);
  await downloadTile(GALE_TILE_URL, galePath);

  // Remove duplicate ingenuity.jpg if present, since it shares the Jezero CTX asset with perseverance
  const ingenuityJpg = path.join(OUT_DIR, 'ingenuity.jpg');
  if (fs.existsSync(ingenuityJpg)) {
    fs.unlinkSync(ingenuityJpg);
    console.log(`Removed redundant duplicate asset: ${ingenuityJpg}`);
  }

  // Also remove old curiosity-ctx.png if present, in favor of standardized gale-ctx.png
  const oldCuriosityCtx = path.join(OUT_DIR, 'curiosity-ctx.png');
  if (fs.existsSync(oldCuriosityCtx)) {
    fs.unlinkSync(oldCuriosityCtx);
    console.log(`Replaced old curiosity-ctx.png with standardized gale-ctx.png`);
  }

  console.log('Regional CTX tiles fetched and deduplication completed.');
}

main().catch(err => {
  console.error('Error fetching regional CTX tiles:', err);
  process.exit(1);
});
