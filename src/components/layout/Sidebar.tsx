"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  BarChart3,
  Code2,
  Rocket,
  Satellite,
  Cloud,
  CloudRain,
  Flame,
  Sun,
  Newspaper,
  TrendingUp,
  Settings,
  Activity,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navGroups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "数据总览", href: "/", icon: <BarChart3 size={18} /> },
      { label: "全球互联", href: "/earth", icon: <Globe size={18} /> },
    ],
  },
  {
    title: "数据源",
    items: [
      { label: "GitHub 趋势", href: "/github", icon: <Code2 size={18} /> },
      { label: "NASA 太空动态", href: "/nasa", icon: <Rocket size={18} /> },
      { label: "卫星追踪", href: "/satellite", icon: <Satellite size={18} /> },
      { label: "天气监测", href: "/weather", icon: <Cloud size={18} /> },
      { label: "降雨监测", href: "/rainfall", icon: <CloudRain size={18} /> },
      { label: "全球地震", href: "/earthquake", icon: <Activity size={18} /> },
      { label: "火灾热点", href: "/fire", icon: <Flame size={18} /> },
      { label: "太空天气", href: "/space-weather", icon: <Sun size={18} /> },
      { label: "新闻资讯", href: "/news", icon: <Newspaper size={18} /> },
      { label: "发展指标", href: "/indicators", icon: <TrendingUp size={18} /> },
    ],
  },
  {
    title: "系统",
    items: [
      { label: "系统设置", href: "/settings", icon: <Settings size={18} /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] backdrop-blur-xl">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-[var(--cyan)] flex items-center justify-center">
            <Globe size={16} className="text-[var(--cyan)]" />
          </div>
          <div>
            <h1
              className="text-sm font-bold tracking-widest text-[var(--cyan)]"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              NOVASTAR
            </h1>
            <p className="text-[10px] text-[var(--text-muted)]">
              星际数据中枢
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group.title && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-[rgba(0,229,255,0.1)] text-[var(--cyan)] border-l-2 border-[var(--cyan)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <span
                    className={isActive ? "text-[var(--cyan)]" : "text-[var(--text-muted)]"}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse-glow" />
          系统在线
        </div>
      </div>
    </aside>
  );
}
