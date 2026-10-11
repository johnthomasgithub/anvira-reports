import type { FormData } from "@/lib/reports";

export const str = (data: FormData, key: string) => {
  const value = data[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
};

/** yyyy-MM-dd → dd/MM/yyyy */
export const fmtDate = (value: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
};

/** yyyy-MM-ddTHH:mm → dd/MM/yyyy HH:mm */
export const fmtDateTime = (value: string) => {
  const [date, time] = value.split("T");
  return time ? `${fmtDate(date)} ${time.slice(0, 5)}` : fmtDate(value);
};
