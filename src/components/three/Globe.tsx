"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SatelliteOrbits } from "./SatelliteOrbits";
import type { SatelliteData } from "@/lib/satellite";

const EARTH_RADIUS = 1;
const EARTH_SEGMENTS = 64;

function GlobeScene({ satellites }: { satellites?: SatelliteData[] }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const dayMap = useTexture("/earth-day.jpg");
  const nightMap = useTexture("/earth-night.jpg");

  useFrame(() => {
    if (!lightRef.current) return;

    // Compute sun direction from astronomical position
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(Date.UTC(now.getUTCFullYear(), 0, 0)).getTime()) / 86400000
    );
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    const decl = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const declRad = (decl * Math.PI) / 180;
    const sunLon = ((utcHours - 12) / 12) * Math.PI;

    // DirectionalLight shines FROM its position TOWARD the scene origin.
    // Negate sun direction so the light sits on the NIGHT side and shines
    // toward the DAY side (illuminating the correct hemisphere).
    const r = 10;
    lightRef.current.position.set(
      -(Math.cos(declRad) * Math.sin(sunLon)) * r,
      -Math.sin(declRad) * r,
      -(Math.cos(declRad) * Math.cos(sunLon)) * r
    );
  });

  if (!dayMap || !nightMap) return null;

  return (
    <group>
      {/* Sun light */}
      <directionalLight
        ref={lightRef}
        intensity={2.5}
        color="#ffffff"
      />

      {/* Earth sphere with day texture + night city lights as emissive */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
        <meshStandardMaterial
          ref={matRef}
          map={dayMap}
          emissiveMap={nightMap}
          emissive={new THREE.Color(2, 2, 2)}
          emissiveIntensity={0.8}
          roughness={1}
          metalness={0}
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
        <ambientLight intensity={0.5} />
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
