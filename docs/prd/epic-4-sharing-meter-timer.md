# Epic 4: Sharing & Meter Timer

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
