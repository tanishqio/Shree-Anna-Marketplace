# Authentication & Registration Flow Architecture

This document describes the hybrid authentication architecture used in the Shree Anna Marketplace, combining Supabase Auth for phone verification and a Python Backend for user management and business logic. It also details the "Developer Bypass" mechanism used for testing.

## 1. Architecture Overview

- **Frontend**: Next.js (React) - Handles UI, triggers Supabase Auth, and manages session state.
- **Auth Provider**: Supabase (GoTrue) - Handles sending SMS OTPs and verifying phone numbers.
- **Backend**: FastAPI (Python) - Manages user profiles, role-based access control (RBAC), and core business logic (listings, orders).
- **Database**: Supabase PostgreSQL - Shared database accessed by both Frontend (via Supabase Client) and Backend (via SQLModel).

### Core Components

1.  **`src/lib/api.ts` (Frontend)**: Central API client. available as `api` and `authApi`.
2.  **`src/lib/hooks/useAuth.tsx`**: React Context for managing user state (`user`, `isAuthenticated`).
3.  **`app/api/v1/auth.py` (Backend)**: Backend endpoints for auth, including `/auth/me` and JWT handling.
4.  **`app/core/security.py` (Backend)**: Middleware validating tokens and handling Developer Bypass.

---

## 2. Standard User Flow (Real Users)

### A. Registration / Login
1.  **User Entry**: User enters phone number on the frontend (e.g., `src/app/login/page.tsx`).
2.  **Request OTP**:
    - Frontend calls `authApi.requestOtp(phone)`.
    - `supabase.auth.signInWithOtp` is called.
    - Supabase sends an SMS to the user.
3.  **Verify OTP**:
    - User enters 6-digit OTP.
    - Frontend calls `authApi.verifyOtp(phone, otp)`.
    - `supabase.auth.verifyOtp` confirms the code.
    - **Success**: Supabase returns a session token.
4.  **Backend Synchronization**:
    - Frontend calls Backend (`/auth/verify-otp` or implicit sync via `/auth/me`).
    - **Check Profile**: Frontend checks `public.users` table. If user is new, it triggers an "Onboarding" flow (Name, District, Role).
    - **Save Profile**: User data is written to the database (e.g., `userApi.onboardFarmer`).

### B. Session Management
- Calls to the Backend use the **Access Token**.
- Backend middleware (`get_current_user`) verifies the token.

---

## 3. Developer Bypass Mechanism (Testing Flow)

To facilitate testing without defining real SMS quotas, a "Developer Mode" is implemented.

### How it Works
1.  **Trigger**: Use specific reserved phone numbers (e.g., `9876543210` for Farmer, `9876543214` for Admin).
2.  **Request OTP**:
    - `authApi.requestOtp` detects a dev number.
    - **Bypass**: Skips Supabase call. Returns success immediately.
    - Logs instruction: "Use OTP `000000`".
3.  **Verify OTP**:
    - User enters `000000`.
    - `authApi.verifyOtp` detects dev credentials.
    - **Token Generation**: Frontend generates a special token format: `dev-<role>-<phone>` (e.g., `dev-farmer-9876543210`).
    - **Backend Handshake**:
        - Frontend sets this `dev-` string as the local access token.
        - Frontend calls `GET /auth/me` with `Authorization: Bearer dev-...`.
4.  **Backend Handling (`security.py`)**:
    - The backend middleware detects the `dev-` prefix.
    - **Auto-Creation**: It checks if a user with this phone exists.
        - If **NO**: It automatically creates a new user in the database with the correct role and a UUID.
        - If **YES**: It retrieves the existing user.
    - Returns the **Real User Object** (with UUID) to the frontend.
5.  **State Sync**:
    - Frontend receives the real user object and updates the `AuthProvider` state.
    - Subsequent API calls (e.g., `createListing`) use the `dev-` token header but contain the correct user UUIDs in the payload/logic, ensuring full system compatibility.

---

## 4. Key Files & Logic

| Component | File Path | Responsibility |
|-----------|-----------|----------------|
| **Auth API** | `src/lib/api.ts` | `verifyOtp` logic, Dev token generation, Backend handshake (`/auth/me`). |
| **Auth Hook** | `src/lib/hooks/useAuth.tsx` | Persists session, handles logout. |
| **Security** | `app/core/security.py` | Validates `dev-` tokens, auto-creates dev users in DB. |
| **DB CRUD** | `app/db/crud.py` | Database operations for creating/fetching users. |

## 5. Troubleshooting Services in Dev Mode

If services (like creating listings) fail in Dev Mode:
1.  Ensure you are using the correct Dev Phone (see `src/lib/api.ts` for list).
2.  Ensure Backend is running (`npm run dev` AND `python main.py`).
3.  Check Backend Logs: Look for "Creating developer user for token..." or "User authenticated".
4.  If frontend shows "User not found", it means the handshake with `/auth/me` failed. Check network tab for 404/401 errors.
