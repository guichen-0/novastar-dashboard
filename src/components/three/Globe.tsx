"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ── Earth texture from NASA Blue Marble (public domain) ─────────── */
const EARTH_TEXTURE_URL =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg";
const EARTH_BUMP_URL =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-topology.png";

/* ── 3D Components ───────────────────────────────────────────────── */
function EarthSphere({
  earthMap,
  earthBump,
}: {
  earthMap: THREE.Texture;
  earthBump: THREE.Texture;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={glowRef}>
      {/* Earth sphere with real texture */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={earthBump}
          bumpScale={0.02}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Atmosphere glow - inner */}
      <mesh>
        <sphereGeometry args={[1.06, 64, 64]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Atmosphere glow - outer */}
      <mesh>
        <sphereGeometry args={[1.18, 64, 64]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.025}
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
      groupRef.current.rotation.y += delta * 0.05;
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
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <mesh position={pos}>
            <ringGeometry args={[0.018, 0.028, 16]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
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
      groupRef.current.rotation.y += delta * 0.05;
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
              args={[
                new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00E5FF" transparent opacity={0.2} />
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

/* ── Main Globe component ────────────────────────────────────────── */
function GlobeScene() {
  const [loaded, setLoaded] = useState(false);
  const [earthMap, earthBump] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE_URL,
    EARTH_BUMP_URL,
  ]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 3, 5]} intensity={0.9} />
      <pointLight position={[-5, -2, -5]} intensity={0.15} color="#8B5CF6" />

      <EarthSphere earthMap={earthMap} earthBump={earthBump} />
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
    </>
  );
}

/* ── Loading fallback ────────────────────────────────────────────── */
function GlobeLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full border-2 border-[var(--cyan)] border-t-transparent animate-spin mx-auto"
        />
        <p
          className="text-xs text-[var(--cyan)] mt-3"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          加载地球纹理...
        </p>
      </div>
    </div>
  );
}

/* ── Exported Globe with Suspense boundary ───────────────────────── */
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
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <React.Suspense fallback={null}>
          <GlobeScene />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
