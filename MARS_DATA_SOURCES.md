# MARS DATA SOURCES & SCIENTIFIC PROVENANCE INVENTORY
## Space Graveyard — Iteration 6B.1: Mars Terrain Accuracy & Regional Surface LOD

This document catalogues the scientific datasets, planetary maps, numerical elevation models, and regional orbital reconnaissance mosaics utilized in the **SPACE GRAVEYARD — They Never Came Home** 3D Universe exploration environment.

To maintain scientific integrity, the project strictly distinguishes between:
1. **Global Optical Color Imagery** (visual surface reflection)
2. **Topographic Shaded Relief** (visual elevation shading)
3. **Numerical Elevation Data** (physical 3D terrain geometry)
4. **Geographically Registered Regional Orbital Reconnaissance** (3D surface LOD patches)

---

### 1. Global Surface Color Mosaic (Optical Texture)

- **Product Name:** `Mars_Viking_MDIM21_ClrMosaic_global_232m` (Viking Mars Digital Image Model version 2.1 Color Mosaic)
- **Publisher / Custodian:** U.S. Geological Survey (USGS) Astrogeology Science Center / NASA Planetary Data System (PDS)
- **Spacecraft / Instrument:** Viking Orbiters 1 & 2 (Visual Imaging Subsystem - VIS)
- **Primary Source URL:** [https://astrogeology.usgs.gov/search/map/mars_viking_color_mosaic](https://astrogeology.usgs.gov/search/map/mars_viking_color_mosaic)
- **Native Resolution:** 232 meters/pixel (~16 pixels/degree)
- **Deployed Raster:** $2048 \times 1024$ equirectangular JPEG texture (`src/assets/mars-viking-2048.jpg`, 389 KB)
- **Map Projection & Datum:** Simple Cylindrical (Equirectangular) projection, IAU 2000 Mars reference sphere ($R = 3,396,190.0\text{ m}$), Prime Meridian centered on $0^\circ$ longitude (Airy-0 crater in Sinus Meridiani).
- **Role in Application:** Base visual color texture (`map: marsVikingTex`).
- **License:** Public Domain (U.S. Government work).
- **Attribution:** NASA / USGS Astrogeology Science Center / JPL-Caltech.

---

### 2. Global Topographic Shaded Relief (Visual Display Layer)

- **Product Name:** `Mars_MGS_MOLA_ClrShade_merge_global_463m` (MGS MOLA Color Shaded Relief Merge)
- **Publisher / Custodian:** NASA Goddard Space Flight Center (GSFC) / USGS Astrogeology Science Center
- **Spacecraft / Instrument:** Mars Global Surveyor (MGS) / Mars Orbiter Laser Altimeter (MOLA)
- **Primary Source URL:** [https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m](https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m)
- **Native Resolution:** 463 meters/pixel (128 pixels/degree at equator)
- **Deployed Raster:** $2048 \times 1024$ equirectangular JPEG texture (`src/assets/mars-mola-topography.jpg`, 465 KB)
- **Role in Application:** Alternative visual layer ("MOLA SHADED RELIEF") selectable in the UI to visualize global altimetric gradations.
- **Note:** This raster is treated strictly as an illustrative color texture and is **NOT** used as numerical height data for geometry displacement.
- **License:** Public Domain (NASA Open Data).
- **Attribution:** NASA / GSFC / MOLA Science Team / USGS Astrogeology.

---

### 3. Numerical 3D Elevation Model (Physical Terrain Geometry)

- **Source Product:** USGS Astrogeology `Mars_MGS_MOLA_DEM_mosaic_global_463m.tif`
- **Official Product Page:** [https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m](https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m)
- **Direct Source Dataset:** `https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif` (2,125,771,142 bytes)
- **Instrument & Mission:** Mars Orbiter Laser Altimeter (MOLA), Mars Global Surveyor (MGS)
- **Native Grid:** $46,080 \times 23,040$ signed 16-bit integers (`Int16`), 128 pixels/degree, uncompressed PCM
- **Datum & Vertical Reference:** Martian Areoid (gravitational equipotential surface computed via GMM-2B gravity model, IAU 2000 reference sphere $R = 3,396,190.0\text{ m}$)
- **Preprocessing Workflow:**
  - Script: `scripts/process-mola-dem.js` (with `scripts/process-mola-dem.py` reference implementation)
  - Method: Direct HTTP range sampling across 1,024 equidistant latitude strips, downsampling each row to 2,048 samples.
  - Deployed Height Dataset: `src/assets/mars/mars-mola-height-2048x1024.u16` (4,194,304 bytes, 16-bit unsigned integers)
  - Lossless Value Mapping: $\text{elevation}_{\text{meters}} = \text{uint16Value} - 32768$ (1 integer unit = exactly 1 meter, zero floating-point quantization error)
  - Measured Dataset Range: $-8,152\text{ m}$ (Hellas Basin floor) to $+21,171\text{ m}$ (Olympus Mons caldera peak)
  - Associated Metadata: `src/assets/mars/mars-mola-height-metadata.json`
- **Three.js Geometry Construction:**
  - Constructed dynamically in `src/utils/marsElevation.ts` via `createMolaMarsGeometry()`.
  - Sphere Grid Resolution: $512 \times 256$ vertices on desktop, $256 \times 128$ on mobile.
  - Physical Radial Offset Formula:
    $$\Delta r = \left(\frac{h_{\text{km}}}{R_{\text{mars}}}\right) \times R_{\text{model}} \times \text{VE}$$
    Where $R_{\text{model}} = 12$, $R_{\text{mars}} = 3,396.19\text{ km}$, $\text{VE} = 1.5$ (documented vertical exaggeration factor).
  - Surface Normals: Computed analytically from the displaced mesh (`geometry.computeVertexNormals()`), producing genuine physical specular highlights and shadows on volcanic calderas and canyon chasms.

---

### 4. Geographically Registered Regional CTX Surface LOD (3D Globe Patches)

High-resolution orbital reconnaissance imagery is geographically registered directly onto the 3D Mars globe. When visitors zoom close to landing sites, the corresponding regional surface patch smoothly fades in over the terrain.

#### 4.1 Jezero Crater (Perseverance & Ingenuity)
- **Layer ID:** `jezero-ctx`
- **Region Name:** Jezero Crater River Delta & Nerio Airfield
- **Source Product:** USGS Astrogeology / Caltech Bruce Murray Lab `CTX_beta01_uncontrolled_5m_Caltech` (Tile Matrix Level 6, Row 25, Col 91)
- **Instrument:** Context Camera (CTX), Mars Reconnaissance Orbiter (MRO)
- **Primary Source URL:** `https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/6/25/91`
- **Native Resolution:** $6\text{ m/pixel}$ (downsampled in Level 6 tile to $\sim 325\text{ m/pixel}$)
- **Geographic Bounds:**
  - West: $75.9375^\circ\text{E}$
  - East: $78.75^\circ\text{E}$
  - South: $16.875^\circ\text{N}$
  - North: $19.6875^\circ\text{N}$
- **Landing Site Inside Bounds:** Perseverance & Ingenuity at $18.38^\circ\text{N}, 77.58^\circ\text{E}$
- **3D Implementation:** Spherical patch geometry ($32 \times 32$ grid) conforming to MOLA elevation with $+0.015$ radial bias and `polygonOffset` to prevent z-fighting.
- **Shared Mission Asset:** Both Perseverance and Ingenuity reference this single georeferenced asset (`src/assets/mars/regional/jezero-ctx.png`, 125 KB), eliminating asset duplication.
- **Attribution:** NASA / JPL-Caltech / MSSS / USGS Astrogeology / Caltech.

#### 4.2 Gale Crater (Curiosity Rover)
- **Layer ID:** `gale-ctx`
- **Region Name:** Northern Gale Crater Floor & Aeolis Mons (Mount Sharp) Slopes
- **Source Product:** USGS Astrogeology / Caltech Bruce Murray Lab `CTX_beta01_uncontrolled_5m_Caltech` (Tile Matrix Level 6, Row 33, Col 112)
- **Instrument:** Context Camera (CTX), Mars Reconnaissance Orbiter (MRO)
- **Primary Source URL:** `https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/6/33/112`
- **Native Resolution:** $6\text{ m/pixel}$ (downsampled in Level 6 tile to $\sim 325\text{ m/pixel}$)
- **Geographic Bounds:**
  - West: $135.0^\circ\text{E}$
  - East: $137.8125^\circ\text{E}$
  - South: $-5.625^\circ\text{S}$
  - North: $-2.8125^\circ\text{S}$
- **Landing Site Inside Bounds:** Curiosity (Bradbury Landing) at $-4.59^\circ\text{S}, 137.44^\circ\text{E}$
- **3D Implementation:** Spherical patch geometry ($32 \times 32$ grid) conforming to MOLA elevation.
- **Attribution:** NASA / JPL-Caltech / MSSS / USGS Astrogeology / Caltech.

---

### 5. Historical Missions & Ephemeris Provenance

1. **Cassini-Huygens (Saturn Grand Finale):**
   - **Correction:** Cassini is **not** an outbound escaping spacecraft and is excluded from the deep-space interstellar trajectory fleet.
   - **Historical Context:** Cassini concluded its 13-year Saturn orbital mission on September 15, 2017, with a deliberate, historic plunge into Saturn’s upper atmosphere (10:31 UTC entry / 11:55 UTC Earth-received signal loss).
   - **Visualization:** Represented as a historical mission event marker in the Saturn system view, clearly distinguished from active spacecraft locations, with no fabricated surface coordinates.
2. **Deep-Space Escaping Fleet:**
   - Outward trajectory lines from the Sun are rendered exclusively for genuine escaping spacecraft:
     - Voyager 1 (interstellar space, $\sim 167\text{ AU}$, Ophiuchus)
     - Voyager 2 (interstellar space, $\sim 138\text{ AU}$, Pavo)
     - Pioneer 10 (outer heliosphere, $\sim 135\text{ AU}$, Taurus)
     - Pioneer 11 (outer heliosphere, $\sim 115\text{ AU}$, Scutum)
     - New Horizons (Kuiper Belt, $\sim 60\text{ AU}$, Sagittarius)
3. **Signal Travel Simulation & Ephemeris Disclosures:**
   - Previous claims of live "JPL Horizons ephemeris" connections have been replaced with honest scientific disclosures:
     - Distances are approximate historical and astronomical reference values.
     - One-way light-travel times are educational derivations calculated via $t = d / c$.
     - Inactive spacecraft (Pioneer 10, Pioneer 11, Cassini) display an explicit alert banner: `MISSION CONCLUDED // NO OPERATIONAL RECEIVER`.

---

### 6. Offline Self-Containment

- All planetary textures, MOLA elevation data, and regional CTX reconnaissance tiles are bundled directly into the compiled standalone single-file distribution ([`SPACE_GRAVEYARD.html`](file:///d:/VSCODE/Space%20Program/SPACE_GRAVEYARD.html)).
- Zero external runtime network requests are executed during exploration.
