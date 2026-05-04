"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Newspaper, ExternalLink, Clock, Tag } from "lucide-react";

const newsItems = [
  {
    title: "SpaceX Starship 完成第15次轨道试飞",
    source: "Space.com",
    time: "2小时前",
    category: "航天",
    summary: "SpaceX 的 Starship 超重型火箭成功完成第15次轨道试飞，实现了助推器和飞船的双重回收。",
    tagColor: "var(--cyan)",
  },
  {
    title: "韦伯望远镜发现最遥远的星系候选体",
    source: "NASA",
    time: "5小时前",
    category: "天文",
    summary: "James Webb 空间望远镜观测到一个红移值 z=14.3 的星系候选体，距今约2.9亿年。",
    tagColor: "var(--purple)",
  },
  {
    title: "中国天问三号任务进入发射准备阶段",
    source: "新华社",
    time: "8小时前",
    category: "航天",
    summary: "中国火星采样返回任务天问三号已完成总装测试，计划于2028年发射。",
    tagColor: "var(--cyan)",
  },
  {
    title: "全球碳排放量连续第二年下降",
    source: "Nature",
    time: "1天前",
    category: "环境",
    summary: "最新研究显示全球碳排放量较上年下降1.2%，可再生能源装机容量增长是主要驱动因素。",
    tagColor: "var(--success)",
  },
  {
    title: "AI辅助药物发现取得重大突破",
    source: "Science",
    time: "1天前",
    category: "科技",
    summary: "DeepMind 的 AlphaFold 3 成功预测了超过200种潜在药物分子的蛋白质结构。",
    tagColor: "var(--magenta)",
  },
  {
    title: "国际空间站迎来首位商业游客长期驻留",
    source: "Reuters",
    time: "2天前",
    category: "航天",
    summary: "Axiom Space 的第四次商业任务成功将一名游客送入国际空间站进行为期30天的驻留。",
    tagColor: "var(--cyan)",
  },
];

export default function NewsPage() {
  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader title="新闻资讯" subtitle="全球资讯网络 · 实时聚合" />

      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Main Feed */}
        <div className="col-span-8">
          <div className="space-y-4">
            {newsItems.map((item, i) => (
              <GlassPanel key={i} className="p-5 group hover:border-[var(--cyan)] transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{
                        color: item.tagColor,
                        background: `color-mix(in srgb, ${item.tagColor} 10%, transparent)`,
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      {item.time}
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-[var(--text-muted)] group-hover:text-[var(--cyan)] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--cyan)] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {item.summary}
                </p>
                <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                  来源: {item.source}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Categories */}
          <GlassPanel className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
              <Tag size={16} className="text-[var(--cyan)]" />
              分类
            </h3>
            <div className="space-y-2">
              {["全部", "航天", "天文", "科技", "环境", "地球科学"].map((cat) => (
                <button
                  key={cat}
                  className="w-full text-left px-3 py-1.5 text-xs rounded-lg text-[var(--text-secondary)] hover:text-[var(--cyan)] hover:bg-[rgba(0,229,255,0.05)] transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Trending */}
          <GlassPanel className="p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
              热门话题
            </h3>
            <div className="space-y-3">
              {["火星采样返回", "韦伯望远镜", "碳中和", "商业航天", "AI制药"].map((topic, i) => (
                <div
                  key={topic}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="text-[10px] font-bold text-[var(--cyan)]"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--text-secondary)]">{topic}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Update Status */}
          <GlassPanel className="p-4">
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-glow" />
              每5分钟自动刷新
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
