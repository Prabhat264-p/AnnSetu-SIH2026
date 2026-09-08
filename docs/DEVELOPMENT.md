# AnnSetu — Developer Onboarding & Setup Guide

Welcome to **AnnSetu**! This guide contains instructions for setting up your local development environment, running the application, executing tests, and making code modifications safely.

---

## 1. System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OS**: macOS, Linux, or Windows (WSL2 recommended)

---

## 2. Quick Start & Installation

1. **Clone the Repository & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Express Backend Server**:
   ```bash
   npm run server
   ```
   *(Runs `server.ts` on port 3000)*

3. **Start the Vite Frontend Dev Server**:
   In a separate terminal window:
   ```bash
   npm run dev
   ```
   *(App accessible at `http://localhost:3000` or Vite dev URL)*

---

## 3. npm Scripts Reference

All package scripts defined in `package.json`:

| Script Command | Description |
| :--- | :--- |
| `npm run dev` | Launches Vite development server on port 3000 |
| `npm run server` | Starts the Express backend server via `tsx server.ts` |
| `npm run build` | Compiles production bundle via `vite build` into `dist/` |
| `npm run lint` | Runs TypeScript type checking (`npx tsc --noEmit`) |
| `npm test` | Runs all 4 test suites across centre, demo, and admin modules |
| `npm run test:all` | Alias for `npm test` |
| `npm run clean` | Cleans build artifacts (`dist/`, `server.js`) |

---

## 4. How to Run Verification Tests

Ensure the server is running on port 3000 (`npm run server`), then execute:

```bash
npm test
```

This runs all 4 regression test suites:
- `tests/centre/official-id-resolution.test.ts`
- `tests/demo/demo-district-consistency.test.ts`
- `tests/admin/admin-navigation.test.ts`
- `tests/admin/admin-login-runtime.test.ts`

---

## 5. Troubleshooting Common Issues

1. **`TypeError: Cannot read properties of undefined (reading 'officialId')`**:
   - Cause: Unhandled fallback when accessing procurement centre object.
   - Solution: Use `resolveCentreById(id, centres)` or `getCentreSafe(id, centres)` from `src/services/centre/centreResolver.ts`. Never perform unchecked array indexing on centres.

2. **Server Port 3000 Already in Use**:
   - Kill any existing node process on port 3000: `lsof -i :3000` then `kill -9 <PID>`.

3. **TypeScript Build Errors**:
   - Run `npm run lint` to view complete type diagnostics.
