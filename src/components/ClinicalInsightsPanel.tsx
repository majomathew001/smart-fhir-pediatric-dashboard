/**
 * ClinicalInsightsPanel
 *
 * AI-assisted clinical summary card for pediatric obesity risk patients.
 * Derives trend interpretation, risk alerts, and recommended actions from
 * patient observation data. Designed for provider-facing use.
 */

import type { ObservationPoint, RiskCategory } from "../types/fhir";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClinicalInsightsPanelProps {
  patientName: string;
  age: number;
  riskCategory: RiskCategory;
  riskScore: number;
  bmiTrend: ObservationPoint[];
  weightTrend: ObservationPoint[];
}

interface BmiTrendSummary {
  direction: "increasing" | "stable" | "decreasing";
  changeAbsolute: number;
  changePercent: number;
  monthsSpan: number;
  latestBmi: number;
  crossedThreshold: "none" | "85th" | "95th";
}

interface ClinicalAlert {
  id: string;
  severity: "urgent" | "warning" | "info";
  title: string;
  body: string;
}

interface Recommendation {
  priority: "high" | "medium" | "routine";
  category: "referral" | "monitoring" | "counseling" | "labs" | "follow-up";
  action: string;
  rationale: string;
}

// ── Derivation logic ──────────────────────────────────────────────────────────

function deriveBmiSummary(bmiTrend: ObservationPoint[]): BmiTrendSummary | null {
  if (bmiTrend.length < 2) return null;
  const first = bmiTrend[0];
  const last = bmiTrend.at(-1)!;
  const delta = last.value - first.value;
  const pct = (delta / first.value) * 100;
  const months = bmiTrend.length * 3; // each point ~3 months apart
  const direction = Math.abs(delta) < 0.3 ? "stable" : delta > 0 ? "increasing" : "decreasing";
  const crossedThreshold = last.value >= 23 ? "95th" : last.value >= 19 ? "85th" : "none";
  return {
    direction,
    changeAbsolute: Math.abs(delta),
    changePercent: Math.abs(pct),
    monthsSpan: months,
    latestBmi: last.value,
    crossedThreshold,
  };
}

function deriveAlerts(
  riskCategory: RiskCategory,
  summary: BmiTrendSummary | null,
  weightTrend: ObservationPoint[],
): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  if (riskCategory === "high-risk") {
    alerts.push({
      id: "risk-threshold",
      severity: "urgent",
      title: "BMI ≥ 95th Percentile",
      body: summary
        ? `Current BMI of ${summary.latestBmi.toFixed(1)} kg/m² meets clinical criteria for pediatric obesity. Structured intervention is indicated per AAP guidelines.`
        : "Patient meets criteria for pediatric obesity. Clinical evaluation recommended.",
    });
  } else if (riskCategory === "overweight") {
    alerts.push({
      id: "overweight-threshold",
      severity: "warning",
      title: "BMI 85th–95th Percentile",
      body: "Patient is classified as overweight. Without intervention, progression to obesity is probable within 12–18 months based on current trajectory.",
    });
  }

  if (summary?.direction === "increasing" && summary.changeAbsolute >= 1.5) {
    alerts.push({
      id: "bmi-trend",
      severity: summary.changeAbsolute >= 3 ? "urgent" : "warning",
      title: `BMI Increasing — +${summary.changeAbsolute.toFixed(1)} kg/m² over ${summary.monthsSpan} months`,
      body: `A gain of ${summary.changeAbsolute.toFixed(1)} kg/m² (${summary.changePercent.toFixed(0)}%) was observed over the past ${summary.monthsSpan} months, exceeding expected growth curves for this age group.`,
    });
  }

  if (weightTrend.length >= 2) {
    const wFirst = weightTrend[0].value;
    const wLast = weightTrend.at(-1)!.value;
    const wDelta = wLast - wFirst;
    if (wDelta >= 4) {
      alerts.push({
        id: "weight-gain",
        severity: "warning",
        title: `Weight Gain — +${wDelta.toFixed(1)} kg since first visit`,
        body: `Total weight gain of ${wDelta.toFixed(1)} kg observed. Review dietary habits and physical activity levels with the patient and caregivers.`,
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "stable",
      severity: "info",
      title: "BMI Within Healthy Range",
      body: "No acute obesity risk indicators detected. Continue routine monitoring at scheduled well-child visits.",
    });
  }

  return alerts;
}

function deriveRecommendations(
  riskCategory: RiskCategory,
  age: number,
  summary: BmiTrendSummary | null,
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (riskCategory === "high-risk") {
    recs.push({
      priority: "high",
      category: "referral",
      action: "Refer to Pediatric Nutrition / Weight Management Program",
      rationale: "AAP recommends intensive health behavior and lifestyle treatment (IHBLT) for children with BMI ≥ 95th percentile.",
    });
    recs.push({
      priority: "high",
      category: "labs",
      action: "Order fasting lipid panel, HbA1c, and fasting glucose",
      rationale: "Screen for metabolic comorbidities including dyslipidemia and impaired glucose regulation.",
    });
    recs.push({
      priority: "high",
      category: "counseling",
      action: "Initiate motivational interviewing with patient and family",
      rationale: "Family engagement and readiness-to-change counseling are predictors of successful long-term weight management.",
    });
  } else if (riskCategory === "overweight") {
    recs.push({
      priority: "medium",
      category: "counseling",
      action: "Provide structured dietary counseling — 5-2-1-0 guidance",
      rationale: "5 fruits/veg daily, ≤2 hrs screen time, ≥1 hr activity, 0 sugary beverages. Evidence-based for this percentile range.",
    });
    recs.push({
      priority: "medium",
      category: "monitoring",
      action: "Schedule BMI and growth re-check in 3 months",
      rationale: "Close interval monitoring allows early detection of progression toward obesity classification.",
    });
  } else {
    recs.push({
      priority: "routine",
      category: "monitoring",
      action: "Continue routine BMI monitoring at annual well-child visits",
      rationale: "Patient is within healthy range. Standard preventive care is appropriate.",
    });
  }

  if (age >= 10 && riskCategory !== "normal") {
    recs.push({
      priority: "medium",
      category: "follow-up",
      action: "Screen for depression and disordered eating behaviours",
      rationale: "Elevated BMI percentile in pre-adolescence correlates with increased psychosocial risk.",
    });
  }

  if (summary?.direction === "increasing") {
    recs.push({
      priority: riskCategory === "high-risk" ? "high" : "medium",
      category: "monitoring",
      action: "Review sleep hygiene — screen for sleep-disordered breathing",
      rationale: "Upward BMI trajectory in this age group warrants evaluation for obesity-related sleep apnea.",
    });
  }

  return recs;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ALERT_STYLES = {
  urgent: {
    border: "border-red-200",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    icon: "text-red-600",
    title: "text-red-800",
    body: "text-red-700",
    badge: "bg-red-600 text-white",
    label: "URGENT",
  },
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    icon: "text-amber-600",
    title: "text-amber-800",
    body: "text-amber-700",
    badge: "bg-amber-500 text-white",
    label: "WARNING",
  },
  info: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    body: "text-emerald-700",
    badge: "bg-emerald-600 text-white",
    label: "STABLE",
  },
};

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  routine: "bg-slate-100 text-slate-600 border-slate-200",
};

const CATEGORY_ICONS: Record<Recommendation["category"], string> = {
  referral: "→",
  monitoring: "◎",
  counseling: "◇",
  labs: "⊕",
  "follow-up": "↺",
};

function AlertCard({ alert }: { alert: ClinicalAlert }) {
  const s = ALERT_STYLES[alert.severity];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${s.border} ${s.bg}`}>
      <div className={`mt-0.5 w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
        {alert.severity === "urgent" && (
          <svg className={`w-4 h-4 ${s.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {alert.severity === "warning" && (
          <svg className={`w-4 h-4 ${s.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )}
        {alert.severity === "info" && (
          <svg className={`w-4 h-4 ${s.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap mb-1">
          <p className={`text-sm font-semibold ${s.title}`}>{alert.title}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.badge}`}>
            {s.label}
          </span>
        </div>
        <p className={`text-xs leading-relaxed ${s.body}`}>{alert.body}</p>
      </div>
    </div>
  );
}

function RecommendationRow({ rec, index }: { rec: Recommendation; index: number }) {
  const priorityStyle = PRIORITY_STYLES[rec.priority];
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap mb-1">
          <p className="text-sm font-medium text-slate-800 flex-1">{rec.action}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityStyle} shrink-0`}>
            {rec.priority.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{rec.rationale}</p>
        <span className="inline-block mt-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
          {CATEGORY_ICONS[rec.category]} {rec.category}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ClinicalInsightsPanel({
  patientName,
  age,
  riskCategory,
  riskScore,
  bmiTrend,
  weightTrend,
}: ClinicalInsightsPanelProps) {
  const summary = deriveBmiSummary(bmiTrend);
  const alerts = deriveAlerts(riskCategory, summary, weightTrend);
  const recommendations = deriveRecommendations(riskCategory, age, summary);

  const urgentCount = alerts.filter(a => a.severity === "urgent").length;

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Clinical Insights</p>
            <p className="text-xs text-slate-400">Derived from {patientName}'s FHIR observations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {urgentCount} Urgent
            </span>
          )}
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
            Not a substitute for clinical judgement
          </span>
        </div>
      </div>

      {/* BMI trend summary strip */}
      {summary && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{summary.latestBmi.toFixed(1)}</p>
            <p className="text-[10px] text-slate-400">Current BMI</p>
          </div>
          <div className="w-px bg-slate-200 hidden sm:block" />
          <div className="text-center">
            <p className={`text-lg font-bold ${summary.direction === "increasing" ? "text-red-600" : summary.direction === "stable" ? "text-amber-600" : "text-emerald-600"}`}>
              {summary.direction === "increasing" ? "▲" : summary.direction === "stable" ? "→" : "▼"} {summary.changeAbsolute.toFixed(1)}
            </p>
            <p className="text-[10px] text-slate-400">Change kg/m²</p>
          </div>
          <div className="w-px bg-slate-200 hidden sm:block" />
          <div className="text-center">
            <p className={`text-lg font-bold ${summary.crossedThreshold === "95th" ? "text-red-600" : summary.crossedThreshold === "85th" ? "text-amber-600" : "text-emerald-600"}`}>
              {summary.crossedThreshold === "none" ? "<85th" : `≥${summary.crossedThreshold}`}
            </p>
            <p className="text-[10px] text-slate-400">Percentile zone</p>
          </div>
          <div className="w-px bg-slate-200 hidden sm:block" />
          <div className="flex-1 min-w-36">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Trend ({summary.monthsSpan}mo)</span>
              <span>{summary.direction}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  summary.direction === "increasing" ? "bg-red-500" : summary.direction === "stable" ? "bg-amber-400" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, summary.changePercent * 5)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Risk alerts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h4 className="text-sm font-semibold text-slate-800">Obesity Risk Alerts</h4>
          <span className="ml-auto text-xs text-slate-400">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="p-4 space-y-3">
          {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h4 className="text-sm font-semibold text-slate-800">Recommended Clinical Actions</h4>
          <span className="ml-auto text-xs text-slate-400">{recommendations.length} item{recommendations.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="px-5 py-1">
          {recommendations.map((rec, i) => (
            <RecommendationRow key={rec.action} rec={rec} index={i} />
          ))}
        </div>
      </div>

      {/* Footer disclaimer */}
      <p className="text-[10px] text-slate-400 text-center px-4 leading-relaxed">
        Clinical insights are algorithmically derived from structured FHIR observation data.
        All recommendations should be validated against current AAP / CDC clinical guidelines and the provider's independent judgement.
      </p>
    </div>
  );
}
