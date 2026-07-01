# Elo! Language Platform: Repository Notes & Core Architecture 🏛️

**Target Environment**: React 19 / Vite 6 / Vercel Serverless / Firestore NoSQL
**Design Philosophy**: Separated, decoupled, strict-mode asynchronous operations optimized for high-performance mobile and B2B client delivery.

---

## 1. Directory Topology

The repository relies on a strict separation of configuration, serverless edge routes, and interactive client layers. Do not extract client source logic into the root directory.

```text
├── .github/workflows/          # CI/CD automated validation pipelines
├── api/                        # Vercel Serverless Functions tier (Google, Resend APIs)
├── public/                     # Static assets, web manifests, and platform icons
├── src/                        # Isolated Client Application Layer
│   ├── components/             # Atomic UI structures (booking, dashboard, ui)
│   ├── lib/                    # SDK initializations & state machines (firestore, xp)
│   ├── pages/                  # Route-level view boundaries (AiCoachPage, LessonPage)
│   └── utils/                  # Safe date parsers & procedural sound logic
├── firestore.indexes.json      # Production query optimization manifests
├── firestore.rules             # Row-level protection matrices (request.auth.uid)
└── vercel.json                 # Serverless configuration, redirects, and Cron pipelines
```

---

## 2. Path Aliasing Configuration

To prevent fragile relative imports across the app, absolute paths are locked down in `tsconfig.json` and `vite.config.ts`. Always import internal modules using the `@` mapping namespace:

*   **`@/*`** -> maps to `/src/*`
*   **`@components/*`** -> maps to `/src/components/*`
*   **`@lib/*`** -> maps to `/src/lib/*`
*   **`@utils/*`** -> maps to `/src/utils/*`

---

## 3. Core Architectural Invariants

To prevent regressions during feature branches and B2B expansion, the following implementation patterns are non-negotiable:

### A. Non-Blocking Background Operations
All auxiliary API dispatches (e.g., transactional emails via Resend, background calendar syncs) must be completely decoupled from primary UI transactions. 
* Trigger them asynchronously (`fetch().catch()`).
* Do not block localized state mutations or hold up UI responsiveness for network flights.

### B. Defensive Date Manipulation (Safari Guardrail)
* Never pass hyphenated ISO strings directly into `new Date()` (crashes Safari date parsing engines).
* All chronological calculations must leverage manual split parsing via the global utility [dateParser.ts](file:///c:/Users/DELL%20I5%20DE%208%C2%BA/Soft%20Dev/elo-fluxa-rj/src/utils/dateParser.ts).
* Normalize all structural calendar views strictly against Rio de Janeiro local time strings (`America/Sao_Paulo`) prior to comparisons.

### C. State Mutability Rules
* Never mutate state collections directly via push arrays or raw assignments.
* All interactive view updates (such as grays, status shifts, or loading flags) must perform a functional update layout (`setX(prev => [...prev, newElement])`) to guarantee instant DOM updates across React 19 concurrent pipelines.

---

## 4. B2B Corporate Expansion Directives

To scale from B2C premium tiers to high-margin employee benefit seating contracts, the codebase supports structural tenancy:

1.  **Sub-Collection Scoping**: The core flat user schema (`/users/{uid}`) contains optional B2B properties to target corporate domains:
    *   `organizationId?: string;` (UUID of the company/enterprise partner)
    *   `corporateCredits?: number;` (Pre-allocated tutor hours or AI call tokens)
2.  **Defensive Validation**: The update profile pipeline [firestore.ts](file:///c:/Users/DELL%20I5%20DE%208%C2%BA/Soft%20Dev/elo-fluxa-rj/src/lib/firestore.ts) dynamically enforces type safety on B2B schema attributes before submitting documents to prevent data corruption.
3.  **Dynamic Corporate Modules**: The path structure inside your components supports loading corporate-specific configurations (e.g., locking/unlocking localized vocabulary hints based on company-wide professional focus domains).
