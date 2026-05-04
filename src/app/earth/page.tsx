import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function EarthPage() {
  return (
    <div className="p-6">
      <PageHeader title="全球互联" subtitle="全球数据互联网络" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
