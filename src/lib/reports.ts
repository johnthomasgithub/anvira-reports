import { supabase, SIGNATURE_BUCKET } from "@/lib/supabase";

export type FormType = "pm" | "breakdown" | "commissioning";
export type FormData = Record<string, unknown>;

export interface Report {
  id: string;
  form_type: FormType;
  form_no: string;
  report_no: string | null;
  job_no: string | null;
  client: string | null;
  report_date: string | null;
  data: FormData;
  created_at: string;
  updated_at: string;
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
}

/** sessionStorage key holding the Saved Reports filters (URL query string). */
export const LAST_LIST_KEY = "anvira-last-list-filters";

const FORM_NO_PREFIX: Record<FormType, string> = {
  pm: "ASPL/PM/",
  breakdown: "ASPL/BDS/",
  commissioning: "ASPL/CR/",
};

const isDataUrl = (v: unknown): boolean => typeof v === "string" && v.startsWith("data:");

// ── Signatures ─────────────────────────────────────────────────────────────
// In the form, a signature is a PNG data URL. On save it is uploaded to the
// private "signatures" bucket and the form data keeps only the file path.

async function uploadSignatures(id: string, data: FormData, fields: string[]): Promise<FormData> {
  if (!supabase) return data;
  const out = { ...data };
  for (const field of fields) {
    const value = out[field];
    if (typeof value !== "string" || !isDataUrl(value)) continue;
    const blob = await (await fetch(value)).blob();
    const path = `${id}/${field}-${Date.now()}.png`;
    const { error } = await supabase.storage
      .from(SIGNATURE_BUCKET)
      .upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`Could not upload signature: ${error.message}`);
    out[field] = path;
  }
  return out;
}

/** Turns a stored signature value into something an <img> can show. */
export async function signatureSrc(value: unknown): Promise<string> {
  if (typeof value !== "string" || !value) return "";
  if (isDataUrl(value) || value.startsWith("http")) return value;
  if (!supabase) return "";
  const { data, error } = await supabase.storage.from(SIGNATURE_BUCKET).createSignedUrl(value, 60 * 60);
  if (error) return "";
  return data.signedUrl;
}

// ── Local fallback (no Supabase keys) ─────────────────────────────────────

const LOCAL_KEY = "anvira-reports";
const LOCAL_COUNTER_KEY = "anvira-report-counters";

function readLocal(): Report[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(reports: Report[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(reports));
}

function nextLocalFormNo(type: FormType): string {
  let counters: Record<string, number> = {};
  try {
    counters = JSON.parse(localStorage.getItem(LOCAL_COUNTER_KEY) || "{}");
  } catch {
    counters = {};
  }
  counters[type] = (counters[type] ?? 0) + 1;
  localStorage.setItem(LOCAL_COUNTER_KEY, JSON.stringify(counters));
  return FORM_NO_PREFIX[type] + String(counters[type]).padStart(4, "0");
}

function matches(r: Report, filter: ListFilter) {
  const has = (value: string | null, q?: string) => !q?.trim() || !!value?.toLowerCase().includes(q.trim().toLowerCase());
  if (filter.formType && filter.formType !== "all" && r.form_type !== filter.formType) return false;
  if (!has(r.client, filter.client)) return false;
  if (filter.number?.trim() && ![r.form_no, r.report_no, r.job_no].some((v) => has(v, filter.number))) return false;
  if (filter.dateFrom && (!r.report_date || r.report_date < filter.dateFrom)) return false;
  if (filter.dateTo && (!r.report_date || r.report_date > filter.dateTo)) return false;
  return true;
}

// ── Public API ─────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

/** Searchable columns. The date falls back so every report can be found by date. */
const toColumns = (summary: ReportSummary, fallbackDate: string) => ({
  client: summary.client || null,
  report_no: summary.reportNo || null,
  job_no: summary.jobNo || null,
  report_date: summary.reportDate || fallbackDate,
});

/** Strips characters that have a meaning inside a PostgREST `or` filter. */
const clean = (value?: string) => value?.trim().replace(/[%,()*]/g, " ").trim() ?? "";

export async function listReports(filter: ListFilter = {}): Promise<Report[]> {
  if (!supabase) {
    return readLocal()
      .filter((r) => matches(r, filter))
      .sort((a, b) => (b.report_date ?? "").localeCompare(a.report_date ?? "") || b.created_at.localeCompare(a.created_at));
  }

  let query = supabase
    .from("reports")
    .select("*")
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter.formType && filter.formType !== "all") query = query.eq("form_type", filter.formType);
  const client = clean(filter.client);
  if (client) query = query.ilike("client", `%${client}%`);
  const number = clean(filter.number);
  if (number) query = query.or(`form_no.ilike.%${number}%,report_no.ilike.%${number}%,job_no.ilike.%${number}%`);
  if (filter.dateFrom) query = query.gte("report_date", filter.dateFrom);
  if (filter.dateTo) query = query.lte("report_date", filter.dateTo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Report[];
}

export async function getReport(id: string): Promise<Report> {
  if (!supabase) {
    const found = readLocal().find((r) => r.id === id);
    if (!found) throw new Error("Report not found");
    return found;
  }
  const { data, error } = await supabase.from("reports").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as Report;
}

export async function createReport(
  type: FormType,
  formData: FormData,
  summary: ReportSummary,
  signatureFields: string[],
): Promise<Report> {
  const id = crypto.randomUUID();

  if (!supabase) {
    const now = new Date().toISOString();
    const report: Report = {
      id,
      form_type: type,
      form_no: nextLocalFormNo(type),
      ...toColumns(summary, today()),
      data: formData,
      created_at: now,
      updated_at: now,
    };
    writeLocal([report, ...readLocal()]);
    return report;
  }

  const data = await uploadSignatures(id, formData, signatureFields);
  const { data: row, error } = await supabase
    .from("reports")
    .insert({ id, form_type: type, ...toColumns(summary, today()), data })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Report;
}

export async function updateReport(
  id: string,
  formData: FormData,
  summary: ReportSummary,
  signatureFields: string[],
): Promise<Report> {
  if (!supabase) {
    const reports = readLocal();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Report not found");
    reports[index] = {
      ...reports[index],
      ...toColumns(summary, reports[index].created_at.slice(0, 10)),
      data: formData,
      updated_at: new Date().toISOString(),
    };
    writeLocal(reports);
    return reports[index];
  }

  const data = await uploadSignatures(id, formData, signatureFields);
  const columns = toColumns(summary, "");
  const { data: row, error } = await supabase
    .from("reports")
    // An empty date keeps whatever date the report already has.
    .update({ ...columns, report_date: columns.report_date || undefined, data })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Report;
}
