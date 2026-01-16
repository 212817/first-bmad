# Goals and Background Context

### Goals

- **Deliver a frictionless parking spot saver** that enables users to save their location in ≤5 seconds
- **Enable instant navigation back** to saved spots via Google/Apple Maps deep links
- **Provide cross-device sync** through Google/Apple OAuth while supporting Guest mode for quick access
- **Achieve 60% activation rate** — new users save at least one spot in first session
- **Maintain zero recurring costs** — run entirely on free-tier infrastructure
- **Support multi-car tagging and location sharing** for families and travelers
- **Ensure privacy-by-default** with 30-day retention, EXIF stripping, and easy data deletion

### Background Context

Urban drivers frequently forget where they parked, especially in large garages, unfamiliar streets, or while traveling. Existing solutions are either too heavy (native apps with unnecessary features) or too manual (photos lost in camera roll). This creates a high-frequency annoyance affecting millions of drivers weekly.

Modern web technology (PWAs, Geolocation API, OAuth) has matured enough to solve this elegantly without native app development. "Where Did I Park?" is a browser-based PWA that prioritizes speed and simplicity: one-tap save, optional photo/note, and instant navigation back. The project is a hobby/portfolio effort with zero budget for recurring costs, targeting organic growth through word-of-mouth.

### Change Log

| Date       | Version | Description                                                                                     | Author    |
| ---------- | ------- | ----------------------------------------------------------------------------------------------- | --------- |
| 2026-01-12 | 1.0     | Initial PRD draft from Project Brief                                                            | John (PM) |
| 2026-01-15 | 1.1     | Added TypeScript, Vite, ESLint/Prettier requirements; CLI testability ACs; data model reference | John (PM) |
| 2026-01-15 | 1.2     | Added CI/CD pipeline with GitHub Actions (free); PR checks for lint, format, tests              | John (PM) |

---
