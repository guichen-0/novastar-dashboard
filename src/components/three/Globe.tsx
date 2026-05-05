"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SatelliteOrbits } from "./SatelliteOrbits";
import type { SatelliteData } from "@/lib/satellite";

const EARTH_RADIUS = 1;
const EARTH_SEGMENTS = 64;

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

    // Sharp terminator: narrow transition zone (~6°)
    float dayFactor = smoothstep(-0.05, 0.08, sunDot);

    // Night lights from VIIRS Black Marble data
    float nightLum = dot(nightColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 lights = nightColor.rgb * smoothstep(0.02, 0.12, nightLum) * 1.8;

    // Base: day texture on day side, near-black on night side
    vec3 base = mix(vec3(0.005, 0.005, 0.01), dayColor.rgb, dayFactor);

    // Blend: lights show on night side, fade on day side
    float nightFactor = 1.0 - dayFactor;
    vec3 finalColor = base + lights * nightFactor;

    // Thin terminator glow (atmospheric scattering hint)
    float terminator = 1.0 - smoothstep(0.0, 0.18, abs(sunDot));
    finalColor += vec3(0.04, 0.15, 0.3) * terminator * 0.15;

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

    // Compute sub-solar point direction in world space.
    // declRad: solar declination (seasonal tilt, ±23.44°)
    // sunLon: hour angle based on UTC (sunLon=0 at UTC noon)
    // The resulting vector points FROM Earth's center TO the sub-solar point,
    // giving dot(surfaceNormal, sunDir) > 0 on the day side.
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(Date.UTC(now.getUTCFullYear(), 0, 0)).getTime()) / 86400000
    );
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    const decl = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const declRad = (decl * Math.PI) / 180;
    const sunLon = ((utcHours - 12) / 12) * Math.PI;

    // Negate: formula gives direction from center to sub-solar point.
    // Shader needs direction toward sun (dot > 0 = day).
    const x = -(Math.cos(declRad) * Math.sin(sunLon));
    const y = -(Math.sin(declRad));
    const z = -(Math.cos(declRad) * Math.cos(sunLon));

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
