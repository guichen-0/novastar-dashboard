"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import SunCalc from "suncalc";
import { SatelliteOrbits } from "./SatelliteOrbits";
import type { SatelliteData } from "@/lib/satellite";

const EARTH_RADIUS = 1;
const EARTH_SEGMENTS = 64;

// Three.js SphereGeometry UV mapping (default params, equator):
//   U=0   → -X axis (texture lon=-180°)
//   U=0.5 → +X axis (texture lon=0° Prime Meridian)
//   U=0.75 → -Z axis (texture lon=+90°E)
// Surface normal at geographic (lat, lon) in world space:
//   (cos(lat)*cos(lon), sin(lat), -cos(lat)*sin(lon))
// Shader's dot(normal, sunDir) > 0 means daylight.

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform vec3 uSunDir;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec4 dayColor = texture2D(uDay, vUv);
    vec4 nightColor = texture2D(uNight, vUv);

    float sunDot = dot(normalize(vWorldNormal), normalize(uSunDir));

    // Day/night blend
    float dayFactor = smoothstep(-0.1, 0.15, sunDot);

    // City lights from night texture
    float nightLum = dot(nightColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 lights = nightColor.rgb * smoothstep(0.01, 0.10, nightLum) * 2.5;

    // Base: day on sunlit side, dark on night side
    vec3 base = mix(vec3(0.005, 0.005, 0.01), dayColor.rgb, dayFactor);

    // Blend lights on night side only
    float nightFactor = 1.0 - dayFactor;
    vec3 finalColor = base + lights * nightFactor;

    // Subtle terminator glow
    float terminator = 1.0 - smoothstep(0.0, 0.2, abs(sunDot));
    finalColor += vec3(0.04, 0.15, 0.3) * terminator * 0.1;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;


function GlobeScene({ satellites }: { satellites?: SatelliteData[] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const dayMap = useTexture("/earth-day.jpg");
  const nightMap = useTexture("/earth-night.jpg");

  const uniforms = useMemo(
    () => ({
      uDay: { value: dayMap },
      uNight: { value: nightMap },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    }),
    [dayMap, nightMap]
  );

  useFrame(() => {
    if (!matRef.current) return;

    // Sun direction via SunCalc's astronomical algorithm (Equation of Time, nutation, etc.)
    const now = new Date();
    const dayMs = 86400000;
    const J1970 = 2440588;
    const J2000 = 2451545;
    const d = now.valueOf() / dayMs - 0.5 + J1970 - J2000;

    // Solar coordinates (same algorithm as SunCalc internals)
    const M = (Math.PI / 180) * (357.5291 + 0.98560028 * d);
    const C = (Math.PI / 180) * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + C + (Math.PI / 180) * 102.9372 + Math.PI;
    const e = (Math.PI / 180) * 23.4397;
    const decl = Math.asin(Math.sin(e) * Math.sin(L));

    // Subsolar longitude: RA - GMST (sun's hour angle at Greenwich)
    const gmstDeg = 280.16 + 360.9856235 * d;
    const ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));

    // Normalize subsolar longitude to [-PI, PI]
    const rawSunLon = ra - ((gmstDeg * Math.PI) / 180);
    const sunLonRad = ((rawSunLon % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

    // Three.js world-space direction (SphereGeometry UV convention)
    const x = Math.cos(decl) * Math.cos(sunLonRad);
    const y = Math.sin(decl);
    const z = -Math.cos(decl) * Math.sin(sunLonRad);

    matRef.current.uniforms.uSunDir.value.set(x, y, z);
  });

  if (!dayMap || !nightMap) return null;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.03, 32, 32]} />
        <meshBasicMaterial color="#00B4D8" transparent opacity={0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial color="#0077B6" transparent opacity={0.03} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {satellites && satellites.length > 0 && (
        <SatelliteOrbits satellites={satellites} />
      )}
    </group>
  );
}

function GlobeLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-[var(--cyan)] mt-3" style={{ fontFamily: "var(--font-orbitron)" }}>INITIALIZING...</p>
      </div>
    </div>
  );
}

export function Globe({ satellites }: { satellites?: SatelliteData[] } = {}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    let count = 0;
    const done = () => { count++; if (count >= 2) setReady(true); };
    loader.load("/earth-day.jpg", done, undefined, done);
    loader.load("/earth-night.jpg", done, undefined, done);
  }, []);

  if (!ready) return <GlobeLoader />;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight intensity={0.3} />
        <GlobeScene satellites={satellites} />
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
