"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ── NASA public domain textures (Blue Marble + Black Marble) ──── */
const EARTH_DAY =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg";
const EARTH_NIGHT =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-night.jpg";
const EARTH_TOPOLOGY =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-topology.png";

/* ── Day/Night shader ──────────────────────────────────────────── */
const dayNightVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dayNightFragment = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);

    float sunDot = dot(vNormal, sunDirection);

    // 晨昏线：在 -0.1 到 0.1 之间平滑过渡
    float dayFactor = smoothstep(-0.1, 0.1, sunDot);

    // 夜间：只保留城市灯光（亮度 > 0.12 的像素），去掉黑色海洋
    float lightBrightness = max(nightColor.r, max(nightColor.g, nightColor.b));
    float lightMask = smoothstep(0.02, 0.18, lightBrightness);

    // 白天：地球纹理 + 少量夜间灯光透出
    vec3 dayResult = dayColor.rgb * dayFactor;

    // 夜间：只显示灯光
    vec3 nightResult = nightColor.rgb * lightMask * (1.0 - dayFactor);

    // 混合
    vec3 finalColor = dayResult + nightResult;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* ── 3D Components ──────────────────────────────────────────────── */
function EarthSphere({
  dayTex,
  nightTex,
  bumpTex,
}: {
  dayTex: THREE.Texture;
  nightTex: THREE.Texture;
  bumpTex: THREE.Texture;
}) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayTex },
      nightTexture: { value: nightTex },
      sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
    }),
    [dayTex, nightTex]
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth sphere with day/night shader */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 128, 64]} />
        <shaderMaterial
          vertexShader={dayNightVertex}
          fragmentShader={dayNightFragment}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmosphere inner glow */}
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Atmosphere outer glow */}
      <mesh>
        <sphereGeometry args={[1.15, 64, 64]} />
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
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <mesh position={pos}>
            <ringGeometry args={[0.015, 0.025, 16]} />
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

/* ── Scene with textures loaded ─────────────────────────────────── */
function GlobeScene() {
  const [dayTex, nightTex, bumpTex] = useLoader(THREE.TextureLoader, [
    EARTH_DAY,
    EARTH_NIGHT,
    EARTH_TOPOLOGY,
  ]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 3, 5]} intensity={0.9} />
      <pointLight position={[-5, -2, -5]} intensity={0.15} color="#8B5CF6" />

      <EarthSphere dayTex={dayTex} nightTex={nightTex} bumpTex={bumpTex} />
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

/* ── Loading fallback ───────────────────────────────────────────── */
function GlobeLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full border-2 border-[var(--cyan)] border-t-transparent animate-spin mx-auto" />
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

/* ── Exported Globe ─────────────────────────────────────────────── */
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
          camera={{ position: [0, 0, 3], fov: 45 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        >
          <GlobeScene />
        </Canvas>
      </React.Suspense>
    </div>
  );
}
