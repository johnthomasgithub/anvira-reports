import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ReportFormEditor from "@/components/form/ReportFormEditor";
import { FORMS, isFormType } from "@/forms/registry";
import { createReport, type FormData } from "@/lib/reports";
import { usePageTitle } from "@/components/shell/navigation";
import NotFound from "./NotFound";

const draftKeyFor = (type: string) => `anvira-draft-${type}`;

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
  const [formKey, setFormKey] = useState(0);
  usePageTitle(isFormType(type) ? FORMS[type].shortTitle : "New Report");

  if (!isFormType(type)) return <NotFound />;

  const def = FORMS[type];
  const draftKey = draftKeyFor(type);

  const handleSubmit = async (values: FormData) => {
    const report = await createReport(type, values, def.summary(values), def.signatureFields);
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
      initialValues={loadDraft(draftKey)}
      subtitle="Fill in the details below. The report number is given automatically when you save."
      submitLabel="Save Report"
      onSubmit={handleSubmit}
      draftKey={draftKey}
      onClear={handleClear}
    />
  );
};

export default NewReportPage;
