# BLYNX Systems — Website

Official static website for BLYNX Systems, live at **https://www.blynxsystems.com**.

Bilingual (English / Spanish) site focused on local lead systems for service businesses.

## Structure

- `scripts/generate-pages.js` — single source of truth for all page content (EN + ES). Generates the HTML pages, `sitemap.xml`, and `robots.txt`.
- `scripts/build.js` — validates required files/content and copies the site into `dist/`.
- `assets/` — CSS, JS, and favicon.
- `en/`, `es/` — generated bilingual pages (do not edit by hand; edit the generator).
- `integrations/google-apps-script.gs` — optional Google Apps Script webhook for lead form submissions.

## Commands

```bash
npm run generate   # regenerate pages from scripts/generate-pages.js
npm run build      # generate + validate + output to dist/
npm run serve      # serve locally at http://localhost:4173
```

## Environment variables

Both values are read at **build time** by `scripts/generate-pages.js` and injected into every
generated page as `window.BLYNX_CONFIG`. Nothing is hardcoded in `assets/site.js`, so rotating
either value means changing one environment variable and rebuilding — never editing source.

| Variable | Required for | Format | Where to set it |
|----------|--------------|--------|-----------------|
| `LEAD_WEBHOOK_URL` | Free Audit + Contact forms | `https://script.google.com/macros/s/.../exec` | Vercel → project → Settings → Environment Variables, and local `.env` |
| `GA4_MEASUREMENT_ID` | Google Analytics 4 | `G-XXXXXXXXXX` | Same |

The build fails fast if either value is malformed, and prints a loud `WARNING` (without failing)
if either is missing, so a misconfigured deploy is visible in the build log:

```
Lead endpoint: configured
GA4 analytics: configured (G-XXXXXXXXXX)
```

If `LEAD_WEBHOOK_URL` is missing, the forms **fail closed**: the visitor sees the error state
with the direct email address, and no lead is silently dropped. If `GA4_MEASUREMENT_ID` is
missing, no analytics snippet is emitted at all and every `trackEvent` call is a no-op — the site
never pretends to be measuring something it is not.

## Analytics

Google Analytics 4 is the single analytics provider. `gtag.js` is injected once per page in
`<head>` by `scripts/generate-pages.js`; no other file may call `gtag('config', ...)` again, and
the build asserts that exactly one initialisation exists per page.

Events sent from `assets/site.js`:

| Event | Fires when |
|-------|-----------|
| `free_audit_submit` | Free Audit form, **only after** the backend confirms `{"result":"success"}` |
| `contact_form_submit` | Contact form, same confirmation rule |
| `primary_cta_click` | Click on any internal `.btn-primary` CTA |
| `project_outbound_click` | Click on an external link inside a `.project-card` |

Analytics parameters are **allow-listed** in `ANALYTICS_PARAM_ALLOWLIST` (`assets/site.js`).
Anything not on that list is dropped before it can reach GA4, so form values — name, email,
phone, message, URLs — can never leak into analytics even if a caller passes them by mistake.

`free_audit_submit` and `contact_form_submit` still have to be marked as **Key Events** in the
GA4 admin UI (Admin → Events → toggle "Mark as key event"); that cannot be done from this repo.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the site and deploys `dist/` to GitHub Pages.

### Custom domain (blynxsystems.com)

DNS records at the domain registrar:

| Type  | Host | Value                |
|-------|------|----------------------|
| CNAME | www  | `<username>.github.io` |
| A     | @    | 185.199.108.153      |
| A     | @    | 185.199.109.153      |
| A     | @    | 185.199.110.153      |
| A     | @    | 185.199.111.153      |

Then in the repo: **Settings → Pages → Custom domain** → `www.blynxsystems.com` and enable **Enforce HTTPS** (available once the certificate is issued, usually within minutes).

## Lead forms

Form submissions post to the `LEAD_WEBHOOK_URL` environment variable (see above), which points at
a Google Apps Script Web App that appends each lead to a Google Sheet and emails
`hello@blynxsystems.com`. The script source is version-controlled in
`integrations/google-apps-script.gs`.

The browser sends `Content-Type: text/plain` on purpose: Apps Script Web Apps do not answer CORS
preflight requests, and `text/plain` is CORS-safelisted so the POST stays a simple request. Apps
Script still `JSON.parse`s the raw body server-side.

A submission is treated as successful **only** when the response body is `{"result":"success"}`.
Apps Script answers HTTP 200 even when it refuses a submission, so checking `response.ok` alone
would show a success message for a lead that was never stored.

### Redeploying the Web App

If the `/exec` URL starts returning 404, the deployment was deleted or replaced and every lead is
being lost. To restore it:

1. Open the script project: <https://script.google.com/home/projects/1nGW7OGSlk41T_1GewveQJrV9Xei5eNsFGFBdTZG7kF3EJQ9_h57kW4mQ>
   (bound to the "BLYNX Leads" spreadsheet, id `1-0uoFXsh149mdXbLqRCkX8pdFNu3IFiysVvSd8eoYVE`).
2. Confirm the code matches `integrations/google-apps-script.gs`; paste it in if it does not.
3. **Deploy → New deployment → Web app**, with **Execute as: Me** and
   **Who has access: Anyone** (anonymous — visitors are not logged into Google).
4. Copy the new URL ending in `/exec`.
5. Set it as `LEAD_WEBHOOK_URL` in the Vercel project, then redeploy.

"Manage deployments → edit an existing deployment" keeps the same URL and is preferable when the
deployment still exists; "New deployment" always produces a **new** URL that must be copied into
the environment variable.

## Legal review note

These legal pages are general operational drafts and should be reviewed by a qualified attorney before relying on them as final legal advice.

## Manual post-deploy checklist

- Confirm or replace the public phone value in the central business configuration.
- Confirm or replace the Instagram URL in the central business configuration.
- Add `public/images/gregor-silva.webp` when the approved founder photo is available.
- Have Privacy Policy and Terms of Service reviewed by a qualified attorney.
- Deploy to Vercel only after local build checks pass.
- Test audit and contact forms in production without sending fake customer data.
- Confirm submissions arrive in the correct CRM, email inbox, Google Sheet or database.
- Review Google Search Console after deploy.
- Request indexing for the main pages.
- Submit the updated `sitemap.xml`.
- Confirm `/en/resources` and `/es/resources` redirect correctly.
- Verify Open Graph previews when sharing the site link.
- Confirm no test URLs are indexable.
