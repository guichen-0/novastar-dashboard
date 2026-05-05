const NOAA_BASE = "https://services.swpc.noaa.gov";

const cache = new Map<string, { data: unknown; timestamp: number }>();

function withCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return Promise.resolve(cached.data as T);
  }
  return fetcher().then((data) => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

export interface KpEntry {
  time_tag: string;
  kp_index: number;
  source: string;
}

export interface SolarWindEntry {
  time_tag: string;
  density: number;
  speed: number;
  temperature: number;
}

export interface MagEntry {
  time_tag: string;
  bx_gsm: number;
  by_gsm: number;
  bz_gsm: number;
  bt: number;
}

export interface XrayEntry {
  time_tag: string;
  flux: string;
}

export interface SpaceWeatherEvent {
  eventTime: string;
  eventType: string;
  sourceLocation: string;
  instruments: { displayName: string }[];
  link: string;
}

export async function fetchKpIndex(): Promise<KpEntry[]> {
  return withCache("kp", 5 * 60 * 1000, async () => {
    const res = await fetch(`${NOAA_BASE}/products/noaa-planetary-k-index.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Kp fetch failed: ${res.status}`);
    const data = await res.json();
    return data.slice(-24);
  });
}

export async function fetchKpForecast(): Promise<KpEntry[]> {
  return withCache("kp-forecast", 30 * 60 * 1000, async () => {
    const res = await fetch(
      `${NOAA_BASE}/products/noaa-planetary-k-index-forecast.json`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error(`Kp forecast fetch failed: ${res.status}`);
    return res.json();
  });
}

export async function fetchSolarWind(): Promise<SolarWindEntry[]> {
  return withCache("solar-wind", 60 * 1000, async () => {
    const res = await fetch(
      `${NOAA_BASE}/products/solar-wind/plasma-7-day.json`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`Solar wind fetch failed: ${res.status}`);
    const data = await res.json();
    return data
      .filter((e: SolarWindEntry) => e.speed > 0)
      .slice(-100);
  });
}

export async function fetchMagData(): Promise<MagEntry[]> {
  return withCache("mag", 60 * 1000, async () => {
    const res = await fetch(
      `${NOAA_BASE}/products/solar-wind/mag-7-day.json`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`Mag fetch failed: ${res.status}`);
    const data = await res.json();
    return data
      .filter((e: MagEntry) => e.bt > 0)
      .slice(-100);
  });
}

export async function fetchXrayFlux(): Promise<XrayEntry[]> {
  return withCache("xray", 60 * 1000, async () => {
    const res = await fetch(`${NOAA_BASE}/products/xray-7-day.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Xray fetch failed: ${res.status}`);
    const data = await res.json();
    return data.slice(-200);
  });
}

export async function fetchSpaceWeatherEvents(): Promise<SpaceWeatherEvent[]> {
  return withCache("events", 10 * 60 * 1000, async () => {
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().split("T")[0].replace(/-/g, "-");

    const res = await fetch(
      `${NOAA_BASE}/data/donki/notifications?startDate=${fmt(startDate)}&endDate=${fmt(now)}&type=all`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
    return res.json();
  });
}
