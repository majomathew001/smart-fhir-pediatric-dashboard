// Core FHIR R4 resource types used by this application

export interface FhirHumanName {
  use?: "official" | "nickname" | "usual";
  family?: string;
  given?: string[];
  text?: string;
}

export interface FhirIdentifier {
  system?: string;
  value?: string;
}

export interface FhirPatient {
  resourceType: "Patient";
  id?: string;
  identifier?: FhirIdentifier[];
  name?: FhirHumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Array<{ city?: string; state?: string; postalCode?: string }>;
}

export interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FhirCodeableConcept {
  coding?: Array<{ system?: string; code?: string; display?: string }>;
  text?: string;
}

export interface FhirObservation {
  resourceType: "Observation";
  id?: string;
  status: string;
  code: FhirCodeableConcept;
  subject?: { reference?: string };
  effectiveDateTime?: string;
  valueQuantity?: FhirQuantity;
  interpretation?: FhirCodeableConcept[];
}

export interface FhirBundle<T = FhirPatient> {
  resourceType: "Bundle";
  total?: number;
  entry?: Array<{ resource?: T }>;
}

// Application-level enriched types

export type RiskCategory = "normal" | "overweight" | "high-risk" | "unknown";

export interface PatientSummary {
  id: string;
  mrn: string;
  fullName: string;
  gender: string;
  birthDate: string;
  age: number;
  bmi: number | null;
  riskCategory: RiskCategory;
  lastVisit?: string;
}

export interface ObservationPoint {
  date: string;
  value: number;
  unit: string;
}

export interface PatientDetail extends PatientSummary {
  bmiTrend: ObservationPoint[];
  weightTrend: ObservationPoint[];
  heightTrend: ObservationPoint[];
  encounters: Array<{ date: string; type: string; provider: string }>;
}

export interface DashboardStats {
  total: number;
  highRisk: number;
  overweight: number;
  normal: number;
}

export interface RiskAlert {
  id: string;
  patientName: string;
  patientId: string;
  message: string;
  severity: "high" | "medium" | "low";
  date: string;
}
