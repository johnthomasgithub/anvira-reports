import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Pencil, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

import { FORMS } from "@/forms/registry";
import { fmtDate } from "@/components/report/format";
import { signatureSrc, type Report } from "@/lib/reports";
import { useApi, useSession } from "@/lib/auth";
import DeleteReportButton from "@/components/DeleteReportButton";
import { usePageTitle } from "@/components/shell/navigation";

function shareText(report: Report) {
  const def = FORMS[report.form_type];
  const summary = def.summary(report.data);
  return [
    def.title,
    `Form No: ${report.form_no}`,
    `Report No: ${summary.reportNo || "-"}`,
    `Date: ${summary.reportDate ? fmtDate(summary.reportDate) : "-"}`,
    `Client: ${summary.client || "-"}`,
    "",
    "Anvira Solutions Pvt Ltd",
  ];
}

const ReportViewPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const api = useApi();
  const { employee } = useSession();
  const { data: report, isLoading, error } = useQuery({ queryKey: ["report", id], queryFn: () => api.getReport(id) });
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  usePageTitle(report?.form_no ?? "Report");

  // Signatures are stored inside the report.
  useEffect(() => {
    if (!report) return;
    const fields = FORMS[report.form_type].signatureFields;
    Promise.all(fields.map(async (f) => [f, await signatureSrc(report.data[f])] as const)).then((entries) =>
      setSignatures(Object.fromEntries(entries)),
    );
  }, [report]);

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
  const Report = def.Report;

  const handlePrint = () => {
    const previous = document.title;
    document.title = report.form_no.replace(/\//g, "-");
    window.print();
    document.title = previous;
  };

  const handleWhatsApp = () => {
    const [title, ...rest] = shareText(report);
    const text = [`*${title}*`, ...rest].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmail = () => {
    const subject = `${def.title} – ${report.form_no}`;
    const body = shareText(report).join("\n");
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
  };

  const handleDelete = async () => {
    await api.deleteReport(report.id);
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.removeQueries({ queryKey: ["report", report.id] });
    toast.success(`${report.form_no} deleted`);
    navigate("/reports", { replace: true });
  };

  const actions = [
    { label: "Edit", icon: Pencil, onClick: () => navigate(`/reports/${report.id}/edit`) },
    { label: "PDF", icon: Printer, onClick: handlePrint, primary: true },
    { label: "WhatsApp", icon: Share2, onClick: handleWhatsApp },
    { label: "Email", icon: Mail, onClick: handleEmail },
  ];

  return (
    <div className="pb-24">
      <Report data={report.data} formNo={report.form_no} signatures={signatures} />

      {employee.role === "admin" && (
        <div className="print:hidden flex justify-center pt-4">
          <DeleteReportButton description={`${report.form_no}${report.owner_name ? ` by ${report.owner_name}` : ""}`} onDelete={handleDelete} />
        </div>
      )}

      {/* Bottom action bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 print:hidden border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex">
          {actions.map(({ label, icon: Icon, onClick, primary }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground active:bg-muted transition-colors"
            >
              <span
                className={
                  primary
                    ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : "flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground"
                }
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ReportViewPage;
