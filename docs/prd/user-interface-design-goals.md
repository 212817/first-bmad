# User Interface Design Goals

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
