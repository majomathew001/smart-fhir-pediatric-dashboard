import { useEffect, useMemo, useState } from "react";
import type { PatientSummary, RiskCategory } from "../../../types/fhir";
import { RiskBadge } from "../RiskBadge";

type SortField = "fullName" | "mrn" | "birthDate" | "bmi" | "riskCategory";
type SortDir = "asc" | "desc";

const PAGE_SIZE_DEFAULT = 8;

const RISK_ORDER: Record<RiskCategory, number> = {
  "high-risk": 0,
  overweight: 1,
  normal: 2,
  unknown: 3,
};

function formatDob(dob: string | undefined) {
  if (!dob) return "—";
  const dt = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return dob;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function compareNullableNumber(a: number | null, b: number | null) {
  const av = a ?? -Infinity;
  const bv = b ?? -Infinity;
  return av === bv ? 0 : av < bv ? -1 : 1;
}

function sortPatients(rows: PatientSummary[], field: SortField, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "fullName":
        cmp = a.fullName.localeCompare(b.fullName);
        break;
      case "mrn":
        cmp = a.mrn.localeCompare(b.mrn);
        break;
      case "birthDate": {
        const at = a.birthDate ? new Date(`${a.birthDate}T00:00:00`).getTime() : -Infinity;
        const bt = b.birthDate ? new Date(`${b.birthDate}T00:00:00`).getTime() : -Infinity;
        cmp = at === bt ? 0 : at < bt ? -1 : 1;
        break;
      }
      case "bmi":
        cmp = compareNullableNumber(a.bmi, b.bmi);
        break;
      case "riskCategory":
        cmp = RISK_ORDER[a.riskCategory] - RISK_ORDER[b.riskCategory];
        break;
      default:
        cmp = 0;
    }
    return cmp * mul;
  });
}

export interface PatientListProps {
  patients: PatientSummary[];
  onViewPatient: (id: string) => void;
  initialSearch?: string;
  pageSize?: number;
  placeholder?: string;
}

export function PatientList({
  patients,
  onViewPatient,
  initialSearch = "",
  pageSize = PAGE_SIZE_DEFAULT,
  placeholder = "Search patients…",
}: PatientListProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sortField, setSortField] = useState<SortField>("riskCategory");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(initialSearch);
    setPage(1);
  }, [initialSearch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p => {
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.birthDate.toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  const sorted = useMemo(() => sortPatients(filtered, sortField, sortDir), [filtered, sortField, sortDir]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortCaret({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="ml-1 text-slate-300">↕</span>;
    return <span className="ml-1 text-blue-500">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const showingStart = sorted.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, sorted.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patients</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {sorted.length} patient{sorted.length !== 1 ? "s" : ""} match
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Patient Name
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("mrn")}
                >
                  MRN / Patient ID <SortCaret field="mrn" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("birthDate")}
                >
                  DOB <SortCaret field="birthDate" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("bmi")}
                >
                  BMI <SortCaret field="bmi" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-700"
                  onClick={() => toggleSort("riskCategory")}
                >
                  Risk <SortCaret field="riskCategory" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                paged.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => onViewPatient(p.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                          {p.fullName
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 truncate">{p.fullName}</div>
                          {p.lastVisit && <div className="text-xs text-slate-400 truncate">Last visit: {p.lastVisit}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.mrn}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDob(p.birthDate)}</td>
                    <td className="px-4 py-3">
                      {p.bmi != null ? <span className="font-semibold text-slate-700">{p.bmi.toFixed(1)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge risk={p.riskCategory} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onViewPatient(p.id);
                        }}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sorted.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
            <p className="text-xs text-slate-500">
              Showing {showingStart}–{showingEnd} of {sorted.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 text-xs rounded-md transition-colors font-medium ${
                    n === page ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

