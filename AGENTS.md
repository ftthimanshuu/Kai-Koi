# Kai Koi — Frontend Development Rules & Protocol

## Core Project Directives

1. **Learning-First Philosophy (Crucial)**:
   - This project is being built for the **user's active learning and deep understanding**.
   - Generating code that the user does not understand is strictly pointless.
   - For every piece of code, configuration, or architectural decision:
     - Clearly explain the **concepts**, the **why**, and how it works under the hood.
     - Avoid opaque "magic" or unexplained abstractions.
     - Break down architectural patterns (e.g., token interceptors, SVG coordinate math, state machines, MSW interception, headless UI primitives) in clear, approachable language.
     - Always invite questions and ensure complete comprehension before moving on.

2. **Step-by-Step Execution Only**:
   - **NEVER** attempt to generate multiple phases or the entire project in a single turn.
   - Build only the single current agreed-upon piece or step.
   - Test, verify, and present the completed step to the user.
   - **Always pause and await explicit user review, verification, and approval before proceeding to the next step.**

3. **Frontend & Backend Division of Responsibility**:
   - Repository: `https://github.com/ftthimanshuu/Kai-Koi` (monorepo layout, tracking branch `develop`).
   - Root directory structure:
     - `frontend/`: React 19 SPA, MSW mocks matching §10 contract, UI/UX, customer flows, and admin views (our focus).
     - `backend/`: Spring Boot + PostgreSQL + Razorpay webhooks (handled by the backend dev).
     - `docs/`: Shared API contract (`SPECIFICATION.md`) and project roadmaps.
   - We focus strictly on the `frontend/` codebase.
   - For backend/database needs, we provide explicit requirements, contract updates, schema specifications, and troubleshooting recommendations for the backend developer.
   - Build against the API specification defined in `docs/SPECIFICATION.md` (§10).
   - Use Mock Service Worker (MSW) handlers so frontend features are fully functional and verifiable before the real backend is connected.

4. **Strict Specification Delivery Sequence (SPECIFICATION.md §12)**:
   - **Phase F0**: Project scaffold & tooling (Vite + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Routing + State + MSW) [COMPLETED]
   - **Phase F1**: Design tokens, app shell (header, footer, nav), home page with mock data [COMPLETED]
   - **Phase F2**: Movies and shows (list, detail, session pickers), Restaurant page (date, party size, slot picker) [NEXT]
   - **Phase F3**: Universal SeatMap component (seats & tables, legend, summary, keyboard/ARIA, mobile zoom, live updates simulation)
   - **Phase F4**: Firebase project setup, auth pages (email + Google), AuthProvider with onAuthStateChanged, protected and role-gated routes
   - **Phase F5**: Hold → checkout → Razorpay Test Mode Checkout → confirmation with QR
   - **Phase F6**: Customer portal: My bookings, booking detail, cancellation with refund quote
   - **Phase F7**: Admin panel: dashboard, CRUD screens, sessions and slot generation
   - **Phase F8**: Admin layout editors (seat grid and restaurant floor plan)
   - **Phase F9**: Backend integration: Swap MSW for real Spring Boot API, generate types from OpenAPI, E2E tests

5. **Technical Constraints & Quality Guidelines**:
   - Stack: Vite + React 19 + TypeScript (strict) + Tailwind CSS + shadcn/ui + React Router + TanStack Query + Zustand.
   - Preserve type-safety with clean interfaces matching §9 and §10 of `SPECIFICATION.md`.
   - Maintain accessibility (WCAG 2.1 AA) and mobile responsiveness.
   - Timezone: Asia/Kolkata (IST), Currency: INR (paise integers formatted to ₹).

6. **Autonomous Command Execution & Git Restriction**:
   - Execute setup, installation, build, lint, and test commands autonomously to keep momentum without asking unnecessary permission.
   - **STRICT PROHIBITION**: You are **NEVER** allowed to execute Git modification commands (`git commit`, `git push`, `git reset`, `git checkout`, `git rebase`, `git merge`, `git branch -d`, etc.) on your own.
   - You may suggest Git commands and clear commit messages in your responses, but the user must execute all Git modifications manually.
