import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ReportFormEditor from "@/components/form/ReportFormEditor";
import { FORMS, isFormType } from "@/forms/registry";
import { useApi, useSession } from "@/lib/auth";
import type { FormData } from "@/lib/reports";
import { usePageTitle } from "@/components/shell/navigation";
import NotFound from "./NotFound";

// One draft per employee, so another person on a shared phone never sees it.
const draftKeyFor = (type: string, employeeId: string) => `anvira-draft-${employeeId}-${type}`;

/** The technician name is filled from the login and cannot be changed. */
const withTechnician = (type: string, values: FormData, name: string): FormData =>
  type === "pm" ? { ...values, technicianName: name } : type === "breakdown" ? { ...values, servicePersonName: name } : type === "commissioning" ? { ...values, engineerName: name } : values;

function loadDraft(key: string): FormData {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

const NewReportPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const api = useApi();
  const { employee } = useSession();
  const [formKey, setFormKey] = useState(0);
  usePageTitle(isFormType(type) ? FORMS[type].shortTitle : "New Report");

  if (!isFormType(type)) return <NotFound />;

  const def = FORMS[type];
  const draftKey = draftKeyFor(type, employee.id);

  const handleSubmit = async (values: FormData) => {
    const report = await api.createReport(type, values, def.summary(values));
    localStorage.removeItem(draftKey);
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    toast.success(`Saved as ${report.form_no}`);
    // Replace the form in history, so "back" from the saved report goes home.
    navigate(`/reports/${report.id}`, { replace: true });
  };

  const handleClear = () => {
    if (!window.confirm("Clear everything you have entered in this form?")) return;
    localStorage.removeItem(draftKey);
    setFormKey((k) => k + 1);
  };

  return (
    <ReportFormEditor
      key={`${type}-${formKey}`}
      def={def}
      initialValues={withTechnician(type, loadDraft(draftKey), employee.name)}
      subtitle="Fill in the details below. The report number is given automatically when you save."
      submitLabel="Save Report"
      onSubmit={handleSubmit}
      draftKey={draftKey}
      onClear={handleClear}
    />
  );
};

export default NewReportPage;
