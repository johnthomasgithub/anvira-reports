# Anvira Reports: project memory for Claude

Read this first. It replaces the chat history from the previous machine. The sister project **GlaceTech Reports** is in `../data-display-table` (it has its own `CLAUDE.md` and was the reference for this app). Cross-project context and the laptop migration checklist are in `../HANDOVER.md`.

## What this app is
**Anvira Solutions Pvt Ltd** (Thane; air conditioning, ventilation, insulation and refrigeration) asked to digitize three paper forms, so technicians fill them **on their phones**:

| Form | Auto Form No. | Code folder |
|---|---|---|
| Preventive Maintenance (PM) Service Report | `ASPL/PM/0001` | `src/forms/pm/` |
| Break Down Service Report | `ASPL/BDS/0001` | `src/forms/breakdown/` |
| Commissioning Report | `ASPL/CR/0001` | `src/forms/commissioning/` |

The original paper PDFs were `PM service Report.pdf`, `break down report anvira.pdf` and `Commissioning Report.pdf` (in `~/Downloads` on the old laptop). Every field on them is in the forms. Only the **client list** was copied from GlaceTech (`src/forms/clients.ts`); the client is expected to send their real list and dropdown values.

Stack: Vite + React 18 + TypeScript + Tailwind + shadcn/ui, react-hook-form, @tanstack/react-query, react-router v6, Supabase (Postgres + Storage), Netlify. No Lovable dependency.

## Current features
- **Forms:** each one is built from shared field components (`src/components/form/fields.tsx`: Section, Group, TextField, DateField, AreaField, RadioField, CheckField, CheckYesNoField, ClientField, SignatureField). New forms autosave a draft to `localStorage` (`anvira-draft-<type>`), and Clear Form asks for confirmation.
- **Printable reports** (`src/components/report/ReportPage.tsx` + `report.scss`):
  - copy the paper layout: Anvira letterhead with the logo and green corner swoosh, footer band
  - A4 at 794px, scaled to fit the phone screen (`--sheet-scale` CSS variable, set by a ResizeObserver)
  - print uses `zoom: 0.9`, so each report fits one A4 page even with browser margins
  - the PM report uses `compact` rows
- **Saved Reports** (`/reports`), with filters in the URL:
  - client name
  - Form No. / Report No. / Job No.
  - report type
  - from / to date

  On phones, report type and dates sit in a bottom-sheet "Filters" drawer. View `/reports/:id` has a bottom action bar (Edit, PDF, WhatsApp, Email); edit is at `/reports/:id/edit`.
- **App feel on phones:**
  - `AppShell` (`src/components/shell/`): sticky top bar with a back arrow and page title (`usePageTitle`), bottom tab bar on Home and Saved, slide-in screen transitions, scroll restoration, `useGoBack()` with sensible parent routes
  - **DatePicker** (`src/components/DatePicker.tsx`): shadcn Calendar in a vaul **bottom sheet** on mobile, a popover on desktop; date+time variant; values stored as `yyyy-MM-dd` / `yyyy-MM-ddTHH:mm`
  - touch CSS: no tap highlight, no overscroll bounce, 16px inputs on mobile
- **PWA:** `public/manifest.webmanifest`, `public/icons/*` (generated from the small logo), `public/sw.js` (caches only the app's own files; Supabase is always live), registered in `src/main.tsx` in production only.
- **Logo:** the animated logo (`src/assets/anvira-logo-animated.webp`) is shown in the header and on the Home page via `BrandLogo`, with the still PNG for reduced motion. The source GIF (2.5 MB) was trimmed to a 128px WebP (144 KB). The printed letterhead uses the still `anvira-logo.png` (83×78, extracted from the PDF). **A high-resolution logo is still awaited from the client.**
- **Local mode:** with no Supabase keys, `npm run dev` uses the demo backend (see above). A production build without keys cannot log in.

## Data / Supabase (`supabase/schema.sql`)
- Table `reports`:
  - `form_type` (`pm` | `breakdown` | `commissioning`)
  - `form_no` (auto, set by trigger `set_form_no` from per-type sequences)
  - `report_no`, `job_no`, `client`, `report_date`
  - `data` (jsonb: all fields), `created_at`, `updated_at`
- **PIN login + roles (ported from GlaceTech, 2026-10-13):** every employee has a unique 4-digit PIN (bcrypt in `employees`), a login lasts 24 h, wrong PINs are rate-limited (5 per 15 min per IP). Tables are locked (RLS on, all privileges revoked from anon); the app only calls `SECURITY DEFINER` functions with the session token: `login`, `whoami`, `logout`, `list_reports`, `get_report`, `create_report`, `update_report`, `delete_report` (admin only), `list_employees` (admin only).
  - **Technician:** sees/edits only their own reports. The technician name (PM `technicianName`, Break Down `servicePersonName`) is filled from the login, read-only, and forced by the database (`_with_owner_name`). Commissioning has no such field.
  - **Admin ("Anvira Admin"):** sees everyone's reports, has a Technician filter, can delete (confirm dialog). Reports saved before login existed have no owner: only admins see them.
  - People: GlaceTech's technicians (010001, 010004-8, 010010-12) + EBENAZER JEBASEELAN (technician, change with SQL if he should be admin) + Anvira Admin. Suganthi is not included. **Real PINs are NOT in the repo:** `~/Downloads/anvira-employee-seed.sql` and `anvira-employee-pins.csv`.
  - Dev demo mode (no keys, `npm run dev` only, `src/lib/localBackend.ts`): PINs 1001-1012 and 1099 (Anvira Admin). Production builds exclude it.
- Signatures are stored **inside `reports.data`** as PNG data URLs (like GlaceTech), so the same rules protect them. The old `signatures` bucket is no longer used; its anon policies are dropped by `schema.sql`.
- To continue numbering from paper: `select setval('form_no_pm_seq', 250);` (same for `form_no_breakdown_seq`, `form_no_commissioning_seq`).
- **Status:** the user created the Supabase project on **their own** account for now (`.env` exists locally, not committed). The plan is to move to the client's own account later: create a fresh project there, run `schema.sql`, switch `.env` and the Netlify variables, then delete the old project.

## Code map
```
src/forms/registry.ts       the 3 forms: title, Form, Report, signatureFields, summary() → searchable columns
src/forms/<form>/           <Form>Form.tsx (inputs), <Form>Report.tsx (printable), fields.ts (field lists)
src/lib/reports.ts          login + list/get/create/update/delete via RPC (token-based), session types
src/lib/auth.ts, components/AuthProvider.tsx   session context, 24 h auto-logout, useApi() (expired -> PIN screen)
src/lib/localBackend.ts     DEV-only demo backend with the same rules (tests: src/test/access-rules.test.ts)
src/lib/supabase.ts         client (null when no keys)
src/components/form/ReportFormEditor.tsx   form page shell (RHF, draft autosave, sticky Save bar)
src/pages/  Index, NewReportPage (/new/:type), EditReportPage, ReportsListPage, ReportViewPage, NotFound
```

## Business context
- **Quote sent to Anvira** (client PDF `~/Downloads/Anvira-Digital-Reports-Cost-and-Timeline.pdf`): **₹20,000–23,000 one-time**, **1–2 weeks**, **₹0/month for about 2 years** on the free tiers, then about ₹2,200/month (Supabase Pro) if needed.
- Needed from the client before final delivery:
  - full client list (name, address, contact, phone)
  - dropdown values for the forms
  - any field changes
  - starting report numbers
  - a high-quality logo
  - an email ID and password to create the Supabase account in their name
- The technical plan doc is `~/Downloads/Cloud-Forms-Storage-Plan-and-Cost-Estimate.pdf`.

## Feature history
Newest first. Dates are when the work was recorded, not necessarily when it started.

### 2026-10-13: PIN login, technician / admin roles (ported from GlaceTech)
- **Compared with GlaceTech** and found Anvira lacked: login, roles, delete, database-enforced security, per-user drafts, a dev demo backend, `.env.example`, `.gitignore`.
- **Added:**
  - 4-digit PIN login screen (`pages/LoginPage.tsx`), 24 h session, auto-logout, expired session sends the user back to the PIN screen (`lib/auth.ts`, `components/AuthProvider.tsx`).
  - Roles: **technician** (own reports only, name auto-filled and read-only on PM `technicianName` and Break Down `servicePersonName`) and **admin** (all reports, Technician filter on the Saved list, the only role that can delete via `DeleteReportButton`).
  - Top bar shows who is logged in, with a log-out button (`AppShell`).
  - Per-employee drafts: `anvira-draft-<employeeId>-<type>`.
  - Saved list title is "My Reports" / "All Reports"; admins see the owner name on each row.
  - `reports` gained `owner_id` and `owner_name`; reports saved before login have no owner (admin-only).
  - `supabase/schema.sql` rewritten: locked tables, RPC functions (`login`, `whoami`, `logout`, `list_reports`, `get_report`, `create_report`, `update_report`, `delete_report`, `list_employees`), bcrypt PINs, rate limit. Idempotent; safe on the old "no login" project.
  - Signatures now stored **inside `reports.data`** (not the `signatures` bucket); the old anon storage policies are dropped.
  - `lib/reports.ts` rewritten to call the RPC functions with the session token; `lib/localBackend.ts` is the DEV-only demo backend (PINs 1001-1012, 1099).
  - `.env` (this project's own Supabase URL and anon key), `.env.example`, `.gitignore` (blocks `.env` and PIN files).
  - Test `src/test/access-rules.test.ts` (login, own-records-only, owner name forced, admin-only delete, logged-out session).
- **Employees:** GlaceTech's technicians (010001, 010004-8, 010010-12), EBENAZER JEBASEELAN (technician), and **Anvira Admin** (admin). Suganthi was left out on purpose. PINs are in `~/Downloads/anvira-employee-seed.sql` and `anvira-employee-pins.csv`, never in the repo.
- **Forms untouched** except the two read-only technician-name fields. Printed reports are unchanged.
- **Checked:** `tsc`, `eslint` (only template `ui/*` warnings), `npm run build` (demo backend absent from `dist`), `vitest` (6 passing).
- **Not yet checked:** `schema.sql` has not been run (no local Postgres on this Mac); the screens have not been viewed in a browser (headless Chrome would not start). **Next step:** run `schema.sql`, then the seed file, in the Supabase SQL Editor, then try a real login.
- **Open question:** should EBENAZER JEBASEELAN be an admin? (`update employees set role = 'admin' where name = 'EBENAZER JEBASEELAN';`)

### Earlier (before the login work)
- The three forms (PM, Break Down, Commissioning) built from shared field components, with draft autosave and a Clear Form confirmation.
- Printable A4 reports with the Anvira letterhead, logo, green corner swoosh and footer band; scaled to phone width; one A4 page when printed; PM uses compact rows.
- Saved Reports with URL filters (client, Form/Report/Job No., type, dates), a phone "Filters" bottom sheet, and a view page with Edit, PDF, WhatsApp and Email.
- Phone app feel: `AppShell`, top bar with back arrow, bottom tab bar, slide transitions, scroll restoration, bottom-sheet `DatePicker`, touch CSS.
- PWA (manifest, icons, service worker) and the animated logo.
- Supabase `reports` table with automatic form numbers (`ASPL/PM/0001`, `ASPL/BDS/0001`, `ASPL/CR/0001`) and a private signatures bucket (replaced on 2026-10-13).
- Local mode (browser storage) when there are no Supabase keys.

## Conventions and verification
- Always run `npx tsc -p tsconfig.app.json --noEmit`, `npx eslint src` (the only remaining warnings are in the template's `src/components/ui/*`) and `npm run build`.
- UI was checked with `puppeteer-core` (installed in a scratch dir) driving the installed Chrome at phone size (390×844, touch). Seed sample reports by writing the `anvira-reports` localStorage key from a temporary page in `dist/`, then remove it. Headless Chrome may not exit; wrap it with `perl -e 'alarm 40; exec @ARGV'`.
- **Not a git repository yet:** run `git init` and push to GitHub before or while migrating (see `../HANDOVER.md`).

## User preferences
See `../data-display-table/CLAUDE.md` → "User preferences learned". In short: simple English, end-to-end tested features, budget-friendly free tiers, an app-like mobile UI, client documents as short colourful PDFs in `~/Downloads` with no personal names.
