import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function RainfallPage() {
  return (
    <div className="p-6">
      <PageHeader title="降雨监测" subtitle="全球气象监测网络" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
