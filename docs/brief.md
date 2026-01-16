# Project Brief: Where Did I Park?

**Created:** January 12, 2026  
**Author:** Mary (Business Analyst)  
**Version:** 1.0

---

## Executive Summary

**Where Did I Park?** is a lightweight, web-based Progressive Web App (PWA) that helps urban drivers quickly save their parking location and navigate back to their car with minimal friction.

**Primary Problem:** Drivers frequently forget where they parked—especially in large garages, unfamiliar streets, or while traveling. Existing solutions are either too heavy (complex apps with unnecessary features) or too manual (photos lost in camera roll, scattered notes).

**Target Market:** Daily commuters, occasional drivers, and travelers who need a zero-install, frictionless way to mark and return to their parking spot.

**Key Value Proposition:** One-tap capture (location + optional photo + note) with instant navigation back via Google/Apple Maps—all from the browser, no app install required.

---

## Problem Statement

### Current State

Urban drivers regularly forget where they parked. This happens most frequently in:

- Large multi-level parking garages with confusing layouts
- Unfamiliar city streets when visiting or traveling
- Busy areas where rushed drivers skip taking mental notes

### Pain Points

- **Memory failure:** After shopping, meetings, or events, the exact parking spot slips from memory
- **Time wasted:** Walking aimlessly through garages or streets trying to locate the car
- **Stress & frustration:** Especially acute when running late, carrying heavy items, or in unsafe areas after dark
- **Meter anxiety:** Forgetting when parking expires leads to tickets

### Why Existing Solutions Fall Short

| Solution              | Problem                                                   |
| --------------------- | --------------------------------------------------------- |
| Native parking apps   | Too heavy—require install, accounts, unnecessary features |
| Photos in camera roll | Get lost among other photos; no navigation help           |
| Notes apps            | Manual entry, no map integration, easy to forget          |
| Car manufacturer apps | Only work with specific vehicles; often clunky            |
| Mental notes          | Unreliable, especially under stress or distraction        |

### Impact

While not life-threatening, this is a **high-frequency annoyance** affecting millions of drivers weekly. The cumulative time wasted and stress caused creates a clear opportunity for a frictionless solution.

### Urgency

With increasing urbanization and parking complexity (larger garages, more travel), this problem is growing. Web technology has matured enough (PWAs, Geolocation API, modern auth) to solve this elegantly without requiring native app development.

---

## Proposed Solution

### Core Concept

A browser-based Progressive Web App (PWA) that enables drivers to save their parking location in under 5 seconds and navigate back using their preferred maps app.

### How It Works

1. **Save** — One tap captures GPS coordinates; optionally snap a photo and add a note (e.g., "Level P2, near elevator")
2. **Timer** — Set a meter expiry reminder with browser notifications (or ICS calendar fallback for iOS)
3. **Return** — Tap "Navigate" to open Google Maps or Apple Maps with walking directions to your car
4. **Sync** — Sign in with Google or Apple to access your spots across devices; or use Guest mode (local only)

### Key Differentiators

| Differentiator         | Why It Matters                                                |
| ---------------------- | ------------------------------------------------------------- |
| **Zero install**       | Works instantly from any browser—no app store friction        |
| **Speed-first UX**     | Designed for ≤5 second save; big buttons, minimal steps       |
| **Photo + Note**       | Compensates for GPS inaccuracy in garages with visual context |
| **Privacy-by-default** | 30-day retention, EXIF stripping, easy data deletion          |
| **Multi-car tags**     | Families or rental users can label different vehicles         |
| **Shareable location** | Send your spot to a partner picking up the car                |

### Why This Will Succeed

- **Simpler than alternatives:** No bloated features, no subscriptions, no vendor lock-in
- **Modern web capabilities:** PWAs, Geolocation API, and OAuth have matured—native apps aren't required anymore
- **Solves a universal problem:** Everyone who drives in cities has experienced this; low barrier to virality
- **Graceful degradation:** Works even with permissions denied (manual address entry, photo upload)

### High-Level Vision

Start with a delightfully simple MVP, then expand to smart features (embedded maps, pin adjustment, offline sync) based on user feedback and usage patterns.

---

## Target Users

### Primary User Segment: Daily Commuters

**Profile:**

- Urban professionals who drive to work or transit hubs
- Park in large office garages, train station lots, or city streets
- Age 25-55, smartphone-savvy, time-constrained

**Current Behaviors:**

- Sometimes take photos of floor/zone signs (often forget)
- Rely on memory—fails after a long workday
- Occasionally use native notes apps (friction, no navigation)

**Pain Points:**

- Rushing in the morning → skip noting location
- End of day mental fatigue → forget where they parked
- Large garages with confusing layouts (P2A vs P2B)

**Goals:**

- Save location effortlessly when parking
- Get back to car quickly after work
- Avoid walking aimlessly through garage

---

### Secondary User Segment: Occasional Drivers & Weekend Users

**Profile:**

- Drive primarily for errands, shopping, events
- Park in malls, entertainment venues, airports
- Less routine—higher variability in parking locations

**Current Behaviors:**

- May take photos but lose them in camera roll
- "I'll remember" mentality—often fails
- Ask companions to remember (unreliable)

**Pain Points:**

- Infrequent parking = less developed mental habits
- Large mall garages are disorienting
- Often carrying bags/items → distracted when parking

**Goals:**

- Quick capture without interrupting their flow
- Navigate back even hours later after shopping/movie

---

### Tertiary User Segment: Travelers & Rental Car Users

**Profile:**

- Business travelers, vacationers, road trippers
- Unfamiliar cities, rental cars, airport long-term lots
- Higher stakes: missing a flight or meeting

**Current Behaviors:**

- Take rental car photos (plate, spot, row)
- Use native maps to drop a pin (clunky, often forget)
- Screenshot parking confirmations

**Pain Points:**

- Unfamiliar vehicle appearance (all rentals look alike)
- Airport lots are massive and confusing
- Returning days later—memory is useless

**Goals:**

- Reliable spot + photo that survives days
- Multi-car tags for rental vs. personal vehicle
- Share location with travel companions

---

## Goals & Success Metrics

### Business Objectives

- **Launch MVP within 3 months** — Validate core concept with real users quickly
- **Achieve 10,000 registered users in first 6 months** — Establish initial user base
- **Maintain <$500/month infrastructure costs at 10K users** — Prove lean, scalable model
- **Reach 60% activation rate** — New users save at least one spot in first session
- **Achieve 40% 30-day retention** — Users return and save 2+ spots within a month

### User Success Metrics

- **≥70% location permission opt-in rate** — Users trust the value proposition
- **≥50% camera permission opt-in rate** — Photo feature is compelling
- **≥30% navigate-back rate within 24 hours** — Users actually rely on the app to return
- **Median "open → save" time ≤5 seconds** — Speed promise is delivered
- **<5% support complaints about GPS accuracy** — Photo + note mitigates location issues

### Key Performance Indicators (KPIs)

| KPI                    | Definition                                               | Target             |
| ---------------------- | -------------------------------------------------------- | ------------------ |
| **Activation Rate**    | % of new users who save 1+ spot in first session         | ≥60%               |
| **Return Rate**        | % of spot saves that result in "Navigate" tap within 24h | ≥30%               |
| **Retention (30-day)** | % of users with 2+ saves in 30 days                      | ≥40%               |
| **Save Speed**         | Median time from app open to spot saved                  | ≤5 seconds         |
| **Permission Opt-in**  | Location ≥70%, Camera ≥50%                               | As stated          |
| **Share Rate**         | % of spots shared with another user                      | Track for insights |
| **Timer Usage**        | % of saves that include meter timer                      | Track for insights |

---

## MVP Scope

### Core Features (Must Have)

- **Google Sign-In:** OAuth 2.0 authentication for cross-device sync
- **Apple Sign-In:** Web-based Sign in with Apple (required for iOS users)
- **Guest Mode:** Local-only storage for users who skip login; warning about no sync
- **One-Tap Save:** Capture GPS coordinates with single tap; minimal friction
- **Photo Capture (Optional):** Take photo directly in-app—stored only in cloud, **not saved to phone gallery**. This saves device storage. Users can also upload from gallery if preferred. Client-side compression before upload.
- **Optional Note:** Free-text field (e.g., "P2, near elevator, blue pillar")
- **Multi-Car Tags:** Label spots by vehicle (e.g., "My Car", "Rental", "Partner's Car")
- **Meter Timer:** Set expiry time; browser notification reminder (with ICS fallback for iOS)
- **Reverse Geocoding:** Display human-readable address for saved spot
- **Navigate to Spot:** Deep link to Google Maps or Apple Maps with walking directions
- **Share Location:** Send spot link to another person (partner pickup scenario)
- **Spot History:** View recent saves; search by date; delete individual spots
- **Privacy Controls:** Delete all data; set retention preferences; download data export
- **EXIF Stripping:** Remove photo metadata by default for privacy

### Out of Scope for MVP

- ❌ Native mobile apps (iOS/Android) — web-first approach
- ❌ Offline-first with background sync — stretch goal post-MVP
- ❌ Embedded map view — use deep links only; consider Leaflet/OSM later
- ❌ AR navigation overlays — future innovation
- ❌ Garage/lot beacon integration — requires partnerships
- ❌ Crowdsourced lot information — needs critical mass of users
- ❌ Payment integrations — no monetization in MVP
- ❌ Admin/ops tooling — no abuse reports or deletion requests dashboard
- ❌ Push notifications via service worker — browser notifications only
- ❌ Multi-language support — English only for MVP

### MVP Success Criteria

The MVP is successful when:

1. **Users can save a spot in ≤5 seconds** from app open (median)
2. **≥60% of new users save at least one spot** in their first session
3. **≥30% of saves result in a "Navigate" tap** within 24 hours
4. **Photo upload completes in ≤3 seconds** on 4G connection
5. **App works reliably on Chrome, Safari (iOS/macOS), Firefox, and Edge**
6. **No critical bugs blocking core save/navigate flow** for 7 consecutive days

---

## Post-MVP Vision

### Phase 2 Features (3-6 months post-launch)

- **Offline-First with Sync:** Save spots locally when offline; auto-sync when connection returns. Essential for garage dead zones.
- **Embedded Map View:** Show saved spot on an interactive map (Leaflet/OpenStreetMap) without leaving the app.
- **Pin Adjustment:** Allow users to manually drag/adjust GPS pin for accuracy in garages.
- **Photo Gallery per Spot:** Multiple photos (entrance, floor sign, car position) for complex parking scenarios.
- **Smart Defaults:** Remember user's preferred car tag, default timer duration, etc.
- **PWA Install Prompt:** Encourage "Add to Home Screen" for faster access and app-like experience.

### Expansion Opportunities (To Be Explored Later)

| Opportunity                 | Description                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- |
| **B2B / Fleet**             | Valet services, rental agencies, corporate fleets—multi-user dashboards             |
| **Parking Payments**        | Integrate meter payments (Passport, ParkMobile APIs) — save + pay in one flow       |
| **EV Charging Integration** | Track charging spots; notify when car is ready                                      |
| **Monetization**            | Freemium model: free core features, premium for extended history, advanced features |

_Note: Long-term vision (AR, wearables, voice assistants, crowdsourced data) to be defined after MVP validation._

---

## Technical Considerations

### Platform Requirements

| Requirement          | Specification                                                           |
| -------------------- | ----------------------------------------------------------------------- |
| **Target Platforms** | Web (mobile-first responsive), optional PWA                             |
| **Browser Support**  | Chrome, Safari (iOS/macOS), Firefox, Edge — latest 2 versions           |
| **Mobile Priority**  | iOS Safari and Android Chrome are primary; desktop is secondary         |
| **Performance**      | Median "open → save" ≤5s; photo upload ≤3s on 4G                        |
| **Accessibility**    | WCAG 2.1 AA basics (contrast, large tap targets, screen reader support) |

### Technology Preferences

| Layer                | Choice                                                                      | Notes                                           |
| -------------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| **Frontend**         | React                                                                       | Modern SPA; mobile-first CSS                    |
| **Backend**          | Node.js (Express or Fastify)                                                | REST API                                        |
| **Database**         | PostgreSQL                                                                  | Free tier options available                     |
| **File Storage**     | **Cloudflare R2** (10 GB free forever) or **Backblaze B2** (10 GB free)     | No egress fees on R2; true free tier, not trial |
| **Auth**             | Google OAuth 2.0 + Sign in with Apple (web)                                 | Free                                            |
| **Hosting**          | **Vercel** (free tier) or **Railway** (free tier) or **Render** (free tier) | Generous free limits for hobby projects         |
| **Database Hosting** | **Supabase** (500 MB free) or **Neon** (512 MB free) or **Railway**         | Free PostgreSQL                                 |
| **Maps**             | Google Maps / Apple Maps deep links                                         | Free (no API calls needed for deep links)       |
| **Geocoding**        | **OpenCage** (2,500 req/day free) or **Nominatim** (free, self-rate-limit)  | Free reverse geocoding                          |

### Cost Strategy

| Principle                   | Implementation                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Zero recurring costs**    | All services on permanent free tiers (not trials)                                                      |
| **Only acceptable expense** | One-time domain purchase (~$10-15/year)                                                                |
| **Photo storage limit**     | When storage approaches limit, auto-delete oldest photos globally (by upload date, regardless of user) |
| **No commercial launch**    | Hobby/portfolio project; no monetization planned                                                       |

### Free Tier Limits to Monitor

| Service       | Free Limit             | Action When Exceeded                             |
| ------------- | ---------------------- | ------------------------------------------------ |
| Cloudflare R2 | 10 GB storage          | Delete oldest photos                             |
| Vercel        | 100 GB bandwidth/month | Should be sufficient for MVP                     |
| Supabase      | 500 MB database        | Monitor spot count; consider cleanup             |
| OpenCage      | 2,500 requests/day     | Cache addresses; fallback to coordinates display |

### Architecture Considerations

| Aspect                | Approach                                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| **Repository**        | Monorepo recommended (simpler for solo/small team)                        |
| **API Design**        | RESTful; JSON payloads; JWT session tokens                                |
| **Image Processing**  | Client-side compression (browser); aggressive resize to ~200KB max        |
| **Photo Cleanup Job** | Scheduled task: check storage usage, delete oldest photos when near limit |
| **Security**          | HTTPS everywhere; CSRF protection; XSS prevention                         |
| **Privacy**           | EXIF stripping; 30-day retention default; session-only auth               |
| **Guest Mode**        | IndexedDB for local storage; no server sync                               |

---

## Constraints & Assumptions

### Constraints

| Category             | Constraint                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| **Budget**           | $0 recurring costs. Only acceptable expense: domain purchase (~$10-15/year)  |
| **Timeline**         | MVP target: ~3 months (flexible; hobby project)                              |
| **Resources**        | Solo developer or very small team; no dedicated designer                     |
| **Technical**        | Web-only; no native apps. Must work within browser API limitations           |
| **Storage**          | 10 GB photo limit (Cloudflare R2 free tier); oldest photos deleted when full |
| **Database**         | ~500 MB limit (Supabase/Neon free tier); must design for efficiency          |
| **Geocoding**        | 2,500 requests/day (OpenCage free tier); must cache results                  |
| **iOS Safari**       | Limited notification support; camera restrictions in background tabs         |
| **No Admin Tooling** | No ops dashboard, abuse reports, or manual deletion requests in MVP          |

### Key Assumptions

**User Behavior:**

- Users will grant location permission when shown clear value proposition
- Users will grant camera permission when photo benefit is explained
- Most users will return to their car within 24 hours of saving
- Guest mode is acceptable trade-off: convenience vs. no sync

**Technical:**

- Browser Geolocation API provides sufficient accuracy for street parking
- GPS in garages will be unreliable → photo + note compensates
- Client-side image compression to ~200KB is acceptable quality for parking photos
- 30-day retention is sufficient for most use cases

**Platform:**

- PWA "Add to Home Screen" is optional enhancement, not required
- Deep links to Google/Apple Maps work reliably across devices
- Sign in with Apple web implementation is stable

**Business:**

- No monetization required; hobby/portfolio project
- User growth will be organic; no marketing budget
- Free tier limits are sufficient for early user base (<1,000 active users)

---

## Risks & Open Questions

### Key Risks

| Risk                                | Likelihood | Impact | Mitigation                                                       |
| ----------------------------------- | ---------- | ------ | ---------------------------------------------------------------- |
| **Permission denial (location)**    | Medium     | High   | Manual address entry fallback; clear value messaging on prompt   |
| **Permission denial (camera)**      | Medium     | Low    | Gallery upload fallback; photo is optional anyway                |
| **GPS inaccuracy in garages**       | High       | Medium | Encourage photo + note; future: pin adjustment feature           |
| **iOS Safari notification limits**  | High       | Medium | ICS calendar export fallback for meter reminders                 |
| **Storage limit hit**               | Medium     | Medium | Auto-delete oldest photos; aggressive compression; monitor usage |
| **Database limit hit**              | Low        | High   | Efficient schema; auto-cleanup of old spots; monitor growth      |
| **Free tier service changes**       | Low        | High   | Abstract storage/DB layers; document migration path              |
| **OAuth provider issues**           | Low        | High   | Support both Google + Apple; Guest mode as fallback              |
| **User confusion (multiple spots)** | Medium     | Low    | Always show "latest" prominently; clear history UI               |
| **Wrong spot saved**                | Medium     | Medium | Confirmation screen with preview; "Edit location" option         |

### Open Questions (Resolved)

| Question                  | Resolution                                    |
| ------------------------- | --------------------------------------------- |
| Allow guest mode in MVP?  | ✅ Yes — local-only storage with sync warning |
| Default data retention?   | ✅ 30 days                                    |
| Reverse geocoding in MVP? | ✅ Yes — display human-readable addresses     |
| Support multi-car tags?   | ✅ Yes — label spots by vehicle               |
| Share location feature?   | ✅ Yes — send spot link to partner            |
| Store photo EXIF?         | ✅ No — strip by default for privacy          |
| Admin/ops tooling?        | ✅ No — not in MVP                            |

### Remaining Open Questions

| Question                                 | Notes                                               |
| ---------------------------------------- | --------------------------------------------------- |
| Monorepo vs. separate repos?             | Team preference; recommend monorepo for simplicity  |
| Which specific free hosting?             | Vercel recommended for React; evaluate during setup |
| Domain name?                             | To be chosen; check availability                    |
| How to handle timezone for meter expiry? | Use device timezone consistently; store in UTC      |
| Analytics implementation?                | Simple event tracking; avoid heavy solutions        |
| Terms of Service / Privacy Policy?       | Need plain-language docs; template or custom?       |

### Areas Needing Further Research

- **Actual GPS accuracy testing** — Test in various environments (street, garage, airport) before finalizing UX
- **Photo compression quality** — Validate 200KB target maintains readability for parking signs
- **iOS Safari camera behavior** — Test `getUserMedia` in PWA context; document limitations
- **Sign in with Apple web setup** — Verify Apple Developer account requirements and costs
- **Cloudflare R2 integration** — Test S3-compatible API with signed URLs for photo retrieval

---

## Appendices

### A. Research Summary

_No formal market research, competitive analysis, or user interviews were conducted prior to this brief. The project is based on:_

- Personal experience with the parking problem
- Informal observation of existing solutions' shortcomings
- Technical feasibility assessment of browser capabilities

**Recommendation:** Consider lightweight validation before or during MVP development:

- Informal user interviews (5-10 drivers)
- Competitive analysis of existing parking apps
- Quick survey on parking habits

### B. Stakeholder Input

_This is a solo/hobby project. Primary stakeholder is the developer/owner._

No external stakeholder feedback to document at this stage.

### C. References

| Resource                 | Link/Note                                     |
| ------------------------ | --------------------------------------------- |
| Cloudflare R2 Pricing    | https://developers.cloudflare.com/r2/pricing/ |
| Vercel Free Tier         | https://vercel.com/pricing                    |
| Supabase Free Tier       | https://supabase.com/pricing                  |
| OpenCage Geocoding       | https://opencagedata.com/pricing              |
| Sign in with Apple (Web) | Apple Developer Documentation                 |
| Google OAuth 2.0         | Google Identity Documentation                 |
| Browser Geolocation API  | MDN Web Docs                                  |
| getUserMedia API         | MDN Web Docs                                  |

---

## Next Steps

### Immediate Actions

1. **Finalize domain name** — Check availability; purchase (~$10-15)
2. **Set up development environment** — Node.js, React, Git repo (monorepo recommended)
3. **Create accounts for free services:**
   - Cloudflare (R2 storage)
   - Vercel (hosting)
   - Supabase or Neon (PostgreSQL)
   - OpenCage (geocoding)
   - Google Cloud Console (OAuth)
   - Apple Developer (Sign in with Apple)
4. **Design basic wireframes** — Mobile-first; focus on save flow and navigation
5. **Build core save/retrieve flow first** — Location capture → storage → display
6. **Test Geolocation API** — Validate accuracy in target environments

### Development Priorities (Suggested Order)

| Phase         | Focus                | Deliverable                                         |
| ------------- | -------------------- | --------------------------------------------------- |
| **Week 1-2**  | Auth + basic UI      | Sign in with Google working; basic React shell      |
| **Week 3-4**  | Core save flow       | Location capture, photo capture, save to DB         |
| **Week 5-6**  | Navigation + history | Deep links to Maps; spot list view                  |
| **Week 7-8**  | Polish + extras      | Multi-car tags, sharing, meter timer, notifications |
| **Week 9-10** | Testing + launch     | Cross-browser testing; soft launch                  |

### PM Handoff

This Project Brief provides the full context for **Where Did I Park?**.

**Next document:** Create the PRD (Product Requirements Document) for detailed feature specifications, user stories, and acceptance criteria.

---

_Document generated by Mary (Business Analyst) using BMAD methodology._
