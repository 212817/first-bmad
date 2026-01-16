# Where Did I Park? — Product Requirements Document (PRD)

**Created:** January 12, 2026  
**Author:** John (Product Manager)  
**Version:** 1.2  
**Status:** Draft

---

## Goals and Background Context

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

## Requirements

### Functional Requirements

**Authentication & User Management**

- **FR1:** Users can sign in with Google OAuth 2.0 to sync spots across devices
- **FR2:** Users can sign in with Apple (web) to sync spots across devices
- **FR3:** Users can use Guest mode (local-only storage via IndexedDB) without creating an account
- **FR4:** Guest mode displays a clear warning that data will not sync across devices
- **FR5:** Users can sign out and switch between accounts
- **FR6:** Users can delete their account and all associated data

**Spot Saving**

- **FR7:** Users can save their current GPS location with a single tap ("Save my spot")
- **FR8:** The app captures latitude, longitude, accuracy, and device timestamp on save
- **FR9:** Users can optionally take a photo directly in-app (stored in cloud only, not on device gallery)
- **FR10:** Users can optionally upload a photo from their device gallery
- **FR11:** Photos are compressed client-side to ~200KB max before upload
- **FR12:** EXIF metadata is stripped from photos before upload for privacy
- **FR13:** Users can add an optional text note (e.g., "P2, near elevator")
- **FR14:** Users can assign a car tag to each spot (e.g., "My Car", "Rental", "Partner's Car")
- **FR15:** Users can create, edit, and delete custom car tags
- **FR16:** Saved spots display a reverse-geocoded human-readable address
- **FR17:** The app shows a confirmation screen with spot preview after saving

**Meter Timer & Reminders**

- **FR18:** Users can set a meter expiry timer when saving a spot
- **FR19:** The app sends a browser notification before meter expiry (configurable lead time)
- **FR20:** For iOS Safari (limited notification support), users can export an ICS calendar reminder as fallback

**Navigation & Retrieval**

- **FR21:** Users can view their most recent saved spot prominently on the home screen
- **FR22:** Users can tap "Navigate" to open Google Maps or Apple Maps with walking directions to the saved spot
- **FR23:** The app detects the user's platform and offers the appropriate maps app
- **FR24:** Users can view their spot history (list of past saves)
- **FR25:** Users can search/filter spot history by date
- **FR26:** Users can delete individual spots from history

**Sharing**

- **FR27:** Users can share a spot link with another person (generates a shareable URL)
- **FR28:** Recipients can view the shared spot location and navigate to it without an account

**Privacy & Data Management**

- **FR29:** Users can view and edit their data retention preferences (default: 30 days)
- **FR30:** Spots older than the retention period are automatically deleted
- **FR31:** Users can download all their data (data export)
- **FR32:** Users can delete all their data with one action
- **FR33:** Photos are stored with signed URLs that expire; no permanent public links

**Fallbacks & Error Handling**

- **FR34:** If location permission is denied, users can manually enter an address
- **FR35:** If camera permission is denied, users can upload from gallery
- **FR36:** If geocoding fails, the app displays coordinates instead of address
- **FR37:** The app gracefully handles network errors with user-friendly messages

### Non-Functional Requirements

**Performance**

- **NFR1:** Median time from app open to spot saved must be ≤5 seconds
- **NFR2:** Photo upload must complete in ≤3 seconds on 4G connection
- **NFR3:** App initial load time must be ≤3 seconds on 4G connection

**Reliability**

- **NFR4:** Core save/navigate flow must have 99.5% uptime
- **NFR5:** No critical bugs blocking core functionality for 7 consecutive days before launch

**Compatibility**

- **NFR6:** App must work on Chrome, Safari (iOS/macOS), Firefox, and Edge (latest 2 versions)
- **NFR7:** App must be mobile-first responsive; iOS Safari and Android Chrome are primary targets
- **NFR8:** App must function on desktop browsers as secondary target

**Security**

- **NFR9:** All traffic must use HTTPS
- **NFR10:** App must implement CSRF protection
- **NFR11:** App must prevent XSS attacks through proper input sanitization
- **NFR12:** Auth tokens must not be stored in localStorage; use session-only cookies
- **NFR13:** JWT session tokens must expire appropriately

**Privacy**

- **NFR14:** EXIF metadata must be stripped from all uploaded photos
- **NFR15:** Default data retention is 30 days; user can configure shorter/longer
- **NFR16:** No tracking of home/work patterns; location data is user-initiated only

**Accessibility**

- **NFR17:** App must meet WCAG 2.1 AA basics (contrast, large tap targets, screen reader support)
- **NFR18:** Primary CTAs must have minimum 44x44px touch targets

**Infrastructure & Cost**

- **NFR19:** All services must use permanent free tiers (not trials)
- **NFR20:** Only acceptable recurring cost is domain (~$10-15/year)
- **NFR21:** When photo storage approaches 10GB limit, oldest photos are auto-deleted globally
- **NFR22:** Geocoding results must be cached to stay within 2,500 requests/day limit

---

## User Interface Design Goals

### Overall UX Vision

A **speed-first, mobile-optimized** experience that feels as fast as taking a screenshot. The interface should be brutally simple: one giant "Save my spot" button dominates the home screen. Everything else is secondary. The app should feel like a utility, not a social platform—no unnecessary engagement features, just solve the problem and get out of the user's way.

### Key Interaction Paradigms

- **One-tap primary action:** Save spot is always one tap away
- **Progressive disclosure:** Optional features (photo, note, timer) appear after location is captured
- **Confirmation with preview:** Show what was saved before dismissing
- **Deep link navigation:** Hand off to native maps apps rather than building map UI
- **Minimal authentication friction:** Guest mode for first use; login prompt only when sync is needed

### Core Screens and Views

1. **Home Screen / Save Spot**
   - Prominent "Save my spot" CTA
   - Current/last saved spot summary card
   - Quick access to navigate back

2. **Save Confirmation Screen**
   - Map preview thumbnail (static image or coordinates)
   - Address (reverse geocoded)
   - Options: Add photo, Add note, Set timer, Select car tag
   - "Done" and "Navigate Now" CTAs

3. **Spot History Screen**
   - List of saved spots (most recent first)
   - Each item shows: address/coordinates, timestamp, car tag, thumbnail
   - Swipe or tap to delete
   - Search/filter by date

4. **Spot Detail Screen**
   - Full address and coordinates
   - Photo (if attached)
   - Note (if attached)
   - Timer status (if set)
   - Navigate, Share, Delete actions

5. **Settings Screen**
   - Account info (signed in as...)
   - Sign in / Sign out
   - Manage car tags
   - Data retention preference
   - Download my data
   - Delete all data
   - Privacy policy / Terms links

6. **Login Screen**
   - "Continue with Google" button
   - "Continue with Apple" button
   - "Continue as Guest" option
   - Brief value proposition text

### Accessibility

**WCAG 2.1 AA** — Focus on:

- Sufficient color contrast (4.5:1 for normal text)
- Large tap targets (minimum 44x44px for all interactive elements)
- Screen reader compatibility for core flows
- Focus indicators for keyboard navigation

### Branding

Minimal, clean, utilitarian aesthetic:

- **Primary color:** A calming blue or green (trust, navigation)
- **Accent:** High-contrast action color for primary CTA
- **Typography:** System fonts for performance; large, readable sizes
- **Icons:** Simple, universally recognizable (pin, camera, car, share)
- **No heavy branding** — the app should feel like a tool, not a brand experience

### Target Device and Platforms

**Web Responsive (Mobile-First)**

- Primary: iOS Safari, Android Chrome (mobile)
- Secondary: Desktop browsers (Chrome, Safari, Firefox, Edge)
- Optional: PWA "Add to Home Screen" for app-like experience

---

## Technical Assumptions

### Repository Structure

**Monorepo** — Single repository containing both frontend and backend code. Recommended for solo developer or small team; simplifies deployment and reduces coordination overhead.

### Service Architecture

**Modular Monolith** deployed on serverless/edge platform:

- **Frontend:** React SPA (Vite + TypeScript) hosted on Vercel (static + edge functions)
- **Backend:** Node.js API (Express or Fastify) with TypeScript — can be Vercel serverless functions or separate service on Railway/Render
- **Database:** PostgreSQL on Supabase or Neon (free tier)
- **File Storage:** Cloudflare R2 (S3-compatible, 10GB free)
- **Auth:** OAuth 2.0 via Google and Apple (handled client-side with token validation on backend)

This is effectively a simple 3-tier architecture, not microservices. All backend logic can live in a single deployable unit.

### Language & Tooling

- **TypeScript** for both frontend and backend (strict mode enabled)
- **Vite** as the frontend build tool (fast HMR, optimized builds)
- **ESLint** for code linting (with TypeScript rules)
- **Prettier** for code formatting (consistent style across codebase)
- **Shared ESLint/Prettier config** at monorepo root

### CI/CD Pipeline

**GitHub Actions** (free tier: 2,000 minutes/month for private repos, unlimited for public repos)

**On every Pull Request:**

- Run Prettier check (fail if unformatted code)
- Run ESLint (fail on errors)
- Run unit tests (both FE and BE)
- Build check (ensure TypeScript compiles without errors)

**On merge to main:**

- All PR checks pass (required)
- Auto-deploy to Vercel (frontend + backend)

**Configuration:**

- `.github/workflows/ci.yml` — PR checks workflow
- Branch protection on `main` — require PR checks to pass before merge
- No paid services — GitHub Actions free tier is sufficient for this project

### Testing Requirements

**Unit + Integration Testing:**

- Unit tests for core business logic (spot saving, timer calculations, data transformations)
- Integration tests for API endpoints
- E2E testing for critical flows (save spot, navigate, auth) — can be manual initially
- No requirement for full testing pyramid in MVP; prioritize coverage of core flows

### Additional Technical Assumptions and Requests

- **Cloudflare R2** for photo storage with signed URLs for secure, time-limited access
- **OpenCage API** for reverse geocoding (2,500 req/day free); cache results in database
- **Client-side image compression** using browser Canvas API before upload
- **IndexedDB** for Guest mode local storage
- **JWT tokens** for session management; short expiry with refresh
- **Environment variables** for all secrets and API keys (never committed)
- **CORS** configured appropriately for API access
- **Rate limiting** on API endpoints to prevent abuse
- **Scheduled job** (cron or serverless scheduled function) for photo cleanup when approaching storage limit
- **Type-safe API contracts** — shared types between frontend and backend
- **Strict TypeScript** — `strict: true` in tsconfig for both FE and BE
- **Pre-commit hooks** (optional) — Husky + lint-staged for automated linting/formatting

### Data Model Reference

See [Project Brief - High-Level Data Model](brief.md) for entity definitions:

| Entity          | Key Fields                                                                                |
| --------------- | ----------------------------------------------------------------------------------------- |
| **User**        | id, auth_provider, email, created_at                                                      |
| **ParkingSpot** | id, user_id, lat, lng, saved_at, note, photo_url, meter_expires_at, car_tag, address_text |
| **CarTag**      | id, user_id, name, is_default                                                             |

---

## Epic List

Based on the MVP scope, here are the proposed epics in logical, sequential order:

| Epic       | Title                       | Goal                                                                                               |
| ---------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| **Epic 1** | Foundation & Authentication | Establish project infrastructure, deploy skeleton app, implement Google/Apple OAuth and Guest mode |
| **Epic 2** | Core Spot Saving            | Enable users to save their parking location with optional photo, note, and car tag                 |
| **Epic 3** | Navigation & Spot Retrieval | Allow users to view saved spots, navigate back via maps deep links, and manage spot history        |
| **Epic 4** | Sharing & Meter Timer       | Enable spot sharing with others and meter expiry reminders with notifications                      |
| **Epic 5** | Privacy, Settings & Polish  | Implement data management features, settings screen, and final polish for launch                   |

**Rationale:**

- **4 main content epics + 1 polish epic** keeps scope manageable
- Each epic delivers deployable, testable functionality
- Epic 1 establishes foundation so subsequent epics can build incrementally
- Core value (save + navigate) is delivered by end of Epic 3
- Sharing and timer are valuable but secondary; grouped in Epic 4
- Privacy controls and settings are critical for launch but can be built last

---

## Epic 1: Foundation & Authentication

**Goal:** Establish the project infrastructure with a deployable skeleton app, implement user authentication via Google OAuth, Apple Sign-In, and Guest mode. By the end of this epic, users can sign in, sign out, and the app is deployed to production with CI/CD.

---

### Story 1.1: Project Setup and Deployment Pipeline

**As a** developer,  
**I want** a fully configured monorepo with React frontend and Node.js backend deployed to production,  
**so that** I have a foundation to build features on with confidence that changes deploy automatically.

**Acceptance Criteria:**

1. Monorepo initialized with React frontend (Vite + TypeScript) and Node.js backend (Express or Fastify + TypeScript)
2. ESLint and Prettier configured at monorepo root with shared config for both FE and BE
3. TypeScript strict mode enabled (`strict: true`) in both frontend and backend tsconfig
4. Frontend deployed to Vercel with automatic deploys on push to main branch
5. Backend deployed (Vercel serverless functions or Railway) with automatic deploys
6. PostgreSQL database provisioned on Supabase or Neon with connection configured
7. Environment variables configured for all environments (dev, production)
8. Basic health check endpoint (`GET /api/health`) returns 200 OK
9. Health check endpoint testable via curl: `curl http://localhost:3000/api/health` returns `{"status": "ok"}`
10. Frontend displays a simple "Where Did I Park?" heading and confirms API connectivity
11. README documents local development setup, linting commands, and deployment process
12. `npm run lint` and `npm run format` scripts work from monorepo root
13. GitHub Actions CI workflow (`.github/workflows/ci.yml`) configured to run on PRs:
    - Prettier format check
    - ESLint check
    - Unit tests (`npm test`)
    - TypeScript build check
14. Branch protection enabled on `main` requiring CI checks to pass before merge
15. CI uses only GitHub Actions free tier (no paid services)

---

### Story 1.2: Google OAuth Sign-In

**As a** user,  
**I want** to sign in with my Google account,  
**so that** my parking spots sync across all my devices.

**Acceptance Criteria:**

1. Login screen displays "Continue with Google" button
2. Clicking button initiates Google OAuth 2.0 flow
3. After successful authentication, user is redirected back to app
4. Backend validates Google ID token and creates/retrieves user record in database
5. User session is established with JWT token (stored in httpOnly cookie)
6. App displays user's email/name after sign-in
7. User record includes: id, email, auth_provider ('google'), created_at
8. Errors during auth flow display user-friendly messages
9. Auth endpoints testable via curl/Postman with documented request/response examples

---

### Story 1.3: Apple Sign-In

**As a** user on an Apple device,  
**I want** to sign in with my Apple ID,  
**so that** I can use my preferred authentication method and sync my spots.

**Acceptance Criteria:**

1. Login screen displays "Continue with Apple" button (proper Apple branding)
2. Clicking button initiates Sign in with Apple web flow
3. After successful authentication, user is redirected back to app
4. Backend validates Apple identity token and creates/retrieves user record
5. User session is established with JWT token
6. Handles Apple's privacy email relay (hidden email) appropriately
7. Works correctly on Safari iOS and other browsers
8. Errors during auth flow display user-friendly messages

---

### Story 1.4: Guest Mode

**As a** user who doesn't want to create an account,  
**I want** to use the app without signing in,  
**so that** I can quickly save my parking spot without friction.

**Acceptance Criteria:**

1. Login screen displays "Continue as Guest" option
2. Selecting Guest mode skips authentication and proceeds to home screen
3. Guest mode displays a persistent banner/indicator showing "Guest Mode - Data stored locally only"
4. App initializes IndexedDB for local storage
5. Guest users can access all spot-saving features (to be built in Epic 2)
6. A prompt encourages signing in to enable sync (non-blocking, dismissible)
7. Guest mode state persists across browser sessions until user signs in

---

### Story 1.5: Sign Out and Account Switching

**As a** signed-in user,  
**I want** to sign out of my account,  
**so that** I can switch accounts or protect my data on a shared device.

**Acceptance Criteria:**

1. Settings or profile area includes "Sign Out" option
2. Signing out clears the session (removes JWT cookie)
3. User is returned to login screen after sign out
4. Any locally cached data remains until explicitly deleted
5. User can sign in with a different account after signing out
6. Guest mode users see "Sign In" instead of "Sign Out"

---

## Epic 2: Core Spot Saving

**Goal:** Enable users to save their parking location with GPS coordinates, optional photo (stored in cloud, not on device), optional text note, and car tag. Spots are stored in the database for authenticated users or IndexedDB for guests.

---

### Story 2.1: Capture and Save GPS Location

**As a** user,  
**I want** to save my current location with one tap,  
**so that** I can quickly mark where I parked.

**Acceptance Criteria:**

1. Home screen displays a prominent "Save my spot" button
2. Tapping the button requests location permission (with clear value message)
3. If permission granted, captures latitude, longitude, and accuracy from Geolocation API
4. Saves spot to database (authenticated) or IndexedDB (guest) with timestamp
5. If location permission denied, displays fallback option (manual address entry - Story 2.6)
6. Shows loading indicator while capturing location
7. Spot data includes: id, user_id, lat, lng, accuracy_meters, saved_at (UTC)
8. After successful save, proceeds to confirmation screen
9. API endpoint `POST /api/spots` testable via curl with JSON body: `{"lat": 40.7128, "lng": -74.0060}`

---

### Story 2.2: Save Confirmation Screen

**As a** user,  
**I want** to see a confirmation of my saved spot,  
**so that** I know the save was successful and can add optional details.

**Acceptance Criteria:**

1. Confirmation screen displays after successful location capture
2. Shows the saved coordinates (lat/lng)
3. Shows timestamp of when spot was saved
4. Provides options to: Add photo, Add note, Set car tag, Set timer (timer in Epic 4)
5. "Done" button returns to home screen
6. "Navigate Now" button opens maps app with directions (to be functional in Epic 3)
7. Screen is skippable - user can tap "Done" immediately for fastest flow

---

### Story 2.3: Optional Photo Capture

**As a** user,  
**I want** to take a photo of my parking spot,  
**so that** I have a visual reminder (especially useful in garages).

**Acceptance Criteria:**

1. Confirmation screen shows "Add Photo" option
2. Tapping opens camera using getUserMedia API (not native camera app)
3. Photo is captured directly in browser, not saved to device gallery
4. Photo is compressed client-side to ≤200KB using Canvas API
5. EXIF metadata is stripped from photo before processing
6. Photo is uploaded to Cloudflare R2 with signed URL
7. Photo URL is saved with the spot record
8. Upload completes in ≤3 seconds on 4G; shows progress indicator
9. If camera permission denied, shows "Upload from Gallery" fallback

---

### Story 2.4: Photo Upload from Gallery

**As a** user who denied camera permission or prefers gallery photos,  
**I want** to upload a photo from my device,  
**so that** I can still attach a visual to my parking spot.

**Acceptance Criteria:**

1. "Upload from Gallery" option available on confirmation screen
2. Opens device file picker for images
3. Selected photo is compressed and EXIF-stripped same as camera capture
4. Photo is uploaded to Cloudflare R2
5. Works on all supported browsers (iOS Safari, Android Chrome, desktop)
6. Handles large photos gracefully (resize before compression if needed)

---

### Story 2.5: Optional Note Field

**As a** user,  
**I want** to add a text note to my parking spot,  
**so that** I can record details like floor number or landmarks.

**Acceptance Criteria:**

1. Confirmation screen shows "Add Note" text input
2. Note field accepts free-form text (max 500 characters)
3. Note is saved with the spot record
4. Note displays on spot detail and history views
5. Note is optional - spot saves without it
6. Placeholder text suggests examples: "P2, near elevator", "Blue pillar", "Row G"

---

### Story 2.6: Manual Address Entry Fallback

**As a** user who denied location permission,  
**I want** to manually enter an address,  
**so that** I can still save my parking spot.

**Acceptance Criteria:**

1. When location permission is denied, show "Enter address manually" option
2. Text input accepts free-form address
3. Address is geocoded to coordinates using OpenCage API
4. Geocoding result is cached in database to conserve API quota
5. If geocoding fails, allow saving with address text only (no coordinates)
6. User is informed that navigation may be less accurate without GPS

---

### Story 2.7: Car Tags

**As a** user with multiple vehicles,  
**I want** to tag each parking spot with a car label,  
**so that** I can distinguish between different vehicles.

**Acceptance Criteria:**

1. Confirmation screen shows car tag selector
2. Default tags available: "My Car", "Rental", "Other"
3. Users can create custom car tags (saved to their profile)
4. Selected car tag is saved with the spot record
5. Car tag displays in spot history and detail views
6. Car tag is optional - defaults to "My Car" if not changed
7. Users can manage (add/edit/delete) custom tags in settings (Epic 5)

---

### Story 2.8: Reverse Geocoding for Address Display

**As a** user,  
**I want** to see a human-readable address for my saved spot,  
**so that** I can understand where I parked without reading coordinates.

**Acceptance Criteria:**

1. After saving a spot with GPS coordinates, fetch address from OpenCage API
2. Cache the geocoded address in the spot record
3. Display address on confirmation screen, spot detail, and history
4. If geocoding fails or quota exceeded, fall back to displaying coordinates
5. Geocoding happens asynchronously - don't block the save flow
6. Handle rate limits gracefully (queue, retry, or skip)

---

## Epic 3: Navigation & Spot Retrieval

**Goal:** Allow users to view their saved spots, navigate back to them via Google/Apple Maps deep links, and manage their spot history.

---

### Story 3.1: Display Latest Spot on Home Screen

**As a** user,  
**I want** to see my most recent parking spot on the home screen,  
**so that** I can quickly navigate back without extra taps.

**Acceptance Criteria:**

1. Home screen shows a card with latest saved spot
2. Card displays: address (or coordinates), timestamp, car tag, photo thumbnail (if exists)
3. Card shows "Navigate" button prominently
4. If no spots saved, show empty state with prompt to save first spot
5. Latest spot updates immediately after new save
6. For guest mode, pulls from IndexedDB; for authenticated, from database

---

### Story 3.2: Navigate to Spot via Maps Deep Link

**As a** user,  
**I want** to tap "Navigate" and get walking directions in my preferred maps app,  
**so that** I can find my way back to my car.

**Acceptance Criteria:**

1. "Navigate" button appears on latest spot card and spot detail screen
2. Tapping opens a deep link to Google Maps or Apple Maps with walking directions
3. On iOS, prefer Apple Maps; on Android and others, prefer Google Maps
4. Deep link format: Google Maps: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=walking`
5. Deep link format: Apple Maps: `https://maps.apple.com/?daddr={lat},{lng}&dirflg=w`
6. If coordinates unavailable (address-only spot), use address in deep link
7. Works correctly on all supported browsers and platforms

---

### Story 3.3: Spot History List

**As a** user,  
**I want** to view all my saved parking spots,  
**so that** I can find a previous location or review my parking history.

**Acceptance Criteria:**

1. History screen accessible from navigation/menu
2. Displays list of spots in reverse chronological order (newest first)
3. Each list item shows: address/coordinates, timestamp, car tag, photo thumbnail
4. Tapping a spot opens spot detail screen
5. List is scrollable with smooth performance (virtualization if needed)
6. For authenticated users, fetches from database with pagination
7. For guests, fetches from IndexedDB
8. Empty state shown if no spots exist

---

### Story 3.4: Spot Detail Screen

**As a** user,  
**I want** to view the full details of a saved spot,  
**so that** I can see the photo, note, and all information about that parking location.

**Acceptance Criteria:**

1. Accessible by tapping a spot in history or latest spot card
2. Displays: full address, coordinates, timestamp, car tag
3. Displays photo at full/larger size (if attached)
4. Displays note text (if attached)
5. Shows timer status if timer was set (Epic 4)
6. Action buttons: Navigate, Share (Epic 4), Delete
7. "Navigate" uses same deep link logic as Story 3.2

---

### Story 3.5: Delete Individual Spot

**As a** user,  
**I want** to delete a parking spot I no longer need,  
**so that** I can keep my history clean.

**Acceptance Criteria:**

1. Delete option available on spot detail screen
2. Confirmation dialog before deletion ("Are you sure?")
3. Deleting removes spot from database/IndexedDB
4. If spot has a photo, photo is deleted from Cloudflare R2
5. User is returned to history screen after deletion
6. Deletion is immediate; no undo (confirmed by dialog)

---

### Story 3.6: Search and Filter Spot History

**As a** user,  
**I want** to search or filter my spot history by date,  
**so that** I can find a specific parking location from the past.

**Acceptance Criteria:**

1. History screen includes date filter/picker
2. User can filter spots by date range or specific date
3. Filtered results update the list immediately
4. "Clear filter" option to show all spots again
5. Works with both database and IndexedDB storage
6. Performant even with many spots (use indexed queries)

---

## Epic 4: Sharing & Meter Timer

**Goal:** Enable users to share their parking spot with others and set meter expiry reminders with browser notifications (and ICS fallback for iOS).

---

### Story 4.1: Share Spot Link

**As a** user,  
**I want** to share my parking spot with someone else,  
**so that** they can find the car (e.g., partner picking up).

**Acceptance Criteria:**

1. "Share" button available on spot detail screen and confirmation screen
2. Generates a shareable URL with unique spot identifier
3. Uses Web Share API where supported; fallback to copy-to-clipboard
4. Shared link works without requiring recipient to have an account
5. Shared spot view shows: address, coordinates, photo (if any), "Navigate" button
6. Shared links expire after 7 days for privacy
7. Rate limit on share link generation to prevent abuse

---

### Story 4.2: View Shared Spot (Public View)

**As a** recipient of a shared parking spot,  
**I want** to view the location and navigate to it,  
**so that** I can find the car.

**Acceptance Criteria:**

1. Shared link opens a public page (no auth required)
2. Page displays: address/coordinates, photo thumbnail (if any), timestamp
3. "Navigate" button opens maps deep link with walking directions
4. Page indicates this is a shared spot
5. If link is expired or invalid, show appropriate error message
6. Minimal UI - just enough to navigate

---

### Story 4.3: Set Meter Timer

**As a** user with metered parking,  
**I want** to set a reminder for when my meter expires,  
**so that** I don't get a parking ticket.

**Acceptance Criteria:**

1. Confirmation screen shows "Set Timer" option
2. User can input duration (minutes) or select preset (30min, 1hr, 2hr)
3. Timer expiry time is calculated and saved with spot record
4. Timer countdown displays on spot detail and home screen
5. Meter expiry is stored as UTC timestamp
6. Timer is optional - most spots won't have one

---

### Story 4.4: Browser Notification for Timer

**As a** user with a meter timer set,  
**I want** to receive a notification before my meter expires,  
**so that** I have time to return or add more time.

**Acceptance Criteria:**

1. App requests notification permission when timer is set
2. Notification fires 10 minutes before expiry (configurable in future)
3. Notification includes: "Meter expiring soon!" and spot address
4. Clicking notification opens the app to spot detail
5. Works on Chrome, Firefox, Edge, and Android browsers
6. If notification permission denied, inform user and suggest ICS fallback

---

### Story 4.5: ICS Calendar Reminder Fallback

**As a** user on iOS Safari (limited notification support),  
**I want** to export a calendar reminder for my meter,  
**so that** I still get alerted before expiry.

**Acceptance Criteria:**

1. When timer is set on iOS Safari, offer "Add to Calendar" option
2. Generates and downloads an ICS file with reminder event
3. Event includes: title "Parking Meter Expires", time, location
4. Reminder set for 10 minutes before expiry
5. Works on any browser as alternative to notifications
6. ICS file opens in default calendar app for import

---

## Epic 5: Privacy, Settings & Polish

**Goal:** Implement user settings, data management features (retention, export, delete), and final polish for launch-ready state.

---

### Story 5.1: Settings Screen

**As a** user,  
**I want** to access my settings,  
**so that** I can manage my account and preferences.

**Acceptance Criteria:**

1. Settings screen accessible from main navigation/menu
2. Shows account info: email, auth provider (Google/Apple/Guest)
3. Shows "Sign In" for guests, "Sign Out" for authenticated users
4. Links to: Manage car tags, Data retention, Privacy policy, Terms
5. Clean, organized layout matching app design
6. Works for both authenticated and guest users

---

### Story 5.2: Manage Car Tags

**As a** user,  
**I want** to create and manage custom car tags,  
**so that** I can organize my parking spots by vehicle.

**Acceptance Criteria:**

1. Accessible from Settings screen
2. Lists all car tags (default + custom)
3. User can add new custom tags
4. User can edit custom tag names
5. User can delete custom tags (default tags cannot be deleted)
6. Deleting a tag doesn't delete spots; spots keep the tag name as text
7. Changes sync to database for authenticated users

---

### Story 5.3: Data Retention Preferences

**As a** user,  
**I want** to control how long my parking data is retained,  
**so that** I can manage my privacy.

**Acceptance Criteria:**

1. Settings screen shows retention preference (default: 30 days)
2. Options: 7 days, 30 days, 90 days, 1 year, Never auto-delete
3. Changing preference saves to user profile
4. Backend cleanup job respects user preference
5. Spots older than retention period are automatically deleted (with photos)
6. Guest mode: retention enforced locally via app

---

### Story 5.4: Download My Data (Export)

**As a** user,  
**I want** to download all my parking data,  
**so that** I have a copy for my records.

**Acceptance Criteria:**

1. "Download my data" option in Settings
2. Generates a JSON file containing all user data: spots, tags, preferences
3. Includes photo URLs (or base64 images for offline access)
4. Download triggers immediately; no email required
5. Works for authenticated users; guest mode exports IndexedDB data
6. File is named with date: `where-did-i-park-export-2026-01-12.json`

---

### Story 5.5: Delete All My Data

**As a** user,  
**I want** to delete all my parking data,  
**so that** I can remove my information from the service.

**Acceptance Criteria:**

1. "Delete all my data" option in Settings
2. Confirmation dialog with clear warning
3. Deletes all spots, photos, and user record from database
4. Deletes all photos from Cloudflare R2
5. Signs user out after deletion
6. For guests, clears IndexedDB storage
7. Action is irreversible; dialog makes this clear

---

### Story 5.6: Delete Account

**As a** user,  
**I want** to delete my account entirely,  
**so that** I can stop using the service and remove my identity.

**Acceptance Criteria:**

1. "Delete Account" option in Settings (authenticated users only)
2. Confirmation dialog with warning
3. Deletes user record, all spots, all photos
4. Revokes OAuth connection where possible
5. Signs user out; returns to login screen
6. Cannot be undone

---

### Story 5.7: Auto-Delete Old Photos (Storage Cleanup)

**As a** system,  
**I want** to automatically delete the oldest photos when storage approaches the limit,  
**so that** the app continues to function without paid storage.

**Acceptance Criteria:**

1. Scheduled job runs daily (or triggered when approaching limit)
2. Checks total storage usage in Cloudflare R2
3. If usage exceeds 80% of 10GB limit, deletes oldest photos
4. Deletes photos by upload date regardless of user
5. Updates spot records to remove deleted photo URLs
6. Logs deletion activity for monitoring
7. No user notification for auto-deletion (documented in privacy policy)

---

### Story 5.8: Auto-Delete Expired Spots (Retention Cleanup)

**As a** system,  
**I want** to automatically delete spots past their retention date,  
**so that** user privacy is protected by default.

**Acceptance Criteria:**

1. Scheduled job runs daily
2. Finds spots older than user's retention preference
3. Deletes expired spots and associated photos
4. Respects "Never auto-delete" preference
5. Handles both per-user preferences and default (30 days)
6. Logs cleanup activity for monitoring

---

### Story 5.9: Privacy Policy and Terms Pages

**As a** user,  
**I want** to read the privacy policy and terms of service,  
**so that** I understand how my data is used.

**Acceptance Criteria:**

1. Privacy Policy page accessible from Settings and footer
2. Terms of Service page accessible from Settings and footer
3. Written in plain language, not legalese
4. Covers: data collected, how it's used, retention, deletion, third parties
5. Includes: EXIF stripping, photo storage, geocoding service
6. Pages are static content; can be markdown rendered
7. Links visible on login screen before sign-up

---

### Story 5.10: Final Polish and Cross-Browser Testing

**As a** user,  
**I want** a polished, bug-free experience across all supported browsers,  
**so that** the app works reliably on my device.

**Acceptance Criteria:**

1. App tested on: Chrome (Android + Desktop), Safari (iOS + macOS), Firefox, Edge
2. All critical flows work: save spot, photo capture, navigate, share, timer
3. No critical bugs blocking core functionality
4. Performance meets targets: ≤5s save, ≤3s photo upload
5. Responsive design works on all screen sizes (mobile, tablet, desktop)
6. Error states have user-friendly messages
7. Loading states have appropriate indicators
8. App is ready for soft launch

---

## Checklist Results Report

_To be completed after running pm-checklist before final PRD approval._

---

## Next Steps

### UX Expert Prompt

> **UX Expert:** Please review this PRD and create a Design Architecture document. Focus on mobile-first, speed-optimized UI with emphasis on the one-tap save flow. Key screens: Home/Save, Confirmation, History, Detail, Settings, Login. Target WCAG 2.1 AA accessibility. Branding should be minimal and utilitarian—this is a utility app, not a social platform.

### Architect Prompt

> **Architect:** Please review this PRD and create a Technical Architecture document. Key technical decisions: React frontend (Vercel), Node.js backend (Vercel functions or Railway), PostgreSQL (Supabase/Neon), Cloudflare R2 for photos, Google/Apple OAuth. Monorepo structure. All services must use free tiers. Focus on the core save flow performance (≤5s) and photo handling (client-side compression, EXIF stripping, signed URLs).

---

_Document generated by John (Product Manager) using BMAD methodology._
