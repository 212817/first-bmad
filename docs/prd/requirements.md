# Requirements

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
