# Kai Koi — Frontend Implementation Plan & Status Tracker

This document tracks the phased frontend delivery for the **Kai Koi** entertainment hub web application, strictly adhering to the delivery sequence defined in `docs/SPECIFICATION.md` §12.

---

## Operating Protocol
- **Repository & Team Structure**:
  - Remote: `https://github.com/ftthimanshuu/Kai-Koi` (monorepo, branch `develop`).
  - `frontend/`: Our focus — React 19 SPA, MSW mocks matching §10 contract, customer & admin UX.
  - `backend/`: Colleague focus — Spring Boot, PostgreSQL, Razorpay webhooks, Firebase Admin.
  - Inter-team handoff: Frontend defines API contracts (§10) via MSW handlers and issues requirements/fixes for backend dev.
- **Strictly Follow Specification (§12)**: Follow the exact phased sequence (F0 through F9).
- **Learning-First (Non-Negotiable)**: Every piece of code, pattern, and architectural choice must be clearly explained with the underlying concepts broken down. No unexplained "magic".
- **Strictly Step-by-Step**: Only work on one sub-step at a time. Never build future phases prematurely.
- **Verification Gate**: Each sub-step must be tested, run/verified, and approved by the user before moving to the next.

---

## Status Legend
- `[ ]` Not Started
- `[~]` In Progress
- `[x]` Completed & Verified

---

## Phase F0: Project Scaffold & Foundation [COMPLETED]
> Goal: Establish a modern, clean, and robust frontend foundation with Vite, React 19, TypeScript, Tailwind CSS, shadcn/ui primitives, routing, and MSW for offline/mock development.

- [x] **Step F0.1**: Initialize Vite + React 19 + TypeScript (strict mode) with absolute path aliases (`@/*`).
- [x] **Step F0.2**: Configure Tailwind CSS v4 and install base utility dependencies (`clsx`, `tailwind-merge`, `lucide-react`).
- [x] **Step F0.3**: Set up shadcn/ui theme configuration and initial essential UI primitives (Button, Input, Card, Dialog, Toast/Sonner).
- [x] **Step F0.4**: Configure Core Routing (`react-router`), State Management (`zustand`), Server State (`@tanstack/react-query`), and HTTP Client (`axios`).
- [x] **Step F0.5**: Set up MSW (Mock Service Worker) infrastructure for intercepting API calls based on `docs/SPECIFICATION.md` §10.
- [x] **Verification Checkpoint F0**: App builds cleanly, runs locally with `npm run dev`, displays layout shell with theme toggle, and MSW network interception is verified.

---

## Phase F1: Design Tokens, App Shell & Home Page [COMPLETED]
> Goal: Build the core visual identity, global navigation header, footer, responsive mobile navigation, and the rich public Home page with mock data.

- [x] **Step F1.1**: Refine design tokens in `src/index.css` (neutral dark/light mode surface tokens, vertical accents for Cinema, Shows, and Dining, typography scale).
- [x] **Step F1.2**: App Shell (`src/app/layouts/RootLayout.tsx`): Header, navigation links, brand logo, mobile slide-over navigation drawer, theme toggle, and footer.
- [x] **Step F1.3**: Home Page (`src/features/home/HomePage.tsx`): Hero banner, "Now Showing" movie cards with quick info, "Upcoming Shows" preview, and "Kai Koi Dining" overview cards powered by TanStack Query & MSW mock data.
- [x] **Verification Checkpoint F1**: App shell is fully responsive, theme switching works cleanly with no visual artifacts, and Home page renders mock data smoothly. *Phase F1 Complete.*

---

## Phase F2: Movies, Shows & Restaurant Browsing [NEXT]
> Goal: Dedicated catalog and detail pages for cinema screenings, live performances, and restaurant slot selection.

- [ ] **Step F2.1**: Movie listing page (`/movies`) with filters (language, genre, format, date) and Movie detail page (`/movies/:slug`) with poster, trailer, synopsis, and screenings grouped by date.
- [ ] **Step F2.2**: Shows listing (`/shows`) and show detail page (`/shows/:slug`) with performers, category, duration, age limit, and performances.
- [ ] **Step F2.3**: Restaurant page (`/restaurant`) with description, ambience gallery, opening hours, and date / party size / dining slot picker.
- **Verification Checkpoint F2**: Customer can browse all three verticals, filter by date/genre, and select a session to proceed to the map. *Awaiting user approval.*

---

## Phase F3: Universal Visual Seat & Table Map
> Goal: The core visual booking engine — an interactive, accessible SVG-based map rendering seats (cinema/shows) and tables (restaurant) with real-time selection.

- [ ] **Step F3.1**: Universal `<SeatMap>` component architecture (SVG grid rendering, tier color mapping, status styling: available, selected, held, booked, blocked).
- [ ] **Step F3.2**: Cinema & Show visual map (grid rows, labels A/B/C..., aisles, screen/stage markers, keyboard navigation & ARIA labels).
- [ ] **Step F3.3**: Restaurant floor plan map (tables 1/2/4/8 capacity, round/square/rect shapes, party size auto-filtering & best-fit outlines).
- [ ] **Step F3.4**: Mobile zoom and pan support (`react-zoom-pan-pinch`), price tier legend, and running selection summary bar with subtotal and "Proceed" CTA.
- [ ] **Step F3.5**: MSW seat-map fixtures for all 3 verticals and simulated live inventory updates.
- **Verification Checkpoint F3**: Map smoothly renders seats and tables, handles max unit selection rules, keyboard/touch navigation works. *Awaiting user approval.*

---

## Phase F4: Authentication & User Accounts (Firebase Auth)
> Goal: Complete user identity flow with Firebase Auth, email/password, Google sign-in, role management, and protected routes.

- [ ] **Step F4.1**: Firebase Client SDK setup (`firebase/auth`), auth environment config, and emulator/dev fallback.
- [ ] **Step F4.2**: Global Auth State Store (`useAuthStore`) managing user session, token getter for Axios interceptor, and role (`CUSTOMER`, `STAFF`, `ADMIN`).
- [ ] **Step F4.3**: Branded Login Page (`/login`) with email + password, validation (React Hook Form + Zod), Google sign-in button, and error alerts.
- [ ] **Step F4.4**: Sign-Up Page (`/signup`) and Forgot Password / Password Reset modal (`/forgot-password`).
- [ ] **Step F4.5**: Protected Route wrapper (`ProtectedRoute`) and Role-Gated Route wrapper (`RoleRoute`).
- [ ] **Step F4.6**: Customer Account / Profile Page (`/account`) & backend sync (`POST /api/v1/me/sync`).
- **Verification Checkpoint F4**: User can register, log in, sign in with Google, inspect session sync, and protected routes redirect unauthorized users. *Awaiting user approval.*

---

## Phase F5: Holds, Checkout & Payment (Razorpay Test Mode)
> Goal: Atomic unit holding, 10-minute hold countdown timer, checkout bill breakdown, and Razorpay test payment modal.

- [ ] **Step F5.1**: Atomic hold placement (`POST /api/v1/holds`) with 10-minute hold countdown timer banner and auto-expiry release.
- [ ] **Step F5.2**: Checkout Page (`/checkout/:holdId`): Session details, itemized bill (base + convenience fee + taxes), cancellation policy display, and customer contact form.
- [ ] **Step F5.3**: Razorpay Checkout in Test Mode (`checkout.js`): Order creation, test card / UPI payment modal, signature verification hook (`POST /api/v1/payments/verify`).
- [ ] **Step F5.4**: Booking Confirmation Page: Booking reference (e.g. `KK-7F3K9Q`), downloadable QR code (`qrcode.react`), session details, and print action.
- **Verification Checkpoint F5**: Customer can hold units, observe hold timer, pay in Razorpay Test Mode, and receive confirmed digital ticket with QR code. *Awaiting user approval.*

---

## Phase F6: Customer Portal ("My Bookings" & Cancellations)
> Goal: Customer account self-service for viewing tickets and processing cancellations.

- [ ] **Step F6.1**: "My Bookings" page (`/bookings`) with tabs: Upcoming, Past, Cancelled.
- [ ] **Step F6.2**: Detailed booking modal / page (`/bookings/:reference`) with live QR ticket for venue entry.
- [ ] **Step F6.3**: Cancellation quote calculator (`GET /api/v1/bookings/:reference/cancellation-quote`) and self-service cancellation flow with refund confirmation.
- **Verification Checkpoint F6**: Customer can review past/upcoming bookings, display QR tickets, and cancel an eligible booking. *Awaiting user approval.*

---

## Phase F7: Admin Operations Panel
> Goal: Comprehensive back-office interface for Kai Koi staff and managers.

- [ ] **Step F7.1**: Admin Layout Shell (`/admin/*`) with collapsible sidebar navigation, top bar, user profile/logout, and breadcrumbs.
- [ ] **Step F7.2**: Admin Dashboard (`/admin`): Metrics overview (today's sessions, occupancy rates, bookings count, revenue breakdown, quick actions).
- [ ] **Step F7.3**: Venues & Pricing Tiers Management (`/admin/venues`, `/admin/price-tiers`).
- [ ] **Step F7.4**: Movies & Live Shows Catalog CRUD (`/admin/movies`, `/admin/shows`).
- [ ] **Step F7.5**: Session Scheduling (`/admin/sessions`) with overlap prevention buffer, and Restaurant dining slot template generator.
- [ ] **Step F7.6**: Bookings Console (`/admin/bookings`) with search by reference/email/phone, booking details, manual refund action, and Staff check-in QR scanner (`/admin/checkin`).
- **Verification Checkpoint F7**: Admin panel is fully navigable, sessions can be scheduled, bookings can be inspected and refunded. *Awaiting user approval.*

---

## Phase F8: Admin Layout Editors
> Goal: Visual tools for building cinema seating grids and restaurant floor plans.

- [ ] **Step F8.1**: Seating Layout Editor (`/admin/venues/:id/layouts/seats`): Rows × columns grid generator, aisle/gap toggling, row labelling (A, B, C...), and tier assignment.
- [ ] **Step F8.2**: Restaurant Floor Plan Editor (`/admin/venues/:id/layouts/floor`): Drag-and-drop table placement (`@dnd-kit/core`), table shapes & capacities (1/2/4/8), and decorative fixtures.
- **Verification Checkpoint F8**: Layouts can be visually created, edited, and published. *Awaiting user approval.*

---

## Phase F9: Backend Integration & Production Hardening
> Goal: Connect real Spring Boot API and production hardening.

- [ ] **Step F9.1**: Swap MSW for the real Spring Boot REST API endpoints.
- [ ] **Step F9.2**: Real-time STOMP WebSocket client (`@stomp/stompjs`) subscribing to `/topic/sessions/:id/inventory`.
- [ ] **Step F9.3**: End-to-end integration testing, error boundaries, performance audit, and production build verification.
- **Verification Checkpoint F9**: Live multi-tab inventory sync verified against backend, production build clean.
