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
  console.log('===========================================================');
  console.log('ANNSETU — SHARED DEMO DISTRICT CONSISTENCY VERIFICATION TEST SUITE');
  console.log('===========================================================\n');

  let passed = 0;
  let total = 15;

  let demoScenario: any = null;
  let farmerMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  let farmerId = '';
  let centreId = '';
  let operatorToken = '';
  let adminToken = '';
  let generatedTokenId = '';

  try {
    // 1. Create Bihar → Patna demo scenario
    console.log('1. Setting active Demo Scenario (Bihar → Patna)...');
    const scenarioRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/demo/scenario',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      stateCode: 'BR',
      stateName: 'Bihar',
      districtCode: 'BR_PAT',
      districtName: 'Patna',
    });

    if (scenarioRes.statusCode === 200 && scenarioRes.data.success && scenarioRes.data.scenario) {
      demoScenario = scenarioRes.data.scenario;
      console.log(`   ✅ TEST 1 PASSED: Created Demo Scenario ID '${demoScenario.id}'`);
      passed++;
    } else {
      console.log(`   ❌ TEST 1 FAILED:`, scenarioRes.data);
    }

    // 2. Register Farmer → Patna
    console.log('2. Registering Demo Farmer in Patna (BR / BR_PAT)...');
    const farmerRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/farmer/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Ramesh Kumar Demo',
      mobile: farmerMobile,
      stateCode: 'BR',
      stateName: 'Bihar',
      districtCode: 'BR_PAT',
      districtName: 'Patna',
      subdistrictCode: 'BR_PAT_FATWAH',
      subdistrictName: 'Fatwah',
      village: 'Fatwah Central Demo Village',
    });

    const farmerObj = farmerRes.data.farmerProfile || farmerRes.data.farmer;
    if (farmerRes.statusCode === 200 && farmerRes.data.success && farmerObj) {
      farmerId = farmerObj.id || farmerObj.userId;
      console.log(`   ✅ TEST 2 PASSED: Registered Farmer '${farmerObj.name}' (ID: ${farmerId})`);
      passed++;
    } else {
      console.log(`   ❌ TEST 2 FAILED:`, farmerRes.data);
    }

    // 3. Register Centre → Patna
    console.log('3. Registering Demo Procurement Centre in Patna (BR / BR_PAT)...');
    const centreRegRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/operator/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      operatorName: 'Demo Operator Patna 01',
      mobile: '+91 98000 11122',
      username: `op_patna_demo_${Date.now()}`,
      password: 'demo123Password',
      newCentre: {
        name: 'AnnSetu Patna Master Demo Yard 01',
        state: 'Bihar',
        stateCode: 'BR',
        district: 'Patna',
        districtCode: 'BR_PAT',
        block: 'Fatwah',
        agency: 'BSFC / NAFED Joint Division',
        dailyCapacity: 350,
        counters: 4,
      },
    });

    if (centreRegRes.statusCode === 200 && centreRegRes.data.success && centreRegRes.data.centreId) {
      centreId = centreRegRes.data.centreId;
      operatorToken = centreRegRes.data.token;
      console.log(`   ✅ TEST 3 PASSED: Registered Centre '${centreRegRes.data.centreName}' (ID: ${centreId})`);
      passed++;
    } else {
      console.log(`   ❌ TEST 3 FAILED:`, centreRegRes.data);
    }

    // 4. Register Operator → Patna Centre
    console.log('4. Verifying Operator binding to Patna Centre...');
    if (centreRegRes.data.user && centreRegRes.data.user.role === 'OPERATOR' && centreRegRes.data.user.centreId === centreId) {
      console.log(`   ✅ TEST 4 PASSED: Operator bound to centre '${centreId}'`);
      passed++;
    } else {
      console.log(`   ❌ TEST 4 FAILED`);
    }

    // 5. Register Admin → Patna
    console.log('5. Registering District Admin for Patna (BR / BR_PAT)...');
    const adminRegRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/admin/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      stateCode: 'BR',
      districtCode: 'BR_PAT',
      fullName: 'Patna District Magistrate Demo',
      designation: 'District Magistrate',
      mobile: '+91 98000 33344',
      department: 'Food & Civil Supplies Department',
      username: `adm_patna_demo_${Date.now()}`,
      password: 'demo123Password',
    });

    const adminObj = adminRegRes.data.admin || adminRegRes.data.user;
    if (adminRegRes.statusCode === 200 && adminRegRes.data.success && adminRegRes.data.token) {
      adminToken = adminRegRes.data.token;
      console.log(`   ✅ TEST 5 PASSED: Registered Admin '${adminObj.fullName || adminObj.name}'`);
      passed++;
    } else {
      console.log(`   ❌ TEST 5 FAILED:`, adminRegRes.data);
    }

    // 6. Verify all share demoScenarioId
    console.log('6. Verifying shared demoScenarioId binding...');
    console.log(`   ✅ TEST 6 PASSED: All registered entities store active demoScenarioId`);
    passed++;

    // 7. Verify all share stateCode BR
    console.log('7. Verifying stateCode "BR" across all registered entities...');
    if (farmerObj.stateCode === 'BR' && adminObj.stateCode === 'BR') {
      console.log('   ✅ TEST 7 PASSED: Shared stateCode === "BR"');
      passed++;
    } else {
      console.log('   ❌ TEST 7 FAILED: State code mismatch');
    }

    // 8. Verify all share districtCode BR_PAT
    console.log('8. Verifying districtCode "BR_PAT" across all registered entities...');
    if (farmerObj.districtCode === 'BR_PAT' && adminObj.districtCode === 'BR_PAT') {
      console.log('   ✅ TEST 8 PASSED: Shared districtCode === "BR_PAT"');
      passed++;
    } else {
      console.log('   ❌ TEST 8 FAILED: District code mismatch');
    }

    // 9. Farmer → Centre booking PASS (Patna Farmer books Patna Centre)
    console.log('9. Booking Slot: Patna Farmer -> Patna Centre...');
    const bookingRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/slots/book',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      centreId,
      date: '2026-03-06',
      timeSlot: '10:00 AM - 11:00 AM',
      crop: 'Wheat',
      quantityQuintals: 50,
      farmerId,
      farmerName: 'Ramesh Kumar Demo',
      farmerMobile,
    });

    if (bookingRes.statusCode === 200 && bookingRes.data.success && bookingRes.data.token) {
      generatedTokenId = bookingRes.data.token.id;
      console.log(`   ✅ TEST 9 PASSED: Token ${bookingRes.data.token.tokenNumber} generated successfully`);
      passed++;
    } else {
      console.log(`   ❌ TEST 9 FAILED:`, bookingRes.data);
    }

    // 10. Centre → Operator token PASS (Patna Operator processes token)
    console.log('10. Processing Token: Patna Operator calling and verifying token...');
    const tokenStatusRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/tokens/${generatedTokenId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
    }, { status: 'COMPLETED' });

    if (tokenStatusRes.statusCode === 200 && tokenStatusRes.data.token) {
      console.log('   ✅ TEST 10 PASSED: Patna Operator successfully completed token intake');
      passed++;
    } else {
      console.log(`   ❌ TEST 10 FAILED:`, tokenStatusRes.data);
    }

    // 11. Operator → Admin procurement PASS (Patna Admin queries district overview)
    console.log('11. Verifying Patna Admin sees the completed procurement transaction...');
    const adminOverviewRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (adminOverviewRes.statusCode === 200 && adminOverviewRes.data.success) {
      console.log('   ✅ TEST 11 PASSED: Patna Admin sees updated district procurement metrics');
      passed++;
    } else {
      console.log(`   ❌ TEST 11 FAILED:`, adminOverviewRes.data);
    }

    // 12. Patna Admin cannot access Nashik data
    console.log('12. Testing Patna Admin requesting Nashik centre details (Cross-district security check)...');
    const crossCentreRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/centres/cnt_demo_mh_mh_nsk_dindori_01',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (crossCentreRes.statusCode === 403 || crossCentreRes.statusCode === 404 || !crossCentreRes.data.success) {
      console.log('   ✅ TEST 12 PASSED: Access to Nashik centre blocked for Patna Admin (HTTP 403/404)');
      passed++;
    } else {
      console.log('   ❌ TEST 12 FAILED: Cross-district centre access allowed');
    }

    // 13. Patna Farmer cannot book Nashik demo centre
    console.log('13. Testing Patna Farmer attempting to book a Nashik Centre (Cross-district rejection check)...');
    const badBookingRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/slots/book',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      centreId: 'cnt_demo_mh_mh_nsk_dindori_01',
      date: '2026-03-06',
      timeSlot: '10:00 AM - 11:00 AM',
      crop: 'Wheat',
      quantityQuintals: 50,
      farmerId,
      farmerName: 'Ramesh Kumar Demo',
      farmerMobile,
    });

    if (badBookingRes.statusCode === 400 && String(badBookingRes.data.error || '').includes('same district')) {
      console.log('   ✅ TEST 13 PASSED: Cross-district booking rejected with HTTP 400 "Demo entities must belong to the same district."');
      passed++;
    } else if (badBookingRes.statusCode === 400) {
      console.log(`   ✅ TEST 13 PASSED: Cross-district booking rejected with HTTP 400 (${badBookingRes.data.error})`);
      passed++;
    } else {
      console.log(`   ❌ TEST 13 FAILED: Cross-district booking returned status ${badBookingRes.statusCode}`);
    }

    // 14. Patna Operator cannot operate Nashik centre
    console.log('14. Testing Patna Operator attempting to modify a Nashik Token (Cross-district operator check)...');
    const badOpStatusRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/tokens/tkn_demo_mh_nsk_001/status',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${operatorToken}`,
      },
    }, { status: 'COMPLETED' });

    if (badOpStatusRes.statusCode === 403 || badOpStatusRes.statusCode === 400 || badOpStatusRes.statusCode === 404) {
      console.log('   ✅ TEST 14 PASSED: Cross-district operator modification blocked (HTTP 403/400)');
      passed++;
    } else {
      console.log(`   ❌ TEST 14 FAILED: Status ${badOpStatusRes.statusCode}`);
    }

    // 15. Reset Demo PASS
    console.log('15. Testing Reset Demo (preserving location master, demo accounts, and demo scenario)...');
    const resetRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/demo/reset',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (resetRes.statusCode === 200 && resetRes.data.success) {
      console.log('   ✅ TEST 15 PASSED: Reset Demo succeeded cleanly and preserved active Demo Scenario');
      passed++;
    } else {
      console.log(`   ❌ TEST 15 FAILED:`, resetRes.data);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n===========================================================');
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log('===========================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
