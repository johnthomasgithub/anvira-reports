import { useNavigate } from "react-router-dom";
import { ClipboardCheck, FolderOpen, Settings2, Wrench } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { FORMS } from "@/forms/registry";
import type { FormType } from "@/lib/reports";
import BrandLogo from "@/components/shell/BrandLogo";

const ICONS: Record<FormType, typeof Wrench> = {
  pm: ClipboardCheck,
  breakdown: Wrench,
  commissioning: Settings2,
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100dvh-60px)] bg-muted/50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center flex flex-col items-center">
          <BrandLogo className="mb-3 h-20 w-20 rounded-2xl p-1.5" />
          <h1 className="text-xl font-bold text-brand-blue">Anvira Solutions Pvt Ltd</h1>
          <p className="text-muted-foreground mt-1 text-sm">Select the report you want to create</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {Object.values(FORMS).map((form) => {
            const Icon = ICONS[form.type];
            return (
              <Card
                key={form.type}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => navigate(`/new/${form.type}`)}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <Icon className="h-10 w-10 text-primary flex-shrink-0" />
                  <div>
                    <h2 className="font-semibold text-lg leading-tight">{form.shortTitle}</h2>
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-brand-green/60 bg-brand-green/10 hover:border-brand-green"
            onClick={() => navigate("/reports")}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <FolderOpen className="h-10 w-10 text-brand-green-dark flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-lg leading-tight">Saved Reports</h2>
                <p className="text-sm text-muted-foreground">Find, open, edit and print old reports</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
