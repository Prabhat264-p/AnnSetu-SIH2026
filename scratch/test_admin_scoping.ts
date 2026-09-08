import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

async function runScopingVerification() {
  console.log('====================================================');
  console.log('ANNSETU — ADMIN DISTRICT DATA SCOPING VERIFICATION');
  console.log('====================================================\n');

  // Test 1: Patna Admin Session
  console.log('--- TEST 1: Patna Admin (DEMO-ADMIN-PATNA) ---');
  const patnaLogin = (await fetch(`${BASE_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: 'DEMO-ADMIN-PATNA', password: 'demo123' }),
  }).then((r) => r.json())) as any;

  if (!patnaLogin.success || !patnaLogin.token) {
    console.error('FAILED to log in as Patna Admin:', patnaLogin);
    process.exit(1);
  }
  const patnaToken = patnaLogin.token;
  console.log('✓ Patna Admin Logged In. District:', patnaLogin.user.district, 'State:', patnaLogin.user.state);

  const patnaCentres = (await fetch(`${BASE_URL}/api/admin/centres`, {
    headers: { Authorization: `Bearer ${patnaToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Patna Centres Count: ${patnaCentres.centres?.length}`);
  const nonPatnaCentresInPatna = patnaCentres.centres.filter((c: any) => c.district.toLowerCase() !== 'patna' && c.districtCode?.toLowerCase() !== 'br_pat');
  console.log(`✓ Non-Patna Centres leakage in Patna Admin: ${nonPatnaCentresInPatna.length}`);

  const patnaAnalytics = (await fetch(`${BASE_URL}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${patnaToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Patna Analytics: Target=${patnaAnalytics.analytics?.targetProcurementQuintals}, TotalProcured=${patnaAnalytics.analytics?.totalProcurementQuintals}`);

  const patnaFarmers = (await fetch(`${BASE_URL}/api/admin/farmers`, {
    headers: { Authorization: `Bearer ${patnaToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Patna Farmers Count: ${patnaFarmers.farmers?.length}`);

  const patnaTokens = (await fetch(`${BASE_URL}/api/admin/tokens`, {
    headers: { Authorization: `Bearer ${patnaToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Patna Tokens Count: ${patnaTokens.tokens?.length}\n`);

  // Test 2: Gujarat Admin Session (Ahmedabad)
  console.log('--- TEST 2: Gujarat/Ahmedabad Admin (ADM-GJ-AHME) ---');
  let gjLogin = (await fetch(`${BASE_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: 'ADM-GJ-AHME-001', password: 'demo123' }),
  }).then((r) => r.json())) as any;

  if (!gjLogin.success) {
    gjLogin = (await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'ADM-GJ-AHME', password: 'demo123' }),
    }).then((r) => r.json())) as any;
  }

  if (!gjLogin.success) {
    const regRes = (await fetch(`${BASE_URL}/api/auth/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stateCode: 'GJ',
        stateName: 'Gujarat',
        districtCode: 'GJ_AHME',
        districtName: 'Ahmedabad',
        fullName: 'Gujarat State Admin',
        designation: 'District Magistrate',
        mobile: `987${Math.floor(1000000 + Math.random() * 9000000)}`,
        email: `admin.${Date.now()}@gj.gov.in`,
        department: 'State Procurement Board',
        username: `admin_gj_${Date.now()}`,
        password: 'demo123',
      }),
    }).then((r) => r.json())) as any;

    if (regRes.success && regRes.admin?.adminId) {
      gjLogin = (await fetch(`${BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: regRes.admin.adminId, password: 'demo123' }),
      }).then((r) => r.json())) as any;
    }
  }

  if (!gjLogin.success || !gjLogin.token) {
    console.error('FAILED to log in as Gujarat Admin:', gjLogin);
    process.exit(1);
  }
  const gjToken = gjLogin.token;
  console.log('✓ Gujarat Admin Logged In. District:', gjLogin.user.district, 'State:', gjLogin.user.state);

  const gjCentres = (await fetch(`${BASE_URL}/api/admin/centres`, {
    headers: { Authorization: `Bearer ${gjToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Gujarat Centres Count: ${gjCentres.centres?.length}`);
  const nonGjCentres = gjCentres.centres.filter((c: any) => !['ahmedabad', 'gj_ahme', 'gj_amd'].includes(c.district.toLowerCase()) && !['ahmedabad', 'gj_ahme', 'gj_amd'].includes((c.districtCode || '').toLowerCase()));
  console.log(`✓ Non-Gujarat/Ahmedabad Centres leakage in Gujarat Admin: ${nonGjCentres.length}`);

  const gjAnalytics = (await fetch(`${BASE_URL}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${gjToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Gujarat Analytics: Target=${gjAnalytics.analytics?.targetProcurementQuintals}, TotalProcured=${gjAnalytics.analytics?.totalProcurementQuintals}`);

  const gjFarmers = (await fetch(`${BASE_URL}/api/admin/farmers`, {
    headers: { Authorization: `Bearer ${gjToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Gujarat Farmers Count: ${gjFarmers.farmers?.length}`);

  const gjTokens = (await fetch(`${BASE_URL}/api/admin/tokens`, {
    headers: { Authorization: `Bearer ${gjToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Gujarat Tokens Count: ${gjTokens.tokens?.length}\n`);

  // Test 3: Nashik Admin Session
  console.log('--- TEST 3: Nashik Admin (DEMO-ADMIN-NASHIK) ---');
  const nashikLogin = (await fetch(`${BASE_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: 'DEMO-ADMIN-NASHIK', password: 'demo123' }),
  }).then((r) => r.json())) as any;

  if (!nashikLogin.success || !nashikLogin.token) {
    console.error('FAILED to log in as Nashik Admin:', nashikLogin);
    process.exit(1);
  }
  const nashikToken = nashikLogin.token;
  console.log('✓ Nashik Admin Logged In. District:', nashikLogin.user.district, 'State:', nashikLogin.user.state);

  const nashikCentres = (await fetch(`${BASE_URL}/api/admin/centres`, {
    headers: { Authorization: `Bearer ${nashikToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Nashik Centres Count: ${nashikCentres.centres?.length}`);
  const nonNashikCentres = nashikCentres.centres.filter((c: any) => c.district.toLowerCase() !== 'nashik');
  console.log(`✓ Non-Nashik Centres leakage in Nashik Admin: ${nonNashikCentres.length}`);

  const nashikAnalytics = (await fetch(`${BASE_URL}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${nashikToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Nashik Analytics: Target=${nashikAnalytics.analytics?.targetProcurementQuintals}, TotalProcured=${nashikAnalytics.analytics?.totalProcurementQuintals}`);

  const nashikFarmers = (await fetch(`${BASE_URL}/api/admin/farmers`, {
    headers: { Authorization: `Bearer ${nashikToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Nashik Farmers Count: ${nashikFarmers.farmers?.length}`);

  const nashikTokens = (await fetch(`${BASE_URL}/api/admin/tokens`, {
    headers: { Authorization: `Bearer ${nashikToken}` },
  }).then((r) => r.json())) as any;
  console.log(`✓ Nashik Tokens Count: ${nashikTokens.tokens?.length}\n`);

  // Assertions
  console.log('====================================================');
  console.log('VERIFICATION CHECKS SUMMARY');
  console.log('====================================================');
  let pass = true;

  if (nonPatnaCentresInPatna.length > 0) { console.error('FAIL: Patna has non-Patna centres!'); pass = false; }
  if (nonGjCentres.length > 0) { console.error('FAIL: Gujarat has non-Gujarat centres!'); pass = false; }
  if (nonNashikCentres.length > 0) { console.error('FAIL: Nashik has non-Nashik centres!'); pass = false; }

  if (pass) {
    console.log('ALL ADMIN DATA SCOPING CHECKS PASSED PERFECTLY!');
  } else {
    console.error('SCOPING VERIFICATION FAILED!');
    process.exit(1);
  }
}

runScopingVerification().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
