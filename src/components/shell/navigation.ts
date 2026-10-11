import { createContext, useCallback, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LAST_LIST_KEY } from "@/lib/reports";

// ── Page title ─────────────────────────────────────────────────────────────

export const TitleContext = createContext<(title: string) => void>(() => {});

/** Sets the title shown in the top app bar while the page is open. */
export function usePageTitle(title: string) {
  const setTitle = useContext(TitleContext);
  useEffect(() => setTitle(title), [setTitle, title]);
}

// ── Navigation helpers ─────────────────────────────────────────────────────

/** Top-level tabs: they show the bottom tab bar instead of their own action bar. */
export const isTabRoute = (path: string) => path === "/" || path === "/reports";

/** Where "back" goes when there is no in-app history (e.g. a shared link). */
function parentOf(path: string): string {
  const edit = /^\/reports\/([^/]+)\/edit$/.exec(path);
  if (edit) return `/reports/${edit[1]}`;
  if (/^\/reports\/[^/]+$/.test(path)) return `/reports?${sessionStorage.getItem(LAST_LIST_KEY) ?? ""}`;
  return "/";
}

/** Goes back like a phone app: to the previous screen, or up to the parent screen. */
export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(() => {
    if (location.key !== "default") navigate(-1);
    else navigate(parentOf(location.pathname), { replace: true });
  }, [navigate, location.key, location.pathname]);
}
