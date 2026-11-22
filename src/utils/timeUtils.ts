import type { SilenceDuration, SignalDelay } from '../types';

export function formatSilenceDuration(lastContact: string): SilenceDuration {
  const last = new Date(lastContact).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - last);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function formatMissionDuration(start: string, end: string | null): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.floor(diffMs / 86400000);
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;

  if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  }
  return `${days} day${days !== 1 ? 's' : ''}`;
}

// ─── Voyager Ephemeris Model ─────────────────────────────────────────────────
// METHODOLOGY: Linear extrapolation from a JPL Horizons baseline epoch.
//   d(t) = d₀ + v × Δt   where Δt = current UTC − reference epoch
// This is an ESTIMATE. It is NOT live telemetry. Actual spacecraft trajectories
// include heliocentric gravity deceleration; cruise velocities vary slightly over
// time. The linear model introduces a small accumulating error (~0.1% per decade).
//
// REFERENCE SOURCE: NASA/JPL Horizons System ephemeris data.
//   https://ssd.jpl.nasa.gov/horizons/
//
// VOYAGER 1 baseline:
//   Epoch : 2024-11-01T00:00:00Z
//   d₀    : ~24.37 billion km from Sun (≈ 162.9 AU)
//   v     : ~16.9995 km/s (derived from Horizons avg over 2023–2024)
//   Source: NASA JPL Horizons; NASA Voyager mission page (Nov 2024 estimate)
//
// VOYAGER 2 baseline:
//   Epoch : 2024-11-01T00:00:00Z
//   d₀    : ~20.72 billion km from Sun (≈ 138.5 AU)
//   v     : ~15.3908 km/s (derived from Horizons avg over 2023–2024)
//   Source: NASA JPL Horizons; NASA Voyager mission page (Nov 2024 estimate)
//
// NOTE ON ACCURACY: Voyager 1 is confirmed to be in interstellar space (crossed
// heliopause ~2012). Voyager 2 crossed the heliopause in December 2018.
// Interstellar medium drag is negligible; linear extrapolation is a good
// approximation over the timescales shown here.
// ─────────────────────────────────────────────────────────────────────────────

export const VOYAGER1_EPHEMERIS = {
  refKm: 24_370_000_000,
  refDate: new Date('2024-11-01T00:00:00Z').getTime(),
  speedKmS: 16.9995,
  refAu: 162.9,
  epochLabel: '2024-11-01 (JPL Horizons)',
  source: 'NASA/JPL Horizons System · science.nasa.gov/mission/voyager',
};

export const VOYAGER2_EPHEMERIS = {
  refKm: 20_720_000_000,
  refDate: new Date('2024-11-01T00:00:00Z').getTime(),
  speedKmS: 15.3908,
  refAu: 138.5,
  epochLabel: '2024-11-01 (JPL Horizons)',
  source: 'NASA/JPL Horizons System · science.nasa.gov/mission/voyager',
};

export function getVoyager1Distance(): number {
  const elapsedSeconds = (Date.now() - VOYAGER1_EPHEMERIS.refDate) / 1000;
  return VOYAGER1_EPHEMERIS.refKm + elapsedSeconds * VOYAGER1_EPHEMERIS.speedKmS;
}

export function getVoyager2Distance(): number {
  const elapsedSeconds = (Date.now() - VOYAGER2_EPHEMERIS.refDate) / 1000;
  return VOYAGER2_EPHEMERIS.refKm + elapsedSeconds * VOYAGER2_EPHEMERIS.speedKmS;
}

// Speed of light: 299,792.458 km/s
const SPEED_OF_LIGHT_KM_S = 299_792.458;

export function getSignalDelay(distanceKm: number): SignalDelay {
  const totalSeconds = distanceKm / SPEED_OF_LIGHT_KM_S;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { hours, minutes, seconds, totalSeconds };
}

export function formatLiveCounter(startDate: string): string {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  const diffMs = now - start;
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function formatDistanceKm(km: number): string {
  if (km >= 1_000_000_000) {
    return `${(km / 1_000_000_000).toFixed(3)} billion km`;
  }
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(2)} million km`;
  }
  return `${km.toLocaleString()} km`;
}
