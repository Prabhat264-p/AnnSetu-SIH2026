# AnnSetu — Data Model & Entity Specifications

This document defines the core data entities, TypeScript contracts, and relationship flows in **AnnSetu**.

---

## 1. Entity Relationship & Data Flow

```
FarmerProfile (User)
       │
       ▼
   Booking (Slot)
       │
       ▼
ProcurementCentre (Master Data)
       │
       ▼
     Token (Digital QR Token)
       │
       ▼
QueueEntry (Live Processing Queue)
       │
       ▼
ProcurementRecord (Completed MSP Transaction)
```

---

## 2. Core Entities

### User & AuthSession (`src/types/user.ts`)
- **`User`**: Base user account representing a Farmer, Operator, or Admin.
  - Fields: `id`, `name`, `mobile`, `role` (`FARMER` | `OPERATOR` | `ADMIN`), `language`, `districtCode`, `stateCode`, `demoScenarioId`.
- **`AuthSession`**: Active authentication session wrapper.

### FarmerProfile (`src/types/farmer.ts`)
- Represents a registered farmer's profile.
- Fields: `id`, `userId`, `name`, `mobile`, `state`, `district`, `block`, `village`, `pinCode`, `latitude`, `longitude`, `locationSource` (`PROFILE` | `GPS` | `DEMO`), `crops`.

### ProcurementCentre (`src/types/centre.ts`)
- Master data entity representing a physical procurement yard.
- Fields:
  - `id`: Internal unique string (e.g. `'cnt_sinnar'`, `'cnt_reg_178876'`).
  - `officialId`: Official government identifier string (e.g. `'MH-NSK-PRC-001'`, `'BR-PTN-DEMO-01'`).
  - `name`: Human-readable centre name.
  - `stateCode`, `districtCode`, `block`, `village`: LGD location codes.
  - `latitude`, `longitude`: Geographical coordinates.
  - `supportedCrops`: Array of crop names accepted.
  - `dailyCapacity`: Daily intake limit in quintals.
  - `counters`, `activeCounters`: Operating counter status.
  - `status`: `OPEN` | `BUSY` | `OVERLOADED` | `CLOSED`.
  - `currentQueue`, `processingCount`, `completedToday`, `estimatedWaitingTime`.

### Slot (`src/types/booking.ts`)
- Time slot allocation for scheduling centre visits.
- Fields: `id`, `centreId`, `date` (`YYYY-MM-DD`), `timeSlot`, `capacity`, `bookedCount`, `remainingCapacity`, `estimatedWait`.

### Token (`src/types/token.ts`)
- Digital pass issued to a farmer upon booking a slot.
- Fields: `id`, `tokenNumber` (e.g. `'WHT-08432'`), `farmerId`, `farmerName`, `centreId`, `centreName`, `crop`, `quantityQuintals`, `date`, `timeSlot`, `queuePosition`, `status` (`SCHEDULED` | `CONFIRMED` | `ARRIVED` | `VERIFIED` | `CALLED` | `PROCESSING` | `COMPLETED` | `CANCELLED`), `counterAssigned`, `qrData`.

### ProcurementRecord (`src/types/procurement.ts`)
- Financial and quality audit record created upon completing intake.
- Fields: `id`, `tokenId`, `tokenNumber`, `farmerName`, `centreId`, `crop`, `quantityQuintals`, `moisturePercentage`, `qualityGrade`, `mspRatePerQuintal`, `totalPayoutRupees`, `paymentStatus`, `timestamp`, `operatorId`.

### DemoScenario (`src/types/demo.ts`)
- Demonstration scope entity for multi-role consistency.
- Fields: `id`, `stateCode`, `stateName`, `districtCode`, `districtName`, `createdAt`.

---

## 3. Centre Master Architecture & Resolution

To guarantee data consistency across Farmer, Operator, and Admin views, all portals resolve centre objects using the canonical `centreResolver` service (`src/services/centre/centreResolver.ts`):

- **`resolveCentreById(id, centres)`**: Looks up a centre by matching any canonical property: `c.id`, `c.officialId`, `c.centreId`.
- **`getCentreSafe(id, centres)`**: Safely resolves a centre object with automatic fallback to prevent `undefined` property access (`officialId` crash prevention).
