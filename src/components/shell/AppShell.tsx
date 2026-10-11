import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigationType } from "react-router-dom";
import { ChevronLeft, FilePlus2, FolderOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { isCloudEnabled } from "@/lib/supabase";
import BrandLogo from "./BrandLogo";
import { TitleContext, isTabRoute, useGoBack } from "./navigation";

/** New screens start at the top; going back restores where you were. */
function useScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const current = useRef(location.key);

  useEffect(() => {
    const onScroll = () => positions.current.set(current.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    current.current = location.key;
    const y = navType === "POP" ? positions.current.get(location.key) ?? 0 : 0;
    window.scrollTo(0, y);
    // Content loaded from cache may render a frame later.
    if (y) requestAnimationFrame(() => window.scrollTo(0, y));
  }, [location.key, navType]);
}

// ── Shell ──────────────────────────────────────────────────────────────────

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
    isActive ? "text-primary" : "text-muted-foreground",
  );

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10 hover:text-white",
  );

const AppShell = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const goBack = useGoBack();
  const [title, setTitle] = useState("Anvira Reports");
  useScrollRestoration();

  const isHome = location.pathname === "/";
  const showTabs = isTabRoute(location.pathname);

  return (
    <TitleContext.Provider value={setTitle}>
      {/* Top app bar */}
      <header className="sticky top-0 z-40 print:hidden bg-gradient-to-r from-brand-blue to-brand-blue-light text-white pt-[env(safe-area-inset-top)] shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-1 h-14 px-2 sm:px-4">
          {isHome ? (
            <Link to="/" className="flex items-center gap-2.5 pl-1">
              <BrandLogo className="h-10 w-10" />
              <span className="font-semibold tracking-tight">Anvira Reports</span>
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={goBack}
                aria-label="Back"
                className="flex h-10 w-10 items-center justify-center rounded-full active:bg-white/20 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>
              <Link to="/" aria-label="Home" className="md:hidden pr-1">
                <BrandLogo className="h-9 w-9" />
              </Link>
            </>
          )}
          <nav className="ml-auto hidden md:flex items-center gap-1">
            <NavLink to="/" end className={desktopNavClass}>
              <FilePlus2 className="h-4 w-4" /> New
            </NavLink>
            <NavLink to="/reports" className={desktopNavClass}>
              <FolderOpen className="h-4 w-4" /> Saved
            </NavLink>
          </nav>
        </div>
        <div className="h-1 bg-brand-green" />
      </header>

      {!isCloudEnabled && (
        <div className="bg-amber-100 text-amber-900 text-xs text-center px-4 py-1.5 print:hidden">
          Local mode: Supabase is not configured, so reports are saved in this browser only.
        </div>
      )}

      {/* Screen content, with a short slide-in when the screen changes */}
      <main
        key={location.pathname}
        className={cn("animate-in fade-in-0 slide-in-from-bottom-2 duration-200", showTabs && "pb-20 md:pb-0")}
      >
        {children}
      </main>

      {/* Bottom tab bar (phones, top-level screens only) */}
      {showTabs && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 print:hidden border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
          <div className="flex">
            <NavLink to="/" end className={tabClass}>
              <FilePlus2 className="h-5 w-5" />
              New Report
            </NavLink>
            <NavLink to="/reports" className={tabClass}>
              <FolderOpen className="h-5 w-5" />
              Saved
            </NavLink>
          </div>
        </nav>
      )}
    </TitleContext.Provider>
  );
};

export default AppShell;
