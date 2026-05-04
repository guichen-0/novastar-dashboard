import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function EarthquakePage() {
  return (
    <div className="p-6">
      <PageHeader title="全球地震" subtitle="地球脉搏监测站" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
