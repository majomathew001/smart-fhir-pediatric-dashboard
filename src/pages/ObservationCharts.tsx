import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart,
} from "recharts";
import type { ObservationPoint } from "../types/fhir";
import { BmiTrendChart } from "../components/Charts/BmiTrendChart";

interface ChartCardProps {
  title: string;
  subtitle: string;
  data: ObservationPoint[];
  color: string;
  unit: string;
  referenceLines?: Array<{ y: number; label: string; color: string }>;
  type?: "line" | "area";
}

function ChartCard({ title, subtitle, data, color, unit, referenceLines, type = "area" }: ChartCardProps) {
  const ChartComponent = type === "area" ? AreaChart : LineChart;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-slate-400">
          No observation data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <ChartComponent data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
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
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}`}
              width={36}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(v: number) => [`${v} ${unit}`, title]}
              labelStyle={{ color: "#64748b", fontWeight: 600 }}
            />
            {referenceLines?.map(r => (
              <ReferenceLine
                key={r.label}
                y={r.y}
                stroke={r.color}
                strokeDasharray="4 3"
                label={{ value: r.label, fill: r.color, fontSize: 10, position: "insideTopRight" }}
              />
            ))}
            {type === "area" ? (
              <>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#grad-${color.replace("#", "")})`}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      )}

      {/* Latest value callout */}
      {data.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
          <span className="text-slate-400">Latest ({data.at(-1)!.date})</span>
          <span className="font-semibold text-slate-700" style={{ color }}>
            {data.at(-1)!.value} {unit}
          </span>
        </div>
      )}
    </div>
  );
}

interface ObservationChartsProps {
  bmiTrend: ObservationPoint[];
  weightTrend: ObservationPoint[];
  heightTrend: ObservationPoint[];
  standalone?: boolean;
}

export function ObservationCharts({ bmiTrend, weightTrend, heightTrend, standalone }: ObservationChartsProps) {
  return (
    <div className={standalone ? "space-y-5 max-w-5xl" : "space-y-4"}>
      {standalone && (
        <div>
          <h2 className="text-xl font-bold text-slate-800">Growth Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Pediatric observation trends over time</p>
        </div>
      )}

      <BmiTrendChart data={bmiTrend} />

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard
          title="Weight Trend"
          subtitle="Body weight (kg) over time"
          data={weightTrend}
          color="#f59e0b"
          unit="kg"
          type="area"
        />
        <ChartCard
          title="Height Trend"
          subtitle="Stature (cm) over time"
          data={heightTrend}
          color="#3b82f6"
          unit="cm"
          type="line"
        />
      </div>

      {standalone && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">Clinical Reference</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            BMI percentile thresholds shown are approximate. Use CDC 2000 or WHO 2006 growth charts for clinical decision-making.
            For ages 2–20 years: ≥85th percentile = Overweight, ≥95th percentile = Obese (High Risk).
          </p>
        </div>
      )}
    </div>
  );
}
