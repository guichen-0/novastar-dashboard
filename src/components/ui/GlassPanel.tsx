interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function GlassPanel({
  children,
  className = "",
  title,
}: GlassPanelProps) {
  return (
    <div
      className={`glass-panel transition-all duration-300 hover:translate-y-[-2px] ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
          <span className="w-[3px] h-3 bg-[var(--cyan)] rounded-sm" />
          <h3
            className="text-xs font-semibold text-[var(--cyan)]"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}
