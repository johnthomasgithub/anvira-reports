import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import ReportFormEditor from "@/components/form/ReportFormEditor";
import { FORMS } from "@/forms/registry";
import { useApi } from "@/lib/auth";
import type { FormData } from "@/lib/reports";
import { usePageTitle } from "@/components/shell/navigation";

const EditReportPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const api = useApi();
  const { data: report, isLoading, error } = useQuery({ queryKey: ["report", id], queryFn: () => api.getReport(id) });
  usePageTitle(report ? `Edit ${report.form_no}` : "Edit Report");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !report) {
    return <p className="text-center py-20 text-muted-foreground">Could not load this report.</p>;
  }

  const def = FORMS[report.form_type];

  const handleSubmit = async (values: FormData) => {
    await api.updateReport(report.id, values, def.summary(values));
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["report", report.id] });
    toast.success(`${report.form_no} updated`);
    // Return to the report screen we came from (it reloads the saved data).
    if (location.key !== "default") navigate(-1);
    else navigate(`/reports/${report.id}`, { replace: true });
  };

  return (
    <ReportFormEditor
      key={report.id}
      def={def}
      initialValues={report.data}
      subtitle={`Editing ${report.form_no}`}
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
    />
  );
};

export default EditReportPage;
