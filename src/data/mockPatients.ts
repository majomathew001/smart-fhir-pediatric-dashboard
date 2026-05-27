import type { PatientSummary, PatientDetail, DashboardStats, RiskAlert } from "../types/fhir";

export const mockPatients: PatientSummary[] = [
  {
    id: "pt-001", mrn: "MRN-100123", fullName: "Aiden Thompson", gender: "Male",
    birthDate: "2014-03-12", age: 10, bmi: 23.4, riskCategory: "high-risk", lastVisit: "2026-05-10",
  },
  {
    id: "pt-002", mrn: "MRN-100124", fullName: "Sofia Martinez", gender: "Female",
    birthDate: "2016-07-22", age: 8, bmi: 19.1, riskCategory: "overweight", lastVisit: "2026-05-15",
  },
  {
    id: "pt-003", mrn: "MRN-100125", fullName: "Liam Johnson", gender: "Male",
    birthDate: "2013-11-05", age: 11, bmi: 16.8, riskCategory: "normal", lastVisit: "2026-04-28",
  },
  {
    id: "pt-004", mrn: "MRN-100126", fullName: "Emma Davis", gender: "Female",
    birthDate: "2018-01-30", age: 7, bmi: 24.7, riskCategory: "high-risk", lastVisit: "2026-05-20",
  },
  {
    id: "pt-005", mrn: "MRN-100127", fullName: "Noah Wilson", gender: "Male",
    birthDate: "2015-09-14", age: 9, bmi: 17.2, riskCategory: "normal", lastVisit: "2026-05-02",
  },
  {
    id: "pt-006", mrn: "MRN-100128", fullName: "Olivia Brown", gender: "Female",
    birthDate: "2012-06-18", age: 12, bmi: 21.0, riskCategory: "overweight", lastVisit: "2026-05-18",
  },
  {
    id: "pt-007", mrn: "MRN-100129", fullName: "Mason Garcia", gender: "Male",
    birthDate: "2017-04-02", age: 8, bmi: 25.3, riskCategory: "high-risk", lastVisit: "2026-05-12",
  },
  {
    id: "pt-008", mrn: "MRN-100130", fullName: "Ava Anderson", gender: "Female",
    birthDate: "2014-12-25", age: 10, bmi: 15.9, riskCategory: "normal", lastVisit: "2026-04-22",
  },
  {
    id: "pt-009", mrn: "MRN-100131", fullName: "Ethan Taylor", gender: "Male",
    birthDate: "2016-02-08", age: 8, bmi: 20.5, riskCategory: "overweight", lastVisit: "2026-05-05",
  },
  {
    id: "pt-010", mrn: "MRN-100132", fullName: "Isabella White", gender: "Female",
    birthDate: "2013-08-19", age: 11, bmi: 22.8, riskCategory: "high-risk", lastVisit: "2026-05-22",
  },
  {
    id: "pt-011", mrn: "MRN-100133", fullName: "James Harris", gender: "Male",
    birthDate: "2018-05-30", age: 6, bmi: 15.4, riskCategory: "normal", lastVisit: "2026-05-08",
  },
  {
    id: "pt-012", mrn: "MRN-100134", fullName: "Charlotte Lewis", gender: "Female",
    birthDate: "2011-10-11", age: 13, bmi: 26.1, riskCategory: "high-risk", lastVisit: "2026-05-14",
  },
];

export const mockDashboardStats: DashboardStats = {
  total: mockPatients.length,
  highRisk: mockPatients.filter(p => p.riskCategory === "high-risk").length,
  overweight: mockPatients.filter(p => p.riskCategory === "overweight").length,
  normal: mockPatients.filter(p => p.riskCategory === "normal").length,
};

export const mockAlerts: RiskAlert[] = [
  {
    id: "alert-001", patientId: "pt-001", patientName: "Aiden Thompson",
    message: "BMI percentile exceeded 95th percentile threshold. Immediate follow-up recommended.",
    severity: "high", date: "2026-05-10",
  },
  {
    id: "alert-002", patientId: "pt-004", patientName: "Emma Davis",
    message: "Weight gain of 4.2 kg over 6 months. Review dietary plan.",
    severity: "high", date: "2026-05-20",
  },
  {
    id: "alert-003", patientId: "pt-007", patientName: "Mason Garcia",
    message: "BMI trending above 95th percentile. Schedule nutrition consult.",
    severity: "high", date: "2026-05-12",
  },
  {
    id: "alert-004", patientId: "pt-002", patientName: "Sofia Martinez",
    message: "BMI between 85th–95th percentile. Monitor at next well visit.",
    severity: "medium", date: "2026-05-15",
  },
  {
    id: "alert-005", patientId: "pt-006", patientName: "Olivia Brown",
    message: "Overweight classification confirmed. Lifestyle counseling initiated.",
    severity: "medium", date: "2026-05-18",
  },
];

export const mockPatientDetail: PatientDetail = {
  id: "pt-001", mrn: "MRN-100123", fullName: "Aiden Thompson", gender: "Male",
  birthDate: "2014-03-12", age: 10, bmi: 23.4, riskCategory: "high-risk", lastVisit: "2026-05-10",
  bmiTrend: [
    { date: "2024-05", value: 19.2, unit: "kg/m²" },
    { date: "2024-08", value: 20.1, unit: "kg/m²" },
    { date: "2024-11", value: 21.0, unit: "kg/m²" },
    { date: "2025-02", value: 21.8, unit: "kg/m²" },
    { date: "2025-05", value: 22.3, unit: "kg/m²" },
    { date: "2025-08", value: 22.9, unit: "kg/m²" },
    { date: "2025-11", value: 23.1, unit: "kg/m²" },
    { date: "2026-02", value: 23.4, unit: "kg/m²" },
  ],
  weightTrend: [
    { date: "2024-05", value: 32.0, unit: "kg" },
    { date: "2024-08", value: 33.5, unit: "kg" },
    { date: "2024-11", value: 35.0, unit: "kg" },
    { date: "2025-02", value: 36.2, unit: "kg" },
    { date: "2025-05", value: 37.5, unit: "kg" },
    { date: "2025-08", value: 38.8, unit: "kg" },
    { date: "2025-11", value: 39.9, unit: "kg" },
    { date: "2026-02", value: 41.0, unit: "kg" },
  ],
  heightTrend: [
    { date: "2024-05", value: 129, unit: "cm" },
    { date: "2024-08", value: 131, unit: "cm" },
    { date: "2024-11", value: 132, unit: "cm" },
    { date: "2025-02", value: 133, unit: "cm" },
    { date: "2025-05", value: 135, unit: "cm" },
    { date: "2025-08", value: 137, unit: "cm" },
    { date: "2025-11", value: 138, unit: "cm" },
    { date: "2026-02", value: 140, unit: "cm" },
  ],
  encounters: [
    { date: "2026-05-10", type: "Well Child Visit", provider: "Dr. Rachel Kim" },
    { date: "2025-11-14", type: "Follow-up: Obesity Risk", provider: "Dr. Rachel Kim" },
    { date: "2025-05-22", type: "Well Child Visit", provider: "Dr. Marcus Patel" },
    { date: "2024-11-08", type: "Nutrition Consult", provider: "RD Sarah Chen" },
  ],
};
