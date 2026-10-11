import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { FormDefinition } from "@/forms/registry";
import type { FormData } from "@/lib/reports";

interface Props {
  def: FormDefinition;
  initialValues: FormData;
  subtitle: string;
  submitLabel: string;
  onSubmit: (values: FormData) => Promise<void>;
  /** When set, the form is autosaved to this localStorage key (new reports only). */
  draftKey?: string;
  onClear?: () => void;
}

const ReportFormEditor = ({ def, initialValues, subtitle, submitLabel, onSubmit, draftKey, onClear }: Props) => {
  const methods = useForm<FormData>({ defaultValues: initialValues });
  const [saving, setSaving] = useState(false);

  // Keep a local draft so nothing is lost if the page reloads or the network drops.
  useEffect(() => {
    if (!draftKey) return;
    let timeout: ReturnType<typeof setTimeout>;
    const subscription = methods.watch((values) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        try {
          localStorage.setItem(draftKey, JSON.stringify(values));
        } catch {
          // Storage full or unavailable: the draft is a convenience only.
        }
      }, 400);
    });
    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [methods, draftKey]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const submit = methods.handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      toast.error("Not saved – please check the internet connection and try again.", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  });

  const Form = def.Form;

  return (
    <div className="min-h-screen bg-muted/50 pt-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-brand-blue tracking-tight">{def.title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={submit} onKeyDown={handleKeyDown} className="space-y-4 sm:space-y-6">
            <Form />

            <div className="flex gap-3 sticky bottom-0 -mx-3 px-3 sm:mx-0 sm:px-0 border-t sm:border-0 bg-background/95 sm:bg-muted/90 backdrop-blur pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button type="submit" className="flex-1" size="lg" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : submitLabel}
              </Button>
              {onClear && (
                <Button type="button" variant="outline" size="lg" onClick={onClear} disabled={saving} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Clear Form
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ReportFormEditor;
