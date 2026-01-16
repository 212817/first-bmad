# Epic 5: Privacy, Settings & Polish

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
