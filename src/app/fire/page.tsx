import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function FirePage() {
  return (
    <div className="p-6">
      <PageHeader title="火灾热点" subtitle="全球火灾监控" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
