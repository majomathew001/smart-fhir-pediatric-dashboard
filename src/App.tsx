import { useState } from "react";
import "./index.css";

import { Layout } from "./components/Layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { PatientList } from "./pages/PatientList";
import { PatientDetail } from "./pages/PatientDetail";
import { ObservationCharts } from "./pages/ObservationCharts";
import { mockAlerts, mockPatientDetail } from "./data/mockPatients";

type Page = "dashboard" | "patients" | "detail" | "charts" | "alerts";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "SMART on FHIR Pediatric Obesity Risk Dashboard",
  patients: "Patient List",
  detail: "Patient Details",
  charts: "Growth Analytics",
  alerts: "Risk Alerts",
};

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedPatient, setSelectedPatient] = useState<string>("pt-001");

  function navigate(target: string, patientId?: string) {
    if (patientId) setSelectedPatient(patientId);
    setPage(target as Page);
  }

  return (
    <Layout
      currentPage={page}
      onNavigate={p => setPage(p as Page)}
      pageTitle={PAGE_TITLES[page]}
      onSearch={undefined}
    >
      {page === "dashboard" && <Dashboard onNavigate={navigate} />}

      {page === "patients" && (
        <PatientList onViewPatient={id => navigate("detail", id)} />
      )}

      {page === "detail" && (
        <PatientDetail
          patientId={selectedPatient}
          onBack={() => setPage("patients")}
        />
      )}

      {page === "charts" && (
        <ObservationCharts
          bmiTrend={mockPatientDetail.bmiTrend}
          weightTrend={mockPatientDetail.weightTrend}
          heightTrend={mockPatientDetail.heightTrend}
          standalone
        />
      )}

      {page === "alerts" && <AlertsPage onViewPatient={id => navigate("detail", id)} />}
    </Layout>
  );
}

// Inline alerts page (lightweight, doesn't warrant its own file)
function AlertsPage({ onViewPatient }: { onViewPatient: (id: string) => void }) {
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Risk Alerts</h2>
        <p className="text-sm text-slate-500 mt-0.5">{mockAlerts.length} active clinical alerts</p>
      </div>

      <div className="space-y-3">
        {mockAlerts.map(alert => {
          const severityConfig = {
            high: { bar: "border-l-red-500", bg: "bg-red-50", badge: "bg-red-100 text-red-700", label: "High" },
            medium: { bar: "border-l-amber-400", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", label: "Medium" },
            low: { bar: "border-l-blue-400", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700", label: "Low" },
          }[alert.severity];

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${severityConfig.bar} shadow-sm px-5 py-4 flex items-start justify-between gap-4`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-slate-800">{alert.patientName}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityConfig.badge}`}>
                    {severityConfig.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-snug">{alert.message}</p>
                <p className="text-xs text-slate-400 mt-1.5">{alert.date}</p>
              </div>
              <button
                onClick={() => onViewPatient(alert.patientId)}
                className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap shrink-0 mt-0.5"
              >
                View Patient
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
