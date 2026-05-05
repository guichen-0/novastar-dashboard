"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import useSWR from "swr";
import { Sun, Zap, Radio, Thermometer } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getSeverity(kp: number): "高" | "中" | "低" {
  if (kp >= 5) return "高";
  if (kp >= 3) return "中";
  return "低";
}

function getKpColor(kp: number): string {
  if (kp >= 5) return "var(--error)";
  if (kp >= 3) return "var(--warning)";
  return "var(--success)";
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function SpaceWeatherPage() {
  const { data: kpData, isLoading: kpLoading } = useSWR(
    "/api/space-weather/kp",
    fetcher,
    { refreshInterval: 300000 }
  );

  const { data: windData, isLoading: windLoading } = useSWR(
    "/api/space-weather/solar-wind",
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: xrayData, isLoading: xrayLoading } = useSWR(
    "/api/space-weather/xray",
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: eventsData, isLoading: eventsLoading } = useSWR(
    "/api/space-weather/events",
    fetcher,
    { refreshInterval: 600000 }
  );

  const kpEntries = kpData?.kp ?? [];
  const solarWind = windData?.plasma ?? [];
  const magData = windData?.mag ?? [];
  const xrayEntries = xrayData?.xray ?? [];
  const events = eventsData?.events ?? [];

  const latestKp = kpEntries.length > 0 ? kpEntries[kpEntries.length - 1].kp_index : 0;
  const latestWind = solarWind.length > 0 ? solarWind[solarWind.length - 1] : null;
  const latestMag = magData.length > 0 ? magData[magData.length - 1] : null;

  const latestXray = xrayEntries.length > 0 ? xrayEntries[xrayEntries.length - 1] : null;
  const xrayFlux = latestXray ? parseFloat(latestXray.flux) : 0;
  const radiationLevel = Math.min(xrayFlux * 1000, 10).toFixed(1);

  const auroraProbNorth = Math.min(Math.round(latestKp * 15), 100);
  const auroraProbSouth = Math.min(Math.round(latestKp * 10), 100);

  const recentEvents = events.slice(0, 5);

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
              {kpLoading ? (
                <div className="h-4 w-16 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
              ) : (
                <span
                  className="text-xs font-bold"
                  style={{ fontFamily: "var(--font-orbitron)", color: getKpColor(latestKp) }}
                >
                  Kp: {latestKp.toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex items-end gap-1 h-32">
              {kpLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-t animate-pulse" style={{ height: `${30 + Math.random() * 40}%` }} />
                    </div>
                  ))
                : kpEntries.slice(-24).map((d: { time_tag: string; kp_index: number }, i: number) => {
                    const time = new Date(d.time_tag);
                    const label = `${String(time.getUTCHours()).padStart(2, "0")}`;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                          {d.kp_index}
                        </span>
                        <div
                          className="w-full rounded-t transition-all duration-300"
                          style={{
                            height: `${(d.kp_index / 9) * 100}%`,
                            background: getKpColor(d.kp_index),
                            boxShadow: `0 0 6px ${d.kp_index >= 5 ? "rgba(239,68,68,0.4)" : d.kp_index >= 3 ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
                            minHeight: 4,
                          }}
                        />
                        <span className="text-[9px] text-[var(--text-muted)]">{label}</span>
                      </div>
                    );
                  })}
            </div>
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
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <div className="h-3 w-32 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mb-2" />
                    <div className="h-2 w-20 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
                  </div>
                ))
              ) : recentEvents.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">暂无近期事件</p>
              ) : (
                recentEvents.map((event: any, i: number) => {
                  const typeMap: Record<string, string> = {
                    CME: "日冕物质抛射",
                    FLR: "太阳耀斑",
                    SEP: "太阳高能粒子",
                    IPC: "行星际冲击波",
                    GST: "地磁暴",
                    "SSC": "太阳冲击波",
                  };
                  const typeName = typeMap[event.messageType] || event.messageType;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                    >
                      <div>
                        <p className="text-xs text-[var(--text-primary)]">{typeName}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-muted)]">
                          <span>{event.sourceLocation || "未知源"}</span>
                          <span>{formatTimeAgo(event.eventTime)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
              {windLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-2 w-20 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mb-2" />
                      <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full" />
                    </div>
                  ))
                : [
                    { label: "太阳风速度", value: latestWind ? latestWind.speed.toFixed(0) : "--", unit: "km/s", pct: latestWind ? Math.min((latestWind.speed / 1000) * 100, 100) : 0 },
                    { label: "质子密度", value: latestWind ? latestWind.density.toFixed(1) : "--", unit: "p/cm³", pct: latestWind ? Math.min((latestWind.density / 20) * 100, 100) : 0 },
                    { label: "磁场强度 Bt", value: latestMag ? latestMag.bt.toFixed(1) : "--", unit: "nT", pct: latestMag ? Math.min((latestMag.bt / 20) * 100, 100) : 0 },
                    { label: "磁场 Bz", value: latestMag ? latestMag.bz_gsm.toFixed(1) : "--", unit: "nT", pct: latestMag ? Math.min(Math.abs(latestMag.bz_gsm) / 10 * 100, 100) : 0 },
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
                          className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--magenta)] rounded-full transition-all duration-500"
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
              辐射水平 (X射线通量)
            </h3>
            <div className="flex items-center justify-center h-24">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[rgba(255,255,255,0.05)] flex items-center justify-center">
                  <div className="text-center">
                    {xrayLoading ? (
                      <div className="h-6 w-12 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mx-auto" />
                    ) : (
                      <div
                        className="text-xl font-bold"
                        style={{
                          fontFamily: "var(--font-orbitron)",
                          color: xrayFlux > 1e-4 ? "var(--error)" : xrayFlux > 1e-5 ? "var(--warning)" : "var(--success)",
                        }}
                      >
                        {xrayFlux > 0 ? xrayFlux.toExponential(1) : "--"}
                      </div>
                    )}
                    <div className="text-[9px] text-[var(--text-muted)]">W/m²</div>
                  </div>
                </div>
                <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48" cy="48" r="44" fill="none"
                    stroke={xrayFlux > 1e-4 ? "var(--error)" : xrayFlux > 1e-5 ? "var(--warning)" : "var(--success)"}
                    strokeWidth="4"
                    strokeDasharray="276"
                    strokeDashoffset={Math.max(276 - (xrayFlux / 1e-4) * 276, 0)}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <p className="text-center text-[10px]" style={{ color: xrayFlux > 1e-4 ? "var(--error)" : "var(--success)" }}>
              {xrayFlux > 1e-4 ? "X级耀斑" : xrayFlux > 1e-5 ? "M级耀斑" : xrayFlux > 1e-6 ? "C级耀斑" : "正常范围"}
            </p>
          </GlassPanel>

          {/* Aurora Forecast */}
          <GlassPanel className="p-5 flex-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
              极光预报
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">北极区域</span>
                <span style={{ color: auroraProbNorth > 50 ? "var(--success)" : auroraProbNorth > 20 ? "var(--warning)" : "var(--text-muted)" }}>
                  可见概率 {auroraProbNorth}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">南极区域</span>
                <span style={{ color: auroraProbSouth > 50 ? "var(--success)" : auroraProbSouth > 20 ? "var(--warning)" : "var(--text-muted)" }}>
                  可见概率 {auroraProbSouth}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Kp 阈值</span>
                <span className="text-[var(--text-muted)]">
                  {latestKp >= 7 ? "全球可见" : latestKp >= 5 ? "高纬可见" : latestKp >= 3 ? "极区可见" : "不可见"}
                </span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
