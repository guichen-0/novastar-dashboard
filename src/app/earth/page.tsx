"use client";

import { Globe } from "@/components/three/Globe";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatsCard } from "@/components/ui/StatsCard";
import useSWR from "swr";
import {
  Radio,
  Wifi,
} from "lucide-react";
import type { SatelliteData } from "@/lib/satellite";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const dataStreams = [
  { label: "GitHub 贡献", value: "+2,341", color: "var(--cyan)" },
  { label: "NASA 事件", value: "12", color: "var(--purple)" },
  { label: "地震活动", value: "23", color: "var(--magenta)" },
  { label: "卫星信号", value: "8,234", color: "var(--success)" },
];

export default function EarthPage() {
  const { data: satData } = useSWR<{ satellites: SatelliteData[] }>(
    "/api/satellites?group=stations",
    fetcher,
    { refreshInterval: 300000 }
  );

  const satellites = satData?.satellites ?? [];

  const orbitStats = [
    { label: "LEO", count: satellites.filter((s) => s.orbitClass === "LEO").length, color: "#00E5FF" },
    { label: "MEO", count: satellites.filter((s) => s.orbitClass === "MEO").length, color: "#8B5CF6" },
    { label: "GEO", count: satellites.filter((s) => s.orbitClass === "GEO").length, color: "#FF0090" },
    { label: "HEO", count: satellites.filter((s) => s.orbitClass === "HEO").length, color: "#F59E0B" },
  ];

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--cyan)] glow-text-cyan"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            全球互联
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            全球数据互联网络 · 实时可视化
          </p>
        </div>
        <div className="flex items-center gap-4">
          {orbitStats.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[10px]" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--text-muted)" }}>
                {s.label} {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Globe - Full width */}
        <div className="col-span-12 relative overflow-hidden" style={{ height: 500 }}>
          <Globe satellites={satellites} />

          {/* Floating Stats */}
          <div className="absolute top-4 right-4 flex flex-col gap-3">
            <StatsCard label="在轨卫星" value={`${satellites.length}`} color="cyan" />
            <StatsCard label="轨道类型" value={`${orbitStats.filter((s) => s.count > 0).length}`} color="purple" />
          </div>
          <div className="absolute bottom-4 left-4 flex flex-col gap-3">
            <StatsCard label="数据流" value="1.2 TB/s" color="magenta" />
            <StatsCard label="在线率" value="99.7%" color="success" />
          </div>
        </div>

        {/* Data Streams */}
        <div className="col-span-12">
          <div className="grid grid-cols-4 gap-4">
            {dataStreams.map((stream) => (
              <GlassPanel key={stream.label} className="p-4 text-center">
                <div
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    color: stream.color,
                    textShadow: `0 0 10px ${stream.color}40`,
                  }}
                >
                  {stream.value}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{stream.label}</p>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Network Status */}
        <div className="col-span-6">
          <GlassPanel className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <Radio size={16} className="text-[var(--cyan)]" />
              网络状态
            </h3>
            <div className="space-y-3">
              {[
                { name: "北美节点", status: "在线", latency: "12ms" },
                { name: "欧洲节点", status: "在线", latency: "28ms" },
                { name: "亚太节点", status: "在线", latency: "45ms" },
                { name: "南美节点", status: "延迟", latency: "120ms" },
                { name: "非洲节点", status: "在线", latency: "67ms" },
              ].map((node) => (
                <div
                  key={node.name}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        node.status === "在线" ? "bg-[var(--success)]" : "bg-[var(--warning)]"
                      }`}
                    />
                    <span className="text-xs text-[var(--text-primary)]">{node.name}</span>
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      color: node.status === "在线" ? "var(--text-muted)" : "var(--warning)",
                    }}
                  >
                    {node.latency}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Data Transfer */}
        <div className="col-span-6">
          <GlassPanel className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
              <Wifi size={16} className="text-[var(--purple)]" />
              数据传输
            </h3>
            <div className="space-y-4">
              {[
                { label: "入站流量", value: "856 GB/s", pct: 72 },
                { label: "出站流量", value: "412 GB/s", pct: 45 },
                { label: "API 调用", value: "2.4M/min", pct: 60 },
                { label: "缓存命中率", value: "94.2%", pct: 94 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[var(--text-secondary)]">{item.label}</span>
                    <span className="text-[var(--cyan)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {item.value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--purple)] rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
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
