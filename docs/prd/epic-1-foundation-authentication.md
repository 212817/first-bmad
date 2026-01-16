# Epic 1: Foundation & Authentication

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
