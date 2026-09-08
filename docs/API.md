# AnnSetu — REST API Documentation

This document describes the active REST API endpoints implemented in `server.ts`.

---

## 1. Authentication Endpoints (`/api/auth/*`)

### `POST /api/auth/farmer/otp`
- **Purpose**: Sends OTP to farmer mobile number for verification.
- **Request Body**: `{ "mobile": "9876543210" }`
- **Response**: `{ "success": true, "message": "OTP sent successfully" }`

### `POST /api/auth/farmer/verify`
- **Purpose**: Verifies farmer OTP and restores/creates session.
- **Request Body**: `{ "mobile": "9876543210", "otp": "123456" }`
- **Response**: AuthSession object with `isAuthenticated: true`, `user`, `role: "FARMER"`, `token`.

### `POST /api/auth/register`
- **Purpose**: Registers a new Farmer profile.
- **Request Body**: Farmer registration data object.
- **Response**: `{ "success": true, "user": User, "farmerProfile": FarmerProfile }`

### `POST /api/auth/operator/login`
- **Purpose**: Authenticates a Procurement Centre Operator.
- **Request Body**: `{ "username": "...", "password": "..." }`
- **Response**: AuthSession object with `role: "OPERATOR"`.

### `POST /api/auth/admin/login`
- **Purpose**: Authenticates a District Administrator.
- **Request Body**: `{ "username": "DEMO-ADMIN-PATNA", "password": "..." }`
- **Response**: AuthSession object with `role: "ADMIN"`, `stateCode`, `districtCode`.

### `POST /api/auth/admin/register`
- **Purpose**: Registers a new District Admin.
- **Request Body**: Admin registration details including state and district selection.
- **Response**: `{ "success": true, "admin": AdminAccount }`

### `GET /api/admin/me`
- **Purpose**: Restores active District Admin session details.
- **Authentication**: Admin Session Token.
- **Response**: `{ "authenticated": true, "admin": AdminAccount }`

### `POST /api/auth/logout`
- **Purpose**: Terminates current authenticated session.
- **Response**: `{ "success": true }`

---

## 2. Demo & Developer Endpoints (`/api/demo/*`, `/api/dev/*`)

### `GET /api/demo/scenario`
- **Purpose**: Retrieves active DemoScenario location scope.
- **Response**: `DemoScenario` object or `null`.

### `POST /api/demo/scenario`
- **Purpose**: Sets or updates active DemoScenario.
- **Request Body**: `{ "stateCode": "BR", "districtCode": "BR_PAT", "stateName": "Bihar", "districtName": "Patna" }`
- **Response**: Updated `DemoScenario` object.

### `POST /api/dev/reset`
- **Purpose**: Resets demo data to initial state while preserving location master and demo accounts.
- **Request Body**: `{ "mode": "DEMO" | "CLEAN" }`
- **Response**: `{ "success": true, "message": "Demo state reset successfully" }`

---

## 3. Centre Endpoints (`/api/centres`, `/api/admin/centres/*`)

### `GET /api/centres`
- **Purpose**: Retrieves all available procurement centres (filtered by state/district if query params provided).
- **Response**: `ProcurementCentre[]`

### `GET /api/admin/centres`
- **Purpose**: Retrieves centres for authenticated admin's district.
- **Authentication**: Admin Role.
- **Response**: `ProcurementCentre[]` (District Isolated)

### `PATCH /api/admin/centres/:id/counters`
- **Purpose**: Updates active counter count for a centre.
- **Request Body**: `{ "activeCounters": 4 }`
- **Response**: Updated `ProcurementCentre` object.

### `PATCH /api/admin/centres/:id/status`
- **Purpose**: Updates centre operating status (`OPEN`, `BUSY`, `OVERLOADED`, `CLOSED`).
- **Request Body**: `{ "status": "BUSY" }`
- **Response**: Updated `ProcurementCentre` object.

---

## 4. Slot & Booking Endpoints (`/api/slots/*`)

### `GET /api/slots`
- **Purpose**: Fetches available time slots for a given centre and date.
- **Query Params**: `?centreId=...&date=YYYY-MM-DD`
- **Response**: `Slot[]`

### `POST /api/slots/book`
- **Purpose**: Books a procurement slot and issues a digital token.
- **Request Body**: `{ "centreId": "...", "date": "...", "timeSlot": "...", "crop": "...", "quantityQuintals": 50 }`
- **Response**: Generated `Token` object.

---

## 5. Token & Queue Endpoints (`/api/tokens/*`)

### `GET /api/tokens`
- **Purpose**: Retrieves tokens for active user/farmer/operator.
- **Response**: `Token[]`

### `PATCH /api/tokens/:id/status`
- **Purpose**: Updates token lifecycle status (`VERIFIED`, `PROCESSING`, `COMPLETED`, etc.).
- **Request Body**: `{ "status": "COMPLETED", "procurementAmountRupees": 113750 }`
- **Response**: Updated `Token` object.

### `POST /api/operator/call-next`
- **Purpose**: Calls next waiting farmer token to an open counter.
- **Request Body**: `{ "centreId": "..." }`
- **Response**: `{ "calledToken": Token }`

---

## 6. Admin Analytics & Audit Endpoints (`/api/admin/*`)

### `GET /api/admin/overview`
- **Purpose**: Retrieves high-level executive command metrics for district admin.
- **Response**: Overview summary object.

### `GET /api/admin/farmers`
- **Purpose**: Retrieves directory of farmers registered in admin's district.
- **Response**: `FarmerProfile[]`

### `GET /api/admin/tokens`
- **Purpose**: Retrieves token audit log for district admin.
- **Response**: `Token[]`

### `GET /api/admin/analytics`
- **Purpose**: Retrieves district procurement analytics, wait time distribution, and crop breakdowns.
- **Response**: `AnalyticsSummary` object.

### `GET /api/admin/procurement`
- **Purpose**: Retrieves finalized procurement transaction records for district.
- **Response**: `ProcurementRecord[]`
