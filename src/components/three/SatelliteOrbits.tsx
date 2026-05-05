"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  computeOrbitPath,
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

interface SatelliteOrbitLineProps {
  sat: SatelliteData;
  visible: boolean;
}

function SatelliteOrbitLine({ sat, visible }: SatelliteOrbitLineProps) {
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const orbitPoints = computeOrbitPath(sat.tleLine1, sat.tleLine2, SAMPLE_COUNT);

    for (const p of orbitPoints) {
      const pos = latLngAltToEcef(p.lat, p.lng, p.alt);
      points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    }

    if (points.length < 2) return null;

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [sat.tleLine1, sat.tleLine2]);

  if (!geometry || !visible) return null;

  return (
    <primitive
      object={new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: ORBIT_COLORS[sat.orbitClass],
          transparent: true,
          opacity: 0.25,
        })
      )}
      ref={lineRef}
    />
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

    const now = new Date();
    const orbitPoints = computeOrbitPath(sat.tleLine1, sat.tleLine2, 1);
    if (orbitPoints.length === 0) return;

    const p = orbitPoints[0];
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
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.015, 8, 8]} />
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
  const [showOrbits, setShowOrbits] = useState(true);

  const orbitClassCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sat of satellites) {
      counts[sat.orbitClass] = (counts[sat.orbitClass] || 0) + 1;
    }
    return counts;
  }, [satellites]);

  return (
    <group>
      {showOrbits &&
        satellites.map((sat) => (
          <SatelliteOrbitLine
            key={`orbit-${sat.noradId}`}
            sat={sat}
            visible={showOrbits}
          />
        ))}
      {satellites.map((sat) => (
        <SatelliteMarker key={`sat-${sat.noradId}`} sat={sat} />
      ))}
    </group>
  );
}
