# AnnSetu — System Architecture & Component Design

## 1. Overview
**AnnSetu** is a Smart Procurement Scheduling & Queue Management platform designed to streamline agricultural procurement across India. It connects Farmers, Procurement Centre Operators, and District Administrators through real-time queue tracking, smart centre recommendations, automated slot allocations, and multi-district administrative isolation.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Client)                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      React Application                      │
│                           App.tsx                           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      AppContext Layer                       │
│                     (src/context/AppContext.tsx)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Services Layer                        │
│            apiService (src/services/api/apiService.ts)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Modular Express Backend                     │
│               (server.ts -> server/server.ts)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     server/routes/    server/controllers/  server/services/
            │                  │                  │
            └──────────────────┴──────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  In-Memory Data Store Layer                 │
│                     (server/data/db.ts)                     │
│      (dbCentres, dbTokens, dbFarmers, dbAdminAccounts, etc) │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Codebase Layering & Folder Structure

### Frontend (`src/`)
- **`src/pages/`**: Screen-level React components grouped by portal:
  - `public/`: Role selection & authentication pages ([RoleSelectionPage](file:///Users/prabhatkumar/antigravity/AnnSetu---Smart-Procurement-Scheduling-&-Queue-Management/src/pages/public/RoleSelectionPage.tsx), [RoleLoginPage](file:///Users/prabhatkumar/antigravity/AnnSetu---Smart-Procurement-Scheduling-&-Queue-Management/src/pages/public/RoleLoginPage.tsx)). *(Note: `LoginPage.tsx` is a legacy fallback component; active auth uses `RoleLoginPage.tsx`)*.
  - `farmer/`: Farmer dashboard, slot selection, token confirmation, live queue, booking history, profile management.
  - `operator/`: Centre operator dashboard, live queue processing, farmer verification, procurement intake.
  - `admin/`: District admin overview dashboard, centre management, farmers directory, token auditor, analytics, settings.
- **`src/components/`**: Reusable UI components:
  - `common/`: Top navbar, left sidebar, mobile navigation, notification drawer, error boundary, reset demo buttons.
  - `farmer/`: Digital token card, interactive map, printable pass, recommendation card, voice search components.
- **`src/context/`**: Global state management via React Context ([AppContext.tsx](file:///Users/prabhatkumar/antigravity/AnnSetu---Smart-Procurement-Scheduling-&-Queue-Management/src/context/AppContext.tsx)). Handles user authentication sessions, active location filters, notification listeners, and data refetching.
- **`src/services/`**: Frontend business logic and API client wrappers grouped by domain:
  - `api/`: REST API HTTP client wrapper ([apiService.ts](file:///Users/prabhatkumar/antigravity/AnnSetu---Smart-Procurement-Scheduling-&-Queue-Management/src/services/api/apiService.ts)).
  - `centre/`: LGD-based centre generation and canonical ID resolution ([centreResolver.ts](file:///Users/prabhatkumar/antigravity/AnnSetu---Smart-Procurement-Scheduling-&-Queue-Management/src/services/centre/centreResolver.ts)).
  - `location/`: Government of India LGD location hierarchy (36 States/UTs, Districts, Blocks).
  - `queue/`: Multi-counter M/M/c queuing theory and ETA prediction calculations.
  - `recommendation/`: Multi-criteria decision model for scoring nearby procurement centres.
  - `notification/`: Web Audio API synthesizer and SMS message generation.
  - `voice/`: Web Speech API speech recognition and natural language intent parsing.
- **`src/types/`**: TypeScript domain interfaces barrel-exported via `src/types/index.ts`.
- **`src/data/`**: Static seed data and demo initializers ([mockData.ts](file:///Users/prabhatkumar/antigravity/AnnSetu---Smart-Procurement-Scheduling-&-Queue-Management/src/data/mockData.ts)).

### Backend (`server/`)
- **`server/server.ts`**: Express application setup, middleware configuration, MongoDB connection, health check, and route mounting.
- **`server/config/`**: Server configuration and environment constants (`constants.ts`).
- **`server/data/`**: Single source of truth for in-memory backend databases (`db.ts`).
- **`server/middleware/`**: Authentication, authorization, and district scope security checks (`auth.middleware.ts`).
- **`server/routes/`**: Express route modules mapping API endpoints to controller handlers (`auth.routes.ts`, `centre.routes.ts`, `booking.routes.ts`, `token.routes.ts`, `operator.routes.ts`, `admin.routes.ts`, `dev.routes.ts`, `farmer.routes.ts`).
- **`server/controllers/`**: HTTP request handlers delegating to domain services.
- **`server/services/`**: Backend business logic domain services (`auth.service.ts`, `centre.service.ts`, `booking.service.ts`, `token.service.ts`, `queue.service.ts`, `procurement.service.ts`, `admin.service.ts`, `demo.service.ts`, `farmer.service.ts`, `notification.service.ts`).
- **`server/utils/`**: Backend helper functions (`helpers.ts`).

---

## 4. The Three Portals

1. **Farmer Portal**:
   - Allows farmers to register, view nearby centres on an interactive map, get AI recommendations, book procurement slots, receive digital QR tokens, and monitor live queue positions.
2. **Centre Operator Portal**:
   - Equipped for procurement centre operators to verify farmer details, check moisture levels, issue MSP procurement records, and call farmers forward through active counters.
3. **District Admin Portal**:
   - Provides district administrators with high-level command dashboards, centre congestion monitoring, procurement analytics, token audit logs, and counter allocation controls strictly scoped to their assigned district.

---

## 5. Shared Centre Architecture

A single, authoritative list of procurement centres (`dbCentres` in `server/data/db.ts`) serves as the ground truth across all three portals:

```
             Backend dbCentres Master (server/data/db.ts)
                             │
                             ▼
                 GET /api/centres Response
                             │
                             ▼
                    centreResolver Logic
             (Canonical officialId Resolution)
            /                │                \
           /                 │                 \
          ▼                  ▼                  ▼
    Farmer Portal     Operator Portal     Admin Portal
```

---

## 6. District Isolation & Data Security

Every District Admin session is bound to a specific `stateCode` and `districtCode` upon authentication. All administrative REST API endpoints (`/api/admin/*`) enforce strict server-side filtering (`server/middleware/auth.middleware.ts`) so that an Admin for Patna (`BR_PAT`) can only access data belonging to Patna, preventing data leaks across districts.

---

## 7. DemoScenario Architecture

To enable seamless live demonstrations, AnnSetu supports `DemoScenario` instances (`demoScenarioId`). When a demo scenario is activated (e.g. `DEMO-BR-PAT-001`), all created Farmers, Centres, Operators, and Admins automatically adopt the same `stateCode`, `districtCode`, and `demoScenarioId`, ensuring a coherent single-district demonstration environment.

---

## 8. Reset Demo Functionality

The "Reset Demo" button invokes `POST /api/dev/reset`. The reset operation preserves master location structures, official centres, and demo accounts, while clearing temporary queue tokens, active bookings, and transient notifications to restore the application to a pristine state.

---

## 9. Routing Implementation

AnnSetu uses a state-driven client-side routing model managed via `AppContext` and URL path state without external router dependencies. Page transitions are handled dynamically by rendering screen components conditionally based on `currentPath` and `currentUser` role.

---

## 10. Where Should I Make Changes?

| Requirement / Component | File Location |
| :--- | :--- |
| **Farmer Dashboard / Screens** | `src/pages/farmer/` |
| **Operator Dashboard / Live Queue** | `src/pages/operator/` |
| **District Admin Dashboard / Analytics** | `src/pages/admin/` |
| **Common UI (Navbar, Sidebar, Modal)** | `src/components/common/` |
| **Farmer UI (Tokens, Maps, Passes)** | `src/components/farmer/` |
| **Global State / Session Orchestration** | `src/context/AppContext.tsx` |
| **REST API Client Requests (Frontend)** | `src/services/api/apiService.ts` |
| **Backend Express Server Setup** | `server/server.ts` |
| **Backend Route Definitions** | `server/routes/` |
| **Backend Controllers** | `server/controllers/` |
| **Backend Domain Services** | `server/services/` |
| **Backend Data Stores (Single Source)** | `server/data/db.ts` |
| **Backend Auth & District Scope Security** | `server/middleware/auth.middleware.ts` |
| **Centre Resolution & ID Matching** | `src/services/centre/centreResolver.ts` |
| **Queue & ETA Algorithms** | `src/services/queue/queueEngine.ts` |
| **Smart Centre Recommendations** | `src/services/recommendation/recommendationEngine.ts` |
| **Location Master (LGD)** | `src/services/location/locationService.ts` |
| **Voice Search Recognition** | `src/services/voice/voiceService.ts` |
| **TypeScript Domain Contracts** | `src/types/` |
