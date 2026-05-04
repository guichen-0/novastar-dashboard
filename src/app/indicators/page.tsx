"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TrendingUp, Globe, Users, Wifi, GraduationCap } from "lucide-react";

const indicators = [
  { label: "全球GDP", value: "$105万亿", change: "+3.2%", icon: <TrendingUp size={16} />, color: "var(--cyan)" },
  { label: "全球人口", value: "81.2亿", change: "+0.9%", icon: <Users size={16} />, color: "var(--magenta)" },
  { label: "互联网渗透率", value: "67.4%", change: "+2.1%", icon: <Wifi size={16} />, color: "var(--purple)" },
  { label: "平均受教育年限", value: "8.7年", change: "+0.3", icon: <GraduationCap size={16} />, color: "var(--success)" },
];

const sdgProgress = [
  { goal: "消除贫困", progress: 62, target: 100 },
  { goal: "零饥饿", progress: 48, target: 100 },
  { goal: "良好健康", progress: 71, target: 100 },
  { goal: "优质教育", progress: 68, target: 100 },
  { goal: "清洁能源", progress: 55, target: 100 },
  { goal: "气候行动", progress: 38, target: 100 },
];

const countries = [
  { name: "挪威", hdi: 0.961, rank: 1 },
  { name: "瑞士", hdi: 0.956, rank: 2 },
  { name: "冰岛", hdi: 0.952, rank: 3 },
  { name: "丹麦", hdi: 0.948, rank: 4 },
  { name: "瑞典", hdi: 0.945, rank: 5 },
  { name: "中国", hdi: 0.768, rank: 75 },
  { name: "美国", hdi: 0.921, rank: 21 },
  { name: "日本", hdi: 0.916, rank: 24 },
];

export default function IndicatorsPage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="发展指标" subtitle="地球文明脉搏 · World Bank Data" />

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {indicators.map((ind) => (
          <GlassPanel key={ind.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: ind.color }}>{ind.icon}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{ind.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: "var(--font-orbitron)",
                  color: ind.color,
                }}
              >
                {ind.value}
              </span>
              <span className="text-[10px] text-[var(--success)] mb-0.5">{ind.change}</span>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - SDG Progress */}
        <div className="col-span-7">
          <GlassPanel className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Globe size={16} className="text-[var(--cyan)]" />
                联合国可持续发展目标进度
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                2026 评估
              </span>
            </div>
            <div className="space-y-4">
              {sdgProgress.map((sdg) => (
                <div key={sdg.goal}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">{sdg.goal}</span>
                    <span className="text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                      {sdg.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sdg.progress}%`,
                        background: sdg.progress >= 60
                          ? "var(--success)"
                          : sdg.progress >= 40
                          ? "var(--warning)"
                          : "var(--error)",
                        boxShadow: `0 0 6px ${
                          sdg.progress >= 60
                            ? "rgba(34,197,94,0.4)"
                            : sdg.progress >= 40
                            ? "rgba(245,158,11,0.3)"
                            : "rgba(239,68,68,0.3)"
                        }`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - Country HDI */}
        <div className="col-span-5">
          <GlassPanel className="p-5 h-full">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              人类发展指数 (HDI) 排名
            </h3>
            <div className="space-y-2">
              {countries.map((country) => (
                <div
                  key={country.name}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-bold text-[var(--cyan)] w-6 text-center"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                      #{country.rank}
                    </span>
                    <span className="text-xs text-[var(--text-primary)]">{country.name}</span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      color: country.hdi >= 0.9 ? "var(--success)" : country.hdi >= 0.7 ? "var(--cyan)" : "var(--warning)",
                    }}
                  >
                    {country.hdi.toFixed(3)}
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
