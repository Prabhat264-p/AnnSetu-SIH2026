# AnnSetu (SIH26032 | GRAINX) — SIH Final Presentation & Live Demo Guide

---

## 1. Demo Core Principle & Problem-Solution Story

### Core Presentation Story:
> **"Farmers should never have to travel to a procurement yard and wait in an uncertain physical queue just to learn when their turn will come."**

---

### End-to-End Workflow:
$$\text{Farmer Location} \longrightarrow \text{Smart Recommendation} \longrightarrow \text{Scheduled Slot} \longrightarrow \text{Digital Token} \longrightarrow \text{Live Queue} \longrightarrow \text{Operator Intake} \longrightarrow \text{District Admin Impact}$$

---

## 2. Configured SIH Demo Scenario (`DEMO-BR-PAT-001`)

| Entity | Demo Attribute / Value | Location Scope |
| :--- | :--- | :--- |
| **Demo Scenario ID** | `DEMO-BR-PAT-001` | Shared Patna District Scope |
| **State** | Bihar (`BR`) | Bihar (`BR`) |
| **District** | Patna (`BR_PAT`) | Patna (`BR_PAT`) |
| **Sub-District / Block** | Fatwah (`BR_PAT_FAT`) | Fatwah (`BR_PAT_FAT`) |
| **Procurement Centre** | `Musallahpur APMC Mandi Sthal` (`cnt_patna` / `BR-PAT-PRC-001`) | Patna (`BR_PAT`) |
| **Farmer Account** | **Phone**: `9876543210` \| **OTP**: `123456` \| **Name**: `Ramesh Kumar` | Fatwah, Patna |
| **Centre Operator Account** | **Centre ID**: `cnt_patna` \| **Username**: `operator` \| **Pass**: `demo123` | Musallahpur Yard, Patna |
| **District Admin Account** | **Admin ID**: `DEMO-ADMIN-PATNA` \| **Pass**: `demo123` | District HQ, Patna |

---

## 3. Step-by-Step 15-Step Presentation Demo Script (5–8 Minutes Target)

```
+-----------------------------------------------------------------------------------+
|                            ANNSETU LIVE DEMO SEQUENCE                              |
+-----------------------------------------------------------------------------------+
|  [01. Role Select] ──> [02. Farmer OTP] ──> [03. Location Filter]                 |
|                                                      │                            |
|                                                      ▼                            |
|  [06. Token Issued] <── [05. Slot Select] <── [04. Smart Recommendation]          |
|          │                                                                        |
|          ▼                                                                        |
|  [07. Live Queue] ──> [08. Switch Operator] ──> [09. Call Next]                   |
|                                                      │                            |
|                                                      ▼                            |
|  [12. Record Created] <── [11. Weighing/Quality] <── [10. Verify Farmer]          |
|          │                                                                        |
|          ▼                                                                        |
|  [13. Switch Admin] ──> [14. District Analytics] ──> [15. Impact Summary]        |
+-----------------------------------------------------------------------------------+
```

### STEP 1: Role Selection Page (0:00 - 0:30)
- **Action**: Open `http://localhost:3000` (or production host). Point out the role selection cards: **Farmer**, **Centre Operator**, and **District Admin**.
- **Script**: *"Welcome to AnnSetu. Our platform solves agricultural procurement congestion by connecting Farmers, Centre Operators, and District Administrators into one unified, scheduled queue ecosystem."*

### STEP 2: Farmer Login & OTP Verification (0:30 - 1:00)
- **Action**: Click **Farmer**, enter phone `9876543210`, enter demo OTP `123456`.
- **Script**: *"The farmer logs in seamlessly using their mobile number. The system restores their verified profile, location, and crop preferences."*

### STEP 3: Farmer Location Selection & Cascading Lookup (1:00 - 1:30)
- **Action**: Show State (`Bihar`), District (`Patna`), Block (`Fatwah`). Demonstrate that changing District dynamically updates available procurement centres without stale data.
- **Script**: *"Farmers can easily filter procurement yards by State, District, and Sub-district using official Local Government Directory (LGD) data."*

### STEP 4: Smart Centre Recommendation (1:30 - 2:15)
- **Action**: Click **Find Centre** / **Smart Recommendation**. Point out the recommendation card and the score breakdown.
- **Script**: *"Instead of picking a random yard, AnnSetu's Multi-Criteria Decision Algorithm recommends the optimal centre by balancing 5 real-time factors: Estimated Waiting Time (30%), Distance (25%), Available Slots (20%), Yard Capacity (15%), and Crop Compatibility (10%)."*

### STEP 5: Date & Slot Selection (2:15 - 2:45)
- **Action**: Select an upcoming date and an available hourly time slot (e.g. `10:00 AM - 11:00 AM`, 25 Quintals Wheat).
- **Script**: *"The farmer picks a convenient 1-hour arrival slot based on real-time yard capacity, preventing crowding during peak arrival hours."*

### STEP 6: Digital Token Generation (2:45 - 3:15)
- **Action**: Confirm booking. Display the generated **Digital Token** (e.g. `WHT-52414`), QR code, arrival window, and assigned queue position.
- **Script**: *"Upon booking, the farmer receives a tamper-proof Digital Token with a QR code and assigned queue number. This token replaces the uncertainty of standing in a physical line."*

### STEP 7: Live Queue Tracking (3:15 - 3:45)
- **Action**: View the **Live Queue** status (`CONFIRMED` / `WAITING`). Point out the estimated wait time indicator and active counter assignments.
- **Script**: *"The farmer can monitor the live yard queue from their home or tractor, arriving at the centre only when their token is called."*

### STEP 8: Operator Portal Login (3:45 - 4:15)
- **Action**: Open new tab/window or logout, log in as **Centre Operator** (`cnt_patna` / `operator` / `demo123`).
- **Script**: *"Now let me switch to the Procurement Centre Operator at Musallahpur APMC Mandi."*

### STEP 9: Operator Dashboard & Call Next (4:15 - 4:45)
- **Action**: View Operator Live Queue dashboard. Click **Call Next** to transition the farmer's token from `WAITING` to `CALLED` (Counter 1).
- **Script**: *"The operator sees today's scheduled arrivals and calls the next farmer in line. The farmer's mobile screen instantly updates to CALLED."*

### STEP 10: Farmer Verification & Document Check (4:45 - 5:15)
- **Action**: Click **Verify Farmer**. Inspect land records, crop type, and identity details.
- **Script**: *"The operator verifies the farmer's identity and land quota in seconds."*

### STEP 11: Quality, Moisture & Weighbridge Entry (5:15 - 5:45)
- **Action**: Enter Moisture Content (`11.8%`), Quality Grade (`Grade A`), Actual Weight (`24.8 Q`), Net Weight (`24.5 Q`). Point out automated MSP payout calculation (`₹55,625`).
- **Script**: *"At the weighbridge, the operator records moisture content and net weight. The system automatically computes the total MSP payout."*

### STEP 12: Procurement Completion & Record Logging (5:45 - 6:15)
- **Action**: Click **Complete Procurement**. Show the generated Procurement Record in **Procurement Records** tab.
- **Script**: *"With one click, the procurement transaction completes, issuing an instant receipt to the farmer and updating yard inventory."*

### STEP 13: District Admin Login & District Scope (6:15 - 6:45)
- **Action**: Logout and log in as **District Admin** (`DEMO-ADMIN-PATNA` / `demo123`).
- **Script**: *"Finally, let's log in as the District Magistrate / District Admin for Patna."*

### STEP 14: District Overview & Analytics (6:45 - 7:30)
- **Action**: Show **Overview**, **Centres**, **Farmers**, **Tokens**, and **Analytics** pages. Highlight total procurement volume, yard utilization rates, and average queue waiting times.
- **Script**: *"The District Admin gets real-time, district-scoped command visibility across all procurement yards in Patna without waiting for manual paper reports. Server-side security guarantees strict district data isolation."*

### STEP 15: Impact Summary & Conclusion (7:30 - 8:00)
- **Action**: Navigate to Role Selection / Impact summary.
- **Script**: *"AnnSetu transforms government grain procurement: Farmers save hours of waiting, yard operators eliminate bottlenecks, and district officials gain complete transparency."*

---

## 4. Judge-Friendly Feature Explanations

### A. Smart Centre Recommendation:
> *"AnnSetu does not simply select the nearest centre. It uses a Multi-Criteria Decision Model combining Distance (25%), Waiting Time (30%), Available Slots (20%), Yard Capacity (15%), and Crop Compatibility (10%) to prevent single-centre congestion."*

### B. Digital Token & QR Pass:
> *"The Digital Token acts as a smart arrival pass. It guarantees the farmer's queue position and eliminates physical queue squatting."*

### C. Live Queue Tracking:
> *"Farmers track their queue status in real time on their mobile devices, arriving at the yard only when called."*

### D. Operator Intake Workflow:
> *"Yards operate with digital counter management, automated MSP settlement calculation, and instant digital receipt generation."*

### E. District Admin Governance:
> *"District administrators monitor procurement volume, yard capacity, and farmer throughput with strict server-side district isolation."*

---

## 5. Technology & Architecture Reference

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express (Route ➔ Controller ➔ Service ➔ Data architecture)
- **Data Layer**: In-Memory Resilient Store (`server/data/db.ts`) with MongoDB adapter
- **Security**: District-Scoped Authentication Middleware (`getAdminDistrictScope`)

---

## 6. Pre-Flight Checklist & Demo Recovery Path

### Pre-Flight Checklist (Run 10 Minutes Before Presentation):
- [x] Backend running on `http://localhost:3000` (`npx tsx server.ts`).
- [x] Frontend running / build verified (`npm run build`).
- [x] Active Demo Scenario set to `DEMO-BR-PAT-001` (Bihar ➔ Patna).
- [x] Farmer login verified (`9876543210` / `123456`).
- [x] Operator login verified (`cnt_patna` / `operator` / `demo123`).
- [x] Admin login verified (`DEMO-ADMIN-PATNA` / `demo123`).
- [x] Browser console clean (0 uncaught errors).

### Live Demo Recovery Path:
> If a demo transaction is interrupted or a presenter makes an accidental input error:
> 1. Click **Reset Demo** (`POST /api/demo/reset`) from the Dev/Admin menu.
> 2. All transient bookings and queue tokens reset instantly while preserving location master, demo accounts, and active scenario.
> 3. Return to **Farmer Login** and proceed smoothly.

---
