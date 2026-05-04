import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function SpaceWeatherPage() {
  return (
    <div className="p-6">
      <PageHeader title="太空天气" subtitle="太阳活动与太空环境" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
