import http from 'http';

function makeRequest(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode || 0, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode || 0, headers: res.headers, data: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('ANNSETU — ADMIN LOGIN RUNTIME & DATA FLOW TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 12;
  let token = '';

  try {
    // Test 1: Admin Login HTTP 200
    console.log('1. Testing Patna Admin Login (DEMO-ADMIN-PATNA / demo123)...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { adminId: 'DEMO-ADMIN-PATNA', password: 'demo123' });

    if (loginRes.statusCode === 200 && loginRes.data.success) {
      console.log('   ✅ Test 1 PASSED: HTTP 200 returned for Patna Admin login');
      passed++;
      token = loginRes.data.token;
    } else {
      console.log(`   ❌ Test 1 FAILED: Status ${loginRes.statusCode}, body:`, loginRes.data);
    }

    // Test 2: User Role is ADMIN
    console.log('2. Verifying User Role is ADMIN...');
    const user = loginRes.data.user || {};
    if (user.role === 'ADMIN') {
      console.log('   ✅ Test 2 PASSED: role === "ADMIN"');
      passed++;
    } else {
      console.log(`   ❌ Test 2 FAILED: role is "${user.role}"`);
    }

    // Test 3: StateCode is BR
    console.log('3. Verifying stateCode is "BR"...');
    if (user.stateCode === 'BR') {
      console.log('   ✅ Test 3 PASSED: stateCode === "BR"');
      passed++;
    } else {
      console.log(`   ❌ Test 3 FAILED: stateCode is "${user.stateCode}"`);
    }

    // Test 4: DistrictCode is BR_PAT
    console.log('4. Verifying districtCode is "BR_PAT"...');
    if (user.districtCode === 'BR_PAT') {
      console.log('   ✅ Test 4 PASSED: districtCode === "BR_PAT"');
      passed++;
    } else {
      console.log(`   ❌ Test 4 FAILED: districtCode is "${user.districtCode}"`);
    }

    // Test 5: Session Restoration GET /api/admin/me
    console.log('5. Testing Session Restoration (GET /api/admin/me)...');
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (meRes.statusCode === 200 && meRes.data.success && meRes.data.admin?.districtCode === 'BR_PAT') {
      console.log('   ✅ Test 5 PASSED: Session restored with correct districtCode BR_PAT');
      passed++;
    } else {
      console.log(`   ❌ Test 5 FAILED: Status ${meRes.statusCode}, body:`, meRes.data);
    }

    // Test 6: District Overview API GET /api/admin/overview
    console.log('6. Testing District Overview API (GET /api/admin/overview)...');
    const overviewRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (overviewRes.statusCode === 200 && overviewRes.data.success && (overviewRes.data.analytics || overviewRes.data.centres)) {
      console.log('   ✅ Test 6 PASSED: District overview returned successfully');
      passed++;
    } else {
      console.log(`   ❌ Test 6 FAILED: Status ${overviewRes.statusCode}, body:`, JSON.stringify(overviewRes.data).slice(0, 100));
    }

    // Test 7: District Centres API GET /api/admin/centres
    console.log('7. Testing District Centres API (GET /api/admin/centres)...');
    const centresRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/centres',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (centresRes.statusCode === 200 && centresRes.data.success && Array.isArray(centresRes.data.centres)) {
      const allPatna = centresRes.data.centres.every((c: any) => c.districtCode === 'BR_PAT' || c.district === 'Patna' || (c.districtCode || '').startsWith('BR_PAT') || (c.districtCode || '').toLowerCase().includes('pat'));
      if (allPatna && centresRes.data.centres.length > 0) {
        console.log(`   ✅ Test 7 PASSED: ${centresRes.data.centres.length} Patna centres returned`);
        passed++;
      } else {
        console.log(`   ❌ Test 7 FAILED: Non-Patna centres found or 0 centres returned`);
      }
    } else {
      console.log(`   ❌ Test 7 FAILED: Status ${centresRes.statusCode}, body:`, centresRes.data);
    }

    // Test 8: District Farmers API GET /api/admin/farmers
    console.log('8. Testing District Farmers API (GET /api/admin/farmers)...');
    const farmersRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/farmers',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (farmersRes.statusCode === 200 && farmersRes.data.success && Array.isArray(farmersRes.data.farmers)) {
      console.log(`   ✅ Test 8 PASSED: ${farmersRes.data.farmers.length} Patna farmers returned`);
      passed++;
    } else {
      console.log(`   ❌ Test 8 FAILED: Status ${farmersRes.statusCode}, body:`, farmersRes.data);
    }

    // Test 9: District Tokens API GET /api/admin/tokens
    console.log('9. Testing District Tokens API (GET /api/admin/tokens)...');
    const tokensRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/tokens',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (tokensRes.statusCode === 200 && tokensRes.data.success && Array.isArray(tokensRes.data.tokens)) {
      console.log(`   ✅ Test 9 PASSED: ${tokensRes.data.tokens.length} Patna tokens returned`);
      passed++;
    } else {
      console.log(`   ❌ Test 9 FAILED: Status ${tokensRes.statusCode}, body:`, tokensRes.data);
    }

    // Test 10: District Analytics API GET /api/admin/analytics
    console.log('10. Testing District Analytics API (GET /api/admin/analytics)...');
    const analyticsRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (analyticsRes.statusCode === 200 && analyticsRes.data.success && analyticsRes.data.analytics) {
      const a = analyticsRes.data.analytics;
      if (typeof a.totalFarmers === 'number' && a.centreStatusCounts && typeof a.centreStatusCounts.openNormal === 'number') {
        console.log('   ✅ Test 10 PASSED: Admin analytics payload structure verified');
        passed++;
      } else {
        console.log('   ❌ Test 10 FAILED: Analytics object structure invalid', a);
      }
    } else {
      console.log(`   ❌ Test 10 FAILED: Status ${analyticsRes.statusCode}, body:`, analyticsRes.data);
    }

    // Test 11: District Procurement API GET /api/admin/procurement
    console.log('11. Testing District Procurement API (GET /api/admin/procurement)...');
    const procurementRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/procurement',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (procurementRes.statusCode === 200 && procurementRes.data.success && Array.isArray(procurementRes.data.records)) {
      console.log(`   ✅ Test 11 PASSED: ${procurementRes.data.records.length} Patna procurement records returned`);
      passed++;
    } else {
      console.log(`   ❌ Test 11 FAILED: Status ${procurementRes.statusCode}, body:`, procurementRes.data);
    }

    // Test 12: Logout POST /api/auth/logout
    console.log('12. Testing Admin Logout (POST /api/auth/logout)...');
    const logoutRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (logoutRes.statusCode === 200 && logoutRes.data.success) {
      console.log('   ✅ Test 12 PASSED: Admin logout returned HTTP 200');
      passed++;
    } else {
      console.log(`   ❌ Test 12 FAILED: Status ${logoutRes.statusCode}, body:`, logoutRes.data);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
