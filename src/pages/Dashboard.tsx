import type { ReactNode } from "react";
import { mockDashboardStats, mockAlerts, mockPatients } from "../data/mockPatients";
import { RiskBadge } from "../components/RiskBadge";

// ── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  bg: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, bg, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Alert Row ─────────────────────────────────────────────────────────────────

function AlertRow({ alert, onViewPatient }: { alert: typeof mockAlerts[0]; onViewPatient: (id: string) => void }) {
  const colors = {
    high: "bg-red-50 border-red-200 text-red-600",
    medium: "bg-amber-50 border-amber-200 text-amber-600",
    low: "bg-blue-50 border-blue-200 text-blue-600",
  };
  const dots = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-blue-500" };

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${colors[alert.severity]}`}>
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dots[alert.severity]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800">{alert.patientName}</p>
          <p className="text-xs text-slate-400">{alert.date}</p>
        </div>
        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{alert.message}</p>
      </div>
      <button
        onClick={() => onViewPatient(alert.patientId)}
        className="text-xs text-blue-600 font-medium hover:underline shrink-0 mt-0.5"
      >
        View
      </button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate: (page: string, patientId?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Good morning, Dr. Patel</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Here's your pediatric obesity risk overview for today.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={stats.total}
          sub="Active cases"
          color="text-blue-600"
          bg="bg-blue-50"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="High Risk"
          value={stats.highRisk}
          sub="Immediate attention"
          color="text-red-600"
          bg="bg-red-50"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="Overweight"
          value={stats.overweight}
          sub="85th–95th percentile"
          color="text-amber-600"
          bg="bg-amber-50"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
        <StatCard
          label="Normal BMI"
          value={stats.normal}
          sub="Healthy range"
          color="text-emerald-600"
          bg="bg-emerald-50"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Two-column panel */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Risk Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Patients requiring clinical attention</p>
            </div>
            <button
              onClick={() => onNavigate("alerts")}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-4 space-y-2">
            {mockAlerts.map(alert => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onViewPatient={id => onNavigate("detail", id)}
              />
            ))}
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Risk Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Current patient cohort</p>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "High Risk", count: stats.highRisk, pct: Math.round(stats.highRisk / stats.total * 100), bar: "bg-red-500" },
              { label: "Overweight", count: stats.overweight, pct: Math.round(stats.overweight / stats.total * 100), bar: "bg-amber-400" },
              { label: "Normal", count: stats.normal, pct: Math.round(stats.normal / stats.total * 100), bar: "bg-emerald-500" },
            ].map(row => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">{row.label}</span>
                  <span className="text-slate-500">{row.count} patients ({row.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.bar} rounded-full`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="px-5 pb-5 pt-1 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</p>
            <button
              onClick={() => onNavigate("patients")}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-sm text-slate-700 hover:text-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All Patients
            </button>
            <button
              onClick={() => onNavigate("charts")}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-sm text-slate-700 hover:text-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Open Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Recent patients */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Recent Patients</h3>
          <button
            onClick={() => onNavigate("patients")}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {mockPatients.slice(0, 5).map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onNavigate("detail", p.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  {p.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.fullName}</p>
                  <p className="text-xs text-slate-400">{p.mrn} · {p.age}y · {p.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {p.bmi != null && (
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                    BMI {p.bmi.toFixed(1)}
                  </span>
                )}
                <RiskBadge risk={p.riskCategory} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
