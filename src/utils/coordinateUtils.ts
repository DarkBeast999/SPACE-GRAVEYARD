/**
 * Coordinate Formatting Utilities for Space Graveyard
 * 
 * Accurately formats planetary, lunar, and heliocentric coordinates with
 * hemispheric notation (N/S for latitude, E/W for longitude) and preserves
 * precision while handling zero correctly.
 */

export interface CoordinatePair {
  lat: number;
  lon: number;
}

/**
 * Normalizes a planetary or lunar longitude into the canonical [-180, +180] degree range.
 * Properly converts East-positive 0-360 systems (e.g., Opportunity at 354.47°E -> -5.53°)
 * into standard signed hemispheric coordinates for 3D globe mapping without mutating original source data.
 */
export function normalizeLongitude(lon: number): number {
  let norm = lon % 360;
  if (norm > 180) norm -= 360;
  if (norm < -180) norm += 360;
  return norm;
}

/**
 * Format latitude into hemispheric notation:
 * - Positive latitude -> N (e.g. +10.5 -> "10.5°N")
 * - Negative latitude -> S (e.g. -10.5 -> "10.5°S", -2.994 -> "2.994°S")
 * - Zero latitude     -> "0°" (no hemisphere)
 */
export function formatLatitude(lat: number): string {
  if (lat === 0) return '0°';
  const hemi = lat > 0 ? 'N' : 'S';
  const val = Math.abs(lat);
  return `${val}°${hemi}`;
}

/**
 * Format longitude into hemispheric notation:
 * - Positive longitude -> E (e.g. +23.34 -> "23.34°E")
 * - Negative longitude -> W (e.g. -23.34 -> "23.34°W")
 * - Zero longitude     -> "0°" (no hemisphere)
 */
export function formatLongitude(lon: number): string {
  if (lon === 0) return '0°';
  const hemi = lon > 0 ? 'E' : 'W';
  const val = Math.abs(lon);
  return `${val}°${hemi}`;
}

/**
 * Format a coordinate pair into a standard string: "lat, lon"
 * e.g. { lat: -2.994, lon: -23.34 } -> "2.994°S, 23.34°W"
 * Returns null if coordinates are null or undefined.
 */
export function formatCoordinates(coords: CoordinatePair | null | undefined): string | null {
  if (!coords) return null;
  return `${formatLatitude(coords.lat)}, ${formatLongitude(coords.lon)}`;
}

/**
 * Returns a scientifically accurate semantic label for the coordinate/position type.
 * Differentiates planetary and lunar surface locations from orbital, heliocentric,
 * and interstellar positions (which do not possess surface lat/lon).
 */
export function getCoordinateSemanticLabel(
  destination: 'moon' | 'mars' | 'deep-space' | string,
  hasCoordinates: boolean
): string {
  if (!hasCoordinates) {
    if (destination === 'deep-space') return 'Interstellar / Heliocentric Domain';
    return 'Orbital / Trajectory Domain';
  }

  switch (destination) {
    case 'moon':
      return 'Lunar Surface Coordinates';
    case 'mars':
      return 'Martian Surface Coordinates';
    case 'venus':
      return 'Venusian Surface Coordinates';
    default:
      return 'Planetary Surface Coordinates';
  }
}
