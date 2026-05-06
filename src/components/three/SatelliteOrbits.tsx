"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  computeOrbitPath,
  computeCurrentPosition,
  latLngAltToEcef,
  type SatelliteData,
} from "@/lib/satellite";

const ORBIT_COLORS: Record<SatelliteData["orbitClass"], string> = {
  LEO: "#00E5FF",
  MEO: "#8B5CF6",
  GEO: "#FF0090",
  HEO: "#F59E0B",
};

const SAMPLE_COUNT = 128;
const MAX_VISIBLE_ORBITS = 8;

interface SatelliteOrbitLineProps {
  sat: SatelliteData;
  visible: boolean;
}

function SatelliteOrbitLine({ sat, visible }: SatelliteOrbitLineProps) {
  const points = useMemo(() => {
    const orbitPoints = computeOrbitPath(sat.tleLine1, sat.tleLine2, SAMPLE_COUNT);
    if (orbitPoints.length < 2) return null;
    return orbitPoints.map((p): [number, number, number] => [p.x, p.y, p.z]);
  }, [sat.tleLine1, sat.tleLine2]);

  if (!points || !visible) return null;

  const color = ORBIT_COLORS[sat.orbitClass];

  return (
    <group>
      {/* Back half: visible through globe, low opacity */}
      <Line
        points={points}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.15}
        depthTest={false}
        depthWrite={false}
      />
      {/* Front half: fully visible */}
      <Line
        points={points}
        color={color}
        lineWidth={1.5}
        transparent
        opacity={0.6}
        depthTest={true}
        depthWrite={false}
      />
    </group>
  );
}

interface SatelliteMarkerProps {
  sat: SatelliteData;
}

function SatelliteMarker({ sat }: SatelliteMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    const p = computeCurrentPosition(sat.tleLine1, sat.tleLine2);
    if (!p) return;

    const pos = latLngAltToEcef(p.lat, p.lng, p.alt);
    meshRef.current.position.set(pos.x, pos.y, pos.z);

    if (glowRef.current) {
      glowRef.current.position.set(pos.x, pos.y, pos.z);
    }
  });

  const color = ORBIT_COLORS[sat.orbitClass];

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export interface SatelliteOrbitsData {
  satellites: SatelliteData[];
}

export function SatelliteOrbits({ satellites }: SatelliteOrbitsData) {
  const visibleSats = useMemo(() => {
    if (satellites.length <= MAX_VISIBLE_ORBITS) return satellites;

    // Distribute evenly across orbit classes, then by altitude
    const byClass = new Map<string, SatelliteData[]>();
    for (const sat of satellites) {
      const list = byClass.get(sat.orbitClass) ?? [];
      list.push(sat);
      byClass.set(sat.orbitClass, list);
    }

    const picked: SatelliteData[] = [];
    const perClass = Math.ceil(MAX_VISIBLE_ORBITS / byClass.size);

    for (const [, sats] of byClass) {
      sats.sort((a, b) => a.altitude - b.altitude);
      const step = Math.max(1, Math.floor(sats.length / perClass));
      for (let i = 0; i < sats.length && picked.length < MAX_VISIBLE_ORBITS; i += step) {
        picked.push(sats[i]);
      }
    }

    return picked;
  }, [satellites]);

  return (
    <group>
      {visibleSats.map((sat) => (
        <SatelliteOrbitLine
          key={`orbit-${sat.noradId}`}
          sat={sat}
          visible={true}
        />
      ))}
      {visibleSats.map((sat) => (
        <SatelliteMarker key={`sat-${sat.noradId}`} sat={sat} />
      ))}
    </group>
  );
}
