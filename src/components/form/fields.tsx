import { useEffect, useState, type ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { signatureSrc } from "@/lib/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import SelectWithOther from "@/components/SelectWithOther";
import SignatureCanvas from "@/components/SignatureCanvas";
import DatePicker from "@/components/DatePicker";

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="text-base text-brand-blue">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

/** Small uppercase caption above a group of inputs. */
export const Group = ({ label, children, cols = 3 }: { label?: string; children: ReactNode; cols?: 2 | 3 | 4 | 6 }) => (
  <div>
    {label && <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>}
    <div
      className={cn(
        "grid gap-3",
        label && "mt-2",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-2 sm:grid-cols-4",
        cols === 6 && "grid-cols-3 sm:grid-cols-6",
      )}
    >
      {children}
    </div>
  </div>
);

interface FieldProps {
  name: string;
  label: string;
  placeholder?: string;
  small?: boolean;
}

export const TextField = ({
  name,
  label,
  placeholder,
  small,
  type = "text",
  readOnly,
}: FieldProps & { type?: string; readOnly?: boolean }) => {
  const { register } = useFormContext();
  return (
    <div className={small ? "space-y-1" : "space-y-2"}>
      <Label htmlFor={name} className={small ? "text-xs" : undefined}>
        {label}
      </Label>
      <Input id={name} type={type} placeholder={placeholder} readOnly={readOnly} className={readOnly ? "bg-muted" : undefined} {...register(name)} />
    </div>
  );
};

export const DateField = ({ name, label, small, mode = "date" }: FieldProps & { mode?: "date" | "datetime-local" | "time" }) => {
  const { control } = useFormContext();
  // Time on its own uses the phone's native time wheel.
  if (mode === "time") return <TextField name={name} label={label} small={small} type="time" />;
  return (
    <div className={small ? "space-y-1" : "space-y-2"}>
      <Label htmlFor={name} className={small ? "text-xs" : undefined}>
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            id={name}
            label={label}
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            withTime={mode === "datetime-local"}
            placeholder={mode === "datetime-local" ? "Pick date & time" : "Pick a date"}
          />
        )}
      />
    </div>
  );
};

export const AreaField = ({ name, label, placeholder, rows = 3 }: FieldProps & { rows?: number }) => {
  const { register } = useFormContext();
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} rows={rows} placeholder={placeholder} {...register(name)} />
    </div>
  );
};

export const RadioField = ({ name, label, options }: { name: string; label: string; options: { value: string; label: string }[] }) => {
  const { control } = useFormContext();
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup value={(field.value as string) ?? ""} onValueChange={field.onChange} className="flex flex-wrap gap-4">
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
                <Label htmlFor={`${name}-${opt.value}`} className="font-normal cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
};

export const CheckField = ({ name, label }: { name: string; label: string }) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center space-x-2">
          <Checkbox id={name} checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
          <Label htmlFor={name} className="font-normal cursor-pointer leading-snug">
            {label}
          </Label>
        </div>
      )}
    />
  );
};

/** A checklist item that also asks Yes / No (e.g. "Rust on cabinet"). */
export const CheckYesNoField = ({ name, label }: { name: string; label: string }) => {
  const { control } = useFormContext();
  return (
    <div className="space-y-1">
      <CheckField name={name} label={label} />
      <Controller
        control={control}
        name={`${name}YesNo`}
        render={({ field }) => (
          <RadioGroup value={(field.value as string) ?? ""} onValueChange={field.onChange} className="flex gap-4 pl-6">
            {["yes", "no"].map((v) => (
              <div key={v} className="flex items-center space-x-1.5">
                <RadioGroupItem value={v} id={`${name}-${v}`} />
                <Label htmlFor={`${name}-${v}`} className="font-normal text-xs cursor-pointer capitalize">
                  {v}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
};

export const ClientField = ({ name, label, options }: { name: string; label: string; options: string[] }) => {
  const { control } = useFormContext();
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <SelectWithOther options={options} value={(field.value as string) ?? ""} onChange={field.onChange} placeholder="Select client" />
        )}
      />
    </div>
  );
};

/**
 * Signature pad. A new signature is a PNG data URL; a saved one is a storage
 * path, shown as an image with a "Sign again" button.
 */
export const SignatureField = ({ name, label }: { name: string; label: string }) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string) ?? "";
        if (value && !value.startsWith("data:")) {
          return <SavedSignature value={value} label={label} onResign={() => field.onChange("")} />;
        }
        return <SignatureCanvas value={value} onChange={field.onChange} label={label} />;
      }}
    />
  );
};

const SavedSignature = ({ value, label, onResign }: { value: string; label: string; onResign: () => void }) => {
  const [src, setSrc] = useState("");
  useEffect(() => {
    signatureSrc(value).then(setSrc);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="border border-input rounded-md bg-background h-[120px] flex items-center justify-center">
        {src ? <img src={src} alt={label} className="max-h-[110px]" /> : <span className="text-xs text-muted-foreground">Loading…</span>}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onResign}>
        Sign again
      </Button>
    </div>
  );
};
