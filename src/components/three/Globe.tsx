"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import { SatelliteOrbits, type SatelliteOrbitsData } from "./SatelliteOrbits";
import type { SatelliteData } from "@/lib/satellite";

const EARTH_RADIUS = 1;
const EARTH_SEGMENTS = 64;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform float uSunLat;
  uniform float uSunLon;
  uniform float uLonOffset;

  varying vec2 vUv;

  void main() {
    vec4 dayColor = texture2D(uDay, vUv);
    vec4 nightColor = texture2D(uNight, vUv);

    // Fragment lon: UV x=0 → -180°, x=0.5 → 0°, x=1 → +180°
    float fragLon = (vUv.x - 0.5) * 6.2831853 + uLonOffset;
    float fragLat = (vUv.y - 0.5) * 3.1415927;

    // Angular distance to subsolar point
    float dlon = fragLon - uSunLon;
    dlon = dlon - 6.2831853 * round(dlon / 6.2831853);

    float dist = acos(clamp(
      cos(fragLat) * cos(uSunLat) * cos(dlon) +
      sin(fragLat) * sin(uSunLat),
      -1.0, 1.0
    ));

    // Day factor: 1 = full day, 0 = full night
    float dayFactor = smoothstep(1.8, 1.2, dist);

    // City lights: extract from night texture, visible GLOBALLY
    float nightLum = dot(nightColor.rgb, vec3(0.299, 0.587, 0.114));
    float lightMask = smoothstep(0.03, 0.15, nightLum);
    // Slightly desaturate night texture
    float gray = nightLum;
    vec3 desaturated = mix(vec3(gray), nightColor.rgb, 0.7);
    vec3 lights = desaturated * lightMask * 2.0;

    // Day side: lights are dimmer (overpowered by sunlight)
    // Night side: lights are bright
    float lightIntensity = mix(1.0, 0.5, dayFactor);
    lights *= lightIntensity;

    // Base: day texture on day side, dark on night side
    vec3 base = mix(vec3(0.0), dayColor.rgb, dayFactor);

    // Overlay lights on top of base
    vec3 finalColor = base + lights;

    // Subtle terminator glow
    float terminator = 1.0 - smoothstep(0.0, 0.4, abs(dist - 1.5707963));
    finalColor += vec3(0.05, 0.2, 0.35) * terminator * 0.15;

    csm_DiffuseColor = vec4(finalColor, 1.0);
  }
`;

function GlobeScene({ satellites }: { satellites?: SatelliteData[] }) {
  const matRef = useRef<any>(null);
  const dayMap = useTexture("/earth-day.jpg");
  const nightMap = useTexture("/earth-night.jpg");

  const uniforms = useMemo(
    () => ({
      uDay: { value: dayMap },
      uNight: { value: nightMap },
      uSunLat: { value: 0 },
      uSunLon: { value: 0 },
      uLonOffset: { value: 0 },
    }),
    [dayMap, nightMap]
  );

  useFrame(() => {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    const decl = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);

    if (matRef.current?.uniforms) {
      matRef.current.uniforms.uSunLat.value = (decl * Math.PI) / 180;
      matRef.current.uniforms.uSunLon.value = ((utcHours - 12) / 12) * Math.PI;
      matRef.current.uniforms.uLonOffset.value = Math.PI;
    }
  });

  if (!dayMap || !nightMap) return null;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <CustomShaderMaterial
          ref={matRef}
          baseMaterial={THREE.MeshBasicMaterial}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
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
        <pointLight position={[5, 3, 5]} intensity={0.8} />
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
