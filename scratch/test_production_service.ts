/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Production Service Integration & Full-Stack Deployment Test
 */

import fs from 'fs';
import path from 'path';

async function runProductionServiceVerification() {
  console.log('====================================================');
  console.log('ANNSETU — PRODUCTION SINGLE-SERVICE DEPLOYMENT TEST');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`   ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`   ❌ [FAIL] ${description}`);
    }
  }

  // 1. Verify Production Build Files
  console.log('1. Verifying dist/ Production Build Assets...');
  const distDir = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');
  const assetsDir = path.join(distDir, 'assets');

  assert(fs.existsSync(distDir), 'dist/ directory exists');
  assert(fs.existsSync(indexHtmlPath), 'dist/index.html exists');
  assert(fs.existsSync(assetsDir), 'dist/assets directory exists');

  // 2. Connect to Running Production Server on Port 5001
  const port = process.env.PORT || 5001;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`\n2. Testing Production Web Service on ${baseUrl}...`);

  // 3. Test Static HTML Route (GET /)
  try {
    const res = await fetch(`${baseUrl}/`);
    const text = await res.text();
    assert(res.status === 200, 'GET / returns HTTP 200 OK');
    assert(text.includes('<div id="root">') || text.includes('<!DOCTYPE html>'), 'GET / serves Vite index.html SPA entry');
  } catch (err: any) {
    assert(false, `GET / failed: ${err.message}`);
  }

  // 4. Test SPA Fallback Routes
  console.log('\n3. Testing Client-Side SPA Fallback Routing...');
  const spaRoutes = ['/login', '/farmer/dashboard', '/operator/queue', '/admin/centres'];
  for (const route of spaRoutes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      const text = await res.text();
      assert(res.status === 200, `GET ${route} returns HTTP 200 OK`);
      assert(text.toLowerCase().includes('<!doctype html>'), `GET ${route} falls back to index.html`);
    } catch (err: any) {
      assert(false, `GET ${route} failed: ${err.message}`);
    }
  }

  // 5. Test Health Check Endpoint (GET /api/health)
  console.log('\n4. Testing Health Check API (GET /api/health)...');
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'GET /api/health returns HTTP 200 OK');
    assert(data.status === 'ok', 'Health status === "ok"');
    assert(data.service === 'annsetu', 'Health service === "annsetu"');
  } catch (err: any) {
    assert(false, `GET /api/health failed: ${err.message}`);
  }

  // 6. Test Voice STT Multipart Endpoint (POST /api/voice/transcribe)
  console.log('\n5. Testing Voice STT API (POST /api/voice/transcribe)...');
  try {
    const wavBuffer = Buffer.alloc(1000);
    const formData = new FormData();
    formData.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'speech.wav');
    formData.append('languageCode', 'hi-IN');

    const res = await fetch(`${baseUrl}/api/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json();

    assert(res.status === 200 || res.status === 503, `POST /api/voice/transcribe returned HTTP ${res.status}`);
    assert(body.diagnostics !== undefined, 'Voice endpoint returns structured diagnostics');
  } catch (err: any) {
    assert(false, `POST /api/voice/transcribe failed: ${err.message}`);
  }

  // 7. Test Location Master & Search APIs
  console.log('\n6. Testing Master Data & Search APIs...');
  try {
    const statesRes = await fetch(`${baseUrl}/api/locations/states`);
    const statesData = await statesRes.json();
    assert(statesRes.status === 200, 'GET /api/locations/states returns HTTP 200');
    assert(statesData.count === 36, 'Returns 36 States/UTs location master');

    const centresRes = await fetch(`${baseUrl}/api/centres?district=Patna`);
    const centresData = await centresRes.json();
    assert(centresRes.status === 200, 'GET /api/centres returns HTTP 200');
    assert(centresData.centres && centresData.centres.length > 0, 'Returns Patna centres list');
  } catch (err: any) {
    assert(false, `Master Data APIs failed: ${err.message}`);
  }

  // 8. Test Farmer, Operator, and Admin Authentication Flow
  console.log('\n7. Testing Roles & Authentication Flow...');
  try {
    // Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'DEMO-ADMIN-PATNA', password: 'demo123' }),
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.success, 'Admin Login (DEMO-ADMIN-PATNA) HTTP 200 OK');

    // Admin Overview Data Scoping
    const overviewRes = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${adminData.token}` },
    });
    const overviewData = await overviewRes.json();
    assert(overviewRes.status === 200 && overviewData.success, 'Admin Overview HTTP 200 OK');
  } catch (err: any) {
    assert(false, `Auth flow failed: ${err.message}`);
  }

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed} / ${total} PRODUCTION CHECKS PASSED`);
  console.log(`====================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runProductionServiceVerification().catch((err) => {
  console.error('Fatal error during production verification:', err);
  process.exit(1);
});
