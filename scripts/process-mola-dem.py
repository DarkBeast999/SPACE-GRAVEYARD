#!/usr/bin/env python3
"""
scripts/process-mola-dem.py

Reference GDAL / Rasterio Python workflow for processing the USGS Astrogeology
Mars MGS MOLA DEM 463m product into a compact 2048x1024 16-bit numerical elevation dataset.

Usage (in an environment with GDAL / Rasterio installed):
    python scripts/process-mola-dem.py
"""

import os
import json
import numpy as np

# Source USGS Astrogeology MOLA DEM product
SOURCE_URL = "/vsicurl/https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif"
OUT_DIR = "src/assets/mars"
OUT_U16 = os.path.join(OUT_DIR, "mars-mola-height-2048x1024.u16")
OUT_META = os.path.join(OUT_DIR, "mars-mola-height-metadata.json")

def process_dem():
    try:
        import rasterio
        from rasterio.enums import Resampling
    except ImportError:
        print("Rasterio not installed. For native execution, use node scripts/process-mola-dem.js")
        return

    print(f"Opening source DEM: {SOURCE_URL}")
    with rasterio.open(SOURCE_URL) as src:
        # Resample to 2048 x 1024 using bilinear interpolation
        data = src.read(
            1,
            out_shape=(1024, 2048),
            resampling=Resampling.bilinear
        )

        valid_mask = data != -32768
        min_elev = float(np.min(data[valid_mask]))
        max_elev = float(np.max(data[valid_mask]))

        print(f"Min elevation: {min_elev} m, Max elevation: {max_elev} m")

        # Map signed int16 (-32768..32767) to uint16 (0..65535)
        u16_data = (data.astype(np.int32) + 32768).astype(np.uint16)

        os.makedirs(OUT_DIR, exist_ok=True)
        u16_data.tofile(OUT_U16)
        print(f"Wrote binary height data to {OUT_U16}")

        meta = {
            "sourceProduct": "Mars_MGS_MOLA_DEM_mosaic_global_463m",
            "sourceUrl": "https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif",
            "width": 2048,
            "height": 1024,
            "dataType": "uint16",
            "byteOrder": "little-endian",
            "minElevationMeters": min_elev,
            "maxElevationMeters": max_elev,
            "elevationOffset": -32768,
            "elevationScale": 1.0,
            "elevationFormula": "elevationMeters = uint16Value - 32768",
            "datum": "Martian Areoid (GMM-2B gravity model equipotential surface, IAU 2000 reference radius 3,396,190.0 m)",
            "projection": "Equirectangular (Plate Carrée)",
            "verticalExaggerationFactor": 1.5,
            "referenceRadiusKm": 3396.19
        }

        with open(OUT_META, "w") as f:
            json.dump(meta, f, indent=2)
        print(f"Wrote metadata to {OUT_META}")

if __name__ == "__main__":
    process_dem()
