"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CloudRain, Droplets, TrendingUp, MapPin } from "lucide-react";

const regions = [
  { name: "东南亚", rain: "暴雨", intensity: 95, color: "var(--cyan)" },
  { name: "东亚", rain: "中雨", intensity: 65, color: "var(--purple)" },
  { name: "南亚", rain: "大雨", intensity: 80, color: "var(--cyan)" },
  { name: "欧洲", rain: "小雨", intensity: 30, color: "var(--text-muted)" },
  { name: "北美", rain: "阵雨", intensity: 45, color: "var(--warning)" },
  { name: "南美", rain: "暴雨", intensity: 88, color: "var(--magenta)" },
];

const rainfallData = [
  { hour: "00", mm: 2 },
  { hour: "03", mm: 5 },
  { hour: "06", mm: 12 },
  { hour: "09", mm: 8 },
  { hour: "12", mm: 15 },
  { hour: "15", mm: 22 },
  { hour: "18", mm: 18 },
  { hour: "21", mm: 10 },
];

export default function RainfallPage() {
  const maxMm = Math.max(...rainfallData.map((d) => d.mm));

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="降雨监测" subtitle="全球气象监测网络 · RainViewer" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Map Area */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Rain Map Placeholder */}
          <GlassPanel className="p-5 relative overflow-hidden" style={{ minHeight: 320 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,229,255,0.03)] to-[rgba(139,92,246,0.02)]" />
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }} />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <CloudRain size={16} className="text-[var(--cyan)]" />
                  全球降雨雷达
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
                  LIVE
                </div>
              </div>
              {/* Simulated rain regions on map */}
              <div className="flex-1 relative">
                {[
                  { top: "20%", left: "65%", size: 60, color: "var(--cyan)", label: "东南亚" },
                  { top: "30%", left: "75%", size: 40, color: "var(--purple)", label: "东亚" },
                  { top: "40%", left: "55%", size: 50, color: "var(--cyan)", label: "南亚" },
                  { top: "25%", left: "35%", size: 30, color: "var(--text-muted)", label: "欧洲" },
                  { top: "30%", left: "15%", size: 35, color: "var(--warning)", label: "北美" },
                  { top: "60%", left: "25%", size: 45, color: "var(--magenta)", label: "南美" },
                ].map((point) => (
                  <div
                    key={point.label}
                    className="absolute group cursor-pointer"
                    style={{ top: point.top, left: point.left }}
                  >
                    <div
                      className="rounded-full animate-pulse-glow"
                      style={{
                        width: point.size,
                        height: point.size,
                        background: `radial-gradient(circle, ${point.color}30, transparent)`,
                        border: `1px solid ${point.color}40`,
                      }}
                    />
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-muted)] whitespace-nowrap">
                      {point.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Rainfall Chart */}
          <GlassPanel className="p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              24小时降雨量 (北京)
            </h3>
            <div className="flex items-end gap-2 h-32">
              {rainfallData.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span
                    className="text-[9px] text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {d.mm}mm
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${(d.mm / maxMm) * 100}%`,
                      background: `linear-gradient(to top, var(--cyan), var(--cyan-light))`,
                      boxShadow: "0 0 8px rgba(0,229,255,0.3)",
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[9px] text-[var(--text-muted)]">{d.hour}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - Region List */}
        <div className="col-span-4 flex flex-col gap-4">
          <GlassPanel className="p-5 flex-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <MapPin size={16} className="text-[var(--cyan)]" />
              区域降雨状态
            </h3>
            <div className="space-y-3">
              {regions.map((region) => (
                <div key={region.name} className="py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[var(--text-primary)]">{region.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{region.rain}</span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${region.intensity}%`,
                        background: region.color,
                        boxShadow: `0 0 6px ${region.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Stats */}
          <GlassPanel className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
              <TrendingUp size={16} className="var(--warning)" />
              降雨统计
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">今日累计</span>
                <span className="text-[var(--cyan)] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  92mm
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">本周累计</span>
                <span className="text-[var(--cyan)] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  348mm
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">本月累计</span>
                <span className="text-[var(--cyan)] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  1,205mm
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">活跃降雨区</span>
                <span className="text-[var(--magenta)] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  24
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Legend */}
          <GlassPanel className="p-4">
            <p className="text-[10px] text-[var(--text-muted)] mb-2">降雨强度图例</p>
            <div className="flex items-center gap-1">
              {["var(--text-muted)", "var(--cyan)", "var(--purple)", "var(--warning)", "var(--magenta)", "var(--error)"].map((c, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-sm"
                  style={{ background: c, opacity: 0.3 + i * 0.14 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] text-[var(--text-muted)] mt-1">
              <span>弱</span>
              <span>强</span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
