"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ── Simplified continent outlines (lon, lat) ──────────────────── */
const CONTINENTS: [number, number][][] = [
  // North America
  [
    [-130, 55], [-125, 60], [-120, 62], [-110, 65], [-100, 68],
    [-85, 70], [-75, 62], [-65, 60], [-55, 52], [-60, 47],
    [-67, 44], [-70, 42], [-75, 35], [-80, 32], [-82, 25],
    [-90, 20], [-95, 18], [-105, 20], [-115, 30], [-120, 34],
    [-125, 42], [-130, 55],
  ],
  // South America
  [
    [-80, 10], [-75, 5], [-70, 2], [-60, -3], [-50, -2],
    [-45, -5], [-38, -8], [-35, -12], [-38, -18], [-42, -22],
    [-48, -28], [-52, -32], [-58, -38], [-65, -42], [-70, -48],
    [-72, -52], [-75, -50], [-74, -45], [-72, -38], [-70, -30],
    [-72, -20], [-75, -10], [-78, -2], [-80, 5], [-80, 10],
  ],
  // Europe
  [
    [-10, 36], [5, 36], [10, 42], [15, 38], [18, 36],
    [25, 36], [30, 38], [35, 37], [40, 42], [42, 48],
    [38, 55], [30, 60], [28, 65], [32, 70], [28, 72],
    [20, 70], [15, 65], [10, 60], [5, 55], [0, 50],
    [-5, 48], [-10, 52], [-8, 58], [5, 62], [10, 58],
    [12, 55], [18, 55], [22, 58], [28, 60], [30, 65],
    [-10, 36],
  ],
  // Africa
  [
    [-15, 35], [-5, 36], [10, 37], [12, 33], [20, 32],
    [25, 30], [32, 30], [35, 28], [38, 22], [42, 12],
    [50, 10], [52, 5], [48, 0], [42, -5], [40, -12],
    [38, -20], [35, -25], [30, -30], [28, -33], [20, -35],
    [18, -33], [15, -28], [12, -22], [10, -10], [8, 0],
    [5, 5], [0, 5], [-5, 5], [-8, 5], [-12, 8],
    [-15, 12], [-18, 18], [-17, 22], [-15, 28], [-15, 35],
  ],
  // Asia (mainland)
  [
    [40, 42], [45, 38], [50, 35], [55, 28], [60, 25],
    [65, 25], [70, 30], [75, 28], [80, 22], [85, 20],
    [88, 15], [90, 10], [95, 5], [98, 2], [100, 0],
    [105, 10], [108, 12], [110, 15], [115, 18], [120, 22],
    [122, 25], [130, 30], [135, 35], [140, 38], [145, 42],
    [150, 48], [145, 50], [140, 55], [130, 60], [120, 65],
    [100, 68], [80, 70], [70, 72], [60, 70], [50, 65],
    [40, 68], [32, 70], [28, 72], [30, 65], [30, 60],
    [35, 55], [32, 50], [35, 42], [40, 42],
  ],
  // Australia
  [
    [115, -15], [120, -14], [130, -12], [135, -12], [140, -15],
    [145, -15], [150, -22], [153, -28], [150, -33], [148, -38],
    [145, -38], [140, -35], [135, -33], [130, -32], [125, -33],
    [118, -35], [115, -32], [114, -28], [113, -24], [115, -20],
    [115, -15],
  ],
  // Greenland
  [
    [-55, 60], [-50, 62], [-42, 65], [-35, 68], [-25, 72],
    [-18, 76], [-20, 80], [-30, 82], [-45, 82], [-55, 78],
    [-60, 74], [-55, 70], [-52, 65], [-55, 60],
  ],
  // UK / Ireland
  [
    [-8, 50], [-6, 52], [-3, 54], [-5, 56], [-3, 58],
    [0, 58], [2, 55], [1, 52], [-1, 50], [-8, 50],
  ],
  // Japan
  [
    [130, 31], [132, 33], [135, 35], [138, 37], [140, 40],
    [142, 43], [145, 45], [145, 43], [142, 40], [140, 38],
    [137, 35], [135, 33], [132, 31], [130, 31],
  ],
];

/* ── Major cities with brightness ───────────────────────────────── */
const CITIES = [
  // East Asia
  { lat: 31.2, lng: 121.5, b: 1.0 },   // Shanghai
  { lat: 39.9, lng: 116.4, b: 1.0 },   // Beijing
  { lat: 23.1, lng: 113.3, b: 0.95 },  // Guangzhou
  { lat: 22.3, lng: 114.2, b: 0.95 },  // Hong Kong
  { lat: 25.0, lng: 121.5, b: 0.85 },  // Taipei
  { lat: 35.7, lng: 139.7, b: 1.0 },   // Tokyo
  { lat: 37.6, lng: 127.0, b: 0.9 },   // Seoul
  // South Asia
  { lat: 28.6, lng: 77.2, b: 0.9 },    // Delhi
  { lat: 19.1, lng: 72.9, b: 0.85 },   // Mumbai
  { lat: 13.1, lng: 80.3, b: 0.7 },    // Chennai
  { lat: 23.8, lng: 90.4, b: 0.75 },   // Dhaka
  // Southeast Asia
  { lat: 1.3, lng: 103.8, b: 0.8 },    // Singapore
  { lat: 14.6, lng: 100.5, b: 0.75 },  // Bangkok
  { lat: -6.2, lng: 106.8, b: 0.85 },  // Jakarta
  { lat: 14.6, lng: 121.0, b: 0.7 },   // Manila
  { lat: 3.1, lng: 101.7, b: 0.7 },    // Kuala Lumpur
  // Europe
  { lat: 51.5, lng: -0.1, b: 0.9 },    // London
  { lat: 48.9, lng: 2.3, b: 0.9 },     // Paris
  { lat: 52.5, lng: 13.4, b: 0.85 },   // Berlin
  { lat: 40.4, lng: -3.7, b: 0.85 },   // Madrid
  { lat: 41.9, lng: 12.5, b: 0.8 },    // Rome
  { lat: 52.4, lng: 4.9, b: 0.75 },    // Amsterdam
  { lat: 50.1, lng: 14.4, b: 0.75 },   // Prague
  { lat: 47.5, lng: 19.1, b: 0.7 },    // Budapest
  { lat: 55.8, lng: 37.6, b: 0.9 },    // Moscow
  { lat: 59.9, lng: 30.3, b: 0.7 },    // St Petersburg
  { lat: 50.4, lng: 30.5, b: 0.7 },    // Kyiv
  { lat: 50.1, lng: 8.7, b: 0.75 },    // Frankfurt
  { lat: 48.2, lng: 16.4, b: 0.7 },    // Vienna
  // Middle East
  { lat: 25.2, lng: 55.3, b: 0.8 },    // Dubai
  { lat: 24.7, lng: 46.7, b: 0.7 },    // Riyadh
  { lat: 32.9, lng: 35.5, b: 0.6 },    // Haifa area
  // North America
  { lat: 40.7, lng: -74.0, b: 1.0 },   // New York
  { lat: 34.1, lng: -118.2, b: 0.95 }, // Los Angeles
  { lat: 41.9, lng: -87.6, b: 0.9 },   // Chicago
  { lat: 29.8, lng: -95.4, b: 0.8 },   // Houston
  { lat: 33.4, lng: -112.1, b: 0.7 },  // Phoenix
  { lat: 47.6, lng: -122.3, b: 0.7 },  // Seattle
  { lat: 37.8, lng: -122.4, b: 0.75 }, // San Francisco
  { lat: 42.4, lng: -71.1, b: 0.7 },   // Boston
  { lat: 25.8, lng: -80.2, b: 0.7 },   // Miami
  { lat: 38.9, lng: -77.0, b: 0.75 },  // Washington DC
  { lat: 36.2, lng: -115.1, b: 0.65 }, // Las Vegas
  { lat: 32.7, lng: -96.8, b: 0.7 },   // Dallas
  { lat: 39.7, lng: -105.0, b: 0.65 }, // Denver
  { lat: 43.7, lng: -79.4, b: 0.75 },  // Toronto
  { lat: 45.5, lng: -73.6, b: 0.65 },  // Montreal
  { lat: 49.3, lng: -123.1, b: 0.6 },  // Vancouver
  { lat: 19.4, lng: -99.1, b: 0.9 },   // Mexico City
  // South America
  { lat: -23.5, lng: -46.6, b: 0.9 },  // São Paulo
  { lat: -22.9, lng: -43.2, b: 0.85 }, // Rio
  { lat: -34.6, lng: -58.4, b: 0.8 },  // Buenos Aires
  { lat: -33.4, lng: -70.7, b: 0.7 },  // Santiago
  { lat: -12.0, lng: -77.0, b: 0.7 },  // Lima
  { lat: 4.7, lng: -74.1, b: 0.7 },    // Bogotá
  { lat: 10.5, lng: -66.9, b: 0.65 },  // Caracas
  // Africa
  { lat: 30.0, lng: 31.2, b: 0.8 },    // Cairo
  { lat: -1.3, lng: 36.8, b: 0.65 },   // Nairobi
  { lat: 6.5, lng: 3.4, b: 0.65 },     // Lagos
  { lat: -33.9, lng: 18.4, b: 0.6 },   // Cape Town
  { lat: -26.2, lng: 28.0, b: 0.65 },  // Johannesburg
  { lat: 33.6, lng: -7.6, b: 0.55 },   // Casablanca
  { lat: 9.0, lng: 38.7, b: 0.55 },    // Addis Ababa
  // Oceania
  { lat: -33.9, lng: 151.2, b: 0.7 },  // Sydney
  { lat: -37.8, lng: 145.0, b: 0.65 }, // Melbourne
  { lat: -27.5, lng: 153.0, b: 0.55 }, // Brisbane
];

/* ── Helpers ─────────────────────────────────────────────────────── */
function pointInPolygon(
  lon: number, lat: number, polygon: [number, number][]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function isLand(lon: number, lat: number): boolean {
  for (const c of CONTINENTS) {
    if (pointInPolygon(lon, lat, c)) return true;
  }
  return false;
}

/* ── Generate procedural Earth texture ──────────────────────────── */
function generateEarthTexture(): THREE.CanvasTexture {
  const w = 2048, h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(w, h);
  const d = imageData.data;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const lon = (px / w) * 360 - 180;
      const lat = 90 - (py / h) * 180;
      const idx = (py * w + px) * 4;

      if (isLand(lon, lat)) {
        // Land: very dark base
        d[idx] = 3;
        d[idx + 1] = 8;
        d[idx + 2] = 12;
        d[idx + 3] = 255;
      } else {
        // Ocean: slightly lighter dark blue
        d[idx] = 1;
        d[idx + 1] = 3;
        d[idx + 2] = 8;
        d[idx + 3] = 255;
      }
    }
  }

  // Draw coastline edges
  for (let py = 1; py < h - 1; py++) {
    for (let px = 1; px < w - 1; px++) {
      const lon = (px / w) * 360 - 180;
      const lat = 90 - (py / h) * 180;
      const curr = isLand(lon, lat);
      const neighbors = [
        isLand(((px + 2) / w) * 360 - 180, 90 - (py / h) * 180),
        isLand(((px - 2) / w) * 360 - 180, 90 - (py / h) * 180),
        isLand((px / w) * 360 - 180, 90 - ((py + 2) / h) * 180),
        isLand((px / w) * 360 - 180, 90 - ((py - 2) / h) * 180),
      ];
      if (neighbors.some((n) => n !== curr)) {
        const idx = (py * w + px) * 4;
        d[idx] = 0;
        d[idx + 1] = 40;
        d[idx + 2] = 60;
        d[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/* ── Generate glow texture (radial gradient for city dots) ──────── */
function generateGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, "rgba(0, 229, 255, 1)");
  gradient.addColorStop(0.15, "rgba(0, 229, 255, 0.6)");
  gradient.addColorStop(0.4, "rgba(0, 180, 220, 0.2)");
  gradient.addColorStop(1, "rgba(0, 100, 150, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/* ── 3D Scene ────────────────────────────────────────────────────── */
function EarthScene() {
  const groupRef = useRef<THREE.Group>(null);
  const earthTex = useMemo(() => generateEarthTexture(), []);
  const glowTex = useMemo(() => generateGlowTexture(), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  // Convert lat/lng to 3D position
  const toPos = (lat: number, lng: number, r: number) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  };

  // City sprites
  const citySprites = useMemo(() => {
    return CITIES.map((city) => ({
      position: toPos(city.lat, city.lng, 1.01),
      brightness: city.b,
    }));
  }, []);

  // Arc lines
  const arcData = useMemo(() => {
    const pairs = [
      { from: [39.9, 116.4], to: [35.7, 139.7] },
      { from: [40.7, -74.0], to: [51.5, -0.1] },
      { from: [31.2, 121.5], to: [1.3, 103.8] },
      { from: [55.8, 37.6], to: [25.2, 55.3] },
      { from: [-33.9, 151.2], to: [1.3, 103.8] },
      { from: [48.9, 2.3], to: [40.7, -74.0] },
      { from: [28.6, 77.2], to: [31.2, 121.5] },
      { from: [25.2, 55.3], to: [1.3, 103.8] },
    ];
    return pairs.map((c) => {
      const start = toPos(c.from[0], c.from[1], 1.01);
      const end = toPos(c.to[0], c.to[1], 1.01);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(50);
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Dark Earth base */}
      <mesh>
        <sphereGeometry args={[1, 128, 64]} />
        <meshBasicMaterial map={earthTex} />
      </mesh>

      {/* City light dots - layered for glow */}
      {citySprites.map((city, i) => (
        <sprite key={i} position={city.position} scale={[0.06 * city.brightness, 0.06 * city.brightness, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            opacity={0.9 * city.brightness}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}

      {/* Arc connections */}
      {arcData.map((points, i) => (
        <line key={`arc-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}

      {/* Satellite orbits */}
      {[0, 60, 120].map((inc, i) => (
        <mesh key={`orbit-${i}`} rotation={[(inc * Math.PI) / 180, 0, 0]}>
          <torusGeometry args={[1.3, 0.001, 8, 120]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.08, 64, 64]} />
        <meshBasicMaterial
          color="#00B4D8"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshBasicMaterial
          color="#0077B6"
          transparent
          opacity={0.025}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ── Loading ─────────────────────────────────────────────────────── */
function GlobeLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)] border-t-transparent animate-spin mx-auto" />
        <p
          className="text-xs text-[var(--cyan)] mt-3"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          INITIALIZING...
        </p>
      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────────────── */
export function Globe() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <React.Suspense fallback={<GlobeLoader />}>
        <Canvas
          camera={{ position: [0, 0, 2.8], fov: 45 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        >
          <EarthScene />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(3 * Math.PI) / 4}
          />
        </Canvas>
      </React.Suspense>
    </div>
  );
}
