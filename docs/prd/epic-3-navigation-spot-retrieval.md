# Epic 3: Navigation & Spot Retrieval

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
