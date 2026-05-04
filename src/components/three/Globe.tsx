"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ── Cities with brightness ───────────────────────────────────── */
const CITIES = [
  {lat:31.2,lng:121.5,b:1},{lat:39.9,lng:116.4,b:1},{lat:23.1,lng:113.3,b:.95},
  {lat:22.3,lng:114.2,b:.95},{lat:25,lng:121.5,b:.85},{lat:35.7,lng:139.7,b:1},
  {lat:37.6,lng:127,b:.9},{lat:28.6,lng:77.2,b:.9},{lat:19.1,lng:72.9,b:.85},
  {lat:13.1,lng:80.3,b:.7},{lat:23.8,lng:90.4,b:.75},{lat:1.3,lng:103.8,b:.8},
  {lat:14.6,lng:100.5,b:.75},{lat:-6.2,lng:106.8,b:.85},{lat:14.6,lng:121,b:.7},
  {lat:3.1,lng:101.7,b:.7},{lat:51.5,lng:-0.1,b:.9},{lat:48.9,lng:2.3,b:.9},
  {lat:52.5,lng:13.4,b:.85},{lat:40.4,lng:-3.7,b:.85},{lat:41.9,lng:12.5,b:.8},
  {lat:52.4,lng:4.9,b:.75},{lat:50.1,lng:14.4,b:.75},{lat:47.5,lng:19.1,b:.7},
  {lat:55.8,lng:37.6,b:.9},{lat:59.9,lng:30.3,b:.7},{lat:50.4,lng:30.5,b:.7},
  {lat:50.1,lng:8.7,b:.75},{lat:48.2,lng:16.4,b:.7},{lat:25.2,lng:55.3,b:.8},
  {lat:24.7,lng:46.7,b:.7},{lat:40.7,lng:-74,b:1},{lat:34.1,lng:-118.2,b:.95},
  {lat:41.9,lng:-87.6,b:.9},{lat:29.8,lng:-95.4,b:.8},{lat:33.4,lng:-112.1,b:.7},
  {lat:47.6,lng:-122.3,b:.7},{lat:37.8,lng:-122.4,b:.75},{lat:42.4,lng:-71.1,b:.7},
  {lat:25.8,lng:-80.2,b:.7},{lat:38.9,lng:-77,b:.75},{lat:36.2,lng:-115.1,b:.65},
  {lat:32.7,lng:-96.8,b:.7},{lat:39.7,lng:-105,b:.65},{lat:43.7,lng:-79.4,b:.75},
  {lat:45.5,lng:-73.6,b:.65},{lat:49.3,lng:-123.1,b:.6},{lat:19.4,lng:-99.1,b:.9},
  {lat:-23.5,lng:-46.6,b:.9},{lat:-22.9,lng:-43.2,b:.85},{lat:-34.6,lng:-58.4,b:.8},
  {lat:-33.4,lng:-70.7,b:.7},{lat:-12,lng:-77,b:.7},{lat:4.7,lng:-74.1,b:.7},
  {lat:10.5,lng:-66.9,b:.65},{lat:30,lng:31.2,b:.8},{lat:-1.3,lng:36.8,b:.65},
  {lat:6.5,lng:3.4,b:.65},{lat:-33.9,lng:18.4,b:.6},{lat:-26.2,lng:28,b:.65},
  {lat:33.6,lng:-7.6,b:.55},{lat:-33.9,lng:151.2,b:.7},{lat:-37.8,lng:145,b:.65},
];

/* ── City lights texture ──────────────────────────────────────── */
function makeCityLightsTexture(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  for (const city of CITIES) {
    const px = ((city.lng + 180) / 360) * w;
    const py = ((90 - city.lat) / 180) * h;
    const radius = 5 + city.b * 12;
    const g = ctx.createRadialGradient(px, py, 0, px, py, radius);
    g.addColorStop(0, `rgba(0,${Math.floor(180+75*city.b)},${Math.floor(200+55*city.b)},${city.b})`);
    g.addColorStop(0.4, `rgba(0,${Math.floor(100+40*city.b)},${Math.floor(150+30*city.b)},${city.b*0.5})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/* ── Shader ────────────────────────────────────────────────────── */
const vs = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fs = `
  uniform sampler2D dayTex;
  uniform sampler2D nightTex;
  uniform vec3 sunDir;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 day = texture2D(dayTex, vUv);
    vec4 night = texture2D(nightTex, vUv);

    float NdotL = dot(vNormal, sunDir);
    float dayFactor = smoothstep(-0.2, 0.2, NdotL);

    vec3 dayCol = day.rgb;
    vec3 nightCol = night.rgb * 1.5;
    vec3 color = mix(nightCol, dayCol, dayFactor);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ── Scene ─────────────────────────────────────────────────────── */
function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const dayMap = useTexture("/earth-day.jpg");
  const nightMap = useTexture("/earth-night.jpg");

  useFrame((_, d) => { if (groupRef.current) groupRef.current.rotation.y += d * 0.05; });

  if (!dayMap || !nightMap) return null;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={dayMap} />
      </mesh>
    </group>
  );
}

function GlobeLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--cyan)] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-[var(--cyan)] mt-3" style={{fontFamily:"var(--font-orbitron)"}}>INITIALIZING...</p>
      </div>
    </div>
  );
}

export function Globe() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    let count = 0;
    const check = () => { count++; if (count >= 2) setReady(true); };
    loader.load("/earth-day.jpg", check, undefined, check);
    loader.load("/earth-night.jpg", check, undefined, check);
  }, []);

  if (!ready) return <GlobeLoader />;

  return (
    <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
      <Canvas
        camera={{position:[0,0,2.8],fov:45}}
        style={{width:"100%",height:"100%",background:"transparent"}}
        gl={{alpha:true,antialias:true}}
        resize={{scroll:false,debounce:{scroll:0,resize:0}}}
      >
        <ambientLight intensity={0.3} />
        <GlobeScene />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} minPolarAngle={Math.PI/4} maxPolarAngle={(3*Math.PI)/4} />
      </Canvas>
    </div>
  );
}
