// Development-only stand-in for the Supabase functions in supabase/schema.sql,
// used when no Supabase keys are set. Data lives in this browser's storage.
// It follows the same rules (own reports only, admins see all, technician name
// fixed) but uses DEMO PINs – the real PINs exist only in the Supabase database.

import type { Employee, FormData, FormType, Report, ReportRow } from "./reports";

const DEMO_EMPLOYEES: (Employee & { pin: string })[] = [
  { id: "e01", code: "010001", name: "ANSARI MOHD FAISAL SHAMIM", role: "technician", pin: "1001" },
  { id: "e04", code: "010004", name: "BRIJESH KUMAR", role: "technician", pin: "1004" },
  { id: "e05", code: "010005", name: "UMESH KUMAR", role: "technician", pin: "1005" },
  { id: "e06", code: "010006", name: "NADAR ABISHEK SURESH KUMAR", role: "technician", pin: "1006" },
  { id: "e07", code: "010007", name: "KAREEM KHAN", role: "technician", pin: "1007" },
  { id: "e08", code: "010008", name: "ISHTYAK IRSHAD AHAMAD", role: "technician", pin: "1008" },
  { id: "e10", code: "010010", name: "MD WASIM AKRAM", role: "technician", pin: "1010" },
  { id: "e11", code: "010011", name: "MOHAMMAD AASIF MOHAMMAD ANWAR", role: "technician", pin: "1011" },
  { id: "e12", code: "010012", name: "MOHD TAHA SHAHADAT SHAIKH", role: "technician", pin: "1012" },
  { id: "e98", code: null, name: "EBENAZER JEBASEELAN", role: "technician", pin: "1098" },
  { id: "e99", code: null, name: "Anvira Admin", role: "admin", pin: "1099" },
];

const REPORTS_KEY = "anvira-demo-reports";
const SESSIONS_KEY = "anvira-demo-sessions";
const COUNTER_KEY = "anvira-demo-counters";
const DAY_MS = 24 * 60 * 60 * 1000;

const FORM_NO_PREFIX: Record<FormType, string> = {
  pm: "ASPL/PM/",
  breakdown: "ASPL/BDS/",
  commissioning: "ASPL/CR/",
};

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

type Sessions = Record<string, { employeeId: string; expiresAt: string }>;

const publicEmployee = ({ pin: _pin, ...e }: Employee & { pin: string }): Employee => e;

function sessionEmployee(token: string): Employee {
  const s = read<Sessions>(SESSIONS_KEY, {})[token];
  const emp = s && new Date(s.expiresAt) > new Date() && DEMO_EMPLOYEES.find((e) => e.id === s.employeeId);
  if (!emp) throw new Error("SESSION_EXPIRED");
  return publicEmployee(emp);
}

/** The technician name in the form always matches the report's owner. */
const withOwnerName = (type: FormType, data: FormData, name: string): FormData => {
  if (type === "pm") return { ...data, technicianName: name };
  if (type === "breakdown") return { ...data, servicePersonName: name };
  if (type === "commissioning") return { ...data, engineerName: name };
  return data;
};

const canSee = (emp: Employee, r: Report) => emp.role === "admin" || r.owner_id === emp.id;
const today = () => new Date().toISOString().slice(0, 10);

function nextFormNo(type: FormType): string {
  const counters = read<Record<string, number>>(COUNTER_KEY, {});
  counters[type] = (counters[type] ?? 0) + 1;
  write(COUNTER_KEY, counters);
  return FORM_NO_PREFIX[type] + String(counters[type]).padStart(4, "0");
}

export function login(pin: string) {
  const emp = DEMO_EMPLOYEES.find((e) => e.pin === pin);
  if (!emp) return { ok: false as const, error: "INVALID_PIN" as const };
  const token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + DAY_MS).toISOString();
  const sessions = read<Sessions>(SESSIONS_KEY, {});
  sessions[token] = { employeeId: emp.id, expiresAt: expires_at };
  write(SESSIONS_KEY, sessions);
  return { ok: true as const, token, expires_at, employee: publicEmployee(emp) };
}

export function whoami(token: string) {
  const employee = sessionEmployee(token);
  return { expires_at: read<Sessions>(SESSIONS_KEY, {})[token].expiresAt, employee };
}

export function logout(token: string) {
  const sessions = read<Sessions>(SESSIONS_KEY, {});
  delete sessions[token];
  write(SESSIONS_KEY, sessions);
}

const has = (value: string | null, q: string | null) => !q || !!value?.toLowerCase().includes(q.toLowerCase());

export function listReports(a: {
  p_token: string;
  p_client: string | null;
  p_number: string | null;
  p_type: string | null;
  p_from: string | null;
  p_to: string | null;
  p_owner: string | null;
}): ReportRow[] {
  const emp = sessionEmployee(a.p_token);
  return read<Report[]>(REPORTS_KEY, [])
    .filter(
      (r) =>
        canSee(emp, r) &&
        (!a.p_owner || r.owner_id === a.p_owner) &&
        has(r.client, a.p_client) &&
        (!a.p_number || [r.form_no, r.report_no, r.job_no].some((v) => has(v, a.p_number))) &&
        (!a.p_type || r.form_type === a.p_type) &&
        (!a.p_from || (!!r.report_date && r.report_date >= a.p_from)) &&
        (!a.p_to || (!!r.report_date && r.report_date <= a.p_to)),
    )
    .sort((x, y) => (y.report_date ?? "").localeCompare(x.report_date ?? "") || y.created_at.localeCompare(x.created_at))
    .map(({ data: _data, ...row }) => row);
}

export function getReport(token: string, id: string): Report {
  const emp = sessionEmployee(token);
  const found = read<Report[]>(REPORTS_KEY, []).find((r) => r.id === id);
  if (!found || !canSee(emp, found)) throw new Error("NOT_FOUND");
  return found;
}

interface SaveArgs {
  p_token: string;
  p_report_no: string;
  p_job_no: string;
  p_client: string;
  p_date: string | null;
  p_data: FormData;
}

export function createReport(a: SaveArgs & { p_type: FormType }): Report {
  const emp = sessionEmployee(a.p_token);
  const now = new Date().toISOString();
  const report: Report = {
    id: crypto.randomUUID(),
    form_type: a.p_type,
    form_no: nextFormNo(a.p_type),
    report_no: a.p_report_no || null,
    job_no: a.p_job_no || null,
    client: a.p_client || null,
    report_date: a.p_date || today(),
    owner_id: emp.id,
    owner_name: emp.name,
    data: withOwnerName(a.p_type, a.p_data, emp.name),
    created_at: now,
    updated_at: now,
  };
  write(REPORTS_KEY, [report, ...read<Report[]>(REPORTS_KEY, [])]);
  return report;
}

export function updateReport(a: SaveArgs & { p_id: string }): Report {
  const emp = sessionEmployee(a.p_token);
  const reports = read<Report[]>(REPORTS_KEY, []);
  const i = reports.findIndex((r) => r.id === a.p_id);
  if (i === -1 || !canSee(emp, reports[i])) throw new Error("NOT_FOUND");
  const r = reports[i];
  reports[i] = {
    ...r,
    report_no: a.p_report_no || null,
    job_no: a.p_job_no || null,
    client: a.p_client || null,
    report_date: a.p_date || r.report_date,
    data: r.owner_name ? withOwnerName(r.form_type, a.p_data, r.owner_name) : a.p_data,
    updated_at: new Date().toISOString(),
  };
  write(REPORTS_KEY, reports);
  return reports[i];
}

export function deleteReport(token: string, id: string) {
  if (sessionEmployee(token).role !== "admin") throw new Error("NOT_ALLOWED");
  const reports = read<Report[]>(REPORTS_KEY, []);
  if (!reports.some((r) => r.id === id)) throw new Error("NOT_FOUND");
  write(REPORTS_KEY, reports.filter((r) => r.id !== id));
}

export function listEmployees(token: string): Employee[] {
  if (sessionEmployee(token).role !== "admin") throw new Error("NOT_ALLOWED");
  return DEMO_EMPLOYEES.map(publicEmployee).sort((a, b) => a.name.localeCompare(b.name));
}
