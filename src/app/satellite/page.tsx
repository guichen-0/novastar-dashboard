"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Satellite, Radio, Globe, Zap } from "lucide-react";

const satellites = [
  { name: "ISS (ZARYA)", orbit: "LEO", altitude: "408 km", speed: "7.66 km/s", period: "92 min", status: "在线" },
  { name: "HUBBLE", orbit: "LEO", altitude: "547 km", speed: "7.59 km/s", period: "96 min", status: "在线" },
  { name: "GPS IIF-12", orbit: "MEO", altitude: "20,200 km", speed: "3.87 km/s", period: "718 min", status: "在线" },
  { name: "GOES-18", orbit: "GEO", altitude: "35,786 km", speed: "3.07 km/s", period: "1436 min", status: "在线" },
  { name: "STARLINK-5201", orbit: "LEO", altitude: "550 km", speed: "7.60 km/s", period: "95 min", status: "在线" },
  { name: "BEIDOU-3", orbit: "MEO", altitude: "21,528 km", speed: "3.83 km/s", period: "773 min", status: "维护中" },
];

const orbitStats = [
  { label: "低轨道 (LEO)", count: "8,234", color: "var(--cyan)" },
  { label: "中轨道 (MEO)", count: "1,456", color: "var(--purple)" },
  { label: "同步轨道 (GEO)", count: "567", color: "var(--magenta)" },
];

export default function SatellitePage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="卫星追踪" subtitle="地球轨道监控网络 · CelesTrak" />

      {/* Orbit Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {orbitStats.map((stat) => (
          <GlassPanel key={stat.label} className="p-4 text-center">
            <div
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-orbitron)",
                color: stat.color,
                textShadow: `0 0 10px ${stat.color}40`,
              }}
            >
              {stat.count}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{stat.label}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Satellite Orbit Visualization */}
        <div className="col-span-7">
          <GlassPanel className="p-5 h-full relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.2),transparent_70%)]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Satellite size={16} className="text-[var(--cyan)]" />
                  轨道可视化
                </h3>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
                  <span className="text-[var(--success)]">TRACKING</span>
                </div>
              </div>
              {/* Orbit visualization */}
              <div className="flex items-center justify-center h-64">
                <div className="relative">
                  {/* Earth */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--purple)] opacity-30 flex items-center justify-center">
                    <Globe size={24} className="text-[var(--cyan)]" />
                  </div>
                  {/* LEO orbit */}
                  <div className="absolute -inset-8 rounded-full border border-[var(--cyan)] opacity-20 animate-spin" style={{ animationDuration: "20s" }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-[var(--cyan)]" />
                  </div>
                  {/* MEO orbit */}
                  <div className="absolute -inset-16 rounded-full border border-[var(--purple)] opacity-15 animate-spin" style={{ animationDuration: "40s", animationDirection: "reverse" }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-[var(--purple)]" />
                  </div>
                  {/* GEO orbit */}
                  <div className="absolute -inset-24 rounded-full border border-[var(--magenta)] opacity-10 animate-spin" style={{ animationDuration: "60s" }}>
                    <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-[var(--magenta)]" />
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--cyan)]" /> LEO</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--purple)]" /> MEO</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--magenta)]" /> GEO</span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Right - Satellite List */}
        <div className="col-span-5">
          <GlassPanel className="p-5 h-full">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <Radio size={16} className="text-[var(--cyan)]" />
              卫星列表
            </h3>
            <div className="space-y-3">
              {satellites.map((sat) => (
                <div
                  key={sat.name}
                  className="py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-primary)] font-medium" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {sat.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        color: sat.status === "在线" ? "var(--success)" : "var(--warning)",
                        background: sat.status === "在线" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {sat.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    <span>{sat.orbit}</span>
                    <span>{sat.altitude}</span>
                    <span>{sat.speed}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
