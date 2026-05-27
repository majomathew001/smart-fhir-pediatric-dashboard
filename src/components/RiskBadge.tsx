import type { RiskCategory } from "../types/fhir";

const config: Record<RiskCategory, { label: string; className: string }> = {
  "high-risk": { label: "High Risk", className: "bg-red-100 text-red-700 border border-red-200" },
  "overweight": { label: "Overweight", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  "normal": { label: "Normal", className: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  "unknown": { label: "Unknown", className: "bg-slate-100 text-slate-500 border border-slate-200" },
};

export function RiskBadge({ risk }: { risk: RiskCategory }) {
  const { label, className } = config[risk];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
