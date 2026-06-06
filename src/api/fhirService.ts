/**
 * FHIR Service Layer
 *
 * Provides a typed interface over the FHIR proxy at /fhir/*.
 * Falls back to bundled local FHIR sample data when the API is unavailable.
 */

import type {
  FhirBundle,
  FhirPatient,
  FhirObservation,
  PatientSummary,
  PatientDetail,
  ObservationPoint,
  RiskCategory,
  DashboardStats,
} from "../types/fhir";
import { getDemoFhirData, getDemoEncounters } from "./demoFhirData";

const BASE = "/fhir";

let demoModeActive = false;

export function isDemoMode(): boolean {
  return demoModeActive;
}

function activateDemoMode() {
  demoModeActive = true;
}

async function fhirGet<T>(path: string): Promise<T> {
  if (demoModeActive) {
    return getDemoFhirData<T>(path);
  }

  try {
    const res = await fetch(`${BASE}/${path}`);
    if (res.headers.get("X-Demo-Mode") === "true") {
      activateDemoMode();
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`FHIR request failed (${res.status}): ${body.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  } catch {
    activateDemoMode();
    return getDemoFhirData<T>(path);
  }
}

// ── Patient ──────────────────────────────────────────────────────────────────

export async function fetchPatients(): Promise<PatientSummary[]> {
  const bundle = await fhirGet<FhirBundle<FhirPatient>>("Patient");
  const summaries = (bundle.entry ?? [])
    .map(e => e.resource)
    .filter((r): r is FhirPatient => r?.resourceType === "Patient")
    .map(fhirPatientToSummary);

  return Promise.all(summaries.map(enrichWithBmi));
}

export async function fetchPatient(id: string): Promise<PatientSummary> {
  const patient = await fhirGet<FhirPatient>(`Patient/${id}`);
  return enrichWithBmi(fhirPatientToSummary(patient));
}

export async function fetchPatientDetail(id: string): Promise<PatientDetail> {
  const [summary, bmiTrend, weightTrend, heightTrend] = await Promise.all([
    fetchPatient(id),
    fetchBmiTrend(id),
    fetchWeightTrend(id),
    fetchHeightTrend(id),
  ]);

  const latestBmi = bmiTrend.at(-1)?.value ?? null;

  return {
    ...summary,
    bmi: latestBmi ?? summary.bmi,
    riskCategory: latestBmi != null ? bmiRiskCategory(latestBmi, summary.age) : summary.riskCategory,
    bmiTrend,
    weightTrend,
    heightTrend,
    encounters: getDemoEncounters(id),
  };
}

export function computeDashboardStats(patients: PatientSummary[]): DashboardStats {
  return {
    total: patients.length,
    highRisk: patients.filter(p => p.riskCategory === "high-risk").length,
    overweight: patients.filter(p => p.riskCategory === "overweight").length,
    normal: patients.filter(p => p.riskCategory === "normal").length,
  };
}

// ── Observations ─────────────────────────────────────────────────────────────

const LOINC = {
  BMI: "39156-5",
  WEIGHT: "29463-7",
  HEIGHT: "8302-2",
} as const;

export async function fetchObservations(patientId: string, loincCode: string): Promise<ObservationPoint[]> {
  const bundle = await fhirGet<FhirBundle<FhirObservation>>(
    `Observation?subject=Patient/${patientId}&code=${loincCode}&_sort=date&_count=20`,
  );
  return (bundle.entry ?? [])
    .map(e => e.resource)
    .filter((r): r is FhirObservation => r?.resourceType === "Observation")
    .flatMap(obs => {
      if (!obs.valueQuantity?.value || !obs.effectiveDateTime) return [];
      return [{
        date: obs.effectiveDateTime.slice(0, 7),
        value: obs.valueQuantity.value,
        unit: obs.valueQuantity.unit ?? "",
      }];
    });
}

export const fetchBmiTrend = (id: string) => fetchObservations(id, LOINC.BMI);
export const fetchWeightTrend = (id: string) => fetchObservations(id, LOINC.WEIGHT);
export const fetchHeightTrend = (id: string) => fetchObservations(id, LOINC.HEIGHT);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function enrichWithBmi(summary: PatientSummary): Promise<PatientSummary> {
  const bmiTrend = await fetchObservations(summary.id, LOINC.BMI);
  const latest = bmiTrend.at(-1);
  if (!latest) return summary;

  const lastVisit = latest.date.length === 7 ? `${latest.date}-15` : latest.date.slice(0, 10);

  return {
    ...summary,
    bmi: latest.value,
    riskCategory: bmiRiskCategory(latest.value, summary.age),
    lastVisit,
  };
}

function fhirPatientToSummary(p: FhirPatient): PatientSummary {
  const name = p.name?.[0];
  const given = name?.given?.join(" ") ?? "";
  const family = name?.family ?? "";
  const fullName = [given, family].filter(Boolean).join(" ") || "Unknown";

  const mrn = p.identifier?.find(i => i.system?.includes("mrn"))?.value
    ?? p.identifier?.[0]?.value
    ?? p.id
    ?? "—";

  const age = p.birthDate ? calcAge(p.birthDate) : 0;

  return {
    id: p.id ?? "",
    mrn,
    fullName,
    gender: capitalize(p.gender ?? "unknown"),
    birthDate: p.birthDate ?? "",
    age,
    bmi: null,
    riskCategory: "unknown",
  };
}

function calcAge(birthDate: string): number {
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  if (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())) age--;
  return age;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// BMI-for-age percentile thresholds (simplified; use CDC tables for production)
export function bmiRiskCategory(bmi: number, age: number): RiskCategory {
  // Approximate thresholds for ages 6–13
  if (bmi >= 23) return "high-risk";
  if (bmi >= 19) return "overweight";
  if (bmi > 0) return "normal";
  return "unknown";
}
