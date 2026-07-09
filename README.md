# BLYNX AIMA AGENCY — Website

Official static website for BLYNX AIMA AGENCY, live at **https://www.blynxsystems.com**.

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

Form submissions post to `LEAD_WEBHOOK_URL` in `assets/site.js`. It is currently empty (submissions log to the browser console only). Set it to a Google Apps Script Web App URL, n8n/Make/Zapier webhook, or custom API endpoint to receive leads.
