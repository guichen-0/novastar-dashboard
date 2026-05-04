"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Activity, MapPin, Clock, AlertTriangle } from "lucide-react";

const earthquakes = [
  { location: "日本 千叶县", magnitude: 4.1, depth: 32, time: "2分钟前", color: "var(--magenta)" },
  { location: "智利 圣地亚哥", magnitude: 5.2, depth: 15, time: "15分钟前", color: "var(--error)" },
  { location: "美国 阿拉斯加", magnitude: 3.8, depth: 45, time: "1小时前", color: "var(--cyan)" },
  { location: "印度尼西亚 苏门答腊", magnitude: 4.7, depth: 28, time: "2小时前", color: "var(--warning)" },
  { location: "土耳其 伊斯坦布尔", magnitude: 3.2, depth: 12, time: "3小时前", color: "var(--purple)" },
  { location: "墨西哥 墨西哥城", magnitude: 4.0, depth: 35, time: "4小时前", color: "var(--magenta)" },
  { location: "新西兰 惠灵顿", magnitude: 3.5, depth: 22, time: "5小时前", color: "var(--cyan)" },
  { location: "中国 四川", magnitude: 3.9, depth: 18, time: "6小时前", color: "var(--warning)" },
];

const stats = [
  { label: "今日地震总数", value: "23", color: "var(--magenta)" },
  { label: "最大震级", value: "5.2", color: "var(--error)" },
  { label: "平均深度", value: "28km", color: "var(--cyan)" },
  { label: "活跃区域", value: "8", color: "var(--purple)" },
];

export default function EarthquakePage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="全球地震" subtitle="地球脉搏监测站 · 实时USGS数据" />

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => (
          <GlassPanel key={stat.label} className="p-4 text-center">
            <div
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-orbitron)",
                color: stat.color,
                textShadow: `0 0 10px ${stat.color}40`,
              }}
            >
              {stat.value}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{stat.label}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Earthquake List */}
        <div className="col-span-7">
          <GlassPanel className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Activity size={16} className="text-[var(--magenta)]" />
                最新地震记录
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                LIVE FEED
              </span>
            </div>
            <div className="space-y-2">
              {earthquakes.map((eq, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0 group hover:bg-[rgba(255,255,255,0.02)] rounded-lg px-2 transition-colors"
                >
                  {/* Magnitude indicator */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      fontFamily: "var(--font-orbitron)",
                      background: `color-mix(in srgb, ${eq.color} 15%, transparent)`,
                      color: eq.color,
                      border: `1px solid color-mix(in srgb, ${eq.color} 30%, transparent)`,
                    }}
                  >
                    {eq.magnitude}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)] font-medium">
                      {eq.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        深度 {eq.depth}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {eq.time}
                      </span>
                    </div>
                  </div>

                  {/* Pulse indicator */}
                  <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: eq.color }} />
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - Magnitude Distribution */}
        <div className="col-span-5 flex flex-col gap-4">
          <GlassPanel className="p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              震级分布
            </h3>
            <div className="space-y-3">
              {[
                { range: "3.0 - 3.9", count: 12, pct: 52, color: "var(--cyan)" },
                { range: "4.0 - 4.9", count: 8, pct: 35, color: "var(--warning)" },
                { range: "5.0 - 5.9", count: 2, pct: 9, color: "var(--magenta)" },
                { range: "6.0+", count: 1, pct: 4, color: "var(--error)" },
              ].map((band) => (
                <div key={band.range}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[var(--text-secondary)]">M {band.range}</span>
                    <span className="text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {band.count} 次
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${band.pct}%`,
                        background: band.color,
                        boxShadow: `0 0 8px ${band.color}60`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Active Zones */}
          <GlassPanel className="p-5 flex-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <AlertTriangle size={16} className="text-[var(--warning)]" />
              活跃地震带
            </h3>
            <div className="space-y-3">
              {[
                { name: "环太平洋地震带", events: 14, risk: "高" },
                { name: "阿尔卑斯-喜马拉雅带", events: 5, risk: "中" },
                { name: "大西洋中脊", events: 3, risk: "低" },
                { name: "东非裂谷", events: 1, risk: "低" },
              ].map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div>
                    <p className="text-xs text-[var(--text-primary)]">{zone.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{zone.events} 次地震</p>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      color: zone.risk === "高" ? "var(--error)" : zone.risk === "中" ? "var(--warning)" : "var(--success)",
                      background: zone.risk === "高" ? "rgba(239,68,68,0.1)" : zone.risk === "中" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                      fontFamily: "var(--font-jetbrains)",
                    }}
                  >
                    {zone.risk}风险
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
