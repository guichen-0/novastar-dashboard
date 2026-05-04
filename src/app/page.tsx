import { StatsCard } from "@/components/ui/StatsCard";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function DashboardPage() {
  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--cyan)] glow-text-cyan"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            指挥中心
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            星际数据中枢 · 实时监控
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <span
            className="text-[var(--cyan)]"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            2026-05-05
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse-glow" />
            系统在线
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100%-88px)]">
        {/* Left Column */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Data Terminal */}
          <GlassPanel className="flex-1 p-4" title="实时数据流">
            <div
              className="text-xs space-y-1 text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <p>
                <span className="text-[var(--text-muted)]">[14:32:01]</span>{" "}
                <span className="text-[var(--cyan)]">[GitHub]</span> react/star
                +23
              </p>
              <p>
                <span className="text-[var(--text-muted)]">[14:32:03]</span>{" "}
                <span className="text-[var(--purple)]">[NASA]</span> APOD 更新
                完成
              </p>
              <p>
                <span className="text-[var(--text-muted)]">[14:32:05]</span>{" "}
                <span className="text-[var(--magenta)]">[USGS]</span> 日本
                4.1级地震
              </p>
              <p>
                <span className="text-[var(--text-muted)]">[14:32:07]</span>{" "}
                <span className="text-[var(--cyan)]">[CelesTrak]</span> ISS
                轨道更新
              </p>
              <p>
                <span className="text-[var(--text-muted)]">[14:32:09]</span>{" "}
                <span className="text-[var(--purple)]">[RainViewer]</span>{" "}
                东京降雨
              </p>
              <p>
                <span className="text-[var(--text-muted)]">[14:32:11]</span>{" "}
                <span className="text-[var(--magenta)]">[FIRMS]</span>{" "}
                印尼火灾+3
              </p>
            </div>
          </GlassPanel>

          {/* NASA */}
          <GlassPanel className="p-4" title="NASA 太空动态">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>🌋</span>
                <span>冰岛火山喷发 · 2小时前</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>☀️</span>
                <span>M级太阳耀斑 · 4小时前</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>🪨</span>
                <span>小行星飞掠 · 距地球0.05AU</span>
              </div>
            </div>
          </GlassPanel>

          {/* Weather */}
          <GlassPanel className="p-4" title="实时天气">
            <div className="flex items-end gap-2">
              <span
                className="text-3xl font-bold text-[var(--cyan)] glow-text-cyan"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                28°C
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              晴 · 东北风3级
            </p>
            <p className="text-xs text-[var(--text-muted)]">北京, 中国</p>
            <div
              className="flex gap-3 mt-2 text-[10px] text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <span>湿度 65%</span>
              <span>风速 12km/h</span>
              <span>气压 1013hPa</span>
            </div>
          </GlassPanel>
        </div>

        {/* Center - Globe Area */}
        <div className="col-span-5 flex items-center justify-center relative">
          {/* Globe Placeholder */}
          <div className="w-80 h-80 rounded-full border border-[var(--cyan)] border-opacity-30 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-[var(--cyan)] opacity-20 animate-pulse-glow" />
            <div className="absolute inset-4 rounded-full border border-[var(--cyan)] opacity-10" />
            <div className="absolute inset-8 rounded-full border border-[var(--cyan)] opacity-5" />
            <div className="text-center">
              <p
                className="text-[var(--cyan)] text-sm"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                🌍
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                3D 地球加载中...
              </p>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute top-4 right-4">
            <StatsCard label="全球节点" value="12,456" color="cyan" />
          </div>
          <div className="absolute bottom-4 left-4">
            <StatsCard label="今日地震" value="23" color="magenta" />
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Earthquake */}
          <GlassPanel className="p-4" title="地震监测">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-secondary)]">
                今日总数
              </span>
              <span
                className="text-lg font-bold text-[var(--magenta)]"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                23次
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-[var(--magenta)]" />
                <div>
                  <p className="text-[var(--text-primary)]">
                    日本 千叶县 · 4.1级
                  </p>
                  <p className="text-[var(--text-muted)]">
                    深度32km · 2分钟前
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-[var(--purple)]" />
                <div>
                  <p className="text-[var(--text-primary)]">
                    智利 圣地亚哥 · 5.2级
                  </p>
                  <p className="text-[var(--text-muted)]">
                    深度15km · 15分钟前
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-[var(--cyan)]" />
                <div>
                  <p className="text-[var(--text-primary)]">
                    美国 阿拉斯加 · 3.8级
                  </p>
                  <p className="text-[var(--text-muted)]">
                    深度45km · 1小时前
                  </p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* GitHub Trending */}
          <GlassPanel className="p-4" title="GitHub 热门">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)]">
                  quantum-core/neo-sync
                </span>
                <span className="text-[var(--magenta)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  ⭐14.2k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)]">
                  cyber-ui/glass-kit
                </span>
                <span className="text-[var(--magenta)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  ⭐8.9k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)]">
                  void-ops/dark-matter-db
                </span>
                <span className="text-[var(--magenta)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  ⭐45.3k
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Satellite */}
          <GlassPanel className="p-4" title="卫星轨道追踪">
            <div className="space-y-2 text-xs" style={{ fontFamily: "var(--font-jetbrains)" }}>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">低轨道 (LEO)</span>
                <span className="text-[var(--cyan)]">8,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">中轨道 (MEO)</span>
                <span className="text-[var(--purple)]">1,456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">同步轨道 (GEO)</span>
                <span className="text-[var(--magenta)]">567</span>
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2">
              🟡 ISS 位置：南太平洋上空
            </p>
          </GlassPanel>

          {/* Fire */}
          <GlassPanel className="p-4" title="全球火灾热点">
            <p
              className="text-lg font-bold text-[var(--error)]"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              156处
            </p>
            <div className="space-y-1 mt-2 text-xs text-[var(--text-secondary)]">
              <p>🟠 印度尼西亚 +12</p>
              <p>🔴 巴西 +8</p>
              <p>🟠 澳大利亚 +5</p>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
