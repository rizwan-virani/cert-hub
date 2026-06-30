# The Certification Launchpad — Formal Plan

**The Certification Launchpad** ("Launch your IT career.") is a landing/dashboard app that is the
front door to the certification study platforms. It routes students to the right
exam, teaches them how to study, aggregates their readiness across every site, and
gives students + faculty the language and disclaimers to fund and adopt the tools.

Repo: `cert-hub/` · Local port: **8113** (registered in root `.claude/launch.json`).
Deploys like its siblings (GitHub Pages at `rizwan-virani.github.io/cert-hub/`).

---

## 1. Goals

1. **Route** — a Certification Explorer that launches any of the 13 platforms, grouped by track and searchable.
2. **Orient** — what this is / isn't, why certs matter, and a concrete study method.
3. **Track** — a private, cross-site readiness dashboard that pulls each exam's progress into one view.
4. **Advocate** — funding guidance for students and faculty, plus all affiliation/licensing disclaimers.
5. **Fix navigation** — make the browser Back button behave everywhere (see §5).

---

## 2. Information architecture (landing view, top→bottom)

1. **Hero** — value prop + aggregate stat strip (platforms / questions / PBQs / labs), CTAs.
2. **Your readiness** — cross-site dashboard band (rings per exam; inviting empty state for new users).
3. **Certification Explorer** — the centerpiece: 13 launcher cards, track filters + search, link to the 36-cert reference catalog.
4. **What this is / isn't** — honest two-column framing + the desktop/Chrome optimization notice.
5. **Why certifications matter** — doors / pay / map.
6. **How to study** — the 6-step method (Read → Drill → Reinforce → Apply → Labs → Measure) + "how do I know I'm ready?".
7. **For educators & funding** — talk to your chair, where money comes from, copy-paste voucher script.
8. **FAQ** — knocks out support questions and reinforces disclaimers.
9. **Footer** — affiliation, trademarks, license, personal-views disclaimer, dev-assistance credit.

Full-screen sub-views (swapped into `#view`): the **reference catalog** (`#/catalog`) and **per-cert detail** (`#/cert/:id`).

---

## 3. Certification Explorer

- **Launcher cards** are data-driven from `assets/js/content/sites.js` — the single source of truth mapping each exam to its slug, port, accent, counts, and `progressKey`. Counts never drift because they live in one file (and are overridden live by the dashboard).
- **Controls:** track chips (Foundations / Infrastructure & Ops / Cybersecurity / Specialty) + free-text search on name/code.
- **Progress-aware:** when a site has reported progress, its card shows a progress bar and a **Resume** button instead of **Launch**.
- **Reference catalog:** reuses the shared `certs.js` (36 certs) for the broader comparison view, with a "▸ Study platform available" marker on the 13 that have one.

### Suggested future enhancement
A 3-question "path picker" (goal → experience → time) that highlights matching cards, and a visual track ladder (A+ → Network+ → Security+ → CySA+/PenTest+).

---

## 4. Cross-site readiness dashboard (architecture)

**Constraint:** each site runs on its own origin (port locally, separate Pages
site deployed). Different origin = separate `localStorage`. The hub cannot read
another origin's storage directly.

**Shared progress contract** — every site writes ONE standardized object to its
own `localStorage`, versioned, and the hub only ever reads it:

```js
// localStorage key e.g. "secplus.examProgress.v1"  (see progressKey in sites.js)
{
  examCode: "SY0-701",
  examName: "CompTIA Security+",
  lastActive: "2026-06-29T...",
  readiness: { score: 0.72, label: "Almost ready" },   // 0–1 + human label
  domains: [ { name, mastery: 0.0–1.0, weakest: bool }, ... ],
  activity: { questionsAnswered, questionsCorrect, flashcardsReviewed,
              pbqsCompleted, labsCompleted, studyStreakDays }
}
```

**Three read mechanisms (the hub supports all; sites opt in over time):**

| Mechanism | How | Status |
|---|---|---|
| Same-origin read | If hub + sites are ever served from one origin, `localStorage.getItem` works directly. | implemented (`Readiness.get`) |
| Hidden-iframe + `postMessage` | Hub embeds each site hidden, posts `examProgress:request`, the site's responder reads its own storage and posts back `examProgress:v1`. Live + automatic. | **DONE** — hub side (`pollReadiness`) + the `progressSync.js` bridge shipped into all 13 sites; verified end-to-end |
| Export / import | Each site exports a progress code; hub imports it. Works cross-device, offline. | planned fallback |

**Rollout to the 13 sites (the shared change, like `certs.js`):**
1. Add a `progressSync` module to each site that (a) writes the `examProgress.v1`
   object whenever progress changes, and (b) on load, if `?hub=progress` or a
   `postMessage` request arrives, replies with that object.
2. Bump each site's `?v=` cache marker.
3. Per the repo convention, fold into the single existing commit via amend +
   force-push — never a second commit.

Until the responders ship, the dashboard shows the empty/onboarding state
gracefully; no errors.

---

## 5. The navigation / back-button fix (major issue)

**Root cause (confirmed in `security-plus/assets/js/app.js`):** the in-site
`Router` only toggles `#dashboard`/`#view` `hidden` and keeps an internal JS
`stack`. It never calls the History API. So the browser's session history has a
single entry per visit — pressing **Back** pops that entry and *leaves the site*
(or returns to the hub). The on-page "Back to Dashboard" buttons work because
they call the router directly; the hardware Back button does not.

**Fix — History-API hash router (implemented here in `hub.js` as the reference):**
- Every navigation is a hash state (`#/`, `#/catalog`, `#/cert/:id`, section
  anchors). `go()` sets `location.hash`; a single `hashchange` handler
  (`route()`) renders the matching view.
- Because back/forward just move through hash states of the **same document**,
  the Back button now navigates **within** the app. Deep links + refresh work
  (the hash is parsed on load).
- "Back to Hub/Dashboard" buttons call the same `go()`, so both paths agree.

**Port into the 13 exam sites:** wrap their existing `Router.open` /
`showDashboard` so each pushes/restores a hash (e.g. `#/domain/3`, `#/labs`,
`#/cert/05`), add a `hashchange` + on-load parse, and a persistent
**"← Study Hub"** link in each top bar so cross-site return is always one click
regardless of history depth. This is a mechanical, low-risk change to the
~20-line Router block — same edit repeated across repos.

---

## 6. Design system & tech

- Static SPA, no build step, no backend — identical to the family. Runs on `python -m http.server 8113`.
- Reuses the shared `styles.css` design system; hub-specific components live in `hub.css`.
- Vendor-accented launcher cards for fast scanning; sticky-feeling section nav in the top bar.
- Accessible: semantic headings, keyboard-navigable, `<details>` FAQ, sufficient contrast, mobile fallback that still surfaces the desktop/Chrome notice.
- Privacy: no accounts, no servers, no tracking — a selling point reused in the educator pitch.

---

## 7. Build phases

- **Phase 1 (this scaffold):** repo, design system, `sites.js` registry, Explorer + launcher, catalog + cert detail, all narrative sections, hash router, readiness empty-state + live-read plumbing. ← **done / in progress**
- **Phase 2:** the browser back-button fix (History-API Router) shipped into all 13 sites. ← **done**
- **Phase 3:** the `progressSync.js` bridge shipped into all 13 sites — answers the hub's `postMessage` readiness request from each site's own data and injects a "← Launchpad" top-bar link. The live cross-site dashboard now lights up automatically. ← **done**
- **Future polish:** path picker + track-ladder visualization; export/import progress fallback (cross-device); richer per-domain breakdown in the readiness tiles.

---

## 8. Open items / decisions

- **Brand name** — placeholder is "study hub". Confirm final name + mark.
- **Deployment URL scheme** — `resolveSiteUrl()` assumes sibling Pages sites (`../slug/`) when deployed and localhost ports locally. Confirm if a custom domain changes this.
- **Verified counts** — `sites.js` counts are seeded from memory; reconcile against each site's live data (or let the dashboard override them once responders ship).
