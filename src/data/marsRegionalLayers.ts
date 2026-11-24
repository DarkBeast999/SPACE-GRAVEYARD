import jezeroCtx from '../assets/mars/regional/jezero-ctx.png';
import galeCtx from '../assets/mars/regional/gale-ctx.png';
import regionalOpportunity from '../assets/mars/regional/opportunity.jpg';
import regionalSpirit from '../assets/mars/regional/spirit.jpg';
import regionalViking1 from '../assets/mars/regional/viking-1.jpg';
import regionalViking2 from '../assets/mars/regional/viking-2.jpg';
import regionalPathfinder from '../assets/mars/regional/pathfinder.jpg';
import regionalPhoenix from '../assets/mars/regional/phoenix.jpg';
import regionalInsight from '../assets/mars/regional/insight.jpg';

export interface RegionalMarsLayer {
  id: string;
  name: string;
  imageAsset: string;
  source: string;
  productId: string;
  instrument: string;
  nativeResolutionMetersPerPixel: number;
  processedResolutionMetersPerPixel: number;
  projection: string;
  bounds: {
    west: number;
    east: number;
    south: number;
    north: number;
  };
  attribution: string;
  isGeoreferenced: boolean;
  associatedArtifactIds: string[];
  description: string;
}

export const REGIONAL_MARS_LAYERS: Record<string, RegionalMarsLayer> = {
  'jezero-ctx': {
    id: 'jezero-ctx',
    name: 'Jezero Crater River Delta & Crater Rim',
    imageAsset: jezeroCtx,
    source: 'USGS Astrogeology / Caltech Bruce Murray Laboratory',
    productId: 'CTX_beta01_uncontrolled_5m_Caltech / Tile (Level 6, Row 25, Col 91)',
    instrument: 'Context Camera (CTX), Mars Reconnaissance Orbiter (MRO)',
    nativeResolutionMetersPerPixel: 6,
    processedResolutionMetersPerPixel: 325,
    projection: 'Equirectangular (GCS_Mars_2000_Sphere, IAU 2000)',
    bounds: {
      west: 75.9375,
      east: 78.75,
      south: 16.875,
      north: 19.6875,
    },
    attribution: 'NASA / JPL-Caltech / MSSS / USGS Astrogeology / Caltech',
    isGeoreferenced: true,
    associatedArtifactIds: ['perseverance', 'ingenuity', 'jezero-crater'],
    description:
      'High-resolution orbital Context Camera reconnaissance mosaic covering the ancient Jezero Crater lake basin, its fan delta sediments, and the landing ellipses of Perseverance and Ingenuity.',
  },
  'gale-ctx': {
    id: 'gale-ctx',
    name: 'Gale Crater Floor & Mount Sharp Slopes',
    imageAsset: galeCtx,
    source: 'USGS Astrogeology / Caltech Bruce Murray Laboratory',
    productId: 'CTX_beta01_uncontrolled_5m_Caltech / Tile (Level 6, Row 33, Col 112)',
    instrument: 'Context Camera (CTX), Mars Reconnaissance Orbiter (MRO)',
    nativeResolutionMetersPerPixel: 6,
    processedResolutionMetersPerPixel: 325,
    projection: 'Equirectangular (GCS_Mars_2000_Sphere, IAU 2000)',
    bounds: {
      west: 135.0,
      east: 137.8125,
      south: -5.625,
      north: -2.8125,
    },
    attribution: 'NASA / JPL-Caltech / MSSS / USGS Astrogeology / Caltech',
    isGeoreferenced: true,
    associatedArtifactIds: ['curiosity', 'gale-crater'],
    description:
      'High-resolution orbital Context Camera reconnaissance mosaic of northern Gale Crater, showing the Bradbury Landing zone and the lower sedimentary stratification of Aeolis Mons (Mount Sharp).',
  },
  opportunity: {
    id: 'opportunity',
    name: 'Meridiani Planum (Eagle & Endurance Craters)',
    imageAsset: regionalOpportunity,
    source: 'NASA Viking Orbiter MDIM 2.1 / MRO CTX Preview',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_regional_preview',
    instrument: 'Viking Visual Imaging Subsystem (VIS) / MRO CTX Context',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 350.0,
      east: 358.0,
      south: -4.0,
      north: 0.0,
    },
    attribution: 'NASA / USGS Astrogeology / JPL',
    isGeoreferenced: false,
    associatedArtifactIds: ['opportunity', 'meridiani-planum'],
    description: 'Regional surface overview of the smooth hematite-rich plains of Sinus Meridiani.',
  },
  spirit: {
    id: 'spirit',
    name: 'Gusev Crater & Columbia Hills',
    imageAsset: regionalSpirit,
    source: 'NASA Viking Orbiter MDIM 2.1 / MRO CTX Preview',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_regional_preview',
    instrument: 'Viking Visual Imaging Subsystem (VIS) / MRO CTX Context',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 172.0,
      east: 178.0,
      south: -16.0,
      north: -12.0,
    },
    attribution: 'NASA / USGS Astrogeology / JPL',
    isGeoreferenced: false,
    associatedArtifactIds: ['spirit', 'gusev-crater'],
    description: 'Regional surface overview of Gusev Crater and the Columbia Hills exploration route.',
  },
  'viking-1': {
    id: 'viking-1',
    name: 'Chryse Planitia (Plains of Gold)',
    imageAsset: regionalViking1,
    source: 'NASA Viking Orbiter MDIM 2.1',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    instrument: 'Viking Orbiter Visual Imaging Subsystem (VIS)',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 305.0,
      east: 320.0,
      south: 18.0,
      north: 26.0,
    },
    attribution: 'NASA / USGS Astrogeology',
    isGeoreferenced: false,
    associatedArtifactIds: ['viking-1'],
    description: 'Regional visual mosaic of Chryse Planitia, landing site of Viking 1 in July 1976.',
  },
  'viking-2': {
    id: 'viking-2',
    name: 'Utopia Planitia (Northern Lowlands)',
    imageAsset: regionalViking2,
    source: 'NASA Viking Orbiter MDIM 2.1',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    instrument: 'Viking Orbiter Visual Imaging Subsystem (VIS)',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 128.0,
      east: 140.0,
      south: 44.0,
      north: 52.0,
    },
    attribution: 'NASA / USGS Astrogeology',
    isGeoreferenced: false,
    associatedArtifactIds: ['viking-2'],
    description: 'Regional visual mosaic of the rock-strewn plains of Utopia Planitia.',
  },
  pathfinder: {
    id: 'pathfinder',
    name: 'Ares Vallis Floodplain',
    imageAsset: regionalPathfinder,
    source: 'NASA Viking Orbiter MDIM 2.1 / MRO CTX Preview',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_regional_preview',
    instrument: 'Viking Visual Imaging Subsystem (VIS)',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 322.0,
      east: 330.0,
      south: 16.0,
      north: 22.0,
    },
    attribution: 'NASA / USGS Astrogeology / JPL',
    isGeoreferenced: false,
    associatedArtifactIds: ['pathfinder'],
    description: 'Outflow channel deposition fan where Mars Pathfinder and Sojourner landed in 1997.',
  },
  phoenix: {
    id: 'phoenix',
    name: 'Green Valley (Vastitas Borealis Arctic Plain)',
    imageAsset: regionalPhoenix,
    source: 'NASA Viking Orbiter MDIM 2.1 / MRO CTX Preview',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_regional_preview',
    instrument: 'Viking Visual Imaging Subsystem (VIS)',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 230.0,
      east: 240.0,
      south: 65.0,
      north: 72.0,
    },
    attribution: 'NASA / USGS Astrogeology / University of Arizona',
    isGeoreferenced: false,
    associatedArtifactIds: ['phoenix'],
    description: 'Martian arctic permafrost plain where Phoenix discovered subsurface water ice.',
  },
  insight: {
    id: 'insight',
    name: 'Elysium Planitia Seismic Plains',
    imageAsset: regionalInsight,
    source: 'NASA Viking Orbiter MDIM 2.1 / MRO CTX Preview',
    productId: 'Mars_Viking_MDIM21_ClrMosaic_regional_preview',
    instrument: 'Viking Visual Imaging Subsystem (VIS)',
    nativeResolutionMetersPerPixel: 232,
    processedResolutionMetersPerPixel: 232,
    projection: 'Equirectangular Preview',
    bounds: {
      west: 130.0,
      east: 140.0,
      south: 0.0,
      north: 8.0,
    },
    attribution: 'NASA / USGS Astrogeology / CNES / DLR',
    isGeoreferenced: false,
    associatedArtifactIds: ['insight'],
    description: 'Smooth, featureless volcanic plains selected for InSight’s ultra-sensitive seismometer.',
  },
};

/**
 * Returns the regional Mars layer associated with a specific artifact ID or site ID.
 * Defaults to null if none exists.
 */
export function getRegionalMarsLayer(id: string): RegionalMarsLayer | null {
  if (!id) return null;
  const targetId = id.toLowerCase().trim();

  // Check direct ID
  if (REGIONAL_MARS_LAYERS[targetId]) {
    return REGIONAL_MARS_LAYERS[targetId];
  }

  // Check associatedArtifactIds
  for (const layer of Object.values(REGIONAL_MARS_LAYERS)) {
    if (layer.associatedArtifactIds.includes(targetId)) {
      return layer;
    }
  }

  return null;
}
