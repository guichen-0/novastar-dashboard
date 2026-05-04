import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function SatellitePage() {
  return (
    <div className="p-6">
      <PageHeader title="卫星追踪" subtitle="地球轨道监控网络" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
