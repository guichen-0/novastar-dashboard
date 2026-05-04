"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Simple 3D noise for procedural continents
function noise3D(x: number, y: number, z: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number, z: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 5; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

function isLand(nx: number, ny: number, nz: number): boolean {
  const n = fbm(nx * 2.5, ny * 2.5, nz * 2.5);
  return n > 0.42;
}

function ResizableCanvas({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        {children}
      </Canvas>
    </div>
  );
}

function EarthSphere() {
  const globeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.08;
    }
  });

  // Generate procedural Earth geometry with continents
  const earthGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 128, 64);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const nx = x;
      const ny = y;
      const nz = z;

      if (isLand(nx, ny, nz)) {
        // Land: dark green/teal with variation
        const variation = fbm(nx * 6, ny * 6, nz * 6) * 0.3;
        colors[i * 3] = 0.02 + variation * 0.1;     // R
        colors[i * 3 + 1] = 0.15 + variation * 0.2;  // G
        colors[i * 3 + 2] = 0.12 + variation * 0.15;  // B
      } else {
        // Ocean: deep blue
        const depth = fbm(nx * 4, ny * 4, nz * 4) * 0.15;
        colors[i * 3] = 0.01;                          // R
        colors[i * 3 + 1] = 0.04 + depth * 0.3;       // G
        colors[i * 3 + 2] = 0.12 + depth * 0.5;       // B
      }
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Grid lines (latitude + longitude)
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: THREE.Vector3[] = [];
      const radius = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);
      for (let lng = 0; lng <= 360; lng += 5) {
        const rad = (lng * Math.PI) / 180;
        points.push(
          new THREE.Vector3(
            radius * Math.cos(rad) * 1.005,
            y * 1.005,
            radius * Math.sin(rad) * 1.005
          )
        );
      }
      lines.push(points);
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const points: THREE.Vector3[] = [];
      const rad = (lng * Math.PI) / 180;
      for (let lat = -90; lat <= 90; lat += 5) {
        const latRad = (lat * Math.PI) / 180;
        points.push(
          new THREE.Vector3(
            Math.cos(latRad) * Math.cos(rad) * 1.005,
            Math.sin(latRad) * 1.005,
            Math.cos(latRad) * Math.sin(rad) * 1.005
          )
        );
      }
      lines.push(points);
    }

    return lines;
  }, []);

  // Edge glow lines (where land meets ocean)
  const edgeLines = useMemo(() => {
    const edges: THREE.Vector3[][] = [];
    const step = 8; // Check every N degrees
    const r = 1.003;

    for (let lat = -90; lat < 90; lat += step) {
      for (let lng = -180; lng < 180; lng += step) {
        const latRad = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180;
        const latRadNext = ((lat + step) * Math.PI) / 180;
        const lngRadNext = ((lng + step) * Math.PI) / 180;

        const toXYZ = (la: number, lo: number) => {
          const x = Math.cos(la) * Math.cos(lo);
          const y = Math.sin(la);
          const z = Math.cos(la) * Math.sin(lo);
          return { x, y, z, nx: x, ny: y, nz: z };
        };

        const p = toXYZ(latRad, lngRad);
        const isCurrentLand = isLand(p.nx, p.ny, p.nz);

        // Check neighbors
        const neighbors = [
          toXYZ(latRadNext, lngRad),
          toXYZ(latRad, lngRadNext),
        ];

        for (const np of neighbors) {
          const isNeighborLand = isLand(np.nx, np.ny, np.nz);
          if (isCurrentLand !== isNeighborLand) {
            // Edge detected
            edges.push([
              new THREE.Vector3(p.x * r, p.y * r, p.z * r),
              new THREE.Vector3(np.x * r, np.y * r, np.z * r),
            ]);
          }
        }
      }
    }

    return edges;
  }, []);

  return (
    <group ref={glowRef}>
      {/* Main Earth sphere with vertex colors */}
      <mesh ref={globeRef} geometry={earthGeometry}>
        <meshStandardMaterial
          vertexColors
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Wireframe grid */}
      <group ref={globeRef}>
        {gridLines.map((points, i) => (
          <line key={`grid-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00E5FF" transparent opacity={0.12} />
          </line>
        ))}
      </group>

      {/* Continental edge glow */}
      <group ref={globeRef}>
        {edgeLines.map((points, i) => (
          <line key={`edge-${i}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00E5FF" transparent opacity={0.4} />
          </line>
        ))}
      </group>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmosphere */}
      <mesh>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.015}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function DataPoints() {
  const points = useMemo(() => {
    const cities = [
      { name: "北京", lat: 39.9, lng: 116.4 },
      { name: "东京", lat: 35.7, lng: 139.7 },
      { name: "纽约", lat: 40.7, lng: -74.0 },
      { name: "伦敦", lat: 51.5, lng: -0.1 },
      { name: "悉尼", lat: -33.9, lng: 151.2 },
      { name: "莫斯科", lat: 55.8, lng: 37.6 },
      { name: "迪拜", lat: 25.2, lng: 55.3 },
      { name: "新加坡", lat: 1.3, lng: 103.8 },
      { name: "巴黎", lat: 48.9, lng: 2.3 },
      { name: "洛杉矶", lat: 34.1, lng: -118.2 },
      { name: "上海", lat: 31.2, lng: 121.5 },
      { name: "首尔", lat: 37.6, lng: 127.0 },
    ];

    return cities.map((city) => {
      const phi = ((90 - city.lat) * Math.PI) / 180;
      const theta = ((city.lng + 180) * Math.PI) / 180;
      const r = 1.015;
      return {
        name: city.name,
        position: new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        ),
      };
    });
  }, []);

  return (
    <>
      {points.map((point) => (
        <group key={point.name}>
          {/* Outer ring */}
          <mesh position={point.position}>
            <ringGeometry args={[0.018, 0.028, 16]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Inner dot */}
          <mesh position={point.position}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function ArcLines() {
  const arcs = useMemo(() => {
    const connections = [
      { from: [39.9, 116.4], to: [35.7, 139.7] },
      { from: [40.7, -74.0], to: [51.5, -0.1] },
      { from: [31.2, 121.5], to: [1.3, 103.8] },
      { from: [55.8, 37.6], to: [25.2, 55.3] },
      { from: [-33.9, 151.2], to: [1.3, 103.8] },
      { from: [48.9, 2.3], to: [40.7, -74.0] },
    ];

    return connections.map((conn) => {
      const toVec = (lat: number, lng: number) => {
        const phi = ((90 - lat) * Math.PI) / 180;
        const theta = ((lng + 180) * Math.PI) / 180;
        const r = 1.015;
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
      };

      const start = toVec(conn.from[0], conn.from[1]);
      const end = toVec(conn.to[0], conn.to[1]);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1.35);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(50);
    });
  }, []);

  return (
    <>
      {arcs.map((points, i) => (
        <line key={`arc-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00E5FF" transparent opacity={0.2} />
        </line>
      ))}
    </>
  );
}

function SatelliteOrbits() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 60, 120].map((inclination, i) => (
        <mesh
          key={i}
          rotation={[(inclination * Math.PI) / 180, 0, 0]}
        >
          <torusGeometry args={[1.3, 0.0015, 8, 120]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

export function Globe() {
  return (
    <ResizableCanvas>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -5, -10]} intensity={0.2} color="#8B5CF6" />

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
    </ResizableCanvas>
  );
}
