# BLYNX Homepage Restructure — Technical Implementation Plan

**Status:** **APPROVED — FROZEN.** Architecture is final. Build to this document.
**Author:** Architecture pass (Claude Opus)
**Builder:** Sonnet
**Independent audit:** Codex
**Business requirements source:** BLYNX Restructuring Brief v2 FINAL (approved)
**Current implementation source of truth:** this repository at commit `133b34f`

### Approved decision log

All open decisions from the draft are now closed. Recorded here so no reader has
to reconstruct them from a conversation.

| # | Decision | Ruling | Sections |
|---|----------|--------|----------|
| 1 | Staging lead infrastructure | **Option A** — separate staging Apps Script + "BLYNX Leads (Staging)" sheet for Preview. Same lead-processing logic, minimum divergence. Staging emails prefixed `[STAGING]`. Production Apps Script not modified by this redesign. | §12.3, §19 |
| 2 | Preview analytics | **Isolated GA4 staging property** for Preview. Production GA4 unchanged. No duplicate `gtag` init. | §13.3, §19 |
| 3 | Visual assets | **Approved to produce.** Explanatory, never decorative. Hero = connected-system visualization. Pillars / system progression / journey = lightweight HTML/CSS/SVG. Projects = real screenshots. No stock businesspeople imagery. | §8 |
| 4 | System 3 anchor | New semantic id `#lead-capture-follow-up-system`, **with `#local-lead-system` preserved as a legacy alias** on the same section. Do not break the public deep link. | §7.5, §20.7 |
| 5 | `interestedSystem` | **SAFE TO IMPLEMENT**, verdict accepted. Implement last, closed enum, no field renames, full chain verified against the **staging** sheet first. | §14 |
| 6 | Prior architectural findings | All approved as written in the draft (derived pricing, data-driven badge, `captureFlowSection` reuse, extended parity validator, native `<details>`, grid decoupling, `requiredSnippets` in lockstep, anchor repair, pinned USD formatting, no generator refactor, no new dependencies). | §5, §7, §9, §17 |

> **Key architectural consequence of decisions 1 and 2:** both `LEAD_WEBHOOK_URL`
> and `GA4_MEASUREMENT_ID` are *already* environment-driven through
> `runtimeHead()` -> `window.BLYNX_CONFIG`. Pointing Preview at a staging backend
> and a staging GA4 property therefore requires **zero application code changes** —
> it is pure environment configuration plus one-time external setup. Sonnet writes
> no code for the staging strategy.

> This document is self-contained. It does not require reading any prior chat
> transcript. Where the approved brief and the repository disagree, the
> disagreement is stated explicitly in §4 and §20 rather than silently resolved.

---

## 1. Objective

Replace the current two-product commercial structure on the BLYNX homepage and
services pages with the approved three-system architecture, publish pricing
publicly, cut homepage text density by >=40%, and do so **without destabilising
the lead-capture and analytics infrastructure that was repaired and verified in
production on 2026-08-22**.

Scope is the commercial/content layer only. No infrastructure rewrite.

---

## 2. Approved Requirements Summary

Condensed from the approved brief. This is requirement, not proposal.

### 2.1 Three systems, public pricing

| # | Name (EN) | Name (ES) | Price | Result chain |
|---|-----------|-----------|-------|--------------|
| 1 | Digital Presence System | Sistema de Presencia Digital | Starting at $1,500 | Be found -> Build trust -> Receive inquiries |
| 2 | Lead Capture & Organization System | Sistema de Captación y Organización | Starting at $2,250 | Receive -> Classify -> Organize |
| 3 | Lead Capture & Follow-Up System | Sistema de Captación y Seguimiento | Starting at $2,500 | Receive -> Organize -> Follow up |

- System 3 carries badge **BEST VALUE / MEJOR VALOR**.
- System 3 includes everything in 1 and 2 plus the five follow-up automations.
- Prices are **public**. Never behind a form, audit, call, or "Contact us for pricing".
- Copy uses "Starting at" / "Desde".
- System 2 must remain a legitimate product; do not degrade it to force System 3.
- Never write "only $250 more". The visual price adjacency carries the argument.

### 2.2 System 3 — five locked automations

1. New Inquiry Confirmation
2. Unattended Opportunity Reminder
3. Quote Follow-Up
4. Appointment Confirmation / Reminder
5. Review Request

Not unlimited automation. Third-party costs (SMS, WhatsApp, paid CRM) separate.

### 2.3 Monthly services (separate from project pricing)

- Digital System Maintenance — **$650/month**
- Social Media Management Add-On — **+$850/month**
- Both — **$1,500/month**
- The add-on is an add-on, not a fourth system. No separate $2,500 social plan.

### 2.4 Terminology rules

- "Lead capture" must be defined on first mention, in both languages, using the
  approved sentence (see §10.3).
- The heading "Results" is retired. Replacement: **What the System Helps
  Improve** / **Qué Ayuda a Mejorar el Sistema**.
- No guarantee of customers, sales, revenue, ranking positions, or lead volume.
- Routes (`zero` / `existing`) are diagnostic situations, never products.

### 2.5 Payment — three steps, milestone attached to each

| Step | Phase | Milestone |
|------|-------|-----------|
| 1 | Diagnosis & Scope | 50% to begin |
| 2 | Design, Build & Approval | 30% after approval |
| 3 | Testing & Launch | 20% before launch |

Final 20% received before production launch. Monthly services billed in advance.

### 2.6 CTA wording — locked

- Primary: **Find the Right System** / **Encuentra tu Sistema**
- Secondary: **Request a Free Audit** / **Solicita una Auditoría Gratis**
- The audit is available but must not be the header's primary button.

### 2.7 Mobile pricing

A **non-sticky** compact three-column price comparison placed immediately before
the stacked system cards. Explicitly **not** a persistent sticky/fixed bar.

---

## 3. Current Repository Findings

Verified by inspection, not assumption.

### 3.1 Generation architecture

`scripts/generate-pages.js` (4,049 lines) is the single source of truth for all
EN and ES page content. It writes `en/**`, `es/**`, `index.html`, `sitemap.xml`,
`robots.txt`. **The generated HTML under `en/` and `es/` is committed to the
repo but must never be hand-edited.**

Build pipeline (`package.json`):

```
npm run build
  = node scripts/build-forge-demo.js      # writes demos/forge/**
  + node scripts/build-barber-demo.js     # writes demos/barber/**
  + node scripts/generate-pages.js        # writes en/**, es/**, index.html, sitemap, robots
  + node scripts/build.js                 # validates, then copies everything into dist/
```

### 3.2 The commercial offer is already a structured data model — major finding

`scripts/generate-pages.js:769` defines `const commercialOffer = { en: {...}, es: {...} }`.

Per-language shape:

```
commercialOffer[lang] = {
  eyebrow, title, intro,
  whoTitle, implementationTitle, resultTitle, detailsLink,
  systems: [ { id, name, startingPrice, price, positioning,
               ideal[], implementationLead, implementation[],
               benefits[], cta, ctaTarget, pricingNote } ],
  comparison: { eyebrow, title, cards: [ { name, label, items[] } ], ctaTarget, ... },
  social:     { eyebrow, title, copy[], inclusionsTitle, inclusions[], ctaTarget, ... },
  faq:        { eyebrow, title, items: [ [question, answer], ... ] }
}
```

Current `systems` array has **two** entries:

| index | id | startingPrice | price |
|-------|----|---------------|-------|
| 0 | `digital-presence-system` | `1500` | `""` |
| 1 | `local-lead-system` | `2500` | `""` |

**`startingPrice` already exists as data but is never rendered.** The renderer at
`generate-pages.js:1837` and `:1879` emits the price only when the *display*
field is non-empty:

```js
${system.price ? `<span class="system-price">${system.price}</span>` : ""}
```

Since `price` is `""` for both systems, no currency figure reaches any page.
`startingPrice` is consumed only by the parity validator. This means **publishing
prices is a data + one-line render change, not new architecture.**

`.system-price` and `.system-offer-card.is-complete` CSS already exist.

### 3.3 Bilingual parity is already enforced programmatically

`generate-pages.js:1140` `validateCommercialOfferParity()` runs at module load
and throws on structural EN/ES divergence: array lengths for `systems`,
`ideal`, `implementation`, `benefits`, `comparison.cards[].items`,
`social.inclusions`, `faq.items`, plus equality of `startingPrice` and
`ctaTarget` per system. This is a genuine asset and must be extended, not removed.

### 3.4 Reusable section renderers already exist

| Function | Line | Renders |
|----------|------|---------|
| `systemsOverviewSection(lang)` | 1820 | Homepage systems grid |
| `systemsDetailSection(lang)` | 1862 | Services page deep scope |
| `socialMediaAddOnSection(lang)` | 1908 | Social add-on band |
| `comparisonSection(lang)` | 1928 | "Which system do you need?" |
| `faqSection(lang)` | 1959 | FAQ accordion |
| `captureFlowSection(lang)` | 2211–2527 | Hand-built SVG capture-flow diagram (**317 lines**) |
| `shell(lang, meta, active, switchPath, body)` | 1730 | Page chrome + `<head>` |
| `header()` / `footer()` | 1651 / 1692 | Nav and footer |
| `projectCard(lang, project, p)` | 2528 | Project/demo card |

### 3.5 Current homepage section order (`homePage(lang)`, line 2623)

| # | Section id / class | Source data |
|---|--------------------|-------------|
| 1 | `#home` `.hero.hero-home` | inline `h` object |
| 2 | `captureFlowSection()` | `FLOW_*` consts, 317-line SVG |
| 3 | `#problem` | `problemCards` (line 1170) |
| 4 | `systemsOverviewSection()` | `commercialOffer` |
| 5 | `socialMediaAddOnSection()` | `commercialOffer.social` |
| 6 | `comparisonSection()` | `commercialOffer.comparison` |
| 7 | `#free-audit-flow` | `auditFlow` (line 1418) |
| 8 | `#process` | `processSteps` (line 1437) |
| 9 | `#results` + connected infra | `results` (1452), `connectedInfrastructure` (1467) |
| 10 | `#about-preview` | inline |
| 11 | `.our-work` | `projectsPage.homeEntry` |
| 12 | `#final-cta` | inline |

Sections 2, 7, 8, 9 are the four redundant process explanations the brief deletes.

### 3.6 CSS architecture

`assets/styles.css` (3,279 lines), single stylesheet, no preprocessor, CSS custom
properties on `:root`, `color-scheme: dark`. **Desktop-first** with `max-width`
media queries at: 1120, 1100, 980, 900, 780, 760, 640, 560, 480.

Relevant to this work:

- `.system-offer-grid, .comparison-grid` (line 1683) — `grid-template-columns: repeat(2, minmax(0, 1fr))`. **Hardcoded 2 columns.**
- Collapse to `1fr` happens inside `@media (max-width: 1120px)` (line 2612).
- `.system-price` (1733) — gold pill, ready to use.
- `.system-offer-card.is-complete` (1707) — gold border + `--glow`. Currently applied to `index === 1`.
- `.pricing-note` (1814).

### 3.7 Forms and lead infrastructure (protected)

`assets/site.js` (495 lines). Endpoint is **not** hardcoded — it is read from
`window.BLYNX_CONFIG.leadWebhookUrl`, injected into `<head>` by
`generate-pages.js:runtimeHead()` from the `LEAD_WEBHOOK_URL` env var.

Confirmed field names (these ARE the Google Sheet column headers):

- **Audit forms** (`/free-audit`, `/free-audit-existing`, `/free-audit-zero`, EN+ES):
  `fullName`, `businessName`, `email`, `cityState`, `businessType`, `websiteUrl`,
  `mainGoal`, `phone`, `googleBusinessProfileLink`, `websiteStatus`,
  `googleBusinessProfileStatus`, `timeline`, `message`,
  `businessStage` (hidden), `preferredLanguage` (hidden),
  `companyWebsiteExtra` (honeypot)
- **Contact forms** (EN+ES): `fullName`, `businessName`, `email`, `phone`,
  `topic`, `message`, `preferredLanguage` (hidden), `companyWebsiteExtra` (honeypot)

Handlers: `handleAuditSubmit(event)` / `handleContactSubmit(event)` via inline
`onsubmit` on `<form class="form-card">`.

Success contract in `submitLead()` — **must not regress**: the request is a
CORS-safelisted `text/plain` POST; a submission counts as successful **only** when
the parsed response body is `{"result":"success"}`. HTTP 200 with
`{"result":"error"}`, non-JSON bodies, non-2xx, and network failures all fail
closed and show the error state.

### 3.8 Apps Script contract (inspected, not modified)

`integrations/google-apps-script.gs` — container-bound to the "BLYNX Leads"
spreadsheet, deployed as a Web App (`executeAs: USER_DEPLOYING`,
`access: ANYONE_ANONYMOUS`).

```
doPost(e)
  -> sanitizeData()        strips < > from every value, trims
  -> validateSubmission()  requires fullName/email/message (contact)
                           or fullName/businessName/email (audit); validates email
  -> honeypot: if companyWebsiteExtra is truthy -> returns success WITHOUT writing
  -> getOrCreateSheet()    finds/creates tab named "Leads"
  -> appendRow()           reads header row; appends any UNKNOWN key as a NEW
                           trailing column; maps values by header name
  -> sendNotificationEmail()  MailApp -> hello@blynxsystems.com, dumps all keys
  -> returns {"result":"success"}
```

`appendRow()` is **schema-additive**: new payload keys create new trailing
columns and never shift existing ones. This is the single most important fact
for the `interestedSystem` assessment in §14.

Live sheet header row (20 columns, verified): `Timestamp`, `formType`,
`fullName`, `email`, `message`, `submittedAt`, `businessStage`,
`preferredLanguage`, `companyWebsiteExtra`, `businessName`, `cityState`,
`businessType`, `websiteUrl`, `mainGoal`, `phone`,
`googleBusinessProfileLink`, `websiteStatus`, `googleBusinessProfileStatus`,
`timeline`, `topic`.

### 3.9 Analytics (protected)

`gtag.js` is injected once per real page by `runtimeHead()` when
`GA4_MEASUREMENT_ID` is set. `scripts/build.js` asserts exactly one
`gtag('config'` per page and fails the build on a second initialisation.

`assets/site.js:63` `ANALYTICS_PARAM_ALLOWLIST` is an **allow-list** (not a
deny-list): any parameter not on it is dropped before reaching GA4. Current
entries: `formType`, `businessStage`, `language`, `page`, `stage`, `slug`,
`from`, `category`, `cta_name`, `cta_target`, `project_name`, `project_domain`.

Protected events: `free_audit_submit`, `contact_form_submit` (both fire **only**
after confirmed backend success), `primary_cta_click`, `project_outbound_click`
(delegated on `document`, mutually exclusive — a `.btn-primary` inside a
`.project-card` pointing off-domain reports only as outbound).

### 3.10 Build-time validation — hard blocker

`scripts/build.js` contains `requiredFiles` (a hardcoded path list) and
`requiredSnippets` (a `Map` of file -> exact copy strings that must be present).
Current assertions include strings this restructure **deletes**:

```
en/index.html: "Two systems. One clear goal.", "Local Lead System",
               "What Your Lead System Can Connect", "LEAD CAPTURE FLOW EXAMPLE",
               "How a search becomes a real opportunity.", "They find you",
               "Which system does your business need?",
               "Optional Add-On: Social Media Support"
es/index.html: Spanish equivalents of all of the above
en/existing/index.html: "Improve the Lead System You Already Have", ...
en/zero/index.html:     "Start From Zero With a Simple Lead System", ...
```

**The build will fail on the first restructure commit unless `requiredSnippets`
is updated in the same commit.** Sonnet must treat this as part of the change,
not as a surprise.

### 3.11 Projects and demos

Project/demo data lives in an array around `generate-pages.js:2319` with
`{ id, url, image, ... }` for `klinner`, `venezuela51`, `forge-demo`,
`barber-demo`. Images exist at `public/images/projects/*.jpg`. Demos are
generated by separate scripts into `demos/forge/**` and `demos/barber/**` and are
`noindex`. Their internal forms are local-only fakes with no backend.

### 3.12 Deployment and preview

- Production Vercel project: **`blynxsystems-com-9ez1`** (owns `blynxsystems.com`
  and `www.blynxsystems.com`). A second project `blynxsystems-com` exists with
  **no domain attached** — do not touch it.
- `vercel.json`: `buildCommand: npm run build`, `outputDirectory: dist`,
  `trailingSlash: false`, two permanent `/resources -> /services` redirects.
- Git-connected: pushes to `main` deploy to production. Non-`main` branches
  produce automatic preview deployments at
  `blynxsystems-com-9ez1-<hash>-gregor-blynx.vercel.app`.
- `.github/workflows/deploy.yml` also builds and deploys to GitHub Pages on push
  to `main`. Redundant with Vercel; **out of scope**, leave alone.
- **Environment variables exist for the `Production` environment only.**
  `LEAD_WEBHOOK_URL` and `GA4_MEASUREMENT_ID` are both scoped `Production`.
  Consequence: a preview deployment builds with neither value, so forms fail
  closed and GA4 is absent. See §4.7 and §19 — this needs a human decision.

---

## 4. Gap Analysis

### 4.1 Two systems -> three systems

- **Current:** `commercialOffer[lang].systems` has 2 entries. Renderers map over the array. `.is-complete` hardcoded to `index === 1`.
- **Required:** 3 entries; System 3 emphasised with BEST VALUE badge.
- **Change:** Insert a new middle system (Organization, $2,250); rename existing
  `local-lead-system` to the System 3 identity and keep `startingPrice: 2500`;
  move emphasis from `index === 1` to the last index; add a `badge` field to the
  data model rather than another positional check.

### 4.2 Prices exist as data but never render

- **Current:** `startingPrice` numeric, `price: ""`, render guarded by `system.price`.
- **Required:** "Starting at $1,500" / "Desde $1,500" visible publicly.
- **Change:** Derive the display string from `startingPrice` plus a per-language
  prefix (`Starting at` / `Desde`) instead of maintaining a duplicate `price`
  string. Removes a whole class of EN/ES drift. Retire the now-misleading
  `pricingNote` ("Final pricing depends on…") or reword it so it does not read as
  price concealment.

### 4.3 Route logic sold as product logic

- **Current:** System 1 `ideal[]` opens with "Are starting from zero", "Have an
  outdated website". `/zero` and `/existing` pages assert product-flavoured copy
  in `requiredSnippets`.
- **Required:** Routes are diagnostic only. Any system sellable to any stage.
- **Change:** Rewrite every `ideal[]` entry to need-based qualifiers. Rewrite
  `/zero` and `/existing` copy so both explicitly state that all three systems
  are available. Update the corresponding `requiredSnippets`.

### 4.4 Four redundant process explanations

- **Current:** `captureFlowSection()` (317 lines), `#free-audit-flow`, `#process`,
  `#results` + `connectedInfrastructure`.
- **Required:** exactly two survivors — a Five Pillars strip and one Customer
  Journey diagram.
- **Change:** Delete `#free-audit-flow`, `#process`, `#results`,
  `connectedInfrastructure` from the homepage. Repurpose `captureFlowSection()`
  as the single Customer Journey diagram (it is already a working responsive SVG
  flow — rebuilding it from scratch would be waste). Add a new lightweight
  `fivePillarsSection(lang)`. Move the six-step audit explanation to the Free
  Audit page.

### 4.5 "Results" heading and promise framing

- **Current:** `#results` section titled "Built to Stop Missed Sales
  Opportunities" listing "More Qualified Opportunities", "Faster Response Time".
- **Required:** "What the System Helps Improve" / "Qué Ayuda a Mejorar el Sistema".
- **Change:** Delete the homepage section; relocate the surviving capability
  lines into the per-system `benefits[]` under the approved heading.

### 4.6 Audit as universal front door

- **Current:** Header primary button is the audit on every page; a dedicated
  6-step homepage section; most in-page CTAs point to the audit.
- **Required:** Primary CTA "Find the Right System"; audit demoted to a text link.
- **Change:** New `header()` action markup; new CTA target; audit section moved
  off the homepage. Note `ctaTarget: "free-audit"` currently appears on every
  system — these become the guided contact route.

### 4.7 Staging cannot currently test the protected paths — CONFLICT

- **Current:** Env vars are `Production`-scoped only.
- **Required by brief:** Phase 2 build in preview/staging, Phase 4 run
  production-equivalent regression across forms, Apps Script, Sheet, email, GA4.
- **Change:** Requires a human decision (§20.1). As it stands the brief's staging
  requirement is not satisfiable.

### 4.8 Mobile pricing comparison does not exist

- **Current:** Cards stack to `1fr` below 1120px. No price summary.
- **Required:** Non-sticky compact 3-column comparison before the stacked cards.
- **Change:** New component + CSS, rendered once and shown only at mobile widths.

### 4.9 Grid is 2-column

- **Current:** `repeat(2, minmax(0, 1fr))`, collapsing at 1120px.
- **Required:** three cards in parallel on desktop.
- **Change:** `repeat(3, …)` for the systems grid with an intermediate tablet
  step. `.comparison-grid` shares the selector and must be decoupled.

---

## 5. Proposed Technical Architecture

Guiding rule from the brief: **prefer the simplest robust implementation.** No
build-system change, no framework, no new dependency, no preprocessor.

1. **Data-model-first.** Almost all commercial change lands in the
   `commercialOffer` object. Renderers stay thin and generic over the array.
2. **Derive, don't duplicate.** Price display strings are computed from
   `startingPrice` + a per-language label. Badges come from a data field, never a
   positional index.
3. **Extend the existing parity validator** rather than adding a second
   validation mechanism.
4. **Reuse `captureFlowSection`** as the Customer Journey diagram. It is already
   a tested responsive SVG.
5. **One new section renderer** (`fivePillarsSection`) and one new mobile
   component (`compactPriceComparison`). Nothing else new.
6. **Keep `assets/site.js` changes minimal**: one `<details>` toggle for the
   comparison table (native element, no JS needed if built as `<details>`), and
   — only if approved in §14 — the `interestedSystem` population.
7. **Update `requiredSnippets` in lockstep** so the build keeps guarding real copy.

---

## 6. Homepage Section Architecture

Final order, 12 sections. `homePage(lang)` composes these in exactly this order.

| # | Section | id | Renderer | Data |
|---|---------|-----|----------|------|
| 1 | Hero | `#home` | inline in `homePage` | `homeCopy[lang]` + price strip |
| 2 | The Problem (+ Before/After visual) | `#problem` | inline | `problemCards` rewritten to before/after pairs |
| 3 | Five Pillars | `#pillars` | `fivePillarsSection(lang)` **NEW** | `pillars[lang]` **NEW** |
| 4 | The Three Systems | `#systems` | `systemsOverviewSection(lang)` **MODIFIED** | `commercialOffer[lang].systems` |
| 5 | Find the Right System (two routes) | `#choose` | `routeSelectorSection(lang)` **NEW** | `routes[lang]` **NEW** |
| 6 | How It Works — Customer Journey | `#journey` | `captureFlowSection(lang)` **REUSED, relabelled** | `FLOW_*` consts |
| 7 | Real Projects & Demos | `#projects` | existing `projectCard()` loop, expanded | projects array |
| 8 | How Implementation Works + Payment | `#implementation` | `implementationSection(lang)` **NEW** | `implementation[lang]` **NEW** |
| 9 | After Launch — Monthly Services | `#monthly` | `socialMediaAddOnSection(lang)` **REWRITTEN** | `commercialOffer[lang].monthly` **NEW SHAPE** |
| 10 | About / Trust | `#about-preview` | inline (unchanged) | inline |
| 11 | FAQ | `#faq` | `faqSection(lang)` (trimmed) | `commercialOffer[lang].faq` |
| 12 | Final CTA | `#final-cta` | inline | `homeCopy[lang]` |

**Deleted from the homepage:** `#free-audit-flow`, `#process`, `#results`
(including `connectedInfrastructure`), and the standalone `comparisonSection()`
call — the comparison becomes an expandable `<details>` inside section 4.

**Anchor migration:** the current nav links to `/en#process` and `/en#results`.
Both anchors disappear. `header()` must be updated in the same commit or the nav
will point at nothing.

---

## 7. Three-System Pricing Architecture

### 7.1 Data model change

```js
// generate-pages.js — commercialOffer[lang]
priceLabel: "Starting at",              // ES: "Desde"
systems: [
  { id: "digital-presence-system",       startingPrice: 1500, badge: null, ... },
  { id: "lead-capture-organization",     startingPrice: 2250, badge: null, ... },   // NEW
  { id: "lead-capture-follow-up",        startingPrice: 2500,
    badge: "Best Value", /* ES: "Mejor Valor" */ ... }
]
```

Display string is derived, never stored twice:

```js
const priceDisplay = `${offer.priceLabel} $${system.startingPrice.toLocaleString("en-US")}`;
```

`toLocaleString("en-US")` is pinned deliberately: the brief requires the same
`$2,250` formatting in both languages — no separator localisation.

### 7.2 Desktop (>= 1121px)

- `.system-offer-grid` -> `repeat(3, minmax(0, 1fr))`.
- All three prices visible simultaneously, same baseline.
- System 3: `.is-complete` (existing gold border + glow), badge pill, solid
  primary CTA, subtle elevation. Systems 1 and 2 keep full styling — no
  desaturation, no reduced padding, no "cheap" treatment.
- Comparison table below the cards inside `<details>`, open by default at desktop.

### 7.3 Tablet (761–1120px)

- Two columns, System 3 spanning the full width of the second row so its badge
  and emphasis survive. Prevents an orphaned third card.

### 7.4 Mobile (<= 760px)

- Compact price comparison **first** (see §15.3), non-sticky.
- Then cards stacked 1 -> 2 -> 3, System 3 last before the CTA.
- Cards truncated to price + result chain + 4 bullets, remainder behind
  "See full scope" (`<details>`).
- Comparison table collapsed by default; opens into an `overflow-x: auto`
  container. A sticky **first table column** is permitted; a page-level sticky
  price bar is not.

---

### 7.5 System 3 anchors — legacy deep link preserved

Decision 4. The existing public deep link `/services#local-lead-system` must keep
working. An HTML element can carry only one `id`, so the section takes the new
semantic id and the legacy id is emitted as an adjacent empty anchor:

```html
<span id="local-lead-system" aria-hidden="true"></span>
<article id="lead-capture-follow-up-system" class="system-offer-card is-complete">
```

Both ids inherit the existing global `[id] { scroll-margin-top: … }` rule, so both
land correctly under the fixed header. Cost: one span. No redirect, no JS, no
routing change.

- Internal links (nav, cards, `detailsLink`) point at the **new** id.
- The legacy id exists only to catch inbound external links.
- If for any reason the alias cannot be emitted cleanly, fall back to keeping the
  existing `local-lead-system` id as the only id. **Never break the public link
  merely to rename an internal anchor.**

## 8. Visual Asset Architecture

**Production visual assets are APPROVED for this phase** (decision 3). Every
visual must be explanatory, not decorative. If a visual does not help the visitor
understand the system, it does not ship.

### 8.1 Asset priority order (binding)

1. Real project screenshots / real UI assets
2. Purpose-built HTML / CSS / SVG system visuals
3. Product or interface mockups
4. Generated conceptual imagery — only where 1–3 genuinely cannot carry the idea
5. Generic stock photography — avoid

**Forbidden as primary visual language:** businesspeople, handshakes, laptops on
desks, abstract glowing orbs, isometric city scenes, 3D renders.

### 8.2 Per-section plan

| Section | Visual | Type | Existing or new | Responsive | Performance |
|---------|--------|------|-----------------|------------|-------------|
| 1 Hero | Connected-system visualization: **Discovery/Google -> Website -> Inquiry -> Opportunity Organization -> Follow-Up** | Prefer HTML/CSS/SVG built in-page; generated imagery only if the composition genuinely needs it | **NEW** | Horizontal 5 nodes >=1121px; 3-node vertical crop <=760px | If SVG/DOM: no extra request. If raster: `loading="eager"`, explicit `width`/`height`, above-fold |
| 2 Problem | Before/After split panel | HTML/CSS, two labelled panels | **NEW** | Stacks, Before first | No image |
| 3 Five Pillars | 5 icons + connector line, each with a small UI fragment | **Inline SVG** — follow existing `FLOW_ICON_*` const pattern | **NEW** | Connector rotates vertical <=760px | No image |
| 4 Three Systems | One small progression mark per card | **Inline SVG** | **NEW** | Scales with card | Card 3's chain must be visibly the longest — the length *is* the value argument |
| 5 Routes | Two paths converging on one shared outcome block | **Inline SVG** | **NEW** | Stacks | No image |
| 6 Customer Journey | 8-node flow: Google Search -> Business Profile -> Website -> Quote Request -> Opportunity Organized -> Follow-Up -> Service -> Review | **REUSE** `captureFlowSection()` (existing working responsive SVG, `generate-pages.js:2211`) | **EXISTING** | Already responsive; vertical <=760px | Zero new cost |
| 7 Projects & Demos | Real desktop + mobile screenshots | **Real screenshots** | **EXISTING** — `public/images/projects/{klinner,venezuela51,forge-demo,barber-demo}.jpg` | Grid -> stack | `loading="lazy"`, explicit `width`/`height` |
| 8 Implementation + Payment | Timeline with 50/30/20 markers pinned to their step | HTML/CSS | **NEW** | Vertical <=760px, markers inline beside their step | No image |
| 9 Monthly Services | Two pricing cards + total chip | HTML/CSS, small icons | **NEW** | Stacks | Deliberately quieter than the system cards |
| 10 About | Founder photo | Existing raster | **EXISTING** — `public/images/gregor-silva.png` | — | `loading="lazy"`. WebP conversion remains out of scope (§22) |

### 8.3 Rules for any raster asset produced

- One consistent illustration system: BLYNX near-black ground, warm cream UI
  surfaces, gold reserved for connective lines and the active state.
- Every interface fragment must be plausible as a real screen.
- No invented metrics, percentages, testimonials or performance claims in any
  visual — the brief's no-guarantee rule applies to imagery, not just copy.
- Explicit `width`/`height` on every `<img>` (the repo is currently 74/74 on this).
- `loading="lazy"` everywhere except the hero.
- Prefer SVG/DOM over raster wherever the visual is diagrammatic — it costs no
  request, scales cleanly, and stays legible in both themes.

## 9. File-by-File Implementation Plan

| File | Current purpose | Change | Action | Depends on |
|------|-----------------|--------|--------|------------|
| `scripts/generate-pages.js` | All EN/ES content + page assembly | `commercialOffer` -> 3 systems, derived prices, badges; new `pillars`/`routes`/`implementation`/`monthly` data; new `fivePillarsSection`/`routeSelectorSection`/`implementationSection`; rewrite `systemsOverviewSection`, `systemsDetailSection`, `socialMediaAddOnSection`; fold `comparisonSection` into `<details>`; delete `auditFlow`/`processSteps`/`results`/`connectedInfrastructure` usage; reorder `homePage()`; update `header()` CTAs/nav; extend `validateCommercialOfferParity()` | **MODIFY** | — |
| `scripts/build.js` | Validates required files/snippets, copies to `dist/` | Update `requiredSnippets` for both languages to the new copy; add price-string assertions; keep GA4 single-init assertion | **MODIFY** | must land in same commit as generator |
| `assets/styles.css` | Single stylesheet | `.system-offer-grid` -> 3-col + tablet step; decouple `.comparison-grid`; new `.price-compare`, `.system-badge`, `.pillars-strip`, `.route-grid`, `.impl-timeline`, `.monthly-grid`; `<details>` styling | **MODIFY** | section markup |
| `assets/site.js` | Behaviours, forms, analytics | Minimal. Only if §14 approved: `interestedSystem` population + allow-list entry. Comparison table needs **no JS** (native `<details>`) | **MODIFY (minimal)** | §14 decision |
| `en/**`, `es/**`, `index.html` | Generated output, committed | Regenerated by `npm run build`. **Never hand-edit** | **REGENERATE** | generator |
| `sitemap.xml`, `robots.txt` | Generated | Regenerated; verify no orphaned URLs | **REGENERATE** | generator |
| `integrations/google-apps-script.gs` | Lead intake backend | none | **PRESERVE** | — |
| `demos/**`, `scripts/build-*-demo.js` | Industry demos | none | **PRESERVE** | — |
| `public/images/**` | Assets | none this phase | **PRESERVE** | §8 authorisation |
| `vercel.json` | Deploy config | none | **PRESERVE** | — |
| `.github/workflows/deploy.yml` | GitHub Pages deploy | none | **PRESERVE** | §22 |
| `docs/plans/blynx-homepage-restructure.md` | This plan | — | **CREATE** (done) | — |

---

## 10. Bilingual Architecture

### 10.1 Mechanism

All copy lives in `commercialOffer` / sibling data objects keyed `en` and `es`.
Renderers take `lang` and never branch on language for structure — only for text.
There is no translation runtime and no per-language template fork. Preserve this.

### 10.2 Parity enforcement

Extend `validateCommercialOfferParity()` to additionally assert:

- `systems.length === 3` in both languages
- per system: equal `startingPrice`, equal `ctaTarget`, equal `id`
- `badge` present on exactly one system, at the same index, in both languages
- new arrays (`pillars`, `routes`, `implementation.steps`, `monthly.tiers`) have
  equal length across languages
- `priceLabel` is non-empty in both

Build fails loudly on divergence. This is the primary defence against a
half-translated ship.

### 10.3 Required definition sentence

Must appear on first mention of "capture"/"captación" on the homepage:

- **EN:** "Lead capture" means receiving and organizing the inquiries and opportunities that come from your website, Google, referrals, advertising, prospecting or other channels.
- **ES:** "La captación" se refiere a recibir y organizar las solicitudes y oportunidades que llegan desde el sitio web, Google, referencias, publicidad, prospección u otros canales.

### 10.4 Spanish quality rule

Spanish is written for Hispanic business owners in the US, not translated
word-for-word. Prices, scope, exclusions and CTA meaning stay identical.

---

## 11. CTA and Navigation Architecture

### 11.1 Navigation

Current: `Home · Systems · Process · Results · About · Projects · Blog · Free Audit` + audit button (8 items).
`Process` and `Results` anchors die with their sections.

Proposed:

| Item | Target |
|------|--------|
| Systems | `/{lang}/services` |
| How It Works | `/{lang}#journey` |
| Projects | `/{lang}/projects` |
| About | `/{lang}/about` |
| Blog | `/{lang}/blog` |
| Contact | `/{lang}/contact` |

Header actions: primary button **Find the Right System / Encuentra tu Sistema**
-> `/{lang}/contact`; secondary text link **Free Audit / Auditoría Gratis** ->
`/{lang}/free-audit`. Language switcher unchanged.

### 11.2 CTA placement

- Hero: primary + secondary.
- Each system card: primary "Start with System N", targeting contact.
- Route A card -> contact; Route B card -> free audit.
- Final CTA: both.

### 11.3 Event integrity

`primary_cta_click` is delegated on `a.btn-primary`; `project_outbound_click` on
off-domain links inside `.project-card`; they are mutually exclusive. Adding
`.btn-primary` to the new cards automatically produces `primary_cta_click` with
`cta_name` and `cta_target` — **no new tracking code required**. Do not add
per-card listeners.


---

## 12. Forms and Lead Infrastructure

**Protected production functionality. Do not rewrite. Do not refactor.**

- Free Audit EN + ES (three URL variants each)
- Contact EN + ES
- Google Apps Script lead intake (`/exec` Web App)
- BLYNX Leads Google Sheet contract (column headers = form field names)
- Email notifications to `hello@blynxsystems.com`
- Success / error behaviour, including post-success duplicate blocking
- Honeypot `companyWebsiteExtra`

### 12.1 Hard constraints

1. **Do not rename, reorder or remove any existing form field name.** Field names
   are live Sheet column headers; renaming orphans historical data.
2. **Do not change the success contract.** Only `{"result":"success"}` counts.
   Never revert to trusting `response.ok`.
3. **Do not hardcode `LEAD_WEBHOOK_URL`.** It arrives via
   `window.BLYNX_CONFIG.leadWebhookUrl`.
4. **Do not modify the Apps Script or the Sheet.**
5. **Do not touch the honeypot** name, position, or the client-side silent-success
   behaviour.
6. **Do not change `Content-Type: text/plain`** — it is what keeps the POST a
   CORS-simple request against Apps Script.

### 12.2 What this restructure legitimately touches

Only the **surrounding page copy and CTA wiring**. The `<form>` elements, their
fields, their `onsubmit` handlers and `submitLead()` stay byte-identical unless
§14 is approved.

If a system card CTA points at `/contact`, that is a link change, not a form change.

### 12.3 Staging lead backend (decision 1 — Option A)

Preview deployments must never write to production leads. Target architecture:

```
Preview     -> LEAD_WEBHOOK_URL (Preview env)    -> Staging Apps Script  -> "BLYNX Leads (Staging)"
Production  -> LEAD_WEBHOOK_URL (Production env) -> Production Apps Script -> "BLYNX Leads"
```

**No application code changes.** `runtimeHead()` already injects whatever
`LEAD_WEBHOOK_URL` the build environment provides. This is environment
configuration plus one-time external setup.

#### Minimum-divergence rule

The staging Apps Script must run the **same lead-processing logic** as production.
`integrations/google-apps-script.gs` stays the single canonical source. The staging
project is that exact file with **only two documented literal differences**:

| Constant | Production | Staging |
|----------|-----------|---------|
| `NOTIFY_EMAIL` | `hello@blynxsystems.com` | same inbox (keeps setup trivial) |
| Email subject | `New BLYNX {formType} lead: …` | `[STAGING] BLYNX Lead Test — {formType}: …` |

Nothing else may differ. Do not fork validation, sanitisation, honeypot handling
or `appendRow()` behaviour — divergence there would make staging tests
meaningless.

To stop the two copies drifting over time, prefer a tiny generator
(`scripts/build-staging-apps-script.js`, ~20 lines) that reads the canonical file,
applies the two documented substitutions, and writes the staging source. Manual
copy-paste is acceptable for a first pass but must be recorded in this file as
technical debt.

#### Production Apps Script is not modified

Per decision 1, this redesign does **not** touch the production Apps Script,
its deployment, or the production sheet. A future consolidation could move the
subject prefix into `PropertiesService` script properties so a single unmodified
file serves both environments — that is a **separate, independently justified and
independently verified task**, explicitly not part of this work.

#### One-time setup (prerequisite, human-assisted)

1. Create spreadsheet **"BLYNX Leads (Staging)"**.
2. Create a container-bound Apps Script on it from the canonical source with the
   two documented differences.
3. Deploy as Web App — *Execute as: Me*, *Who has access: Anyone*. Authorising the
   script's Sheets + Mail scopes requires one interactive Google approval, exactly
   as production did.
4. Set `LEAD_WEBHOOK_URL` for the **Preview** environment only:
   `vercel env add LEAD_WEBHOOK_URL preview --project blynxsystems-com-9ez1 --scope gregor-blynx`
5. Verify: `GET <staging /exec>` returns `BLYNX lead intake is running.`

Production's `LEAD_WEBHOOK_URL` is untouched throughout.

---

## 13. Analytics Architecture

**Protected.** Preserve exactly:

- Single `gtag.js` include + single `gtag('config', …)` per page, injected by
  `runtimeHead()` from `GA4_MEASUREMENT_ID`. `scripts/build.js` asserts this;
  a second initialisation fails the build.
- `free_audit_submit` — fires only after confirmed backend success
- `contact_form_submit` — fires only after confirmed backend success
- `primary_cta_click` — delegated, `cta_name` + `cta_target`
- `project_outbound_click` — delegated, `project_name` + `project_domain`

### 13.1 Allow-list discipline

`ANALYTICS_PARAM_ALLOWLIST` is an allow-list. Adding a parameter requires an
explicit entry; anything else is silently dropped. **Never add a parameter that
could carry personal data.** The only addition contemplated in this work is
`interestedSystem` (a fixed enum), and only if §14 is approved.

### 13.2 No new tracking work required

New `.btn-primary` cards inherit `primary_cta_click` through the existing
delegated listener. Do not add new listeners, do not add new event names.

### 13.3 Preview analytics (decision 2)

Preview currently has no `GA4_MEASUREMENT_ID`, so `gtag` is absent and §18.4
cannot run there. Resolution: an **isolated GA4 staging property** whose
Measurement ID is set on the Preview environment only.

```
Preview     -> GA4_MEASUREMENT_ID (Preview env)    -> GA4 property "BLYNX Systems (Staging)"
Production  -> GA4_MEASUREMENT_ID (Production env) -> G-2BQVTPK4HR (unchanged)
```

- **No application code changes.** `runtimeHead()` already emits exactly one
  `gtag('config', …)` using whatever ID the environment supplies. The
  single-initialisation build assertion continues to hold in both environments.
- **Production analytics stay clean** — preview traffic and regression test events
  never reach the production property.
- **Keep it minimal.** A separate property, one web data stream, nothing else. No
  GTM container, no second analytics vendor, no server-side tagging, no
  `debug_mode` plumbing.
- **Do not mark key events on the staging property.** Conversions are configured on
  production only.

One-time setup (human-assisted, same path as the production property):
create the GA4 property + web stream, then
`vercel env add GA4_MEASUREMENT_ID preview --project blynxsystems-com-9ez1 --scope gregor-blynx`.

Acceptable fallback if the staging property cannot be created: leave
`GA4_MEASUREMENT_ID` unset on Preview and defer §18.4 to a controlled
post-merge production verification using `BLYNX FORM TEST` values. This is a
downgrade and must be reported, not chosen silently.

---

## 14. `interestedSystem` Assessment

The approved brief classifies this field as commercially approved but
technically conditional, and requires verification before implementation. That
verification has now been performed against the live repository and the live
backend contract.

### 14.1 Verification performed

| Check | Finding |
|-------|---------|
| Payload contract | `submitLead()` sends `JSON.stringify({ formType, submittedAt, ...formData })`. Adding a form input adds one key. No positional coupling. |
| `sanitizeData()` | Iterates `Object.keys(data)`; unknown keys handled generically. |
| `validateSubmission()` | Only checks presence of required fields and email format. An extra key is ignored. |
| `appendRow()` | Reads the live header row, pushes any unknown key as a **new trailing column**, then maps values by header name. **Schema-additive; existing columns cannot shift.** |
| Honeypot ordering | Honeypot check runs *before* any sheet write. Unaffected. |
| `sendNotificationEmail()` | Iterates all keys except `formType`; the new field appears in the email body automatically. No template change needed. |
| Sheet headers | 20 columns verified live. No existing `interestedSystem` column and no name collision. |
| EN/ES forms | Both use the identical hidden-field mechanism already proven by `businessStage` (`populateAuditContextFields()`). |
| GA4 | Requires one explicit allow-list entry. The value is a fixed enum with no personal data. |

### 14.2 Classification

**SAFE TO IMPLEMENT** — with three binding conditions.

Rationale: `appendRow()` is additive by construction, so the failure mode the
brief feared (shifted, renamed, lost or corrupted columns) is not reachable by
adding a payload key. The mechanism being copied (`businessStage`) is already in
production and verified. No Apps Script or Sheet change is required.

### 14.3 Binding conditions

1. **Implement last.** Ship and verify the entire commercial restructure first.
   This field must never be the reason a restructure rollback becomes complicated.
2. **Values are a closed enum:** `system-1 | system-2 | system-3 | unsure`.
   Never free text. Never a system display name.
3. **Full-chain test on STAGING before production.** Required chain, verified in
   order, against the staging backend (decision 1):

   ```
   System CTA click
     -> form carries interestedSystem
     -> staging Apps Script receives it
     -> BLYNX Leads (Staging) gains a new trailing column, prior columns intact
     -> [STAGING] notification email contains the value
     -> browser shows the success state
     -> GA4 staging property records the conversion event
   ```

   If any link cannot be verified, revert **this field only** and ship the rest.

### 14.4 Residual risk

Low but non-zero: the first submission carrying the new key triggers a header-row
write in `appendRow()`. That path is already exercised (the current 20 columns were
created by it), but it is a write to a live sheet.

Mitigation is now stronger than in the draft: because decision 1 gives Preview its
own staging backend, **the first header-row write happens on the staging sheet, not
production.** Confirm on staging that the new column appears as column 21 and all
20 prior columns are intact and correctly aligned, before the field ever reaches
the production endpoint.

---

## 15. Responsive Strategy

CSS is desktop-first (`max-width` queries). Keep that convention.

### 15.1 Desktop (>= 1121px)

- Systems: 3 columns, equal height, all prices on one baseline.
- Five pillars: horizontal strip with connector.
- Journey: horizontal 8-node flow (existing behaviour).
- Implementation timeline: horizontal, payment markers beneath their phase.
- Comparison table: visible/open.

### 15.2 Tablet (761–1120px)

- Systems: 2 columns; System 3 spans the second row full width so its badge and
  emphasis are not orphaned.
- Pillars: wrap to 3 + 2.
- Journey and timeline: horizontal with `overflow-x: auto`.

### 15.3 Mobile (<= 760px)

- **Compact price comparison, non-sticky**, immediately before the cards:

```
[ PRESENCE    ] [ ORGANIZATION ] [ FOLLOW-UP ✦ ]
[ $1,500      ] [ $2,250       ] [ $2,500      ]
```

  Three equal cells, each a jump link to its full card. Scrolls out of view
  normally. **Forbidden:** `position: sticky`, `position: fixed`, or any
  scroll-persistent pricing element.

- Systems stack 1 -> 2 -> 3. Cards truncated to price + result chain + 4 bullets,
  remainder in `<details>`. BEST VALUE badge inside card 3's visible header — never
  relying on elevation/transform, which reads as nothing at narrow widths.
- Pillars: vertical connector.
- Journey and timeline: vertical, one node per row. Do not scale the horizontal
  diagram down.
- Before/After: stacked, Before first.

### 15.4 Overflow rule

Zero horizontal page overflow at 320, 390 and 768px. Every wide element (table,
journey, timeline) scrolls inside its own `overflow-x: auto` container. The body
never scrolls sideways.

Note for auditors: `.form-intro` legitimately uses `position: sticky` at desktop
widths. A blanket grep for `position:sticky` will produce a false positive — the
acceptance criterion must be scoped to pricing components (§21).

---

## 16. Performance / Accessibility Impact

### 16.1 Performance

- Net **reduction** expected: deleting `captureFlowSection`'s duplicate siblings
  and three homepage sections removes markup; no new raster assets this phase.
- No new dependencies, no JS framework, no additional network requests.
- `<details>` is native — the comparison table needs no JavaScript.
- Keep explicit `width`/`height` on every image and `loading="lazy"` except the hero.
- CSS grows modestly; still one stylesheet, still no build step for it.

### 16.2 Accessibility

- Preserve the existing skip link and `aria-label`s on nav/sections.
- `<details>`/`<summary>` gives keyboard and screen-reader behaviour for free —
  do not replace it with a div-and-JS accordion.
- Price must be real text, never baked into an image.
- The BEST VALUE badge needs an accessible name, not colour alone.
- Comparison table: real `<table>` with `<th scope="col">` headers.
- Maintain visible focus states on all new interactive elements.
- Respect `prefers-reduced-motion` on any new transition.
- Contrast: gold `#f5b849` on near-black passes; do not lighten card 1/2 text to
  create false hierarchy.

---

## 17. Implementation Sequence

Recommended order for Sonnet. Each step should build green before the next.

0. **Prerequisites (human-assisted, before any code).** Staging backend and staging
   GA4 property exist and both Preview env vars are set — §12.3 and §13.3. If these
   are not ready, steps 1–16 still proceed; only the protected-path suite (§18.3,
   §18.4) is blocked.
1. **Branch.** `git checkout -b feat/three-system-restructure` off `main`. Never commit to `main`.
2. **Data model.** Rewrite `commercialOffer` for 3 systems in EN and ES: ids, names, `startingPrice`, `badge`, `priceLabel`, need-based `ideal[]`, `implementation[]`, `benefits[]`, exclusions. Extend `validateCommercialOfferParity()`. Build must pass on the validator alone.
3. **Price rendering.** Derive display strings from `startingPrice` (pinned `"en-US"`); move `.is-complete` from `index === 1` to the badge-bearing system; add the badge pill. Emit the legacy `#local-lead-system` alias span alongside the new System 3 id (§7.5).
4. **CSS for 3-up.** Systems grid to 3 columns, tablet step, decouple `.comparison-grid`, badge styling.
5. **New data + renderers.** `pillars`, `routes`, `implementation`, `monthly`; `fivePillarsSection`, `routeSelectorSection`, `implementationSection`; rewrite `socialMediaAddOnSection` to the $650 / +$850 / $1,500 structure.
6. **Comparison table.** Fold `comparisonSection` into a `<details>` inside the systems section.
7. **Homepage recomposition.** Reorder `homePage()` per §6; delete `#free-audit-flow`, `#process`, `#results`, `connectedInfrastructure`; relabel `captureFlowSection` as the Journey; expand the projects section.
8. **Free Audit page.** Move the six-step audit explanation there.
9. **Navigation + CTAs.** Update `header()`: new items, primary "Find the Right System", audit demoted to a text link. Fix the dead `#process` / `#results` anchors.
10. **Route pages.** Rewrite `/zero` and `/existing` copy so neither implies a fixed product.
11. **Services pages.** Make them the deep-detail surface: full per-system scope, full comparison, exclusions, FAQ.
12. **Mobile price comparison.** Build the non-sticky compact component.
12b. **Visuals.** Build the HTML/CSS/SVG visuals per §8: hero connected-system flow, before/after panel, five-pillar strip, three system progression marks, route diagram, implementation timeline. Reuse `captureFlowSection()` for the journey. Real screenshots for projects.
13. **`requiredSnippets`.** Update `scripts/build.js` for both languages; add price-string assertions. *(Can be done incrementally alongside steps 2–11 to keep the build green — do not leave it to the end.)*
14. **Regenerate + verify.** `npm run build` with both env vars set; confirm the GA4 single-init assertion holds.
15. **Push branch -> preview deploy.** Visual review desktop + mobile (§19).
16. **Regression suite** (§18).
17. **`interestedSystem`** — only after everything above is green, and only per §14.3, verified against the **staging** sheet.
18. **Report and stop.** Do not merge to `main`. Human approval gates production.

---

## 18. Testing and Regression Plan

### 18.1 Build-level

- `npm run build` passes with `LEAD_WEBHOOK_URL` and `GA4_MEASUREMENT_ID` set.
- `npm run build` passes with neither set (local dev), emitting the two expected warnings.
- `node --check` clean on `assets/site.js`, `scripts/generate-pages.js`, `scripts/build.js`.
- `validateCommercialOfferParity()` throws when a Spanish array is deliberately shortened (verify the guard actually guards).
- GA4 single-initialisation assertion still fails on a deliberately duplicated `gtag('config')`.

### 18.2 Content and bilingual

- Three systems, correct names, correct prices, in EN and ES.
- Prices render as text on the systems and monthly sections in both languages.
- No occurrence of `Contact us for pricing` / `Contáctanos para precios`.
- No occurrence of `guarantee|guaranteed|more customers|more leads|garantiz|más clientes`.
- No `Results` / `Resultados` used as a promise-flavoured section heading.
- The approved "lead capture" definition appears on first mention in both languages.
- No system name adjacent to stage language (`starting from zero`, `outdated website`, `empiezas de cero`).
- `hreflang` pairs resolve for every page.

### 18.3 Protected forms — full chain, against the STAGING backend

Runs on the preview deployment, writing to **"BLYNX Leads (Staging)"** and
producing `[STAGING]`-prefixed emails. Production leads are never touched.

For each of Free Audit EN, Free Audit ES, Contact EN, Contact ES, on desktop **and** mobile viewport, using values labelled `BLYNX FORM TEST`:

1. Form renders and required-field validation blocks an empty submit.
2. Submission reaches the Apps Script.
3. Browser shows the **success** state (not error), in the right language.
4. Row lands in the **BLYNX Leads (Staging)** sheet with correct column alignment.
5. Notification email generated, subject prefixed `[STAGING]`.
6. Submit button blocks a duplicate after success.
7. Zero console errors.

Negative paths:

8. Honeypot filled -> zero backend requests, zero conversion events, silent success shown.
9. Simulated `{"result":"error"}` at HTTP 200 -> error state shown, **no** conversion event.
10. Simulated network failure -> error state shown, no conversion event.

### 18.4 Protected analytics

Runs against the **GA4 staging property** on Preview (§13.3), never the production property.

- `free_audit_submit` fires once, only after backend success, and reaches Google.
- `contact_form_submit` likewise.
- `primary_cta_click` fires on the new system-card CTAs with `cta_name` / `cta_target`.
- `project_outbound_click` fires on Klinner / Venezuela 51 links with `project_name` / `project_domain`, and does **not** also fire `primary_cta_click`.
- No event payload contains `fullName`, `email`, `phone`, `message`, `businessName` or `cityState`.
- Exactly one `gtag('config')` per page in the rendered output.

> Delivery note: GA4 batches events. Verifying "reached Google" requires waiting
> for the batch flush (~9s) and/or forcing a `visibilitychange`/unload before
> asserting on requests to `google-analytics.com/g/collect`. Asserting too early
> produces false failures.

### 18.5 Navigation, links, responsive

- Every nav item resolves; no dead `#process` / `#results` anchors anywhere.
- Language switcher preserves the current page in both directions.
- Project links open the correct external sites; demo links open the correct demos.
- Zero horizontal overflow at 320, 390, 768px on home, services, projects, contact, free-audit, blog (EN and ES).
- Mobile price comparison is present, non-sticky, and scrolls out of view.
- Comparison table opens/closes by keyboard.

### 18.6 Test data cleanup

Remove `BLYNX FORM TEST` rows from the **staging** sheet after the run. The
production sheet is not involved in this suite and must not be edited.

If the §13.3 fallback was taken (no staging GA4 property) and any verification had
to happen against production, remove those rows from the production sheet too, and
report it explicitly.

---

## 19. Preview / Staging Plan

**No direct production deployment.** Production merges only after human approval.

### 19.1 Mechanism

Vercel is git-connected to `blynxsystems-com-9ez1`. Pushing
`feat/three-system-restructure` produces an automatic preview deployment at
`blynxsystems-com-9ez1-<hash>-gregor-blynx.vercel.app`. Production stays on the
last `main` deployment throughout.

### 19.2 Environment matrix (decisions 1 and 2)

| Variable | Production | Preview |
|----------|-----------|---------|
| `LEAD_WEBHOOK_URL` | Production Apps Script -> "BLYNX Leads" | Staging Apps Script -> "BLYNX Leads (Staging)" |
| `GA4_MEASUREMENT_ID` | `G-2BQVTPK4HR` (unchanged) | GA4 staging property |

The draft's blocking issue is **resolved**: Preview now has both values, so the
full regression suite runs there without touching production data.

Both variables are already environment-driven through `runtimeHead()`, so this
matrix is achieved with **zero application code changes** — Sonnet writes no code
for it. Setup is: create the two external resources, then set two Preview env vars.

### 19.3 Preconditions before the protected suite runs

- Staging `/exec` responds `BLYNX lead intake is running.` to a GET.
- Preview build log prints `Lead endpoint: configured` and
  `GA4 analytics: configured (<staging id>)`.
- A preview page's `window.BLYNX_CONFIG` shows the **staging** endpoint — a
  production endpoint appearing on preview is a hard stop.

### 19.4 What is testable without the prerequisites

§18.1, §18.2, §18.5 — build integrity, content, bilingual parity, navigation,
responsive behaviour, visual review. That is the bulk of the work and it is not
gated on any external setup.

§18.3 and §18.4 are gated on §12.3 and §13.3 being in place.

### 19.5 Promotion to production

Only after: §21 all PASS, human visual review of the preview URL on desktop and
mobile, and explicit approval. Then merge to `main`; Vercel deploys production
automatically. Sonnet does not merge.

## 20. Risks and Edge Cases

### 20.1 RESOLVED — staging lead path (decision 1: Option A)

The draft's blocking decision is closed. Preview uses a separate staging Apps
Script and "BLYNX Leads (Staging)" sheet; production leads are never touched by
testing. Full architecture in §12.3, environment matrix in §19.2.

Residual risk moves from *data contamination* to *setup*: the staging backend and
staging GA4 property require one-time human-assisted Google authorisation. If that
setup slips, §18.3 and §18.4 are blocked while everything else proceeds (§19.4).
Report the block; do not silently fall back to testing against production.

Secondary residual risk: staging and production Apps Script copies drifting apart
over time. Mitigated by the two-substitution rule and the optional generator in
§12.3. If they drift, staging tests stop proving anything about production.

### 20.2 Build fails on first restructure commit

`requiredSnippets` asserts copy that this work deletes. Mitigation: update
`scripts/build.js` in the same commit / incrementally per §17 step 13.

### 20.3 Dead anchors

Nav currently links `#process` and `#results`; both sections are deleted.
Mitigation: §17 step 9 is not optional.

### 20.4 Badge emphasis regression

`.is-complete` is currently positional (`index === 1`). With three systems that
silently emphasises the wrong card. Mitigation: data-driven `badge` field.

### 20.5 `.comparison-grid` shares the systems selector

Changing `.system-offer-grid` to 3 columns also changes `.comparison-grid`.
Mitigation: split the rule before touching column counts.

### 20.6 System 2 must not read as filler

The brief forbids degrading it. Risk is visual, not textual: equal padding,
equal bullet count, equal CTA prominence. Review side by side at desktop.

### 20.7 System 3 identity reuse — RESOLVED (decision 4)

The existing `local-lead-system` (`startingPrice: 2500`) becomes System 3. The
section takes the new id `#lead-capture-follow-up-system`; `#local-lead-system` is
preserved as an adjacent empty anchor so the public deep link
`/services#local-lead-system` keeps working (§7.5).

Remaining risk: an internal reference left pointing at the old id while the
element moves. Mitigation: grep for `local-lead-system` after the change — every
remaining occurrence must be either the alias span itself or an intentional
external-facing reference, never an internal nav/card link.

### 20.8 Price/locale formatting

`toLocaleString` without a pinned locale would render `2.250` under a Spanish
locale. Mitigation: pin `"en-US"` (§7.1).

### 20.9 Generated files in git

`en/**` and `es/**` are committed. A hand-edit would be silently overwritten by
the next build. Mitigation: generator-only edits, always.

### 20.10 Preview pointed at production by mistake

If the Preview env vars are missing or misconfigured, a preview deployment could
inherit nothing (forms fail closed — safe) or, worse, be manually pointed at the
production endpoint (test rows in real leads — not safe). Mitigation: §19.3
precondition check on `window.BLYNX_CONFIG` before any form test.

### 20.11 Visual assets outgrowing their purpose

Assets are now authorised, which creates room for decorative drift. Mitigation:
§8's explanatory-not-decorative rule and the forbidden-imagery list. A visual that
does not explain the system does not ship.

### 20.12 Scope creep into infrastructure

The temptation to "tidy" `generate-pages.js` (4,049 lines) while inside it.
Explicitly out of scope (§22).

---

## 21. Acceptance Criteria

Objective PASS/FAIL. Every item must PASS before requesting merge approval.

| # | Criterion | Method |
|---|-----------|--------|
| 1 | `npm run build` exits 0 with both env vars set | CI/local |
| 2 | `npm run build` exits 0 with neither set, emitting 2 warnings | local |
| 3 | Exactly one `gtag('config'` per generated page | grep count per file |
| 4 | Three systems present with `$1,500`, `$2,250`, `$2,500` in `en/index.html` **and** `es/index.html` | grep |
| 5 | `$650`, `$850`, `$1,500` present in the monthly section, both languages | grep |
| 6 | Zero matches for `Contact us for pricing` / `Contáctanos para precios` | grep |
| 7 | Zero matches for `guarantee\|guaranteed\|more customers\|more leads\|garantiz\|más clientes` in generated HTML | grep |
| 8 | Zero section headings equal to `Results` / `Resultados` | grep on heading tags |
| 9 | Approved "lead capture" definition present, both languages | grep |
| 10 | No system name within 200 chars of `starting from zero`/`outdated website`/`empiezas de cero` | scripted proximity check |
| 11 | Homepage body word count reduced >= 40% vs `133b34f` baseline (~1,100 words), both languages | scripted count, before/after |
| 12 | The find->capture->organize->follow-up sequence explained in exactly 2 places | manual review against §6 |
| 13 | BEST VALUE / MEJOR VALOR badge on System 3 only | grep + visual |
| 14 | Zero `position:sticky` **or** `position:fixed` on any pricing component (`.price-compare`, `.system-*`) | scoped grep — `.form-intro` sticky is expected and allowed |
| 14b | `/services#local-lead-system` still scrolls to the System 3 section | click-through on preview, both languages |
| 14c | Every visual is explanatory; zero stock businesspeople/handshake/laptop imagery | manual review against §8.1 |
| 15 | Zero horizontal overflow at 320/390/768px on all 6 key pages, both languages | browser measurement |
| 16 | All nav items resolve; zero references to `#process` or `#results` | grep + click-through |
| 17 | 4 protected forms: success state, **staging** sheet row, `[STAGING]` email, no console errors | §18.3 |
| 17b | Preview `window.BLYNX_CONFIG.leadWebhookUrl` is the **staging** endpoint, never production | inspect preview page |
| 17c | Production sheet gained zero rows during the whole test run | compare row count before/after |
| 18 | Honeypot: zero backend requests, zero conversion events | §18.3 |
| 19 | Failure paths show error state and fire no conversion event | §18.3 |
| 20 | 4 protected events fire and reach Google, on the **staging** GA4 property | §18.4 |
| 20b | Production GA4 property received zero preview traffic | GA4 realtime check during the run |
| 21 | No event payload contains personal data | §18.4 |
| 22 | Test rows removed from the **staging** sheet | manual |
| 23 | `main` untouched; work reviewable on a preview URL | `git log origin/main` |

---

## 22. Out of Scope

Sonnet must **not** build, change, or "improve" any of the following in this work:

- Business strategy, the approved offer, pricing, or the three-system definitions
- The Google Apps Script source or deployment
- The BLYNX Leads Google Sheet structure or contents (beyond removing test rows)
- `submitLead()` success-contract logic
- GA4 initialisation mechanics or new event names
- Refactoring `scripts/generate-pages.js` architecture (file splitting, templating engine)
- GitHub Pages workflow (`.github/workflows/deploy.yml`)
- `vercel.json`, security headers, caching policy
- WebP/image compression, including `gregor-silva.png`
- Repository cleanup (stray root `.PNG` files, `.image-work/`)
- Demo indexing / `noindex` on demos
- The Barber and FORGE demo internals
- Blog content or blog strategy
- Adding any dependency, framework, or build step
- **Modifying the production Apps Script, its deployment, or its `/exec` URL** — including the future `PropertiesService` consolidation described in §12.3, which is a separate task
- Changing the production `LEAD_WEBHOOK_URL` or `GA4_MEASUREMENT_ID` environment values
- Marking key events / conversions on the GA4 staging property
- Adding GTM, server-side tagging, `debug_mode` plumbing, or a second analytics vendor
- Merging to `main` or deploying to production

> Note: producing production **visual assets is now in scope** (decision 3, §8) —
> this reverses the draft's deferral. Assets must remain explanatory, and the
> forbidden-imagery list in §8.1 still applies.

---

## 23. Builder Handoff (Sonnet)

You are implementing an approved commercial restructure on a live marketing site
whose lead-capture pipeline was broken for weeks and repaired three days ago.
The copy is reversible. The lead pipeline is not. Optimise for not breaking it.

**Do this:**

1. Work on `feat/three-system-restructure`. Never commit to `main`. Never deploy to production.
2. Read §6 (section order), §7 (pricing), §17 (sequence). Follow §17 in order.
2b. **You write no code for the staging strategy.** Both `LEAD_WEBHOOK_URL` and
   `GA4_MEASUREMENT_ID` are already environment-driven. Preview gets a staging
   backend and a staging GA4 property purely through environment configuration
   (§19.2). Before running any form test, confirm on the preview page that
   `window.BLYNX_CONFIG.leadWebhookUrl` is the **staging** endpoint. If it is the
   production endpoint, stop and report.
3. Almost everything you need to change is the `commercialOffer` data object in
   `scripts/generate-pages.js`. Prefer data changes over new renderers.
4. Never hand-edit anything under `en/` or `es/` — those are build output. Edit the
   generator and rebuild.
5. Update `requiredSnippets` in `scripts/build.js` as you go. If you leave it to
   the end, you will work against a red build for hours.
6. Derive price strings from `startingPrice` with a pinned `"en-US"` locale. Do not
   store a second price string per language.
7. Drive the BEST VALUE emphasis from a `badge` data field, not an array index.
8. Split `.comparison-grid` off `.system-offer-grid` **before** changing column counts.
9. Use native `<details>` for the comparison table and truncated card scope. No JS accordion.
10. Extend `validateCommercialOfferParity()` for the new arrays. Let the build catch half-translations.
11. Ship `interestedSystem` **last**, and only under §14.3, verified against the
    **staging** sheet. If anything is ambiguous, ship without it and report.
12. Emit `#local-lead-system` as a legacy alias span beside System 3's new id
    (§7.5). The public deep link must keep working.
13. Build visuals per §8 — HTML/CSS/SVG first, real screenshots for projects,
    reuse `captureFlowSection()` for the journey. Every visual must explain
    something. No stock businesspeople, handshakes or laptops.

**Never do this:**

- Rename, reorder or remove a form field name (they are Sheet column headers)
- Change the `{"result":"success"}` success contract, or trust `response.ok`
- Hardcode `LEAD_WEBHOOK_URL` or `GA4_MEASUREMENT_ID`
- Add a second `gtag('config')`
- Touch the honeypot, the Apps Script, or the Sheet schema
- Fire a conversion event anywhere except after confirmed backend success
- Add a parameter to `ANALYTICS_PARAM_ALLOWLIST` that could carry personal data
- Add a sticky or fixed mobile pricing bar
- Refactor the generator's architecture while you are in there
- Touch the production Apps Script, its deployment, or the production sheet
- Change production environment variables
- Break `/services#local-lead-system`
- Run form tests against the production endpoint

**Definition of done:** every criterion in §21 passes, the work is reviewable on a
Vercel preview URL, `main` is untouched, and you have reported results plus
anything you deliberately left out. Then stop and wait for approval.

---

## Appendix A — Baseline for comparison

- Commit: `133b34f` "Restore lead capture and add GA4 analytics"
- Homepage sections: 12 (EN and ES)
- Homepage body copy: ~1,100 words
- Systems offered: 2
- Prices rendered: 0
- Production Vercel project: `blynxsystems-com-9ez1`
- Sheet columns: 20

## Appendix B — Decisions (all closed)

| # | Decision | Ruling | Where |
|---|----------|--------|-------|
| 1 | Staging lead-path strategy | **Option A** — separate staging Apps Script + "BLYNX Leads (Staging)" for Preview | §12.3, §19.2, §20.1 |
| 2 | Preview analytics | Isolated **GA4 staging property** on Preview; production property untouched | §13.3, §19.2 |
| 3 | Production visual assets | **Approved.** Explanatory only; HTML/CSS/SVG preferred; real screenshots for projects | §8 |
| 4 | System 3 anchor | New `#lead-capture-follow-up-system` **+** `#local-lead-system` preserved as legacy alias | §7.5, §20.7 |
| 5 | `interestedSystem` | **SAFE TO IMPLEMENT** — last in sequence, closed enum, verified on staging first | §14 |
| 6 | Prior architectural findings | All approved as drafted | §5, §7, §9, §17 |

**No open decisions remain. This plan is frozen.**

### Outstanding prerequisites (setup, not decisions)

These are human-assisted one-time tasks, not architectural questions. They gate
§18.3 and §18.4 only; all other work proceeds without them.

1. Create "BLYNX Leads (Staging)" sheet + staging Apps Script Web App (§12.3).
2. Create the GA4 staging property + web stream (§13.3).
3. Set `LEAD_WEBHOOK_URL` and `GA4_MEASUREMENT_ID` on the **Preview** environment.
