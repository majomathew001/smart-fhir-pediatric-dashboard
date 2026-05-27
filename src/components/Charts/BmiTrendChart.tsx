import { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  type TooltipProps,
} from "recharts";
import type { ObservationPoint } from "../../types/fhir";

interface BmiTrendChartProps {
  data: ObservationPoint[];
  color?: string;
  unit?: string;
  /** Show risk zone shading and percentile reference lines */
  showRiskZones?: boolean;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function BmiTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const bmi = payload[0].value as number;
  const zone =
    bmi >= 23 ? { label: "Obese (≥95th)", color: "#ef4444" }
    : bmi >= 19 ? { label: "Overweight (85–95th)", color: "#f59e0b" }
    : { label: "Healthy Weight", color: "#10b981" };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-600 mb-2">{label}</p>
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="text-slate-500">BMI</span>
        <span className="font-bold text-slate-800">{bmi.toFixed(1)} kg/m²</span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: zone.color }} />
        <span style={{ color: zone.color }} className="font-medium">{zone.label}</span>
      </div>
    </div>
  );
}

// ── Main chart ────────────────────────────────────────────────────────────────

export function BmiTrendChart({
  data,
  color = "#ef4444",
  unit = "kg/m²",
  showRiskZones = true,
}: BmiTrendChartProps) {
  const gradientId = useId();
  const latest = data.at(-1);

  // Compute Y-axis domain with padding for the reference areas
  const values = data.map(d => d.value);
  const yMin = Math.max(10, Math.floor(Math.min(...values) - 1.5));
  const yMax = Math.ceil(Math.max(...values) + 2.5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">BMI Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Body Mass Index over time · Pediatric growth tracking</p>
        </div>
        {latest && (
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-slate-800">{latest.value.toFixed(1)}</p>
            <p className="text-[10px] text-slate-400">{unit} · {latest.date}</p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-lg">
          No BMI observation data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={34}
            />

            <Tooltip content={<BmiTooltip />} />

            {showRiskZones && (
              <>
                {/* Healthy zone */}
                <ReferenceArea
                  y1={yMin}
                  y2={19}
                  fill="#10b981"
                  fillOpacity={0.05}
                />
                {/* Overweight zone */}
                <ReferenceArea
                  y1={19}
                  y2={23}
                  fill="#f59e0b"
                  fillOpacity={0.07}
                />
                {/* Obese zone */}
                <ReferenceArea
                  y1={23}
                  y2={yMax}
                  fill="#ef4444"
                  fillOpacity={0.07}
                />

                {/* 85th percentile line */}
                <ReferenceLine
                  y={19}
                  stroke="#f59e0b"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{
                    value: "85th pctile",
                    fill: "#f59e0b",
                    fontSize: 10,
                    position: "insideTopRight",
                    offset: 4,
                  }}
                />
                {/* 95th percentile line */}
                <ReferenceLine
                  y={23}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{
                    value: "95th pctile",
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "insideTopRight",
                    offset: 4,
                  }}
                />
              </>
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3.5, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Risk zone legend */}
      {showRiskZones && data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-4">
          {[
            { color: "bg-emerald-500", label: "Healthy (<85th)" },
            { color: "bg-amber-400", label: "Overweight (85–95th)" },
            { color: "bg-red-500", label: "Obese (≥95th)" },
          ].map(z => (
            <div key={z.label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className={`w-2.5 h-2.5 rounded-sm ${z.color} opacity-70`} />
              {z.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
