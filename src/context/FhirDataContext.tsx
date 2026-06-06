import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PatientSummary, PatientDetail } from "../types/fhir";
import {
  fetchPatients,
  fetchPatientDetail,
  isDemoMode,
} from "../api/fhirService";

interface FhirDataContextValue {
  patients: PatientSummary[];
  demoMode: boolean;
  loading: boolean;
  error: string | null;
  getPatientDetail: (id: string) => Promise<PatientDetail>;
  refresh: () => Promise<void>;
}

const FhirDataContext = createContext<FhirDataContextValue | null>(null);

export function FhirDataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPatients() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatients();
      setPatients(data);
      setDemoMode(isDemoMode());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function getPatientDetail(id: string) {
    const detail = await fetchPatientDetail(id);
    setDemoMode(isDemoMode());
    return detail;
  }

  return (
    <FhirDataContext.Provider
      value={{
        patients,
        demoMode,
        loading,
        error,
        getPatientDetail,
        refresh: loadPatients,
      }}
    >
      {children}
    </FhirDataContext.Provider>
  );
}

export function useFhirData() {
  const ctx = useContext(FhirDataContext);
  if (!ctx) throw new Error("useFhirData must be used within FhirDataProvider");
  return ctx;
}
