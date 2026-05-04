"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
} from "lucide-react";

const forecast = [
  { day: "周一", high: 28, low: 18, icon: "☀", condition: "晴" },
  { day: "周二", high: 26, low: 17, icon: "⛅", condition: "多云" },
  { day: "周三", high: 24, low: 16, icon: "🌧", condition: "小雨" },
  { day: "周四", high: 22, low: 15, icon: "🌧", condition: "中雨" },
  { day: "周五", high: 25, low: 16, icon: "⛅", condition: "多云" },
  { day: "周六", high: 27, low: 17, icon: "☀", condition: "晴" },
  { day: "周日", high: 29, low: 19, icon: "☀", condition: "晴" },
];

const cities = [
  { name: "北京", temp: 28, condition: "晴", humidity: 65 },
  { name: "上海", temp: 26, condition: "多云", humidity: 72 },
  { name: "东京", temp: 22, condition: "阴", humidity: 80 },
  { name: "纽约", temp: 18, condition: "晴", humidity: 55 },
  { name: "伦敦", temp: 14, condition: "小雨", humidity: 85 },
  { name: "悉尼", temp: 16, condition: "多云", humidity: 70 },
];

export default function WeatherPage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="天气监测" subtitle="全球气象监测站 · 实时数据" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Current Weather */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Main weather card */}
          <GlassPanel className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,229,255,0.05)] to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">当前位置</p>
                  <h2
                    className="text-lg font-bold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                  >
                    北京, 中国
                  </h2>
                </div>
                <div className="text-5xl">☀</div>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span
                  className="text-6xl font-bold text-[var(--cyan)]"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    textShadow: "0 0 20px rgba(0,229,255,0.4)",
                  }}
                >
                  28°
                </span>
                <span className="text-lg text-[var(--text-muted)] mb-2">C</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                晴 · 东北风3级 · 体感 30°
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Droplets size={14} className="text-[var(--cyan)]" />
                  <span>湿度 65%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Wind size={14} className="text-[var(--cyan)]" />
                  <span>风速 12km/h</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Gauge size={14} className="text-[var(--cyan)]" />
                  <span>气压 1013hPa</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Eye size={14} className="text-[var(--cyan)]" />
                  <span>能见度 10km</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Sunrise size={14} className="text-[var(--warning)]" />
                  <span>日出 05:42</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Sunset size={14} className="text-[var(--magenta)]" />
                  <span>日落 19:18</span>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Air Quality */}
          <GlassPanel className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cloud size={16} className="text-[var(--cyan)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">空气质量</h3>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="text-3xl font-bold text-[var(--success)]"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                42
              </div>
              <div className="flex-1">
                <p className="text-xs text-[var(--success)] mb-1">优</p>
                <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--success)] to-[var(--warning)] w-[14%] rounded-full" />
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Center - 7 Day Forecast */}
        <div className="col-span-4 flex flex-col gap-4">
          <GlassPanel className="p-5 flex-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              7日预报
            </h3>
            <div className="space-y-3">
              {forecast.map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <span className="text-xs text-[var(--text-secondary)] w-12">
                    {day.day}
                  </span>
                  <span className="text-lg">{day.icon}</span>
                  <span className="text-xs text-[var(--text-muted)] w-16 text-center">
                    {day.condition}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {day.high}°
                    </span>
                    <div className="w-16 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--magenta)] rounded-full"
                        style={{
                          width: `${((day.high - 10) / 25) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs text-[var(--text-muted)]"
                      style={{ fontFamily: "var(--font-jetbrains)" }}
                    >
                      {day.low}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right - City Comparison */}
        <div className="col-span-3 flex flex-col gap-4">
          <GlassPanel className="p-5 flex-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              全球城市
            </h3>
            <div className="space-y-3">
              {cities.map((city) => (
                <div
                  key={city.name}
                  className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                >
                  <div>
                    <p className="text-xs text-[var(--text-primary)]">{city.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{city.condition}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold text-[var(--cyan)]"
                      style={{ fontFamily: "var(--font-orbitron)" }}
                    >
                      {city.temp}°
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      湿度 {city.humidity}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Wind Rose */}
          <GlassPanel className="p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
              风向风速
            </h3>
            <div className="flex items-center justify-center h-24">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
                <div className="absolute inset-2 rounded-full border border-[rgba(0,229,255,0.1)]" />
                <div className="absolute inset-4 rounded-full border border-[rgba(0,229,255,0.05)]" />
                {/* N S E W labels */}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-muted)]">N</span>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-[var(--text-muted)]">S</span>
                <span className="absolute top-1/2 -right-1 -translate-y-1/2 text-[8px] text-[var(--text-muted)]">E</span>
                <span className="absolute top-1/2 -left-1 -translate-y-1/2 text-[8px] text-[var(--text-muted)]">W</span>
                {/* Wind direction indicator */}
                <div className="absolute top-1 left-1/2 w-0.5 h-6 bg-[var(--cyan)] origin-bottom -translate-x-1/2 rotate-45 rounded-full" />
              </div>
            </div>
            <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
              东北风 12km/h
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
