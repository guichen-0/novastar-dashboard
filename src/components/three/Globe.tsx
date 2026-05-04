"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ── Simplified continent outlines (lon, lat pairs) ─────────────── */
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
    [-10, 36], [-5, 36], [0, 38], [3, 43], [0, 47],
    [-5, 48], [-10, 52], [-8, 58], [5, 62], [10, 58],
    [12, 55], [18, 55], [22, 58], [28, 60], [30, 65],
    [32, 70], [28, 72], [20, 70], [15, 65], [10, 60],
    [5, 55], [0, 50], [5, 44], [10, 42], [15, 38],
    [18, 36], [12, 36], [5, 36], [-10, 36],
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
  // Asia
  [
    [30, 70], [40, 68], [50, 65], [60, 70], [70, 72],
    [80, 70], [100, 68], [120, 65], [130, 60], [140, 55],
    [145, 50], [150, 48], [145, 42], [140, 38], [135, 35],
    [130, 30], [122, 25], [120, 22], [115, 18], [110, 15],
    [108, 12], [105, 10], [100, 5], [98, 2], [100, 0],
    [95, 5], [90, 10], [88, 15], [85, 20], [80, 22],
    [75, 28], [70, 30], [65, 25], [60, 25], [55, 28],
    [50, 30], [45, 32], [40, 37], [35, 37], [30, 35],
    [28, 42], [30, 48], [35, 55], [32, 60], [30, 65],
    [30, 70],
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
  // Antarctica (simplified)
  [
    [-60, -65], [-30, -70], [0, -72], [30, -70], [60, -68],
    [90, -70], [120, -68], [150, -70], [180, -72],
    [-180, -72], [-150, -70], [-120, -68], [-90, -70], [-60, -65],
  ],
];

/* ── Point-in-polygon for lat/lng → equirectangular canvas ─────── */
function pointInPolygon(
  lon: number,
  lat: number,
  polygon: [number, number][]
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
  for (const continent of CONTINENTS) {
    if (pointInPolygon(lon, lat, continent)) return true;
  }
  return false;
}

/* ── Generate Earth texture on canvas ───────────────────────────── */
function generateEarthTexture(): THREE.CanvasTexture {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, "#051525");
  oceanGrad.addColorStop(0.3, "#081e33");
  oceanGrad.addColorStop(0.5, "#0a2240");
  oceanGrad.addColorStop(0.7, "#081e33");
  oceanGrad.addColorStop(1, "#051525");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Draw continents pixel-by-pixel
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const lon = (px / w) * 360 - 180;
      const lat = 90 - (py / h) * 180;

      if (isLand(lon, lat)) {
        const idx = (py * w + px) * 4;
        // Land: dark teal with slight variation
        const variation = Math.sin(lon * 0.1) * Math.cos(lat * 0.1) * 10;
        data[idx] = 8 + variation;       // R
        data[idx + 1] = 32 + variation;   // G
        data[idx + 2] = 28 + variation;   // B
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add coastline glow
  const coastCanvas = document.createElement("canvas");
  coastCanvas.width = w;
  coastCanvas.height = h;
  const coastCtx = coastCanvas.getContext("2d")!;
  coastCtx.putImageData(imageData, 0, 0);

  // Edge detection for coastlines
  for (let py = 1; py < h - 1; py++) {
    for (let px = 1; px < w - 1; px++) {
      const lon = (px / w) * 360 - 180;
      const lat = 90 - (py / h) * 180;
      const current = isLand(lon, lat);

      // Check 4 neighbors
      const neighbors = [
        isLand(((px + 1) / w) * 360 - 180, 90 - (py / h) * 180),
        isLand(((px - 1) / w) * 360 - 180, 90 - (py / h) * 180),
        isLand((px / w) * 360 - 180, 90 - ((py + 1) / h) * 180),
        isLand((px / w) * 360 - 180, 90 - ((py - 1) / h) * 180),
      ];

      const hasEdge = neighbors.some((n) => n !== current);
      if (hasEdge) {
        const idx = (py * w + px) * 4;
        data[idx] = 0;
        data[idx + 1] = 200;
        data[idx + 2] = 230;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/* ── 3D Components ──────────────────────────────────────────────── */
function EarthSphere() {
  const globeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => generateEarthTexture(), []);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.06;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={glowRef}>
      {/* Earth sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.018}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function DataPoints() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  const points = useMemo(() => {
    const cities = [
      { lat: 39.9, lng: 116.4 },
      { lat: 35.7, lng: 139.7 },
      { lat: 40.7, lng: -74.0 },
      { lat: 51.5, lng: -0.1 },
      { lat: -33.9, lng: 151.2 },
      { lat: 55.8, lng: 37.6 },
      { lat: 25.2, lng: 55.3 },
      { lat: 1.3, lng: 103.8 },
      { lat: 48.9, lng: 2.3 },
      { lat: 34.1, lng: -118.2 },
      { lat: 31.2, lng: 121.5 },
      { lat: 37.6, lng: 127.0 },
    ];

    return cities.map((city) => {
      const phi = ((90 - city.lat) * Math.PI) / 180;
      const theta = ((city.lng + 180) * Math.PI) / 180;
      const r = 1.012;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    });
  }, []);

  return (
    <group ref={groupRef}>
      {points.map((pos, i) => (
        <group key={i}>
          <mesh position={pos}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <mesh position={pos}>
            <ringGeometry args={[0.02, 0.032, 16]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ArcLines() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  const arcs = useMemo(() => {
    const connections = [
      { from: [39.9, 116.4], to: [35.7, 139.7] },
      { from: [40.7, -74.0], to: [51.5, -0.1] },
      { from: [31.2, 121.5], to: [1.3, 103.8] },
      { from: [55.8, 37.6], to: [25.2, 55.3] },
      { from: [-33.9, 151.2], to: [1.3, 103.8] },
      { from: [48.9, 2.3], to: [40.7, -74.0] },
    ];

    const toVec = (lat: number, lng: number) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      const r = 1.012;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    return connections.map((conn) => {
      const start = toVec(conn.from[0], conn.from[1]);
      const end = toVec(conn.to[0], conn.to[1]);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(50);
    });
  }, []);

  return (
    <group ref={groupRef}>
      {arcs.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00E5FF" transparent opacity={0.18} />
        </line>
      ))}
    </group>
  );
}

function SatelliteOrbits() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 60, 120].map((inclination, i) => (
        <mesh key={i} rotation={[(inclination * Math.PI) / 180, 0, 0]}>
          <torusGeometry args={[1.3, 0.0015, 8, 120]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Canvas wrapper with proper containment ─────────────────────── */
export function Globe() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[5, 3, 5]} intensity={0.8} />
        <pointLight position={[-5, -2, -5]} intensity={0.15} color="#8B5CF6" />

        <EarthSphere />
        <DataPoints />
        <ArcLines />
        <SatelliteOrbits />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />
      </Canvas>
    </div>
  );
}
