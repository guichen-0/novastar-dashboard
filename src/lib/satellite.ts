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
  if (typeof result === "boolean" || !result.position) return null;

  const position = result.position as satellite.EciVec3<number>;
  const velocity = result.velocity as satellite.EciVec3<number>;

  if (!velocity) return null;

  return { position, velocity };
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

export function computeOrbitPath(
  line1: string,
  line2: string,
  sampleCount: number = 128
): OrbitPoint[] {
  const satrec = satellite.twoline2satrec(line1, line2);
  const period = (2 * Math.PI) / satrec.no * 1440;
  const now = new Date();
  const gmst = satellite.gstime(now);

  const points: OrbitPoint[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = new Date(now.getTime() + (i / sampleCount) * period * 60 * 1000);
    const result = propagateSatellite(satrec, t);
    if (!result) continue;

    const geodetic = satellite.eciToGeodetic(result.position, satellite.gstime(t));
    points.push({
      lat: satellite.radiansToDegrees(geodetic.latitude),
      lng: satellite.radiansToDegrees(geodetic.longitude),
      alt: geodetic.height,
    });
  }

  return points;
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
