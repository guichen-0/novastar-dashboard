"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function WireframeGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.1;
    }
  });

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
            radius * Math.cos(rad) * 1.01,
            y * 1.01,
            radius * Math.sin(rad) * 1.01
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
            Math.cos(latRad) * Math.cos(rad) * 1.01,
            Math.sin(latRad) * 1.01,
            Math.cos(latRad) * Math.sin(rad) * 1.01
          )
        );
      }
      lines.push(points);
    }

    return lines;
  }, []);

  return (
    <group ref={glowRef}>
      {/* Main sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#00E5FF"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe grid */}
      <group ref={globeRef}>
        {gridLines.map((points, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00E5FF" transparent opacity={0.25} />
          </line>
        ))}
      </group>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.03}
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
      const r = 1.02;
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
        <mesh key={point.name} position={point.position}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#00E5FF" />
        </mesh>
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
        const r = 1.02;
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
      };

      const start = toVec(conn.from[0], conn.from[1]);
      const end = toVec(conn.to[0], conn.to[1]);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1.4);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(40);
    });
  }, []);

  return (
    <>
      {arcs.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00E5FF" transparent opacity={0.15} />
        </line>
      ))}
    </>
  );
}

function SatelliteOrbits() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 60, 120].map((inclination, i) => (
        <mesh
          key={i}
          rotation={[(inclination * Math.PI) / 180, 0, 0]}
        >
          <torusGeometry args={[1.3, 0.002, 8, 100]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      <WireframeGlobe />
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
    </Canvas>
  );
}
