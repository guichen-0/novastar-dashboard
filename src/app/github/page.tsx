"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Search,
  Star,
  GitFork,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface Repo {
  name: string;
  fullName: string;
  description: string;
  stars: string;
  forks: string;
  language: string;
  langColor: string;
  trend: number[];
  updatedAt: string;
}

const mockRepos: Repo[] = [
  {
    name: "neo-sync",
    fullName: "quantum-core/neo-sync",
    description: "High-frequency distributed state synchronization protocol for neural clusters.",
    stars: "14.2k",
    forks: "3.1k",
    language: "Rust",
    langColor: "#dea584",
    trend: [20, 40, 30, 70, 50, 90],
    updatedAt: "2小时前",
  },
  {
    name: "glass-kit",
    fullName: "cyber-ui/glass-kit",
    description: "A comprehensive toolkit for building volumetric holographic interfaces.",
    stars: "8.9k",
    forks: "1.2k",
    language: "TypeScript",
    langColor: "#3178c6",
    trend: [60, 50, 70, 65, 80, 85],
    updatedAt: "5小时前",
  },
  {
    name: "dark-matter-db",
    fullName: "void-ops/dark-matter-db",
    description: "Zero-gravity relational database optimized for deep space latency.",
    stars: "45.3k",
    forks: "8.4k",
    language: "Go",
    langColor: "#00add8",
    trend: [30, 35, 60, 50, 75, 100],
    updatedAt: "1天前",
  },
  {
    name: "flux-engine",
    fullName: "nebula-sw/flux-engine",
    description: "Real-time data stream processing engine with sub-millisecond latency guarantees.",
    stars: "22.7k",
    forks: "4.8k",
    language: "Rust",
    langColor: "#dea584",
    trend: [45, 55, 40, 65, 80, 75],
    updatedAt: "3小时前",
  },
  {
    name: "holo-ui",
    fullName: "stellar-lab/holo-ui",
    description: "Next-generation holographic UI framework for spatial computing applications.",
    stars: "6.3k",
    forks: "890",
    language: "TypeScript",
    langColor: "#3178c6",
    trend: [25, 35, 50, 45, 60, 70],
    updatedAt: "12小时前",
  },
  {
    name: "quantum-mesh",
    fullName: "deep-space/quantum-mesh",
    description: "Decentralized mesh networking protocol for interplanetary communication.",
    stars: "31.5k",
    forks: "6.2k",
    language: "C++",
    langColor: "#f34b7d",
    trend: [40, 50, 55, 70, 65, 85],
    updatedAt: "6小时前",
  },
  {
    name: "nova-lang",
    fullName: "astro-dev/nova-lang",
    description: "A blazing-fast systems programming language designed for space-grade software.",
    stars: "18.9k",
    forks: "2.7k",
    language: "Rust",
    langColor: "#dea584",
    trend: [30, 45, 60, 55, 70, 80],
    updatedAt: "1天前",
  },
  {
    name: "pixel-forge",
    fullName: "canvas-studio/pixel-forge",
    description: "GPU-accelerated image processing pipeline with neural network upscaling.",
    stars: "11.4k",
    forks: "1.9k",
    language: "Python",
    langColor: "#3572A5",
    trend: [50, 40, 65, 70, 60, 90],
    updatedAt: "8小时前",
  },
  {
    name: "zero-trust-sdk",
    fullName: "secure-core/zero-trust-sdk",
    description: "Enterprise-grade zero-trust authentication and authorization framework.",
    stars: "9.6k",
    forks: "1.5k",
    language: "TypeScript",
    langColor: "#3178c6",
    trend: [35, 45, 50, 60, 55, 75],
    updatedAt: "4小时前",
  },
];

const languages = ["All", "Rust", "TypeScript", "Go", "Python", "C++", "JavaScript"];
const timeRanges = ["Today", "This Week", "This Month", "This Year"];

function Sparkline({ data, color = "var(--cyan)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="h-8 w-full flex items-end gap-[3px] border-b border-[rgba(0,229,255,0.1)] pb-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all duration-300"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              i === data.length - 1
                ? color
                : `color-mix(in srgb, ${color} ${40 + i * 12}%, transparent)`,
            boxShadow:
              i === data.length - 1 ? `0 0 8px ${color}` : "none",
          }}
        />
      ))}
    </div>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div className="glass-panel p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-[var(--magenta)] hover:shadow-[0_0_20px_rgba(255,0,144,0.2)]">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent opacity-30 group-hover:via-[var(--magenta)] group-hover:opacity-60" />

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0">
          <h3
            className="text-base font-bold text-[var(--cyan)] truncate group-hover:text-[var(--cyan-light)] transition-colors"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {repo.fullName}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
            {repo.description}
          </p>
        </div>
        <ExternalLink
          size={14}
          className="text-[var(--text-muted)] group-hover:text-[var(--cyan)] transition-colors flex-shrink-0 ml-2 mt-1"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1 text-[var(--warning)]">
          <Star size={13} />
          <span
            className="text-xs font-bold"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {repo.stars}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <GitFork size={13} />
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-jetbrains)" }}
          >
            {repo.forks}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">
          {repo.updatedAt}
        </span>
      </div>

      {/* Sparkline */}
      <Sparkline data={repo.trend} />

      {/* Language tag */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: repo.langColor }}
        />
        <span className="text-[11px] text-[var(--text-secondary)]">
          {repo.language}
        </span>
      </div>
    </div>
  );
}

export default function GitHubPage() {
  const [selectedLang, setSelectedLang] = useState("All");
  const [selectedTime, setSelectedTime] = useState("Today");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const filteredRepos = mockRepos.filter((repo) => {
    const matchesLang =
      selectedLang === "All" || repo.language === selectedLang;
    const matchesSearch =
      searchQuery === "" ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="p-6 h-full flex flex-col">
      <PageHeader title="GitHub 趋势" subtitle="全球代码协作网络 · 实时追踪" />

      {/* Filter Bar */}
      <GlassPanel className="p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Language Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangDropdown(!showLangDropdown);
                setShowTimeDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all"
            >
              <Filter size={13} />
              <span style={{ fontFamily: "var(--font-orbitron)" }}>
                Language:
              </span>
              <span className="text-[var(--text-primary)]">{selectedLang}</span>
              <ChevronDown size={12} />
            </button>
            {showLangDropdown && (
              <div className="absolute top-full mt-1 left-0 z-50 glass-panel p-1 min-w-[120px]">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedLang === lang
                        ? "text-[var(--cyan)] bg-[rgba(0,229,255,0.1)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTimeDropdown(!showTimeDropdown);
                setShowLangDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-all"
            >
              <Clock size={13} />
              <span style={{ fontFamily: "var(--font-orbitron)" }}>Time:</span>
              <span className="text-[var(--text-primary)]">{selectedTime}</span>
              <ChevronDown size={12} />
            </button>
            {showTimeDropdown && (
              <div className="absolute top-full mt-1 left-0 z-50 glass-panel p-1 min-w-[120px]">
                {timeRanges.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTime(t);
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      selectedTime === t
                        ? "text-[var(--cyan)] bg-[rgba(0,229,255,0.1)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.03)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search Repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[rgba(0,0,0,0.3)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all w-64"
          />
        </div>
      </GlassPanel>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 mb-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[var(--cyan)]" />
          <span>
            今日 <span className="text-[var(--cyan)] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>{filteredRepos.length}</span> 个热门仓库
          </span>
        </div>
        <span>·</span>
        <span>
          总 Star{" "}
          <span className="text-[var(--warning)] font-bold" style={{ fontFamily: "var(--font-jetbrains)" }}>
            168.8k
          </span>
        </span>
      </div>

      {/* Repo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {filteredRepos.map((repo) => (
          <RepoCard key={repo.fullName} repo={repo} />
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[var(--text-muted)] text-sm">
            未找到匹配的仓库
          </p>
        </div>
      )}
    </div>
  );
}
