import * as satellite from "satellite.js";

const EARTH_RADIUS_KM = 6371;

export interface SatelliteData {
  name: string;
  noradId: number;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  orbitClass: "LEO" | "MEO" | "GEO" | "HEO";
  tleLine1: string;
  tleLine2: string;
}

export interface OrbitPoint {
  lat: number;
  lng: number;
  alt: number;
}

export interface EcefPoint {
  x: number;
  y: number;
  z: number;
}

const CELESTRAK_BASE = "https://celestrak.org/NORAD/elements/gp.php";

const CACHE = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchSatelliteTLE(
  group: string = "stations"
): Promise<string> {
  const cacheKey = `tle-${group}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as string;
  }

  const url = `${CELESTRAK_BASE}?GROUP=${group}&FORMAT=tle`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`CelesTrak fetch failed: ${res.status}`);
  }

  const text = await res.text();
  CACHE.set(cacheKey, { data: text, timestamp: Date.now() });
  return text;
}

function classifyOrbit(altitude: number, eccentricity: number): SatelliteData["orbitClass"] {
  if (eccentricity > 0.25) return "HEO";
  if (altitude > 35000) return "GEO";
  if (altitude > 2000) return "MEO";
  return "LEO";
}

function propagateSatellite(
  satrec: satellite.SatRec,
  date: Date
): { position: satellite.EciVec3<number>; velocity: satellite.EciVec3<number> } | null {
  const result = satellite.propagate(satrec, date);

  if (!result || typeof result === "boolean") return null;

  const pos = result.position as satellite.EciVec3<number> | false | undefined;
  const vel = result.velocity as satellite.EciVec3<number> | false | undefined;

  if (!pos || typeof pos !== "object" || !vel || typeof vel !== "object") return null;
  if (typeof pos.x !== "number" || typeof pos.y !== "number" || typeof pos.z !== "number") return null;

  return { position: pos, velocity: vel };
}

export function computePositions(
  tleText: string,
  date: Date = new Date()
): SatelliteData[] {
  const lines = tleText
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const satellites: SatelliteData[] = [];

  for (let i = 0; i < lines.length - 1; i += 2) {
    const line1 = lines[i];
    const line2 = lines[i + 1];
    if (!line1 || !line2 || !line1.startsWith("1 ") || !line2.startsWith("2 ")) continue;

    try {
      const satrec = satellite.twoline2satrec(line1, line2);
      const result = propagateSatellite(satrec, date);
      if (!result) continue;

      const gmst = satellite.gstime(date);
      const geodetic = satellite.eciToGeodetic(result.position, gmst);

      const lat = satellite.radiansToDegrees(geodetic.latitude);
      const lng = satellite.radiansToDegrees(geodetic.longitude);
      const alt = geodetic.height;

      const speed = Math.sqrt(
        result.velocity.x ** 2 +
        result.velocity.y ** 2 +
        result.velocity.z ** 2
      );

      const name = line1.substring(2, 7).trim();

      satellites.push({
        name,
        noradId: parseInt(satrec.satnum as unknown as string, 10),
        lat,
        lng,
        altitude: alt,
        velocity: speed,
        orbitClass: classifyOrbit(alt, satrec.ecco),
        tleLine1: line1,
        tleLine2: line2,
      });
    } catch {
      continue;
    }
  }

  return satellites;
}

function eciToEcef(
  pos: satellite.EciVec3<number>,
  gmst: number
): { x: number; y: number; z: number } {
  const cosG = Math.cos(gmst);
  const sinG = Math.sin(gmst);
  return {
    x: cosG * pos.x + sinG * pos.y,
    y: -sinG * pos.x + cosG * pos.y,
    z: pos.z,
  };
}

export function computeOrbitPath(
  line1: string,
  line2: string,
  sampleCount: number = 128
): EcefPoint[] {
  const satrec = satellite.twoline2satrec(line1, line2);

  if (satrec.error > 0) return [];

  const period = (2 * Math.PI) / satrec.no;
  if (!isFinite(period) || period <= 0) return [];

  const now = new Date();
  const gmst = satellite.gstime(now);
  const scale = 1 / EARTH_RADIUS_KM;

  // Propagate all samples and convert to ECEF at a single reference time (now).
  // Using the same GMST for every point ensures the orbit closes properly.
  const rawPoints: (EcefPoint | null)[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = new Date(now.getTime() + (i / sampleCount) * period * 60 * 1000);
    const result = propagateSatellite(satrec, t);
    if (!result) {
      rawPoints.push(null);
      continue;
    }

    const ecef = eciToEcef(result.position, gmst);

    rawPoints.push({
      x: ecef.x * scale,
      y: ecef.z * scale,
      z: -ecef.y * scale,
    });
  }

  // Fill gaps by interpolating between valid neighbors
  const points: EcefPoint[] = [];
  for (let i = 0; i < rawPoints.length; i++) {
    if (rawPoints[i]) {
      points.push(rawPoints[i]!);
      continue;
    }
    let prev = -1, next = -1;
    for (let j = i - 1; j >= 0; j--) { if (rawPoints[j]) { prev = j; break; } }
    for (let j = i + 1; j < rawPoints.length; j++) { if (rawPoints[j]) { next = j; break; } }
    if (prev >= 0 && next >= 0) {
      const t = (i - prev) / (next - prev);
      const a = rawPoints[prev]!, b = rawPoints[next]!;
      points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
    } else if (prev >= 0) {
      points.push(rawPoints[prev]!);
    } else if (next >= 0) {
      points.push(rawPoints[next]!);
    }
  }

  return points;
}

export function computeCurrentPosition(
  line1: string,
  line2: string
): OrbitPoint | null {
  const satrec = satellite.twoline2satrec(line1, line2);
  if (satrec.error > 0) return null;

  const now = new Date();
  const result = propagateSatellite(satrec, now);
  if (!result) return null;

  const geodetic = satellite.eciToGeodetic(result.position, satellite.gstime(now));
  return {
    lat: satellite.radiansToDegrees(geodetic.latitude),
    lng: satellite.radiansToDegrees(geodetic.longitude),
    alt: geodetic.height,
  };
}

export function latLngAltToEcef(
  lat: number,
  lng: number,
  alt: number
): { x: number; y: number; z: number } {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const r = (EARTH_RADIUS_KM + alt) / 6371;

  return {
    x: r * Math.cos(latRad) * Math.cos(lngRad),
    y: r * Math.sin(latRad),
    z: r * Math.cos(latRad) * Math.sin(lngRad),
  };
}
