import { useState } from "react";
import { mockPatientDetail, mockPatients } from "../data/mockPatients";
import { RiskBadge } from "../components/RiskBadge";
import { ObservationCharts } from "./ObservationCharts";
import { ClinicalInsightsPanel } from "../components/ClinicalInsightsPanel";
import { BmiTrendChart } from "../components/Charts/BmiTrendChart";
import { PatientInsightCard } from "../components/PatientInsightCard";

type Tab = "overview" | "insights" | "observations" | "encounters" | "notes";

interface PatientDetailProps {
  patientId: string;
  onBack: () => void;
}

export function PatientDetail({ patientId, onBack }: PatientDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Use mock detail data (in production: fetch by id)
  const patient = patientId === "pt-001"
    ? mockPatientDetail
    : { ...mockPatientDetail, ...mockPatients.find(p => p.id === patientId), bmiTrend: mockPatientDetail.bmiTrend, weightTrend: mockPatientDetail.weightTrend, heightTrend: mockPatientDetail.heightTrend, encounters: mockPatientDetail.encounters };

  const latestBmi = patient.bmiTrend.at(-1);
  const latestWeight = patient.weightTrend.at(-1);
  const latestHeight = patient.heightTrend.at(-1);

  const riskScore = patient.riskCategory === "high-risk" ? 87
    : patient.riskCategory === "overweight" ? 62 : 28;

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: "overview", label: "Overview" },
    {
      key: "insights",
      label: "AI Insights",
      badge: patient.riskCategory === "high-risk" ? "!" : undefined,
    },
    { key: "observations", label: "Trends" },
    { key: "encounters", label: "Encounters" },
    { key: "notes", label: "Clinical Notes" },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Patient List
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">{patient.fullName}</span>
      </div>

      {/* Demographics card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold shrink-0">
              {patient.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{patient.fullName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {patient.mrn} · {patient.gender} · {patient.age} years old
              </p>
              <p className="text-xs text-slate-400 mt-0.5">DOB: {patient.birthDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <RiskBadge risk={patient.riskCategory} />
            {patient.lastVisit && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                Last visit: {patient.lastVisit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Latest BMI",
            value: latestBmi ? `${latestBmi.value.toFixed(1)}` : "—",
            unit: "kg/m²",
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "Weight",
            value: latestWeight ? `${latestWeight.value}` : "—",
            unit: latestWeight?.unit ?? "kg",
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Height",
            value: latestHeight ? `${latestHeight.value}` : "—",
            unit: latestHeight?.unit ?? "cm",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Obesity Risk Score",
            value: `${riskScore}`,
            unit: "/ 100",
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.unit}</p>
            <p className="text-xs font-medium text-slate-600 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Risk score bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-slate-700">Pediatric Obesity Risk Score</p>
          <span className={`text-sm font-bold ${riskScore >= 75 ? "text-red-600" : riskScore >= 50 ? "text-amber-600" : "text-emerald-600"}`}>
            {riskScore}/100
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${riskScore >= 75 ? "bg-red-500" : riskScore >= 50 ? "bg-amber-400" : "bg-emerald-500"}`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Low Risk</span>
          <span>Moderate</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-4 pt-1 flex gap-0.5 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <PatientInsightCard
                patientName={patient.fullName}
                bmi={patient.bmi}
                riskCategory={patient.riskCategory}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Demographics</h4>
                  <dl className="space-y-2">
                    {[
                      ["Full Name", patient.fullName],
                      ["MRN", patient.mrn],
                      ["Gender", patient.gender],
                      ["Date of Birth", patient.birthDate],
                      ["Age", `${patient.age} years`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-slate-50">
                        <dt className="text-xs text-slate-400">{label}</dt>
                        <dd className="text-xs font-medium text-slate-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Latest Vitals</h4>
                  <dl className="space-y-2">
                    {[
                      ["BMI", latestBmi ? `${latestBmi.value.toFixed(1)} kg/m²` : "—"],
                      ["Weight", latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : "—"],
                      ["Height", latestHeight ? `${latestHeight.value} ${latestHeight.unit}` : "—"],
                      ["Risk Category", patient.riskCategory.replace("-", " ").replace(/^\w/, c => c.toUpperCase())],
                      ["Risk Score", `${riskScore} / 100`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-slate-50">
                        <dt className="text-xs text-slate-400">{label}</dt>
                        <dd className="text-xs font-medium text-slate-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights tab */}
          {activeTab === "insights" && (
            <ClinicalInsightsPanel
              patientName={patient.fullName}
              age={patient.age}
              riskCategory={patient.riskCategory}
              riskScore={riskScore}
              bmiTrend={patient.bmiTrend}
              weightTrend={patient.weightTrend}
            />
          )}

          {/* Observations / Trends tab */}
          {activeTab === "observations" && (
            <div className="space-y-4">
              <BmiTrendChart data={patient.bmiTrend} showRiskZones />
              <ObservationCharts
                bmiTrend={[]}
                weightTrend={patient.weightTrend}
                heightTrend={patient.heightTrend}
              />
            </div>
          )}

          {/* Encounters tab */}
          {activeTab === "encounters" && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Encounter History</h4>
              <div className="space-y-2">
                {patient.encounters.map((enc, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{enc.type}</p>
                      <p className="text-xs text-slate-400">{enc.provider}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{enc.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes tab */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clinical Notes</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
                Clinical notes integration requires EHR connection. Configure SMART on FHIR DocumentReference access in your authorization scope.
              </div>
              <div className="space-y-3">
                {[
                  { date: "2026-05-10", author: "Dr. Rachel Kim", text: "Patient presents for annual well-child visit. BMI continues to trend upward. Discussed dietary modifications and increased physical activity with family. Nutrition referral placed." },
                  { date: "2025-11-14", author: "Dr. Rachel Kim", text: "Follow-up for obesity risk management. Family reports improved dietary habits but limited physical activity due to school schedule. Continue monitoring." },
                ].map((note, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-slate-600">{note.author}</span>
                      <span>{note.date}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
