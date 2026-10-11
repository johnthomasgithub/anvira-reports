import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./report.scss";
import logo from "@/assets/anvira-logo.png";
import swoosh from "@/assets/corner-swoosh.png";
import type { FormData } from "@/lib/reports";

export interface ReportProps {
  data: FormData;
  formNo: string;
  /** Signature field name → image src (already resolved from storage). */
  signatures: Record<string, string>;
}

const SHEET_WIDTH = 794; // A4 width at 96 dpi

/** Scale factor that fits the A4 sheet into the available width (phones). */
function useSheetScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const style = getComputedStyle(el);
      const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setScale(Math.min(1, available / SHEET_WIDTH));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, scale };
}

/** A4 sheet with the Anvira letterhead and footer band, as on the paper forms. */
export const ReportPage = ({ children, compact }: { children: ReactNode; compact?: boolean }) => {
  const { ref, scale } = useSheetScale();
  return (
    <div className="report-wrapper" ref={ref}>
      <div
        className={compact ? "report-page compact" : "report-page"}
        style={{ "--sheet-scale": scale } as CSSProperties}
      >
        <header className="lh">
          <img src={swoosh} alt="" className="lh-swoosh" />
          <img src={logo} alt="Anvira" className="lh-logo" />
          <div className="lh-right">
            <div className="lh-namebox">
              <div className="lh-name">ANVIRA SOLUTIONS PVT LTD</div>
              <div className="lh-tagline">
                (Air Co<b>N</b>ditioning <b>V</b>entilation, <b>I</b>nsulation &amp; <b>R</b>efriger<b>A</b>tion)
              </div>
            </div>
            <div className="lh-address">
              S - 12, Kris Korner Commercial Plaza, Anand Nagar, Kavesar, G B Road,
              <br />
              Thane West, Thane, Maharashtra 400615.
            </div>
            <div className="lh-contact">Tel : +91 (22) 25970353 &nbsp;www.anvira.in | sales@anvira.in</div>
          </div>
        </header>

        <main className="report-body">{children}</main>

        <footer className="report-footer">
          <div className="rf-line" />
          <div className="rf-band">
            <div>Solution Providers and System Integrators For Cold / Dry Warehousing</div>
            <div className="rf-strong">Contracting &amp; Consultancy Services</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

/** Title row with the form name on the left and Form No / Report No on the right. */
export const TitleRow = ({ title, rows }: { title: string; rows: [string, ReactNode][] }) => (
  <table className="rt rt-title">
    <colgroup>
      <col style={{ width: "54%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "28%" }} />
    </colgroup>
    <tbody>
      {rows.map(([label, value], i) => (
        <tr key={label}>
          {i === 0 && (
            <td rowSpan={rows.length} className="rt-title-name">
              {title}
            </td>
          )}
          <td className="rt-title-label">{label}</td>
          <td className="rt-title-value">{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const CB = ({ checked, label }: { checked?: boolean; label?: ReactNode }) => (
  <span className="cbl">
    <span className="cb">{checked && <span className="cb-tick">✓</span>}</span>
    {label}
  </span>
);

export const Sig = ({ src }: { src?: string }) =>
  src ? <img src={src} alt="Signature" className="sig-img" /> : <div className="sig-empty" />;
