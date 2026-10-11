import type { ComponentType } from "react";
import type { ReportProps } from "@/components/report/ReportPage";
import type { FormData, FormType, ReportSummary } from "@/lib/reports";

import PmForm from "./pm/PmForm";
import PmReport from "./pm/PmReport";
import BreakdownForm from "./breakdown/BreakdownForm";
import BreakdownReport from "./breakdown/BreakdownReport";
import CommissioningForm from "./commissioning/CommissioningForm";
import CommissioningReport from "./commissioning/CommissioningReport";

export interface FormDefinition {
  type: FormType;
  title: string;
  shortTitle: string;
  description: string;
  Form: ComponentType;
  Report: ComponentType<ReportProps>;
  signatureFields: string[];
  /** Values copied into the searchable columns of the reports table. */
  summary: (data: FormData) => ReportSummary;
}

const text = (data: FormData, key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");

export const FORMS: Record<FormType, FormDefinition> = {
  pm: {
    type: "pm",
    title: "Preventive Maintenance Service Report",
    shortTitle: "PM Service Report",
    description: "Quarterly preventive maintenance visit with checklist",
    Form: PmForm,
    Report: PmReport,
    signatureFields: ["customerSignature", "technicianSignature"],
    summary: (d) => ({ client: text(d, "clientName"), reportNo: text(d, "reportNo"), jobNo: text(d, "jobNo"), reportDate: text(d, "date") }),
  },
  breakdown: {
    type: "breakdown",
    title: "Break Down Service Report",
    shortTitle: "Break Down Report",
    description: "Complaint attended, inspection and service rendered",
    Form: BreakdownForm,
    Report: BreakdownReport,
    signatureFields: ["servicePersonSignature", "customerSignature"],
    summary: (d) => ({ client: text(d, "clientName"), reportNo: text(d, "reportNo"), jobNo: text(d, "jobNo"), reportDate: text(d, "reportDate") }),
  },
  commissioning: {
    type: "commissioning",
    title: "Commissioning Report",
    shortTitle: "Commissioning Report",
    description: "New installation details and PM schedule",
    Form: CommissioningForm,
    Report: CommissioningReport,
    signatureFields: ["engineerSignature", "customerSignature"],
    summary: (d) => ({
      client: text(d, "clientName"),
      reportNo: text(d, "reportNo"),
      jobNo: text(d, "jobNo"),
      reportDate: text(d, "engineerSignDate") || text(d, "customerPoDate"),
    }),
  },
};

export const FORM_LIST = Object.values(FORMS);

export const isFormType = (value: string | undefined): value is FormType => !!value && value in FORMS;
