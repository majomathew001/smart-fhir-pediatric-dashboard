import { PatientList as PatientListTable } from "../components/PatientList/PatientList";
import { useFhirData } from "../context/FhirDataContext";

interface PatientListPageProps {
  onViewPatient: (id: string) => void;
  initialSearch?: string;
}

export function PatientList({ onViewPatient, initialSearch = "" }: PatientListPageProps) {
  const { patients, loading, error } = useFhirData();

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
        Failed to load patients: {error}
      </div>
    );
  }

  return (
    <PatientListTable
      patients={patients}
      onViewPatient={onViewPatient}
      initialSearch={initialSearch}
      pageSize={8}
    />
  );
}
