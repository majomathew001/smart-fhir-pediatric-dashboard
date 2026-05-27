import { mockPatients } from "../data/mockPatients";
import { PatientList as PatientListTable } from "../components/PatientList/PatientList";

interface PatientListPageProps {
  onViewPatient: (id: string) => void;
  initialSearch?: string;
}

export function PatientList({ onViewPatient, initialSearch = "" }: PatientListPageProps) {
  return (
    <PatientListTable
      patients={mockPatients}
      onViewPatient={onViewPatient}
      initialSearch={initialSearch}
      pageSize={8}
    />
  );
}
