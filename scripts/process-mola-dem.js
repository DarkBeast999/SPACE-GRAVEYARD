import fs from 'fs';
import path from 'path';

/**
 * process-mola-dem.js
 * 
 * Preprocessing script to fetch genuine numerical elevation samples
 * from the USGS Astrogeology Mars MGS MOLA DEM 463m product:
 * https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif
 * 
 * Samples a 2048 x 1024 grid of signed 16-bit integer elevation values (in meters),
 * converts them to a compact lossless Uint16 binary array (.u16),
 * and writes metadata with source min/max elevations, datum, and projection details.
 */

const TARGET_WIDTH = 2048;
const TARGET_HEIGHT = 1024;
const SOURCE_WIDTH = 46080;
const SOURCE_HEIGHT = 23040;
const ROW_BYTES = 92160;
const FIRST_ROW_OFFSET = 184973;
const TIFF_URL = 'https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif';

const OUT_DIR = path.resolve('src/assets/mars');
const OUT_U16 = path.join(OUT_DIR, 'mars-mola-height-2048x1024.u16');
const OUT_META = path.join(OUT_DIR, 'mars-mola-height-metadata.json');

async function fetchRow(rowIdx, retries = 3) {
  const byteOffset = FIRST_ROW_OFFSET + rowIdx * ROW_BYTES;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(TIFF_URL, {
        headers: { Range: `bytes=${byteOffset}-${byteOffset + ROW_BYTES - 1}` }
      });
      if (!res.ok && res.status !== 206) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = await res.arrayBuffer();
      return new DataView(buf);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  console.log('Starting MOLA DEM processing...');
  console.log(`Source: ${TIFF_URL}`);
  console.log(`Target: ${TARGET_WIDTH} x ${TARGET_HEIGHT} (lossless Uint16)`);

  const u16Buffer = new Uint16Array(TARGET_WIDTH * TARGET_HEIGHT);
  let minElev = Infinity;
  let maxElev = -Infinity;
  let validCount = 0;

  // Precompute source row and col indices
  const sourceRows = [];
  for (let j = 0; j < TARGET_HEIGHT; j++) {
    sourceRows.push(Math.round(j * (SOURCE_HEIGHT - 1) / (TARGET_HEIGHT - 1)));
  }

  const sourceCols = [];
  for (let i = 0; i < TARGET_WIDTH; i++) {
    sourceCols.push(Math.round(i * (SOURCE_WIDTH - 1) / (TARGET_WIDTH - 1)));
  }

  const CONCURRENCY = 8;
  let completedRows = 0;
  const startTime = Date.now();

  async function worker(rowIndices) {
    for (const j of rowIndices) {
      const srcRow = sourceRows[j];
      const rowView = await fetchRow(srcRow);
      
      for (let i = 0; i < TARGET_WIDTH; i++) {
        const srcCol = sourceCols[i];
        const elev = rowView.getInt16(srcCol * 2, true); // little-endian signed int16 (meters)
        
        if (elev !== -32768) {
          if (elev < minElev) minElev = elev;
          if (elev > maxElev) maxElev = elev;
          validCount++;
        }
        
        // Lossless mapping from signed int16 (-32768..32767) to unsigned uint16 (0..65535)
        const u16Val = elev + 32768;
        u16Buffer[j * TARGET_WIDTH + i] = u16Val;
      }

      completedRows++;
      if (completedRows % 64 === 0 || completedRows === TARGET_HEIGHT) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const percent = ((completedRows / TARGET_HEIGHT) * 100).toFixed(1);
        console.log(`Progress: ${completedRows}/${TARGET_HEIGHT} rows (${percent}%) - ${elapsed}s elapsed`);
      }
    }
  }

  // Partition rows among workers
  const tasks = Array.from({ length: CONCURRENCY }, () => []);
  for (let j = 0; j < TARGET_HEIGHT; j++) {
    tasks[j % CONCURRENCY].push(j);
  }

  await Promise.all(tasks.map(t => worker(t)));

  console.log(`\nSampling complete! Processed ${validCount} valid samples.`);
  console.log(`Min Elevation: ${minElev} m, Max Elevation: ${maxElev} m`);

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Write binary .u16 file
  const byteBuf = Buffer.from(u16Buffer.buffer);
  fs.writeFileSync(OUT_U16, byteBuf);
  console.log(`Saved binary height dataset to ${OUT_U16} (${byteBuf.length} bytes)`);

  // Write metadata
  const metadata = {
    sourceProduct: "Mars_MGS_MOLA_DEM_mosaic_global_463m",
    sourceUrl: TIFF_URL,
    description: "Numerical digital elevation model derived from Mars Global Surveyor Mars Orbiter Laser Altimeter (MOLA) observations.",
    custodian: "USGS Astrogeology Science Center / NASA Planetary Data System (PDS)",
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
    dataType: "uint16",
    byteOrder: "little-endian",
    minElevationMeters: minElev,
    maxElevationMeters: maxElev,
    elevationOffset: -32768,
    elevationScale: 1.0,
    elevationFormula: "elevationMeters = uint16Value - 32768",
    datum: "Martian Areoid (GMM-2B gravity model equipotential surface, IAU 2000 reference radius 3,396,190.0 m)",
    projection: "Equirectangular (Plate Carrée)",
    longitudeConvention: "Planetocentric, centered on Prime Meridian 0° (-180° to +180°)",
    latitudeLimits: {
      north: 90.0,
      south: -90.0
    },
    longitudeLimits: {
      west: -180.0,
      east: 180.0
    },
    rowOrientation: "North to South (Row 0 = +90°N, Row 1023 = -90°S)",
    columnOrientation: "West to East (Col 0 = -180°W, Col 1024 = 0° Prime Meridian, Col 2047 = +180°E)",
    verticalExaggerationFactor: 1.5,
    referenceRadiusKm: 3396.19,
    processingHistory: "Direct numerical downsampling from 46080x23040 signed Int16 USGS GeoTIFF via reproducible HTTP range sampling script scripts/process-mola-dem.js."
  };

  fs.writeFileSync(OUT_META, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`Saved metadata to ${OUT_META}`);
}

main().catch(err => {
  console.error('Fatal error during DEM processing:', err);
  process.exit(1);
});
