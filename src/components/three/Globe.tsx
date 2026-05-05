"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SatelliteOrbits } from "./SatelliteOrbits";
import type { SatelliteData } from "@/lib/satellite";

const EARTH_RADIUS = 1;
const EARTH_SEGMENTS = 64;

const nightVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nightFragmentShader = /* glsl */ `
  uniform sampler2D uNight;
  uniform vec3 uSunDir;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec4 nightColor = texture2D(uNight, vUv);

    // Day/night factor from directional light
    float sunDot = dot(normalize(vWorldNormal), normalize(uSunDir));
    float nightFactor = smoothstep(0.1, -0.3, sunDot);

    // Extract bright city lights from night texture
    float nightLum = dot(nightColor.rgb, vec3(0.299, 0.587, 0.114));
    float lightMask = smoothstep(0.03, 0.15, nightLum);

    // Desaturate and boost
    float gray = nightLum;
    vec3 desaturated = mix(vec3(gray), nightColor.rgb, 0.7);
    vec3 lights = desaturated * lightMask * 2.5;

    // Only show on night side
    lights *= nightFactor;

    gl_FragColor = vec4(lights, 1.0);
  }
`;

function SunLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    // Solar declination
    const decl = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const declRad = (decl * Math.PI) / 180;

    // Subsolar longitude
    const sunLon = ((utcHours - 12) / 12) * Math.PI;

    // Convert to Cartesian (sun direction in world space)
    const x = Math.cos(declRad) * Math.sin(sunLon);
    const y = Math.sin(declRad);
    const z = Math.cos(declRad) * Math.cos(sunLon);

    lightRef.current.position.set(x * 10, y * 10, z * 10);
  });

  return <directionalLight ref={lightRef} intensity={2.0} color="#ffffff" />;
}

function GlobeScene({ satellites }: { satellites?: SatelliteData[] }) {
  const nightMatRef = useRef<THREE.ShaderMaterial>(null);
  const dayMap = useTexture("/earth-day.jpg");
  const nightMap = useTexture("/earth-night.jpg");

  const nightUniforms = useMemo(
    () => ({
      uNight: { value: nightMap },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    }),
    [nightMap]
  );

  useFrame(() => {
    if (!nightMatRef.current) return;

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    const decl = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const declRad = (decl * Math.PI) / 180;
    const sunLon = ((utcHours - 12) / 12) * Math.PI;

    const x = Math.cos(declRad) * Math.sin(sunLon);
    const y = Math.sin(declRad);
    const z = Math.cos(declRad) * Math.cos(sunLon);

    nightMatRef.current.uniforms.uSunDir.value.set(x, y, z);
  });

  if (!dayMap || !nightMap) return null;

  return (
    <group>
      {/* Day side: lit by DirectionalLight */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <meshStandardMaterial
          map={dayMap}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Night side: additive city lights (shader masks to dark side) */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.001, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <shaderMaterial
          ref={nightMatRef}
          vertexShader={nightVertexShader}
          fragmentShader={nightFragmentShader}
          uniforms={nightUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
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
        <ambientLight intensity={0.08} />
        <SunLight />
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
