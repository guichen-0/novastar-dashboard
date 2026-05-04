"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Flame, TrendingUp, AlertTriangle, MapPin } from "lucide-react";

const fireRegions = [
  { name: "印度尼西亚", fires: 312, trend: "+12", severity: "高" },
  { name: "巴西", fires: 198, trend: "+8", severity: "高" },
  { name: "澳大利亚", fires: 87, trend: "+5", severity: "中" },
  { name: "刚果民主共和国", fires: 64, trend: "+3", severity: "中" },
  { name: "俄罗斯", fires: 45, trend: "-2", severity: "低" },
  { name: "美国", fires: 38, trend: "+1", severity: "低" },
];

const hourlyData = [
  { hour: "00", count: 120 },
  { hour: "04", count: 95 },
  { hour: "08", count: 180 },
  { hour: "12", count: 320 },
  { hour: "16", count: 450 },
  { hour: "20", count: 280 },
];

export default function FirePage() {
  const maxCount = Math.max(...hourlyData.map((d) => d.count));

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="火灾热点" subtitle="NASA FIRMS 全球火灾监控" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Fire Map + Chart */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Fire Map */}
          <GlassPanel className="p-5 relative overflow-hidden" style={{ minHeight: 280 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(239,68,68,0.03)] to-transparent" />
            <div className="relative z-10 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                  <Flame size={16} className="text-[var(--error)]" />
                  全球火灾热点分布
                </h3>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] animate-pulse-glow" />
                  <span className="text-[var(--error)]">LIVE</span>
                </div>
              </div>
              {/* Fire dots on map */}
              <div className="relative h-48">
                {[
                  { top: "45%", left: "70%", size: 40, count: "312", label: "印尼" },
                  { top: "55%", left: "30%", size: 30, count: "198", label: "巴西" },
                  { top: "70%", left: "80%", size: 22, count: "87", label: "澳洲" },
                  { top: "50%", left: "48%", size: 18, count: "64", label: "刚果" },
                  { top: "20%", left: "60%", size: 14, count: "45", label: "俄罗斯" },
                  { top: "35%", left: "15%", size: 12, count: "38", label: "美国" },
                ].map((dot) => (
                  <div
                    key={dot.label}
                    className="absolute group cursor-pointer"
                    style={{ top: dot.top, left: dot.left }}
                  >
                    <div
                      className="rounded-full animate-pulse-glow"
                      style={{
                        width: dot.size,
                        height: dot.size,
                        background: "radial-gradient(circle, rgba(239,68,68,0.4), transparent)",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                    />
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-muted)] whitespace-nowrap">
                      {dot.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Hourly Trend */}
          <GlassPanel className="p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              24小时火灾探测趋势
            </h3>
            <div className="flex items-end gap-3 h-28">
              {hourlyData.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                  <span
                    className="text-[9px] text-[var(--text-muted)]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${(d.count / maxCount) * 100}%`,
                      background: "linear-gradient(to top, var(--error), var(--warning))",
                      boxShadow: "0 0 8px rgba(239,68,68,0.3)",
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[9px] text-[var(--text-muted)]">{d.hour}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - Region Stats */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Total Count */}
          <GlassPanel className="p-5 text-center">
            <div
              className="text-4xl font-bold text-[var(--error)]"
              style={{
                fontFamily: "var(--font-orbitron)",
                textShadow: "0 0 15px rgba(239,68,68,0.5)",
              }}
            >
              8,432
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">全球活跃火灾热点</p>
            <p className="text-[10px] text-[var(--error)] mt-2">+12% 较昨日</p>
          </GlassPanel>

          {/* Region List */}
          <GlassPanel className="p-5 flex-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <MapPin size={16} className="text-[var(--warning)]" />
              区域火灾统计
            </h3>
            <div className="space-y-3">
              {fireRegions.map((region) => (
                <div
                  key={region.name}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div>
                    <p className="text-xs text-[var(--text-primary)]">{region.name}</p>
                    <p
                      className="text-[10px] text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {region.fires} 处
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px]"
                      style={{
                        color: region.trend.startsWith("+") ? "var(--error)" : "var(--success)",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {region.trend}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        color: region.severity === "高" ? "var(--error)" : region.severity === "中" ? "var(--warning)" : "var(--success)",
                        background: region.severity === "高" ? "rgba(239,68,68,0.1)" : region.severity === "中" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {region.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Alerts */}
          <GlassPanel className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[var(--error)]" />
              <div className="flex-1">
                <p className="text-[10px] text-[var(--error)] font-bold">高危警报</p>
                <p className="text-[10px] text-[var(--text-muted)]">印尼苏门答腊地区火灾扩散中</p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
