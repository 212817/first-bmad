# Where Did I Park? - Story Index

> **Project:** Where Did I Park? PWA  
> **Total Stories:** 34  
> **Created:** January 15, 2026  
> **Status:** ✅ Ready for Development

---

## Quick Navigation

| Epic                                         | Stories | Theme                       |
| -------------------------------------------- | ------- | --------------------------- |
| [Epic 1](#epic-1-foundation--authentication) | 5       | Foundation & Authentication |
| [Epic 2](#epic-2-core-spot-saving)           | 8       | Core Spot Saving            |
| [Epic 3](#epic-3-navigation--spot-retrieval) | 6       | Navigation & Spot Retrieval |
| [Epic 4](#epic-4-sharing--meter-timer)       | 5       | Sharing & Meter Timer       |
| [Epic 5](#epic-5-privacy-settings--polish)   | 10      | Privacy, Settings & Polish  |

---

## Epic 1: Foundation & Authentication

**Goal:** Establish project infrastructure, deployment pipeline, and user authentication.

| Story               | Title                                 | Status   | Dependencies |
| ------------------- | ------------------------------------- | -------- | ------------ |
| [1.1](1.1.story.md) | Project Setup and Deployment Pipeline | Approved | None         |
| [1.2](1.2.story.md) | Google OAuth Sign-In                  | Approved | 1.1          |
| [1.3](1.3.story.md) | Apple Sign-In                         | Draft    | 1.1          |
| [1.4](1.4.story.md) | Guest Mode (Anonymous Usage)          | Draft    | 1.1          |
| [1.5](1.5.story.md) | Sign Out and Session Management       | Draft    | 1.2, 1.3     |

**Key Deliverables:**

- Monorepo with React frontend + Express backend
- CI/CD pipeline with GitHub Actions
- PostgreSQL (Neon) + Cloudflare R2 configured
- OAuth authentication (Google + Apple)
- Guest mode with IndexedDB

---

## Epic 2: Core Spot Saving

**Goal:** Implement the primary feature - saving parking spots with location, photos, notes, and tags.

| Story               | Title                                 | Status | Dependencies |
| ------------------- | ------------------------------------- | ------ | ------------ |
| [2.1](2.1.story.md) | Capture and Save GPS Location         | Draft  | 1.1          |
| [2.2](2.2.story.md) | Save Confirmation Screen              | Draft  | 2.1          |
| [2.3](2.3.story.md) | Optional Photo Capture                | Draft  | 2.2          |
| [2.4](2.4.story.md) | Add Note to Spot                      | Draft  | 2.2          |
| [2.5](2.5.story.md) | Quick Edit After Save                 | Draft  | 2.2          |
| [2.6](2.6.story.md) | Manual Address Entry (Fallback)       | Draft  | 2.1          |
| [2.7](2.7.story.md) | Car Tags                              | Draft  | 2.2          |
| [2.8](2.8.story.md) | Reverse Geocoding for Display Address | Draft  | 2.1          |

**Key Deliverables:**

- One-tap spot saving with GPS
- Photo capture with compression + EXIF stripping
- Notes and car tags
- Address display via reverse geocoding

---

## Epic 3: Navigation & Spot Retrieval

**Goal:** Help users navigate back to their parked car and view history.

| Story               | Title                            | Status | Dependencies |
| ------------------- | -------------------------------- | ------ | ------------ |
| [3.1](3.1.story.md) | View Latest Spot on Map          | Draft  | 2.1          |
| [3.2](3.2.story.md) | Navigate to Spot (External Maps) | Draft  | 3.1          |
| [3.3](3.3.story.md) | Spot History List                | Draft  | 2.1          |
| [3.4](3.4.story.md) | Spot Detail View                 | Draft  | 3.3          |
| [3.5](3.5.story.md) | Delete Spot                      | Draft  | 3.4          |
| [3.6](3.6.story.md) | Search and Filter History        | Draft  | 3.3          |

**Key Deliverables:**

- Interactive map with spot marker
- Navigation links to Google/Apple Maps
- Paginated history with virtual scrolling
- Search/filter by date, tag, address

---

## Epic 4: Sharing & Meter Timer

**Goal:** Enable spot sharing and parking meter reminders.

| Story               | Title                         | Status | Dependencies |
| ------------------- | ----------------------------- | ------ | ------------ |
| [4.1](4.1.story.md) | Generate Share Link           | Draft  | 3.4          |
| [4.2](4.2.story.md) | View Shared Spot (Public)     | Draft  | 4.1          |
| [4.3](4.3.story.md) | Set Meter Expiry Time         | Draft  | 2.2          |
| [4.4](4.4.story.md) | Meter Timer Countdown Display | Draft  | 4.3          |
| [4.5](4.5.story.md) | Meter Expiry Notification     | Draft  | 4.4          |

**Key Deliverables:**

- Shareable spot links (24h expiry)
- Public spot view page
- Meter timer with countdown
- Browser notifications for expiry

---

## Epic 5: Privacy, Settings & Polish

**Goal:** User settings, data management, privacy compliance, and final polish.

| Story                 | Title                                         | Status | Dependencies  |
| --------------------- | --------------------------------------------- | ------ | ------------- |
| [5.1](5.1.story.md)   | Settings Screen                               | Draft  | 1.5           |
| [5.2](5.2.story.md)   | Manage Car Tags                               | Draft  | 2.7, 5.1      |
| [5.3](5.3.story.md)   | Data Retention Preferences                    | Draft  | 5.1           |
| [5.4](5.4.story.md)   | Download My Data (Export)                     | Draft  | 5.1           |
| [5.5](5.5.story.md)   | Delete All My Data                            | Draft  | 5.1, 1.5      |
| [5.6](5.6.story.md)   | Delete Account                                | Draft  | 5.5, 1.2, 1.3 |
| [5.7](5.7.story.md)   | Auto-Delete Old Photos (Storage Cleanup)      | Draft  | 2.3           |
| [5.8](5.8.story.md)   | Auto-Delete Expired Spots (Retention Cleanup) | Draft  | 5.3, 5.7      |
| [5.9](5.9.story.md)   | Privacy Policy and Terms Pages                | Draft  | 5.1           |
| [5.10](5.10.story.md) | Final Polish and Cross-Browser Testing        | Draft  | All           |

**Key Deliverables:**

- Settings with account management
- Data export (JSON)
- Data/account deletion
- Automated cleanup jobs
- Privacy policy and terms
- Cross-browser testing + Lighthouse audit

---

## Development Order

Stories should be implemented in order within each epic. Cross-epic dependencies:

```
Epic 1 ──────────────────────────────────────────────────────────►
         │
         └──► Epic 2 ────────────────────────────────────────────►
                    │
                    └──► Epic 3 ─────────────────────────────────►
                               │
                               └──► Epic 4 ──────────────────────►
                                          │
                                          └──► Epic 5 ───────────►
```

---

## Technology Stack

| Layer    | Technology           | Version     |
| -------- | -------------------- | ----------- |
| Frontend | React + TypeScript   | 19.x, 5.7.x |
| Build    | Vite                 | 6.x         |
| Styling  | Tailwind CSS         | 4.x         |
| State    | Zustand              | 5.x         |
| Backend  | Express + TypeScript | 5.x         |
| Database | PostgreSQL (Neon)    | 17.x        |
| ORM      | Drizzle              | 0.38.x      |
| Storage  | Cloudflare R2        | -           |
| Testing  | Vitest + Playwright  | 3.x, 1.50.x |
| Hosting  | Vercel               | -           |

---

## Story Status Legend

| Status      | Meaning                            |
| ----------- | ---------------------------------- |
| Draft       | Story defined, not started         |
| Approved    | Reviewed and ready for dev         |
| In Progress | Currently being implemented        |
| Review      | Implementation complete, in review |
| Done        | Merged to main                     |

---

## Validation History

| Date       | Epic       | Result  | Fixes Applied |
| ---------- | ---------- | ------- | ------------- |
| 2026-01-15 | Epic 2     | ✅ Pass | 3 fixes       |
| 2026-01-15 | Epic 3     | ✅ Pass | 4 fixes       |
| 2026-01-15 | Epic 4     | ✅ Pass | 1 fix         |
| 2026-01-15 | Epic 5     | ✅ Pass | 5 fixes       |
| 2026-01-15 | Cross-Epic | ✅ Pass | 3 fixes       |

**Total validation fixes:** 16

---

## Quick Commands

```bash
# Start development
pnpm install
pnpm dev

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format

# Build for production
pnpm build
```

---

_Generated by PO Sarah on January 15, 2026_
