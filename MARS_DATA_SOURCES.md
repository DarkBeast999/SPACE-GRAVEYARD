# MARS DATA SOURCES & SCIENTIFIC PROVENANCE INVENTORY
## Space Graveyard — Iteration 6B: Realistic Planetary Exploration

This document catalogues the scientific datasets, planetary maps, elevation models, and regional orbital reconnaissance mosaics utilized in the **SPACE GRAVEYARD — They Never Came Home** 3D Universe exploration environment.

---

### 1. Global Mars Surface Color Mosaic

- **Product Name:** `Mars_Viking_MDIM21_ClrMosaic_global_232m` (Viking Mars Digital Image Model version 2.1 Color Mosaic)
- **Publisher / Provider:** U.S. Geological Survey (USGS) Astrogeology Science Center / NASA Planetary Data System (PDS)
- **Spacecraft / Instrument:** Viking Orbiters 1 & 2 (Visual Imaging Subsystem - VIS)
- **Primary Source URL:** [https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars) / [https://astrogeology.usgs.gov/search/map/mars_viking_color_mosaic](https://astrogeology.usgs.gov/search/map/mars_viking_color_mosaic)
- **Native Resolution:** 232 meters/pixel (~16 pixels/degree)
- **Deployed Resolution:** $2048 \times 1024$ equirectangular raster (processed to balance optimal 60fps WebGL rendering across mobile and desktop environments with zero external runtime network requests)
- **Map Projection & Datum:** Simple Cylindrical (Equirectangular) projection, IAU 2000 Mars sphere, Prime Meridian centered on $0^\circ$ longitude (Airy-0 crater in Sinus Meridiani)
- **Processing Performed:** 32 individual Level 2 WMTS tiles ($256 \times 256$) were fetched, seamlessly stitched, color-calibrated, and compressed into an optimized progressive JPEG asset bundled directly into the standalone distribution.
- **License / Terms of Use:** Public Domain (U.S. Government work)
- **Attribution:** NASA / USGS Astrogeology Science Center / JPL-Caltech

---

### 2. Global Mars Topography & 3D Terrain Relief

- **Product Name:** `Mars_MGS_MOLA_ClrShade_merge_global_463m` (MGS MOLA Global Color Hillshade & Digital Elevation Model Merge)
- **Publisher / Provider:** NASA Goddard Space Flight Center (GSFC) / USGS Astrogeology Science Center
- **Spacecraft / Instrument:** Mars Global Surveyor (MGS) / Mars Orbiter Laser Altimeter (MOLA)
- **Primary Source URL:** [https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m](https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m) / [https://trek.nasa.gov/mars/](https://trek.nasa.gov/mars/)
- **Native Resolution:** 463 meters/pixel (128 pixels/degree at equator)
- **Deployed Resolution:** $2048 \times 1024$ equirectangular raster
- **Map Projection & Coordinate Frame:** Equirectangular, Mars Areoid Datum ($0\text{ km}$ elevation reference corresponding to average atmospheric pressure of $6.1\text{ mbar}$)
- **Topographic Range:** $-8,200\text{ m}$ (Hellas Planitia floor) to $+21,229\text{ m}$ (Olympus Mons summit caldera)
- **Vertical Relief & Exaggeration Factor:** Applied as a scalar displacement map on a $128 \times 128$ vertex sphere mesh with an intentional **$1.5\times$ vertical exaggeration factor** to ensure prominent planetary landforms (Olympus Mons, Tharsis Montes, Valles Marineris, Hellas Basin) are perceptible from orbital vantage points without distorting planetary sphericity.
- **License / Terms of Use:** Public Domain (NASA / GSFC)
- **Attribution:** NASA / GSFC / MOLA Science Team / USGS Astrogeology

---

### 3. Regional Landing-Site Reconnaissance Mosaics

| Landing Site | Exploration Target | Primary Instrument / Product | Resolution | Geographic Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **Jezero Crater** | Perseverance & Ingenuity | MRO CTX (`JEZ_ctx_B_soc_008_orthoMosaic_6m`) | $6\text{ m/px}$ | River delta and Nerio Airfield ($18.44^\circ\text{N}, 77.45^\circ\text{E}$) |
| **Gale Crater** | Curiosity Rover | MRO CTX (`curiosity_ctx_mosaic`) | $6\text{ m/px}$ | Mount Sharp (Aeolis Mons) lakebed mudstones ($-4.59^\circ\text{S}, 137.44^\circ\text{E}$) |
| **Gusev Crater** | Spirit Rover | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | Columbia Hills hydrothermal silica deposit ($-14.57^\circ\text{S}, 175.48^\circ\text{E}$) |
| **Meridiani Planum** | Opportunity Rover | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | Endurance & Santa Maria craters ($-1.95^\circ\text{S}, -5.53^\circ\text{W}$) |
| **Chryse Planitia** | Viking 1 Lander | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | First successful Mars surface landing ($22.27^\circ\text{N}, -47.97^\circ\text{W}$) |
| **Utopia Planitia** | Viking 2 Lander | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | Northern rock-strewn plain ($47.97^\circ\text{N}, -134.26^\circ\text{W}$) |
| **Ares Vallis** | Mars Pathfinder & Sojourner | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | Catastrophic ancient outflow channel ($19.33^\circ\text{N}, -33.56^\circ\text{W}$) |
| **Vastitas Borealis** | Phoenix Lander | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | Arctic permafrost ice-soil boundary ($68.22^\circ\text{N}, -125.74^\circ\text{W}$) |
| **Elysium Planitia** | InSight Lander | NASA Viking MDIM 2.1 Regional Tile | $232\text{ m/px}$ | Smooth volcanic plain for seismometer ($4.50^\circ\text{N}, 135.62^\circ\text{E}$) |

- **Attribution:** NASA / JPL-Caltech / Malin Space Science Systems (MSSS) / USGS

---

### 4. Major Planetary Landmarks Reference

All geological feature coordinates and elevation metrics are cross-checked against the **IAU Gazetteer of Planetary Nomenclature**:

1. **Olympus Mons:** $18.65^\circ\text{N}, 226.20^\circ\text{E}$ ($-133.80^\circ\text{W}$), Peak Elevation $+21.9\text{ km}$
2. **Valles Marineris:** $13.90^\circ\text{S}, 300.80^\circ\text{E}$ ($-59.20^\circ\text{W}$), Canyon Floor Depth down to $-7.0\text{ km}$
3. **Hellas Planitia:** $42.40^\circ\text{S}, 70.50^\circ\text{E}$, Basin Floor $-7.15\text{ km}$
4. **Tharsis Montes:** $2.80^\circ\text{N}, 247.20^\circ\text{E}$ ($-112.80^\circ\text{W}$), Regional Elevation $\sim +15.0\text{ km}$
5. **Gale Crater:** $5.37^\circ\text{S}, 137.44^\circ\text{E}$, Basin Floor $-4.5\text{ km}$
6. **Jezero Crater:** $18.38^\circ\text{N}, 77.58^\circ\text{E}$, Basin Floor $-2.5\text{ km}$
7. **Gusev Crater:** $14.57^\circ\text{S}, 175.48^\circ\text{E}$, Basin Floor $-1.9\text{ km}$
8. **Meridiani Planum:** $0.20^\circ\text{N}, 357.50^\circ\text{E}$ ($-2.50^\circ\text{W}$), Regional Elevation $-1.4\text{ km}$

---

### 5. Procedural Texture Provenance Disclosures

To prevent scientific misattribution, procedural models used for other planets in the Solar System are explicitly catalogued as non-photographic illustrative models:

- **Mercury:** Procedural illustrative model generated via Canvas2D informed by crater distribution and lobate scarps documented by NASA's MESSENGER mission. Not a spacecraft image or scientific surface mosaic.
- **Venus:** Procedural illustrative atmospheric model depicting sulfuric acid cloud decks documented by Pioneer Venus and Magellan radar mapping.
- **Jupiter:** Procedural illustrative cloud band model depicting zonal cloud belts and the Great Red Spot anticyclone informed by NASA Juno and Cassini observations.
- **Saturn & Rings:** Procedural illustrative model depicting atmospheric bands and the Cassini Division gap informed by Voyager and Cassini imagery.
- **Deep Space Fleet:** Trajectories are educational schematic representations based on JPL Horizons ephemerides. Pioneer 10, Pioneer 11, and Cassini are clearly noted as inactive/concluded missions with no operational receiver.
