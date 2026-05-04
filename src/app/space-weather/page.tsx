"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Sun, Zap, Radio, Thermometer } from "lucide-react";

const solarEvents = [
  { type: "M2.1 耀斑", time: "4小时前", source: "AR3842", severity: "中" },
  { type: "日冕物质抛射", time: "8小时前", source: "AR3839", severity: "高" },
  { type: "太阳高能粒子", time: "12小时前", source: "L1监测站", severity: "低" },
];

const kpIndex = [
  { hour: "00", value: 3 },
  { hour: "03", value: 4 },
  { hour: "06", value: 5 },
  { hour: "09", value: 4 },
  { hour: "12", value: 3 },
  { hour: "15", value: 4 },
  { hour: "18", value: 3 },
  { hour: "21", value: 2 },
];

export default function SpaceWeatherPage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="太空天气" subtitle="太阳活动与太空环境 · NOAA SWPC" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Solar Activity */}
        <div className="col-span-7 flex flex-col gap-4">
          {/* Kp Index Chart */}
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Sun size={16} className="text-[var(--cyan)]" />
                地磁活动 Kp 指数
              </h3>
              <span
                className="text-xs font-bold text-[var(--warning)]"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                Kp: 4.2
              </span>
            </div>
            <div className="flex items-end gap-2 h-32">
              {kpIndex.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span
                    className="text-[9px] text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {d.value}
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${(d.value / 9) * 100}%`,
                      background:
                        d.value >= 5
                          ? "var(--error)"
                          : d.value >= 3
                          ? "var(--warning)"
                          : "var(--success)",
                      boxShadow: `0 0 6px ${
                        d.value >= 5
                          ? "rgba(239,68,68,0.4)"
                          : d.value >= 3
                          ? "rgba(245,158,11,0.3)"
                          : "rgba(34,197,94,0.3)"
                      }`,
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[9px] text-[var(--text-muted)]">{d.hour}</span>
                </div>
              ))}
            </div>
            {/* Kp scale */}
            <div className="flex items-center gap-2 mt-3 text-[9px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[var(--success)]" /> 低 (0-2)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[var(--warning)]" /> 中 (3-4)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[var(--error)]" /> 高 (5+)</span>
            </div>
          </GlassPanel>

          {/* Solar Events */}
          <GlassPanel className="p-5 flex-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <Zap size={16} className="text-[var(--warning)]" />
              太空天气事件
            </h3>
            <div className="space-y-3">
              {solarEvents.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div>
                    <p className="text-xs text-[var(--text-primary)]">{event.type}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-muted)]">
                      <span>{event.source}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      color: event.severity === "高" ? "var(--error)" : event.severity === "中" ? "var(--warning)" : "var(--success)",
                      background: event.severity === "高" ? "rgba(239,68,68,0.1)" : event.severity === "中" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                      fontFamily: "var(--font-jetbrains)",
                    }}
                  >
                    {event.severity}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - Solar Wind & Radiation */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Solar Wind */}
          <GlassPanel className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <Thermometer size={16} className="text-[var(--magenta)]" />
              太阳风参数
            </h3>
            <div className="space-y-4">
              {[
                { label: "太阳风速度", value: "425", unit: "km/s", pct: 42 },
                { label: "质子密度", value: "5.2", unit: "p/cm³", pct: 26 },
                { label: "磁场强度", value: "6.8", unit: "nT", pct: 34 },
                { label: "温度", value: "1.2×10⁵", unit: "K", pct: 60 },
              ].map((param) => (
                <div key={param.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[var(--text-secondary)]">{param.label}</span>
                    <span className="text-[var(--cyan)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {param.value} {param.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--magenta)] rounded-full"
                      style={{ width: `${param.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Radiation Level */}
          <GlassPanel className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
              <Radio size={16} className="text-[var(--purple)]" />
              辐射水平
            </h3>
            <div className="flex items-center justify-center h-24">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[rgba(255,255,255,0.05)] flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="text-xl font-bold text-[var(--success)]"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                      0.8
                    </div>
                    <div className="text-[9px] text-[var(--text-muted)]">mSv/h</div>
                  </div>
                </div>
                <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="44" fill="none" stroke="var(--success)" strokeWidth="4" strokeDasharray="276" strokeDashoffset="220" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="text-center text-[10px] text-[var(--success)]">正常范围</p>
          </GlassPanel>

          {/* Aurora Forecast */}
          <GlassPanel className="p-5 flex-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
              极光预报
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">北极区域</span>
                <span className="text-[var(--success)]">可见概率 65%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">南极区域</span>
                <span className="text-[var(--warning)]">可见概率 45%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">高纬度地区</span>
                <span className="text-[var(--text-muted)]">不可见</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
