import type { RiskCategory } from "../types/fhir";
import { RiskBadge } from "./RiskBadge";

const RECOMMENDATIONS: Record<RiskCategory, string> = {
  "high-risk":
    "Refer to pediatric weight management and order metabolic screening (lipid panel, HbA1c). Schedule follow-up within 4–6 weeks.",
  overweight:
    "Provide structured dietary counseling (5-2-1-0) and recheck BMI in 3 months. Monitor for progression toward obesity.",
  normal:
    "Continue routine BMI monitoring at annual well-child visits. Reinforce healthy lifestyle habits with family.",
  unknown:
    "Obtain current height and weight to calculate BMI percentile. Document risk category at next encounter.",
};

export interface PatientInsightCardProps {
  /** Patient display name (optional header) */
  patientName?: string;
  bmi: number | null;
  riskCategory: RiskCategory;
  /** Override default risk-based recommendation */
  recommendation?: string;
  className?: string;
}

export function PatientInsightCard({
  patientName,
  bmi,
  riskCategory,
  recommendation,
  className = "",
}: PatientInsightCardProps) {
  const rec = recommendation ?? RECOMMENDATIONS[riskCategory];
  const isHighRisk = riskCategory === "high-risk";

  return (
    <article
      className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isHighRisk ? "border-red-200" : "border-slate-200"} ${className}`}
    >
      {/* Accent bar for high-risk */}
      {isHighRisk && <div className="h-1 bg-red-500" />}

      <div className="p-5">
        {patientName && (
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            {patientName}
          </p>
        )}

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Body Mass Index</p>
            {bmi != null ? (
              <p className="text-3xl font-bold text-slate-800 tabular-nums">
                {bmi.toFixed(1)}
                <span className="text-base font-normal text-slate-400 ml-1">kg/m²</span>
              </p>
            ) : (
              <p className="text-lg font-medium text-slate-400">Not recorded</p>
            )}
          </div>
          <RiskBadge risk={riskCategory} />
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xs font-semibold text-slate-700">Provider recommendation</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{rec}</p>
        </div>
      </div>
    </article>
  );
}
