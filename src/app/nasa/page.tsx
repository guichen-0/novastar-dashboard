"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Camera,
  AlertTriangle,
  Sun,
  Flame,
  Rocket,
  Radio,
} from "lucide-react";

const neoObjects = [
  { name: "2026 KA1", diameter: "45m", distance: "0.02 AU", velocity: "12.3 km/s", hazardous: true },
  { name: "2026 JX3", diameter: "120m", distance: "0.08 AU", velocity: "8.7 km/s", hazardous: false },
  { name: "2026 HL7", diameter: "28m", distance: "0.01 AU", velocity: "15.1 km/s", hazardous: true },
  { name: "2026 RF2", diameter: "85m", distance: "0.05 AU", velocity: "10.2 km/s", hazardous: false },
];

const eonetEvents = [
  { name: "伊比利亚半岛野火", status: "活动中", color: "var(--error)" },
  { name: "西太平洋台风", status: "监控中", color: "var(--warning)" },
  { name: "冰岛火山活动", status: "观察中", color: "var(--purple)" },
];

export default function NasaPage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="NASA 太空动态" subtitle="实时星际与近地环境监控网络" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - APOD */}
        <div className="col-span-7 flex flex-col gap-4">
          <div className="glass-panel relative overflow-hidden group min-h-[360px] flex flex-col">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,229,255,0.05)] via-[rgba(139,92,246,0.03)] to-[rgba(255,0,144,0.02)]" />
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.15),transparent_70%)]" />
            </div>

            {/* Scan line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent opacity-40" />

            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 px-3 py-1 rounded border border-[var(--border)] bg-[var(--bg-surface)] backdrop-blur-md text-[10px] text-[var(--cyan)] uppercase tracking-wider">
                  <Camera size={12} />
                  每日天文图片 (APOD)
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-[10px] backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
                  <span className="text-[var(--success)]">LIVE</span>
                </div>
              </div>

              <div className="mt-auto">
                <h2
                  className="text-2xl font-bold text-[var(--text-primary)] mb-2"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  猎户座大星云的核心
                </h2>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 max-w-2xl">
                  这幅极其清晰的影像由哈勃空间望远镜和斯皮策空间望远镜的数据合成，揭示了距离地球约1500光年的猎户座大星云（M42）核心区域的动荡细节。强烈的紫外辐射和恒星风正在雕刻着这片巨大的恒星形成区。
                </p>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  <span>哈勃 + 斯皮策</span>
                  <span>2026-05-04</span>
                  <span>深空天体</span>
                </div>
              </div>
            </div>
          </div>

          {/* NeoWs */}
          <GlassPanel className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Rocket size={16} className="text-[var(--purple)]" />
                近地天体追踪 (NeoWs)
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                UPDATED: 5m AGO
              </span>
            </div>
            <div className="space-y-2">
              {neoObjects.map((obj) => (
                <div
                  key={obj.name}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        obj.hazardous ? "bg-[var(--error)]" : "bg-[var(--success)]"
                      }`}
                    />
                    <span className="text-xs text-[var(--text-primary)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {obj.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    <span>直径 {obj.diameter}</span>
                    <span>{obj.distance}</span>
                    <span>{obj.velocity}</span>
                    {obj.hazardous && (
                      <span className="text-[var(--error)] bg-[rgba(239,68,68,0.1)] px-1.5 py-0.5 rounded border border-[rgba(239,68,68,0.2)]">
                        危险
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - Data Panels */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* EONET */}
          <GlassPanel className="p-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[rgba(0,229,255,0.05)] rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <AlertTriangle size={16} className="text-[var(--warning)]" />
                自然灾害监控 (EONET)
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                UPDATED: 2m AGO
              </span>
            </div>
            <div className="space-y-3 relative z-10">
              {eonetEvents.map((event) => (
                <div
                  key={event.name}
                  className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2 last:border-0"
                >
                  <span className="text-xs text-[var(--text-secondary)]">
                    {event.name}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded border"
                    style={{
                      color: event.color,
                      background: `color-mix(in srgb, ${event.color} 10%, transparent)`,
                      borderColor: `color-mix(in srgb, ${event.color} 20%, transparent)`,
                      fontFamily: "var(--font-jetbrains)",
                    }}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Space Weather */}
          <GlassPanel className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Sun size={16} className="text-[var(--cyan)]" />
                太空天气 (NOAA SWPC)
              </h3>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] mb-1 text-[var(--text-muted)]">
                  <span>太阳活动指数</span>
                  <span className="text-[var(--cyan)]" style={{ fontFamily: "var(--font-jetbrains)" }}>Kp: 4.2</span>
                </div>
                <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--magenta)] w-[42%] relative">
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 blur-sm" />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold text-[var(--cyan)]"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  124
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">太阳黑子数</div>
              </div>
            </div>
          </GlassPanel>

          {/* FIRMS */}
          <GlassPanel className="p-5 relative overflow-hidden flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(239,68,68,0.03)] to-transparent" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Flame size={16} className="text-[var(--error)]" />
                全球火灾热点 (FIRMS)
              </h3>
            </div>
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              <div
                className="text-4xl font-bold text-[var(--error)]"
                style={{
                  fontFamily: "var(--font-orbitron)",
                  textShadow: "0 0 15px rgba(239,68,68,0.5)",
                }}
              >
                8,432
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                24小时内探测热点
              </div>
              <div className="flex gap-4 mt-4 text-[10px]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                <span className="text-[var(--error)]">● 印尼 +312</span>
                <span className="text-[var(--warning)]">● 巴西 +198</span>
                <span className="text-[var(--magenta)]">● 澳大利亚 +87</span>
              </div>
            </div>
          </GlassPanel>

          {/* DSN Status */}
          <GlassPanel className="p-4">
            <div className="flex items-center gap-3">
              <Radio size={14} className="text-[var(--success)]" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[var(--text-secondary)]">深空网络 (DSN)</span>
                  <span className="text-[var(--success)]">在线</span>
                </div>
                <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[var(--success)] w-[87%] rounded-full" />
                </div>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                87%
              </span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
