# Epic 2: Core Spot Saving

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

### Story 2.9: Interactive Map with Marker Adjustment

**As a** user,  
**I want** to see an interactive map of my parking spot,  
**so that** I can verify the location and manually adjust it if GPS was inaccurate.

**Acceptance Criteria:**

1. Confirmation screen displays an interactive map instead of static placeholder
2. Map uses free tile provider (OpenStreetMap via Leaflet)
3. Map supports hybrid view (satellite imagery with street labels overlay)
4. User can toggle between street view and hybrid/satellite view
5. A draggable marker shows the saved parking location
6. User can drag marker to adjust location if GPS was inaccurate
7. Adjusted coordinates are saved when user confirms the change
8. Map is responsive and works on mobile devices

---
