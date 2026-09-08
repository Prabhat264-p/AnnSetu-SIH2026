# AnnSetu — Demo Mode & Scenario Architecture

This document details the Demo Mode functionality, shared `DemoScenario` bindings, and Reset Demo operations.

---

## 1. Demo Mode Overview

AnnSetu includes a built-in **Demo Mode** designed to allow stakeholders, evaluators, and developers to experience real-time procurement workflows across all three user roles (Farmer, Centre Operator, District Admin) in a shared demonstration district.

---

## 2. Shared Demo Scenario Concept

When running in Demo Mode, entities generated during the onboarding workflow belong to a single common district (e.g., **Bihar ➔ Patna / `BR_PAT`**):

- **Demo Scenario ID**: `DEMO-BR-PAT-001`
- **Demo State**: Bihar (`BR`)
- **Demo District**: Patna (`BR_PAT`)
- **Demo Block**: Fatwah
- **Demo Entities Created**:
  - **Demo Farmer**: `Ramesh Kumar Demo` (Fatwah Village)
  - **Demo Procurement Centre**: `AnnSetu Patna Master Demo Yard 01` (`BR-PTN-DEMO-01`)
  - **Demo Operator**: Operator bound to `BR-PTN-DEMO-01`
  - **Demo District Admin**: `Patna District Magistrate Demo` (`DEMO-ADMIN-PATNA`)

All entities store the active `demoScenarioId`, `stateCode`, and `districtCode`, establishing full data flow integration from Farmer slot booking to Operator intake to Admin metrics.

---

## 3. Reset Demo Operations

The **Reset Demo** functionality (`POST /api/dev/reset`) allows developers to reset the system to a clean demo baseline without destroying underlying location structures or master accounts.

### What Reset Demo Clears (Transient Activity):
- Temporary slot bookings created during the session
- Generated digital tokens (`WHT-*`)
- Live queue positions and waiting line entries
- Generated notifications and SMS simulations
- Temporary procurement intake records

### What Reset Demo Preserves (Master Baseline):
- Government LGD Location Master (36 States/UTs, Districts, Blocks)
- Official procurement centres (`INITIAL_CENTRES`)
- Active `DemoScenario` scope (`demoScenarioId`)
- Pre-configured demo user accounts (`DEMO-ADMIN-PATNA`, initial operator, initial farmer profile)

---

## 4. How to Trigger Reset Demo

1. **Via UI**: Click the "Reset Demo" button available in the top Navbar or on the Login screen.
2. **Via REST API**:
   ```bash
   curl -X POST http://localhost:3000/api/dev/reset \
     -H "Content-Type: application/json" \
     -d '{"mode": "DEMO"}'
   ```
