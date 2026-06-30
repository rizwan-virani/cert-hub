# the certification launchpad

**A free, open-source hub for IT and cybersecurity certification exam prep.**
A single home base that launches a family of self-paced study platforms, tracks your readiness across every exam in one place, and guides you from your first certification toward your next career move.

> Designed and authored by **Professor Rizwan Virani.**

---

## What this is

An academic launchpad into a family of self-paced certification study platforms. It lets you compare certifications, see how they connect into a career path, and track your progress across every exam in one private dashboard. It is completely free, requires no account, and is offline-capable once loaded.

## What this is not

- **Not** a source of actual or copyrighted exam questions, "brain dumps," or leaked items. **Every practice question across the connected platforms is original.**
- **Not** an official product of, and not affiliated with, endorsed by, or sponsored by CompTIA, ISC2, or any certifying body.
- **Not** a guarantee of a passing score. These are practice tools — the exams test judgment, not memorization.

---

## At a glance

| | |
| --- | --- |
| **Type** | Certification exam-prep hub |
| **Vendors covered** | CompTIA and ISC2 |
| **Cost** | Free and open-source |
| **Accounts** | None — progress is stored locally in your browser |
| **Offline** | Installable as a Progressive Web App |

## Connected study platforms

| Track | Platforms |
| --- | --- |
| **Foundations** | A+ Core 1, A+ Core 2 |
| **Infrastructure & Ops** | Network+, Server+, Linux+, Cloud+ |
| **Cybersecurity** | Security+, ISC2 CC, CySA+, PenTest+, SecAI+, CISSP, CCSP |
| **Specialty** | Data+, Project+ |

## Features

| Area | What you get |
| --- | --- |
| **Certification Explorer** | Launch any connected study platform, grouped by career track, with search, recommended prerequisites, estimated study hours, and a link to each official exam blueprint. |
| **Readiness dashboard** | Pulls your progress from every platform into one private view — a readiness ring and label per exam — with no account and no server. |
| **How to study** | The proven read → drill → reinforce → apply → labs → measure loop, explained for new students. |
| **For educators & funding** | Guidance on Perkins/CTE and institutional voucher funding, a script for approaching a chair or advisor, and the CompTIA Academic Store discount. |
| **Career guidance** | A "You passed — now what?" guide covering the Credly badge, résumé/LinkedIn entries, and a recruiter announcement template. |
| **Reference catalog** | A broad comparison of industry certifications — cost, blueprint, DoD 8140 mapping, and salary and role insights. |
| **Backup & restore** | One-click export of your progress to a file, restore on another device, and a clear-all reset for a fresh start. |
| **Theme** | A global light/dark toggle with all state saved to your browser. |

## How to use it

1. **Open the Certification Explorer** and pick an exam — follow a track from the top if you're unsure where to start.
2. **Launch a study platform** and work its read → drill → reinforce → apply → labs loop.
3. **Watch your readiness** appear automatically on the dashboard as you study.
4. **Plan your funding** with the For Educators section before you schedule your exam.
5. **Back up your progress** so you can restore it on another computer or after clearing your browser.
6. **Install it** from your browser to study offline.

## Run it locally

The site is fully static — no build step. Serve the folder with any static web server:

```bash
# from the repository root:
python -m http.server 8113
# then open http://localhost:8113
```

Best experienced on a desktop or laptop in Google Chrome; the connected platforms' labs, terminal simulations, and drag-and-drop activities require a mouse and keyboard.

## Project structure

```
.
├── index.html                  # shell: hero, readiness, explorer, sections, script order
├── manifest.webmanifest        # PWA manifest (installable)
├── sw.js                       # service worker (offline-capable, network-first navigation)
├── LICENSE                     # dual license (MIT code + CC BY-NC-SA content)
├── README.md
└── assets/
    ├── css/
    │   ├── styles.css          # shared design system, dark & light
    │   └── hub.css             # hub-specific components
    ├── img/
    │   └── icon.svg            # app icon
    └── js/
        ├── hub.js              # router, launcher, readiness, theme, backup/restore
        └── content/
            ├── sites.js        # the study-platform registry (single source of truth)
            └── certs.js        # Industry Certification Explorer catalog
```

## License

This project is **dual-licensed**:

- The **software framework and interface code** are licensed under the **MIT License**.
- The **educational curriculum content** (study text modules, question banks, flashcards, and lab scenarios) is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License** (CC BY-NC-SA 4.0).

See the [LICENSE](LICENSE) file for full terms.

---

*This is a personal educational resource. All views and content are entirely my own and do not represent the views, positions, endorsements, or policies of my employer or of any other person, organization, or institution. "CompTIA" and its certification names are trademarks of CompTIA, Inc.; "ISC2" and "Certified in Cybersecurity" are trademarks of ISC2 — used here only to identify the exams this resource helps you prepare for. All practice questions are original. Released for academic use.*
