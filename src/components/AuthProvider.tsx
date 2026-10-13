import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AuthContext } from "@/lib/auth";
import { LAST_LIST_KEY, checkSession, login, logout, type Session } from "@/lib/reports";

const SESSION_KEY = "anvira-session";

function loadSession(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as Session | null;
    return s && new Date(s.expiresAt) > new Date() ? s : null;
  } catch {
    return null;
  }
}

/** Keeps the PIN login: stored on this device for up to 24 hours. */
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(loadSession);

  const signOut = useCallback(
    (reason?: "expired") => {
      setSession((current) => {
        if (current && reason !== "expired") logout(current.token).catch(() => {});
        return null;
      });
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(LAST_LIST_KEY);
      queryClient.clear();
      if (reason === "expired") toast.info("Your login has expired. Please enter your PIN again.");
    },
    [queryClient],
  );

  const signIn = useCallback(async (pin: string) => {
    const result = await login(pin);
    if (result.ok) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.session));
      setSession(result.session);
    }
    return result;
  }, []);

  // On start, confirm the stored login is still valid on the server.
  useEffect(() => {
    const stored = loadSession();
    if (!stored) return;
    checkSession(stored)
      .then((fresh) => {
        if (!fresh) signOut("expired");
        else {
          localStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
          setSession(fresh);
        }
      })
      .catch(() => {
        // Offline: keep the stored login; the next request will check again.
      });
  }, [signOut]);

  // Log out automatically when the 24 hours are up.
  useEffect(() => {
    if (!session) return;
    const ms = new Date(session.expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => signOut("expired"), Math.max(0, Math.min(ms, 2_147_000_000)));
    return () => clearTimeout(timer);
  }, [session, signOut]);

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
