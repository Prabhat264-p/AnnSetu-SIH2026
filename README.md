# AnnSetu — Smart Procurement Scheduling & Queue Management

AnnSetu is a Smart Procurement Scheduling and Queue Management platform designed to streamline agricultural procurement operations across India. It connects **Farmers**, **Procurement Centre Operators**, and **District Administrators** through AI-driven centre recommendations, automated slot bookings, real-time queue tracking, and district-isolated command dashboards.

---

## Key Portals & Features

- 🌾 **Farmer Portal**: Search procurement centres, view interactive maps, receive smart centre recommendations, book time slots, obtain digital QR passes, and monitor live queue wait times.
- 🏢 **Operator Portal**: Live queue processing, farmer identity verification, moisture/quality checks, MSP procurement record generation, and multi-counter calling.
- 📊 **District Admin Portal**: High-level command overview, procurement analytics, centre congestion monitoring, token audit logs, and counter allocation controls with strict district-level data isolation.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti.
- **Backend**: Express.js REST API, TypeScript (`tsx`).
- **Services**: LGD Location Master Integration, M/M/c Multi-Counter Queue Engine, Multi-Criteria Decision Recommendation Engine, Web Speech API Voice Search, Web Audio API Sound Chimes.

---

## Developer Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: High-level design, layer breakdown, portal features, and developer change location guide.
- 🚀 **[Development Guide](docs/DEVELOPMENT.md)**: Local setup instructions, package scripts, testing commands, and troubleshooting.
- 🔌 **[REST API Reference](docs/API.md)**: Active Express backend API endpoints, parameters, and payload contracts.
- 📐 **[Data Model Specifications](docs/DATA_MODEL.md)**: TypeScript domain contracts, entity relationships, and centre resolution lookup mechanics.
- 🧪 **[Demo Mode & Reset Guide](docs/DEMO_MODE.md)**: Shared `DemoScenario` bindings, demo accounts, and Reset Demo operations.

---

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Express Server**:
   ```bash
   npm run server
   ```

3. **Start Frontend Dev Server**:
   ```bash
   npm run dev
   ```

4. **Run Automated Test Suite**:
   ```bash
   npm test
   ```