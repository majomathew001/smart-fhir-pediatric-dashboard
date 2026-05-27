import { useEffect, useState } from "react";

type FhirHumanName = {
  given?: string[];
  family?: string;
  text?: string;
};

type FhirPatient = {
  resourceType: "Patient";
  id?: string;
  name?: FhirHumanName[];
  gender?: string;
  birthDate?: string;
};

type FhirBundle = {
  resourceType: "Bundle";
  entry?: { resource?: FhirPatient }[];
  total?: number;
};

function formatName(patient: FhirPatient): string {
  const name = patient.name?.[0];
  if (!name) return "Unknown";
  if (name.text) return name.text;
  const given = name.given?.join(" ") ?? "";
  const family = name.family ?? "";
  return [given, family].filter(Boolean).join(" ") || "Unknown";
}

function formatGender(gender?: string): string {
  if (!gender) return "—";
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function formatDate(date?: string): string {
  if (!date) return "—";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PatientList() {
  const [patients, setPatients] = useState<FhirPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/fhir/Patient");
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `Request failed (${res.status})`);
        }

        const bundle = (await res.json()) as FhirBundle;
        if (cancelled) return;

        const list =
          bundle.entry
            ?.map(entry => entry.resource)
            .filter((resource): resource is FhirPatient => resource?.resourceType === "Patient") ?? [];

        setPatients(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPatients();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-8 mx-auto w-full max-w-3xl text-left">
        <p className="text-[#fbf0df]/70 font-mono text-sm">Loading patients…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 mx-auto w-full max-w-3xl text-left">
        <div className="bg-[#1a1a1a] border-2 border-red-400/60 rounded-xl p-4 text-red-300 font-mono text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="mt-8 mx-auto w-full max-w-3xl text-left">
        <p className="text-[#fbf0df]/70 font-mono text-sm">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 mx-auto w-full max-w-3xl text-left">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#fbf0df]">Patients</h2>
        <span className="text-sm font-mono text-[#fbf0df]/60">{patients.length} total</span>
      </div>

      <ul className="flex flex-col gap-3">
        {patients.map(patient => (
          <li
            key={patient.id ?? formatName(patient)}
            className="bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-4 transition-colors duration-200 hover:border-[#f3d5a3]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{formatName(patient)}</p>
                {patient.id && (
                  <p className="text-xs font-mono text-[#fbf0df]/50 mt-1">ID: {patient.id}</p>
                )}
              </div>
              <div className="text-right text-sm font-mono text-[#fbf0df]/80 shrink-0">
                <p>{formatGender(patient.gender)}</p>
                <p className="text-[#fbf0df]/60">{formatDate(patient.birthDate)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
