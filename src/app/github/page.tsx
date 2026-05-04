import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function GitHubPage() {
  return (
    <div className="p-6">
      <PageHeader title="GitHub 趋势" subtitle="全球代码协作网络" />
      <GlassPanel className="p-6">
        <p className="text-[var(--text-secondary)]">页面开发中...</p>
      </GlassPanel>
    </div>
  );
}
