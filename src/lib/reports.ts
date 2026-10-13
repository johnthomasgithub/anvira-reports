import { supabase } from "@/lib/supabase";

// All data goes through checked database functions (see supabase/schema.sql),
// called with the session token from the PIN login. The database decides what
// each employee may see: technicians their own reports, admins everyone's.

export type FormType = "pm" | "breakdown" | "commissioning";
export type FormData = Record<string, unknown>;
export type Role = "technician" | "admin";

export interface Employee {
  id: string;
  code: string | null;
  name: string;
  role: Role;
}

export interface Session {
  token: string;
  expiresAt: string; // ISO time
  employee: Employee;
}

export type LoginResult = { ok: true; session: Session } | { ok: false; error: "INVALID_PIN" | "TOO_MANY_ATTEMPTS" };

/** List row (no form data). */
export interface ReportRow {
  id: string;
  form_type: FormType;
  form_no: string;
  report_no: string | null;
  job_no: string | null;
  client: string | null;
  report_date: string | null;
  /** Null for reports saved before PIN login existed. */
  owner_id: string | null;
  owner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report extends ReportRow {
  data: FormData;
}

export interface ReportSummary {
  client: string;
  reportNo: string;
  jobNo: string;
  reportDate: string; // yyyy-MM-dd or ""
}

export interface ListFilter {
  /** Part of the client name. */
  client?: string;
  /** Part of the Form No., Report No. or Job No. */
  number?: string;
  formType?: FormType | "all";
  /** yyyy-MM-dd, inclusive */
  dateFrom?: string;
  dateTo?: string;
  /** Admins only: one technician's reports. */
  ownerId?: string;
}

/** sessionStorage key holding the Saved Reports filters (URL query string). */
export const LAST_LIST_KEY = "anvira-last-list-filters";

/** The session has ended (24 hours passed, or logged out elsewhere). */
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please enter your PIN again.");
  }
}

const isDataUrl = (v: unknown): boolean => typeof v === "string" && v.startsWith("data:");

/**
 * Signatures are stored inside the report (PNG data URLs), so they follow the
 * same access rules as the report. Older reports may hold a link instead.
 */
export async function signatureSrc(value: unknown): Promise<string> {
  if (typeof value !== "string" || !value) return "";
  return isDataUrl(value) || value.startsWith("http") ? value : "";
}

// ── Backend selection ─────────────────────────────────────────────────────
// Without Supabase keys, development builds use an in-browser demo backend.
// Production builds never include it (the import is removed at build time).

type LocalBackend = typeof import("./localBackend");

function localBackend(): Promise<LocalBackend> {
  return import.meta.env.DEV
    ? import("./localBackend")
    : Promise.reject(new Error("The app is not connected to Supabase. Add the keys and redeploy."));
}

function toError(message: string): Error {
  if (message.includes("SESSION_EXPIRED")) return new SessionExpiredError();
  if (message.includes("NOT_FOUND")) return new Error("Not found, or you do not have access to it.");
  if (message.includes("NOT_ALLOWED")) return new Error("Only an admin can do this.");
  if (message.includes("Could not find the function")) {
    return new Error("The database is not set up for PIN login yet. Run supabase/schema.sql in Supabase.");
  }
  return new Error(message);
}

/** Runs a demo-backend call with the same error handling as Supabase. */
async function viaLocal<T>(fn: (backend: LocalBackend) => T): Promise<T> {
  const backend = await localBackend();
  try {
    return fn(backend);
  } catch (err) {
    throw toError(err instanceof Error ? err.message : String(err));
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.rpc(fn, args);
  if (error) throw toError(error.message);
  return data as T;
}

// ── Login ──────────────────────────────────────────────────────────────────

interface LoginResponse {
  ok: boolean;
  error?: "INVALID_PIN" | "TOO_MANY_ATTEMPTS";
  token?: string;
  expires_at?: string;
  employee?: Employee;
}

export async function login(pin: string): Promise<LoginResult> {
  const res = supabase ? await rpc<LoginResponse>("login", { p_pin: pin }) : await viaLocal((b) => b.login(pin));
  if (!res.ok || !res.token || !res.expires_at || !res.employee) {
    return { ok: false, error: res.error ?? "INVALID_PIN" };
  }
  return { ok: true, session: { token: res.token, expiresAt: res.expires_at, employee: res.employee } };
}

/** Confirms a stored session is still valid; returns it refreshed, or null. */
export async function checkSession(session: Session): Promise<Session | null> {
  try {
    const res = supabase
      ? await rpc<{ expires_at: string; employee: Employee }>("whoami", { p_token: session.token })
      : await viaLocal((b) => b.whoami(session.token));
    return { token: session.token, expiresAt: res.expires_at, employee: res.employee };
  } catch (err) {
    if (err instanceof SessionExpiredError) return null;
    throw err;
  }
}

export async function logout(token: string): Promise<void> {
  if (supabase) await rpc("logout", { p_token: token });
  else await viaLocal((b) => b.logout(token));
}

// ── Reports ────────────────────────────────────────────────────────────────

/** Searchable columns; the database falls back to today when the date is empty. */
const toArgs = (summary: ReportSummary) => ({
  p_report_no: summary.reportNo,
  p_job_no: summary.jobNo,
  p_client: summary.client,
  p_date: summary.reportDate || null,
});

export async function listReports(token: string, filter: ListFilter = {}): Promise<ReportRow[]> {
  const args = {
    p_token: token,
    p_client: filter.client?.trim() || null,
    p_number: filter.number?.trim() || null,
    p_type: filter.formType && filter.formType !== "all" ? filter.formType : null,
    p_from: filter.dateFrom || null,
    p_to: filter.dateTo || null,
    p_owner: filter.ownerId || null,
  };
  return supabase ? rpc("list_reports", args) : viaLocal((b) => b.listReports(args));
}

export async function getReport(token: string, id: string): Promise<Report> {
  if (!supabase) return viaLocal((b) => b.getReport(token, id));
  const rows = await rpc<Report[]>("get_report", { p_token: token, p_id: id });
  if (!rows[0]) throw toError("NOT_FOUND");
  return rows[0];
}

export async function createReport(
  token: string,
  type: FormType,
  formData: FormData,
  summary: ReportSummary,
): Promise<Report> {
  const args = {
    p_token: token,
    p_type: type,
    ...toArgs(summary),
    p_data: JSON.parse(JSON.stringify(formData)),
  };
  if (!supabase) return viaLocal((b) => b.createReport(args));
  const rows = await rpc<Report[]>("create_report", args);
  return rows[0];
}

export async function updateReport(
  token: string,
  id: string,
  formData: FormData,
  summary: ReportSummary,
): Promise<Report> {
  const args = {
    p_token: token,
    p_id: id,
    ...toArgs(summary),
    p_data: JSON.parse(JSON.stringify(formData)),
  };
  if (!supabase) return viaLocal((b) => b.updateReport(args));
  const rows = await rpc<Report[]>("update_report", args);
  return rows[0];
}

/** Admins only: permanently deletes a report. */
export async function deleteReport(token: string, id: string): Promise<void> {
  if (supabase) await rpc("delete_report", { p_token: token, p_id: id });
  else await viaLocal((b) => b.deleteReport(token, id));
}

/** Admins only. */
export async function listEmployees(token: string): Promise<Employee[]> {
  return supabase ? rpc("list_employees", { p_token: token }) : viaLocal((b) => b.listEmployees(token));
}
