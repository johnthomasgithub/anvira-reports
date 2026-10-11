import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Hash, SlidersHorizontal, User, X } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import DatePicker from "@/components/DatePicker";
import { FORMS, FORM_LIST, isFormType } from "@/forms/registry";
import { CLIENT_OPTIONS } from "@/forms/clients";
import { fmtDate } from "@/components/report/format";
import { LAST_LIST_KEY, listReports, type FormType } from "@/lib/reports";
import { usePageTitle } from "@/components/shell/navigation";

const TYPE_BADGE: Record<FormType, string> = {
  pm: "bg-brand-blue/10 text-brand-blue border-brand-blue/30",
  breakdown: "bg-orange-100 text-orange-800 border-orange-300",
  commissioning: "bg-brand-green/15 text-brand-green-dark border-brand-green/40",
};

const FILTER_KEYS = ["client", "number", "type", "from", "to"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

/** Debounces a text value so the list is not re-fetched on every keystroke. */
function useDebounced(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const ReportsListPage = () => {
  usePageTitle("Saved Reports");
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filters live in the URL, so "back" from a report returns to the same list.
  const [params, setParams] = useSearchParams();
  const get = (key: FilterKey) => params.get(key) ?? "";
  const set = (key: FilterKey, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const typeParam = get("type");
  const formType: FormType | "all" = isFormType(typeParam) ? typeParam : "all";
  const client = useDebounced(get("client"));
  const number = useDebounced(get("number"));
  const dateFrom = get("from");
  const dateTo = get("to");
  const hasFilters = FILTER_KEYS.some((k) => params.get(k));
  const extraFilterCount = [typeParam, dateFrom, dateTo].filter(Boolean).length;

  // Remember the current filters for the back button on a report.
  useEffect(() => {
    sessionStorage.setItem(LAST_LIST_KEY, params.toString());
  }, [params]);

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ["reports", { client, number, formType, dateFrom, dateTo }],
    queryFn: () => listReports({ client, number, formType, dateFrom, dateTo }),
  });

  const extraFilters = (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs">Report type</Label>
        <Select value={formType} onValueChange={(v) => set("type", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reports</SelectItem>
            {FORM_LIST.map((f) => (
              <SelectItem key={f.type} value={f.type}>
                {f.shortTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-from" className="text-xs">
          From date
        </Label>
        <DatePicker id="f-from" label="From date" value={dateFrom} onChange={(v) => set("from", v)} placeholder="Any" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-to" className="text-xs">
          To date
        </Label>
        <DatePicker id="f-to" label="To date" value={dateTo} onChange={(v) => set("to", v)} placeholder="Any" />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/50 py-4 px-4">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Search */}
        <Card>
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="f-client" className="text-xs">
                  Client name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="f-client"
                    list="client-options"
                    value={get("client")}
                    onChange={(e) => set("client", e.target.value)}
                    placeholder="Type or pick a client"
                    className="pl-9"
                    enterKeyHint="search"
                  />
                  <datalist id="client-options">
                    {CLIENT_OPTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-number" className="text-xs">
                  Form No. / Report No. / Job No.
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="f-number"
                    value={get("number")}
                    onChange={(e) => set("number", e.target.value)}
                    placeholder="e.g. PM/0012 or 0412"
                    className="pl-9"
                    enterKeyHint="search"
                  />
                </div>
              </div>
            </div>

            {!isMobile && <div className="grid grid-cols-3 gap-3">{extraFilters}</div>}

            <div className="flex items-center gap-2 text-sm">
              {isMobile && (
                <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {extraFilterCount > 0 && (
                    <span className="ml-0.5 rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground">
                      {extraFilterCount}
                    </span>
                  )}
                </Button>
              )}
              <span className="text-muted-foreground">
                {isLoading ? "Searching…" : `${reports.length} report${reports.length === 1 ? "" : "s"}`}
              </span>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setParams({}, { replace: true })}>
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[84px] w-full rounded-lg" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-center text-destructive py-8">Could not load reports. Please check the internet connection.</p>
        )}
        {!isLoading && !error && reports.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No reports found.</p>
        )}

        <div className="space-y-2">
          {reports.map((r) => (
            <Link key={r.id} to={`/reports/${r.id}`} className="block active:scale-[0.99] transition-transform">
              <Card className="hover:shadow-md hover:border-primary/50 transition">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{r.form_no}</span>
                      <Badge variant="outline" className={TYPE_BADGE[r.form_type]}>
                        {FORMS[r.form_type].shortTitle}
                      </Badge>
                    </div>
                    <div className="text-sm truncate mt-0.5">{r.client || "—"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {r.report_date ? fmtDate(r.report_date) : "—"}
                      {r.report_no && <> · Report No. {r.report_no}</>}
                      {r.job_no && <> · Job No. {r.job_no}</>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Phone: report type and dates in a bottom sheet */}
      {isMobile && (
        <Drawer open={sheetOpen} onOpenChange={setSheetOpen} shouldScaleBackground={false}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4">{extraFilters}</div>
            <DrawerFooter className="flex-row gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);
                      ["type", "from", "to"].forEach((k) => next.delete(k));
                      return next;
                    },
                    { replace: true },
                  )
                }
              >
                Reset
              </Button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Show {reports.length} report{reports.length === 1 ? "" : "s"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default ReportsListPage;
