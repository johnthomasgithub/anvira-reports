import { beforeEach, describe, expect, it } from "vitest";

import * as b from "@/lib/localBackend";

const args = (token: string, extra = {}) => ({
  p_token: token,
  p_report_no: "R1",
  p_job_no: "",
  p_client: "ACME",
  p_date: "2026-10-01",
  p_data: { technicianName: "someone else", clientName: "ACME" },
  ...extra,
});
const filter = (token: string) => ({ p_token: token, p_client: null, p_number: null, p_type: null, p_from: null, p_to: null, p_owner: null });

describe("PIN login and roles (demo backend, same rules as schema.sql)", () => {
  beforeEach(() => localStorage.clear());

  it("rejects a wrong PIN and accepts the admin PIN", () => {
    expect(b.login("0000").ok).toBe(false);
    const admin = b.login("1099");
    expect(admin.ok && admin.employee.name).toBe("Anvira Admin");
    expect(admin.ok && admin.employee.role).toBe("admin");
  });

  it("technicians see only their own reports; admin sees all", () => {
    const t1 = b.login("1004");
    const t2 = b.login("1005");
    const admin = b.login("1099");
    if (!t1.ok || !t2.ok || !admin.ok) throw new Error("login failed");

    const r = b.createReport({ ...args(t1.token), p_type: "pm" });
    b.createReport({ ...args(t2.token), p_type: "breakdown" });

    expect(b.listReports(filter(t1.token))).toHaveLength(1);
    expect(b.listReports(filter(t2.token))).toHaveLength(1);
    expect(b.listReports(filter(admin.token))).toHaveLength(2);
    expect(() => b.getReport(t2.token, r.id)).toThrow("NOT_FOUND");
    expect(() => b.updateReport({ ...args(t2.token), p_id: r.id })).toThrow("NOT_FOUND");
  });

  it("forces the technician name to the owner, even when an admin edits", () => {
    const t = b.login("1004");
    const admin = b.login("1099");
    if (!t.ok || !admin.ok) throw new Error("login failed");
    const r = b.createReport({ ...args(t.token), p_type: "pm" });
    expect(r.data.technicianName).toBe("BRIJESH KUMAR");
    const edited = b.updateReport({ ...args(admin.token), p_id: r.id });
    expect(edited.data.technicianName).toBe("BRIJESH KUMAR");
    expect(edited.owner_name).toBe("BRIJESH KUMAR");
  });

  it("forces the commissioning engineer name to the owner", () => {
    const t = b.login("1004");
    if (!t.ok) throw new Error("login failed");
    const r = b.createReport({ ...args(t.token), p_type: "commissioning", p_data: { engineerName: "someone else" } });
    expect(r.data.engineerName).toBe("BRIJESH KUMAR");
  });

  it("only an admin can delete", () => {
    const t = b.login("1004");
    const admin = b.login("1099");
    if (!t.ok || !admin.ok) throw new Error("login failed");
    const r = b.createReport({ ...args(t.token), p_type: "commissioning" });
    expect(() => b.deleteReport(t.token, r.id)).toThrow("NOT_ALLOWED");
    b.deleteReport(admin.token, r.id);
    expect(b.listReports(filter(admin.token))).toHaveLength(0);
  });

  it("a logged-out session is rejected", () => {
    const t = b.login("1004");
    if (!t.ok) throw new Error("login failed");
    b.logout(t.token);
    expect(() => b.listReports(filter(t.token))).toThrow("SESSION_EXPIRED");
  });
});
