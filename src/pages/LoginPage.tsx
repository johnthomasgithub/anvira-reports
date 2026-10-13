import { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, LockKeyhole } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/lib/auth";
import { isCloudEnabled } from "@/lib/supabase";
import BrandLogo from "@/components/shell/BrandLogo";

const ERRORS = {
  INVALID_PIN: "Wrong PIN. Please try again.",
  TOO_MANY_ATTEMPTS: "Too many wrong PINs. Please wait 15 minutes and try again.",
};

const LoginPage = () => {
  const { signIn } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (value: string) => {
    setBusy(true);
    setError("");
    try {
      const result = await signIn(value);
      if ("error" in result) {
        setError(ERRORS[result.error]);
        setPin("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in. Check the internet connection.");
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-muted/50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8 flex flex-col items-center text-center gap-5">
          <BrandLogo className="h-20 w-20 rounded-2xl p-1.5" />
          <div className="text-brand-blue font-bold">Anvira Solutions Pvt Ltd</div>
          <div>
            <h1 className="text-lg font-semibold flex items-center justify-center gap-2">
              <LockKeyhole className="h-4 w-4" /> Enter your PIN
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your 4-digit employee PIN</p>
          </div>

          <InputOTP
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoFocus
            value={pin}
            disabled={busy}
            onChange={(v) => {
              setPin(v);
              setError("");
            }}
            onComplete={submit}
          >
            <InputOTPGroup className="gap-3">
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-14 w-12 rounded-md border text-2xl font-semibold" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <div className="h-5 text-sm">
            {busy ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </span>
            ) : (
              error && <span className="text-destructive">{error}</span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Your login stays active for 24 hours on this device.</p>
          {!isCloudEnabled && import.meta.env.DEV && (
            <p className="text-xs rounded bg-amber-100 text-amber-900 px-2 py-1">
              Local demo: PINs 1001–1012 (technicians) and 1099 (Anvira Admin)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
