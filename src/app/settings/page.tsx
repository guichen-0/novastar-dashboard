"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Settings,
  Key,
  RefreshCw,
  Database,
  Bell,
  Palette,
  Shield,
  Check,
} from "lucide-react";

const apiSources = [
  { name: "GitHub API", status: "已配置", key: "ghp_****...7cm", active: true },
  { name: "NASA API", status: "未配置", key: "", active: false },
  { name: "OpenWeather", status: "已配置", key: "ow_****...a3f", active: true },
  { name: "USGS API", status: "免费", key: "无需密钥", active: true },
  { name: "CelesTrak", status: "免费", key: "无需密钥", active: true },
  { name: "NewsAPI", status: "未配置", key: "", active: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"api" | "appearance" | "notifications" | "data">("api");

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="系统设置" subtitle="飞船系统控制中心" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Left - Settings Navigation */}
        <div className="col-span-3">
          <GlassPanel className="p-3">
            <nav className="space-y-1">
              {[
                { id: "api" as const, label: "API 配置", icon: <Key size={16} /> },
                { id: "appearance" as const, label: "外观设置", icon: <Palette size={16} /> },
                { id: "notifications" as const, label: "通知管理", icon: <Bell size={16} /> },
                { id: "data" as const, label: "数据管理", icon: <Database size={16} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                    activeTab === tab.id
                      ? "bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border-l-2 border-[var(--cyan)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-[var(--cyan)]" : "text-[var(--text-muted)]"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </GlassPanel>
        </div>

        {/* Right - Settings Content */}
        <div className="col-span-9">
          {activeTab === "api" && (
            <div className="space-y-4">
              <GlassPanel className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                    <Key size={16} className="text-[var(--cyan)]" />
                    数据源 API 密钥
                  </h3>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[10px] text-[var(--cyan)] hover:border-[var(--cyan)] transition-all">
                    <RefreshCw size={12} />
                    全部刷新
                  </button>
                </div>
                <div className="space-y-3">
                  {apiSources.map((source) => (
                    <div
                      key={source.name}
                      className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            source.active ? "bg-[var(--success)]" : "bg-[var(--text-muted)]"
                          }`}
                        />
                        <div>
                          <p className="text-xs text-[var(--text-primary)]">{source.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                            {source.key || "未配置"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{
                            color: source.status === "已配置" ? "var(--success)" : source.status === "免费" ? "var(--cyan)" : "var(--warning)",
                            background: source.status === "已配置" ? "rgba(34,197,94,0.1)" : source.status === "免费" ? "rgba(0,229,255,0.1)" : "rgba(245,158,11,0.1)",
                            fontFamily: "var(--font-jetbrains)",
                          }}
                        >
                          {source.status}
                        </span>
                        <button className="text-[10px] text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors">
                          配置
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          )}

          {activeTab === "appearance" && (
            <GlassPanel className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
                <Palette size={16} className="text-[var(--cyan)]" />
                外观设置
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">主题颜色</p>
                  <div className="flex gap-3">
                    {["var(--cyan)", "var(--magenta)", "var(--purple)", "var(--success)"].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-[var(--border)] hover:border-[var(--text-primary)] transition-all"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.03)]">
                  <span className="text-xs text-[var(--text-secondary)]">动态背景</span>
                  <div className="w-10 h-5 bg-[var(--cyan)] rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.03)]">
                  <span className="text-xs text-[var(--text-secondary)]">粒子效果</span>
                  <div className="w-10 h-5 bg-[var(--cyan)] rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[var(--text-secondary)]">紧凑模式</span>
                  <div className="w-10 h-5 bg-[rgba(255,255,255,0.1)] rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-[var(--text-muted)] rounded-full" />
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}

          {activeTab === "notifications" && (
            <GlassPanel className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
                <Bell size={16} className="text-[var(--cyan)]" />
                通知管理
              </h3>
              <div className="space-y-3">
                {[
                  { label: "地震警报 (5.0+)", enabled: true },
                  { label: "NASA APOD 更新", enabled: true },
                  { label: "GitHub 趋势变化", enabled: false },
                  { label: "太空天气事件", enabled: true },
                  { label: "火灾热点警报", enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.03)]">
                    <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
                    <div
                      className={`w-10 h-5 rounded-full relative cursor-pointer ${
                        item.enabled ? "bg-[var(--cyan)]" : "bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${
                          item.enabled ? "right-0.5 bg-white" : "left-0.5 bg-[var(--text-muted)]"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeTab === "data" && (
            <GlassPanel className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
                <Database size={16} className="var(--cyan)" />
                数据管理
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.03)]">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">缓存大小</p>
                    <p className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-jetbrains)" }}>12.4 MB</p>
                  </div>
                  <button className="text-[10px] text-[var(--error)] hover:underline">清除缓存</button>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.03)]">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">自动刷新间隔</p>
                    <p className="text-[10px] text-[var(--text-muted)]">所有数据源</p>
                  </div>
                  <select className="bg-[rgba(0,0,0,0.3)] border border-[var(--border)] rounded px-2 py-1 text-[10px] text-[var(--text-primary)]">
                    <option>5 分钟</option>
                    <option>15 分钟</option>
                    <option>30 分钟</option>
                    <option>1 小时</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <Shield size={14} className="text-[var(--success)]" />
                  <span className="text-xs text-[var(--text-secondary)]">所有数据仅本地存储，不上传任何服务器</span>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
