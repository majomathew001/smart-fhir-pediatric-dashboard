import type { FhirBundle, FhirObservation, FhirPatient } from "../types/fhir";
import patientsBundle from "../data/fhir/patients.json";
import observationsBundle from "../data/fhir/observations.json";
import { mockPatientDetail } from "../data/mockPatients";

const patients = patientsBundle as FhirBundle<FhirPatient>;
const observations = observationsBundle as FhirBundle<FhirObservation>;

function patientById(id: string): FhirPatient | undefined {
  return patients.entry
    ?.map(e => e.resource)
    .find(p => p?.id === id);
}

function filterObservations(patientId: string, loincCode: string): FhirObservation[] {
  const ref = `Patient/${patientId}`;
  return (observations.entry ?? [])
    .map(e => e.resource)
    .filter((r): r is FhirObservation => {
      if (r?.resourceType !== "Observation") return false;
      const code = r.code?.coding?.[0]?.code;
      return r.subject?.reference === ref && code === loincCode;
    })
    .sort((a, b) => (a.effectiveDateTime ?? "").localeCompare(b.effectiveDateTime ?? ""));
}

export function getDemoEncounters(patientId: string) {
  if (patientId === "pt-001") return mockPatientDetail.encounters;
  return [
    { date: "2026-03-15", type: "Well Child Visit", provider: "Dr. Marcus Patel" },
    { date: "2025-09-10", type: "Follow-up: Growth", provider: "Dr. Rachel Kim" },
  ];
}

export function getDemoFhirData<T>(path: string): T {
  const [resource, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");

  if (resource === "Patient") {
    return patients as T;
  }

  const patientMatch = resource.match(/^Patient\/(.+)$/);
  if (patientMatch) {
    const patient = patientById(patientMatch[1]!);
    if (!patient) throw new Error(`Demo patient not found: ${patientMatch[1]}`);
    return patient as T;
  }

  if (resource === "Observation") {
    const subject = params.get("subject") ?? "";
    const patientId = subject.replace("Patient/", "");
    const code = params.get("code") ?? "";
    const matches = filterObservations(patientId, code);
    const bundle: FhirBundle<FhirObservation> = {
      resourceType: "Bundle",
      type: "searchset",
      total: matches.length,
      entry: matches.map(resource => ({ resource })),
    };
    return bundle as T;
  }

  throw new Error(`No demo FHIR data for path: ${path}`);
}
