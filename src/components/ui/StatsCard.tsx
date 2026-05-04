interface StatsCardProps {
  label: string;
  value: string;
  color?: "cyan" | "magenta" | "purple" | "success";
}

const colorMap = {
  cyan: "var(--cyan)",
  magenta: "var(--magenta)",
  purple: "var(--purple)",
  success: "var(--success)",
};

export function StatsCard({ label, value, color = "cyan" }: StatsCardProps) {
  return (
    <div className="glass-panel px-3 py-2 text-center">
      <p className="text-[10px] text-[var(--text-muted)] mb-1">{label}</p>
      <p
        className="text-lg font-bold glow-text-cyan"
        style={{
          fontFamily: "var(--font-orbitron)",
          color: colorMap[color],
        }}
      >
        {value}
      </p>
    </div>
  );
}
