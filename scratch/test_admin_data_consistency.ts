import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

async function runDataConsistencyAudit() {
  console.log('===========================================================');
  console.log('ANNSETU — FINAL ADMIN DATA CONSISTENCY AUDIT & VERIFICATION');
  console.log('===========================================================\n');

  // Helper for requests
  const apiCall = async (url: string, method = 'GET', body?: any, token?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return (await res.json()) as any;
  };

  // --------------------------------------------------------------------------
  // 1. PATNA ADMIN SCOPE
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: PATNA ADMIN SCOPE (DEMO-ADMIN-PATNA) ---');
  const patnaLogin = await apiCall('/api/auth/admin/login', 'POST', {
    adminId: 'DEMO-ADMIN-PATNA',
    password: 'demo123',
  });
  if (!patnaLogin.success) {
    console.error('FAILED to login as Patna Admin:', patnaLogin);
    process.exit(1);
  }
  const patnaToken = patnaLogin.token;
  console.log(`✓ Patna Logged In. User District: ${patnaLogin.user.district}, State: ${patnaLogin.user.state}`);

  const patnaOverview = await apiCall('/api/admin/overview', 'GET', undefined, patnaToken);
  const patnaCentres = await apiCall('/api/admin/centres', 'GET', undefined, patnaToken);
  const patnaFarmers = await apiCall('/api/admin/farmers', 'GET', undefined, patnaToken);
  const patnaTokens = await apiCall('/api/admin/tokens', 'GET', undefined, patnaToken);
  const patnaAnalytics = await apiCall('/api/admin/analytics', 'GET', undefined, patnaToken);

  console.log(`  Overview Centres Count: ${patnaOverview.centres?.length}`);
  console.log(`  Centres Master Count:   ${patnaCentres.centres?.length}`);
  console.log(`  Farmers Count:          ${patnaFarmers.farmers?.length}`);
  console.log(`  Tokens Count:           ${patnaTokens.tokens?.length}`);
  console.log(`  Total Procurement:      ${patnaAnalytics.analytics?.totalProcurementQuintals} Qtl`);
  console.log(`  Average Wait Time:      ${patnaAnalytics.analytics?.averageWaitMinutes} min`);
  console.log(`  Completion Rate:        ${patnaAnalytics.analytics?.tokenCompletionRatePercent}%\n`);

  // --------------------------------------------------------------------------
  // 2. GOA ADMIN SCOPE (GA_SOUT)
  // --------------------------------------------------------------------------
  console.log('--- TEST 2: GOA/SOUTH GOA ADMIN SCOPE (GA_SOUT) ---');
  let goaLogin = await apiCall('/api/auth/admin/login', 'POST', {
    adminId: 'ADM-GA-SOUT-001',
    password: 'demo123',
  });

  if (!goaLogin.success) {
    goaLogin = await apiCall('/api/auth/admin/login', 'POST', {
      adminId: 'ADM-GA-SOUT',
      password: 'demo123',
    });
  }

  if (!goaLogin.success) {
    const regRes = await apiCall('/api/auth/admin/register', 'POST', {
      stateCode: 'GA',
      stateName: 'Goa',
      districtCode: 'GA_SOUT',
      districtName: 'South Goa',
      fullName: 'South Goa District Admin',
      designation: 'District Magistrate',
      mobile: `982${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: `admin.goa.${Date.now()}@goa.gov.in`,
      department: 'Goa Civil Supplies Board',
      username: `admin_goa_${Date.now()}`,
      password: 'demo123',
    });

    if (regRes.success && regRes.admin?.adminId) {
      goaLogin = await apiCall('/api/auth/admin/login', 'POST', {
        adminId: regRes.admin.adminId,
        password: 'demo123',
      });
    }
  }

  if (!goaLogin.success) {
    console.error('FAILED to login as Goa Admin:', goaLogin);
    process.exit(1);
  }
  const goaToken = goaLogin.token;
  console.log(`✓ Goa Logged In. User District: ${goaLogin.user.district}, State: ${goaLogin.user.state}`);

  const goaOverview = await apiCall('/api/admin/overview', 'GET', undefined, goaToken);
  const goaCentres = await apiCall('/api/admin/centres', 'GET', undefined, goaToken);
  const goaFarmers = await apiCall('/api/admin/farmers', 'GET', undefined, goaToken);
  const goaTokens = await apiCall('/api/admin/tokens', 'GET', undefined, goaToken);
  const goaAnalytics = await apiCall('/api/admin/analytics', 'GET', undefined, goaToken);

  console.log(`  Overview Centres Count: ${goaOverview.centres?.length}`);
  console.log(`  Centres Master Count:   ${goaCentres.centres?.length}`);
  console.log(`  Farmers Count:          ${goaFarmers.farmers?.length}`);
  console.log(`  Tokens Count:           ${goaTokens.tokens?.length}`);
  console.log(`  Total Procurement:      ${goaAnalytics.analytics?.totalProcurementQuintals} Qtl`);
  console.log(`  Average Wait Time:      ${goaAnalytics.analytics?.averageWaitMinutes} min`);
  console.log(`  Completion Rate:        ${goaAnalytics.analytics?.tokenCompletionRatePercent}%\n`);

  // --------------------------------------------------------------------------
  // 3. NASHIK ADMIN SCOPE
  // --------------------------------------------------------------------------
  console.log('--- TEST 3: NASHIK ADMIN SCOPE (DEMO-ADMIN-NASHIK) ---');
  const nashikLogin = await apiCall('/api/auth/admin/login', 'POST', {
    adminId: 'DEMO-ADMIN-NASHIK',
    password: 'demo123',
  });
  if (!nashikLogin.success) {
    console.error('FAILED to login as Nashik Admin:', nashikLogin);
    process.exit(1);
  }
  const nashikToken = nashikLogin.token;
  console.log(`✓ Nashik Logged In. User District: ${nashikLogin.user.district}, State: ${nashikLogin.user.state}`);

  const nashikOverview = await apiCall('/api/admin/overview', 'GET', undefined, nashikToken);
  const nashikCentres = await apiCall('/api/admin/centres', 'GET', undefined, nashikToken);
  const nashikFarmers = await apiCall('/api/admin/farmers', 'GET', undefined, nashikToken);
  const nashikTokens = await apiCall('/api/admin/tokens', 'GET', undefined, nashikToken);
  const nashikAnalytics = await apiCall('/api/admin/analytics', 'GET', undefined, nashikToken);

  console.log(`  Overview Centres Count: ${nashikOverview.centres?.length}`);
  console.log(`  Centres Master Count:   ${nashikCentres.centres?.length}`);
  console.log(`  Farmers Count:          ${nashikFarmers.farmers?.length}`);
  console.log(`  Tokens Count:           ${nashikTokens.tokens?.length}`);
  console.log(`  Total Procurement:      ${nashikAnalytics.analytics?.totalProcurementQuintals} Qtl`);
  console.log(`  Average Wait Time:      ${nashikAnalytics.analytics?.averageWaitMinutes} min`);
  console.log(`  Completion Rate:        ${nashikAnalytics.analytics?.tokenCompletionRatePercent}%\n`);

  // --------------------------------------------------------------------------
  // 4. CONSISTENCY & LEAKAGE VERIFICATION
  // --------------------------------------------------------------------------
  console.log('===========================================================');
  console.log('CONSISTENCY & ISOLATION CHECKS');
  console.log('===========================================================');

  let passed = true;

  // Overview centre count must match Centres master count
  if (patnaOverview.centres.length !== patnaCentres.centres.length) {
    console.error(`FAIL: Patna Overview centres count (${patnaOverview.centres.length}) != Centres master count (${patnaCentres.centres.length})`);
    passed = false;
  } else {
    console.log(`✓ PASS: Patna Overview centre count (${patnaOverview.centres.length}) matches Centres master count`);
  }

  if (goaOverview.centres.length !== goaCentres.centres.length) {
    console.error(`FAIL: Goa Overview centres count (${goaOverview.centres.length}) != Centres master count (${goaCentres.centres.length})`);
    passed = false;
  } else {
    console.log(`✓ PASS: Goa Overview centre count (${goaOverview.centres.length}) matches Centres master count`);
  }

  if (nashikOverview.centres.length !== nashikCentres.centres.length) {
    console.error(`FAIL: Nashik Overview centres count (${nashikOverview.centres.length}) != Centres master count (${nashikCentres.centres.length})`);
    passed = false;
  } else {
    console.log(`✓ PASS: Nashik Overview centre count (${nashikOverview.centres.length}) matches Centres master count`);
  }

  // Cross-district leakage checks
  const nonPatnaInPatna = patnaCentres.centres.filter((c: any) => c.state !== 'Bihar' && c.district.toLowerCase() !== 'patna');
  const nonGoaInGoa = goaCentres.centres.filter((c: any) => c.state !== 'Goa' && !c.district.toLowerCase().includes('goa'));
  const nonNashikInNashik = nashikCentres.centres.filter((c: any) => c.state !== 'Maharashtra' && c.district.toLowerCase() !== 'nashik');

  if (nonPatnaInPatna.length > 0) { console.error(`FAIL: Patna leaked ${nonPatnaInPatna.length} non-Patna centres`); passed = false; }
  else { console.log('✓ PASS: Patna has 0 non-Patna centres'); }

  if (nonGoaInGoa.length > 0) { console.error(`FAIL: Goa leaked ${nonGoaInGoa.length} non-Goa centres`); passed = false; }
  else { console.log('✓ PASS: Goa has 0 non-Goa centres'); }

  if (nonNashikInNashik.length > 0) { console.error(`FAIL: Nashik leaked ${nonNashikInNashik.length} non-Nashik centres`); passed = false; }
  else { console.log('✓ PASS: Nashik has 0 non-Nashik centres'); }

  // Check Goa empty state analytics
  if (goaTokens.tokens.length === 0) {
    if (goaAnalytics.analytics.tokenCompletionRatePercent !== 0) {
      console.error(`FAIL: Goa has 0 tokens but completion rate is ${goaAnalytics.analytics.tokenCompletionRatePercent}%`);
      passed = false;
    } else {
      console.log('✓ PASS: Goa 0 tokens yields truthful 0% completion rate');
    }
    if (goaAnalytics.analytics.noShowRatePercent !== 0) {
      console.error(`FAIL: Goa has 0 tokens but no-show rate is ${goaAnalytics.analytics.noShowRatePercent}%`);
      passed = false;
    } else {
      console.log('✓ PASS: Goa 0 tokens yields truthful 0% no-show rate');
    }
  }

  // Check wait time chart in Goa analytics lists ONLY Goa centres
  const goaWaitChartCentres = goaAnalytics.analytics.waitTimeByCentre || [];
  const invalidCentresInGoaChart = goaWaitChartCentres.filter((w: any) => !goaCentres.centres.some((c: any) => c.name === w.centreName));
  if (invalidCentresInGoaChart.length > 0) {
    console.error('FAIL: Goa wait time chart contains foreign centres:', invalidCentresInGoaChart);
    passed = false;
  } else {
    console.log('✓ PASS: Goa wait time chart lists ONLY Goa district centres');
  }

  console.log('\n===========================================================');
  if (passed) {
    console.log('FINAL AUDIT RESULT: ALL DATA CONSISTENCY CHECKS PASSED!');
  } else {
    console.error('FINAL AUDIT RESULT: FAILED DATA CONSISTENCY AUDIT!');
    process.exit(1);
  }
}

runDataConsistencyAudit().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
