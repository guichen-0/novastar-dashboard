"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ── NASA public domain textures ────────────────────────────────── */
const EARTH_DAY =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg";
const EARTH_NIGHT =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-night.jpg";

/* ── Day / Night custom shader ──────────────────────────────────── */
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec4 day = texture2D(dayTexture, vUv);
    vec4 night = texture2D(nightTexture, vUv);

    float NdotL = dot(vNormal, sunDir);

    // --- Day side ---
    // Brighten the day texture so oceans are vivid blue
    vec3 dayColor = day.rgb * 1.3;
    // Clamp so we don't blow out
    dayColor = min(dayColor, vec3(1.0));

    // --- Night side ---
    // The night texture has warm city lights (orange/yellow)
    // Extract luminance to decide what is "light" vs "dark ocean"
    float lum = dot(night.rgb, vec3(0.299, 0.587, 0.114));

    // Make dark ocean pixels transparent, keep bright city pixels
    float mask = smoothstep(0.01, 0.12, lum);

    // Shift city lights from warm orange → cyan for futuristic look
    // Boost brightness significantly
    float boost = 2.5;
    vec3 nightCyan = vec3(
      night.r * 0.1 + night.g * 0.3 + night.b * 0.6,
      night.r * 0.2 + night.g * 0.7 + night.b * 0.5,
      night.r * 0.1 + night.g * 0.4 + night.b * 0.8
    ) * boost;
    // Mix some original warmth back so it's not purely cyan
    vec3 nightColor = mix(night.rgb * boost * 0.8, nightCyan, 0.65);
    nightColor *= mask;

    // --- Blend day / night with soft terminator ---
    float dayFactor = smoothstep(-0.15, 0.15, NdotL);

    vec3 finalColor = mix(nightColor, dayColor, dayFactor);

    // Terminator glow line (subtle cyan at the boundary)
    float terminator = 1.0 - abs(NdotL);
    terminator = pow(terminator, 8.0);
    finalColor += vec3(0.0, 0.6, 0.8) * terminator * 0.12;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* ── 3D Components ──────────────────────────────────────────────── */
function EarthSphere({
  dayTex,
  nightTex,
}: {
  dayTex: THREE.Texture;
  nightTex: THREE.Texture;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayTex },
      nightTexture: { value: nightTex },
      sunDir: { value: new THREE.Vector3(1, 0.2, 0.5).normalize() },
    }),
    [dayTex, nightTex]
  );

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Main Earth sphere */}
      <mesh>
        <sphereGeometry args={[1, 128, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmosphere – inner edge glow */}
      <mesh>
        <sphereGeometry args={[1.04, 64, 64]} />
        <meshBasicMaterial
          color="#00B4D8"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere – outer haze */}
      <mesh>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshBasicMaterial
          color="#0077B6"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function DataPoints() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
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
    return cities.map((c) => {
      const phi = ((90 - c.lat) * Math.PI) / 180;
      const theta = ((c.lng + 180) * Math.PI) / 180;
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
            <sphereGeometry args={[0.007, 6, 6]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <mesh position={pos}>
            <ringGeometry args={[0.013, 0.022, 12]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
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
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  const arcs = useMemo(() => {
    const conns = [
      { from: [39.9, 116.4], to: [35.7, 139.7] },
      { from: [40.7, -74.0], to: [51.5, -0.1] },
      { from: [31.2, 121.5], to: [1.3, 103.8] },
      { from: [55.8, 37.6], to: [25.2, 55.3] },
      { from: [-33.9, 151.2], to: [1.3, 103.8] },
      { from: [48.9, 2.3], to: [40.7, -74.0] },
    ];
    const toV = (lat: number, lng: number) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      return new THREE.Vector3(
        -1.012 * Math.sin(phi) * Math.cos(theta),
        1.012 * Math.cos(phi),
        1.012 * Math.sin(phi) * Math.sin(theta)
      );
    };
    return conns.map((c) => {
      const s = toV(c.from[0], c.from[1]);
      const e = toV(c.to[0], c.to[1]);
      const m = s.clone().add(e).multiplyScalar(0.5).normalize().multiplyScalar(1.3);
      return new THREE.QuadraticBezierCurve3(s, m, e).getPoints(50);
    });
  }, []);

  return (
    <group ref={groupRef}>
      {arcs.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}

function SatelliteOrbits() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.03; });
  return (
    <group ref={ref}>
      {[0, 60, 120].map((inc, i) => (
        <mesh key={i} rotation={[(inc * Math.PI) / 180, 0, 0]}>
          <torusGeometry args={[1.3, 0.001, 8, 120]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────── */
function GlobeScene() {
  const [dayTex, nightTex] = useLoader(THREE.TextureLoader, [
    EARTH_DAY,
    EARTH_NIGHT,
  ]);
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 3, 5]} intensity={0.8} />
      <EarthSphere dayTex={dayTex} nightTex={nightTex} />
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

function GlobeLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-[var(--cyan)] mt-3" style={{ fontFamily: "var(--font-orbitron)" }}>
          INITIALIZING...
        </p>
      </div>
    </div>
  );
}

/* ── Export ───────────────────────────────────────────────────────── */
export function Globe() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <React.Suspense fallback={<GlobeLoader />}>
        <Canvas
          camera={{ position: [0, 0, 2.8], fov: 45 }}
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
