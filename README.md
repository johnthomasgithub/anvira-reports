# Anvira Reports

Phone-friendly digital versions of the Anvira Solutions paper forms:

| Form | Form No. format |
|---|---|
| Preventive Maintenance Service Report | `ASPL/PM/0001` |
| Break Down Service Report | `ASPL/BDS/0001` |
| Commissioning Report | `ASPL/CR/0001` |

Technicians fill a form on the phone and sign on screen, and the report is saved to the cloud (Supabase). Saved reports can be searched, opened, edited, printed or saved as a PDF that matches the paper layout, and shared on WhatsApp or by email.

There is **no login**: anyone with the app link can use it, so share the link only with the team.

Stack: Vite + React + TypeScript + Tailwind + shadcn/ui, Supabase (database and signature storage), hosted on Netlify.

---

## Using it on a phone

The app is built for phones. It has a top bar with a back arrow, a bottom tab bar, bottom-sheet date pickers and filters, and report screens sized to the phone.

To install it like an app, open the site in **Chrome (Android)** and tap **⋮ → Add to Home screen / Install app**, or in **Safari (iPhone)** tap **Share → Add to Home Screen**. It then opens full screen with the Anvira icon and no browser bar. A small service worker (`public/sw.js`) caches only the app's own files so it starts instantly. Report data always comes live from Supabase.

## Run locally

```sh
npm install
cp .env.example .env   # optional: add Supabase keys (see below)
npm run dev            # http://localhost:8080
```

Without Supabase keys the app runs in **local mode**. Reports are saved in the browser only, and a yellow banner says so. This is useful for trying out forms before the Supabase project exists.

## Supabase setup (one time)

1. Create a free project at [supabase.com](https://supabase.com) using the client's email account. Pick the **Mumbai (ap-south-1)** region.
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates:
   - the `reports` table (one row per form; all fields in a `data` JSON column),
   - automatic form numbers (`ASPL/PM/0001`, …),
   - access rules (create, read and edit allowed; delete is not possible from the app),
   - a private `signatures` storage bucket.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. Put them in `.env` for local use, and in Netlify for the live site (next section).

To continue numbering from the paper forms, run e.g. `select setval('form_no_pm_seq', 250);` and the next PM report becomes `ASPL/PM/0251`.

## Netlify setup (one time)

1. Push this folder to a Git repository (GitHub).
2. In Netlify: **Add new site → Import an existing project →** pick the repository. The build settings come from [`netlify.toml`](netlify.toml): `npm run build`, publish `dist`, Node 20.
3. Under **Site configuration → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Redeploy whenever the variables change, because they are built into the app.

`netlify.toml` also sends all routes to `index.html` (single-page app) and asks search engines not to index the site.

## How data is stored

- **`reports` table:** `form_type`, `form_no` (automatic), `report_no`, `job_no`, `client` and `report_date` are columns used for searching. Every form field is stored in `data` (JSON).
- **Signatures:** on save, each signature is uploaded as a PNG to the private `signatures` bucket at `<report id>/<field>-<time>.png`. The JSON keeps only the file path. Signatures are shown through short-lived signed links.
- **PDFs:** never stored. The printable page is rebuilt from the data each time **Print / Save PDF** is pressed.
- **Drafts:** a new form is autosaved on the phone (localStorage) until it is saved to the cloud, so nothing is lost if the page reloads or the network drops.

## Finding old reports

**Saved Reports** (`/reports`) filters by:

- **Client name:** type part of the name, or pick from the list
- **Form No. / Report No. / Job No.:** any part of the number
- **Report type**
- **From / To date**

Filters are kept in the page address, so **Saved Reports** on an open report returns to the same filtered list. From a report: **Edit → Save Changes** updates it in place.

## Exporting data

- **Excel/CSV:** Supabase → Table Editor → `reports` → Export.
- **Full backup:** `pg_dump "<connection string from Supabase → Connect>" --schema=public -Fc -f anvira-backup.dump`
- **Signatures:** Supabase → Storage → `signatures`. For a bulk copy, use the S3 connection (Storage → S3 Connection) with `aws s3 sync`.

The free plan has no automatic backups, so export regularly.

## Project structure

```
src/
  forms/
    clients.ts            client list for the Client dropdown
    registry.ts           the three forms: titles, components, signature fields, searchable values
    pm/                   PM form, printable report, field lists (checks, readings)
    breakdown/            Break Down form and printable report
    commissioning/        Commissioning form and printable report
  components/
    form/fields.tsx       shared inputs (text, date, radio, checkbox, signature…)
    form/ReportFormEditor.tsx   form page shell: draft autosave, save button
    report/ReportPage.tsx       A4 sheet with the Anvira letterhead and footer
    report/report.scss          print styles
  lib/
    supabase.ts           Supabase client (null in local mode)
    reports.ts            list / get / create / update reports, signature upload
  pages/                  Home, New report, Edit report, Saved reports, Report view
supabase/schema.sql       database setup script
```

**Adding a client:** edit `src/forms/clients.ts`. Clients not on the list can still be typed with "Other".
