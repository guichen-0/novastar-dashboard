import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function NasaPage() {
  return (
    <div className="p-6">
      <PageHeader title="NASA 太空动态" subtitle="太空探索前沿" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
