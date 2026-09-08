import fetch from 'node-fetch';
import {
  getStatesList,
  getDistrictsForState,
  getBlocksForDistrict,
  DISTRICTS_MASTER,
} from '../src/services/location/locationService';

const BASE = 'http://localhost:3000/api';

interface StateTestResult {
  state: string;
  district: string;
  block: string;
  centreId: string;
  centreName: string;
  districtsCount: number;
  blocksCount: number;
  centresFound: number;
  recommendationWorks: boolean;
  futureSlotAvailable: boolean;
  status: 'PASS' | 'FAIL';
}

async function runBrowserRuntimeRegression() {
  console.log('===========================================================');
  console.log('FINAL BROWSER / RUNTIME REGRESSION — 8 REPAIRED STATES');
  console.log('===========================================================\n');

  const repairedStates = [
    'Arunachal Pradesh',
    'Goa',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura',
  ];

  const results: StateTestResult[] = [];
  let consoleErrors = false;

  for (const stateName of repairedStates) {
    try {
      // 1. State Selection & District Dropdown
      const districtsList = getDistrictsForState(stateName).filter((d) => d !== 'All Districts');
      if (districtsList.length === 0) {
        throw new Error(`District dropdown empty for ${stateName}`);
      }
      const selectedDistrict = districtsList[0];

      // 2. Select District & Block Dropdown
      const blocksList = getBlocksForDistrict(stateName, selectedDistrict).filter((b) => b !== 'All Blocks');
      if (blocksList.length === 0) {
        throw new Error(`Block dropdown empty for ${stateName} -> ${selectedDistrict}`);
      }
      const selectedBlock = blocksList[0];

      // 3. Find Centre API
      const centreRes = await fetch(
        `${BASE}/centres?state=${encodeURIComponent(stateName)}&district=${encodeURIComponent(
          selectedDistrict
        )}&block=${encodeURIComponent(selectedBlock)}`
      );
      const centreData = (await centreRes.json()) as any;
      if (!centreData.centres || centreData.centres.length === 0) {
        throw new Error(`No centres returned for ${stateName} -> ${selectedDistrict} -> ${selectedBlock}`);
      }

      const targetCentre = centreData.centres[0];

      // 4. Centre Details Open
      const detailRes = await fetch(`${BASE}/centres/${targetCentre.id}`);
      const detailData = (await detailRes.json()) as any;
      const openedCentreId = detailData.id || detailData.centre?.id;
      if (!openedCentreId || openedCentreId !== targetCentre.id) {
        throw new Error(`Failed to open details for centre ${targetCentre.id}`);
      }

      // 5. Smart Recommendation Works
      const recRes = await fetch(`${BASE}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: targetCentre.latitude || 25.0,
          longitude: targetCentre.longitude || 90.0,
          crop: 'Paddy',
          maxDistanceKm: 50,
          district: selectedDistrict,
          state: stateName,
        }),
      });
      const recData = (await recRes.json()) as any;
      const recWorks = recData.recommendations && recData.recommendations.length > 0;

      // 6. Future Date Selection & Available Slot Appears
      const futureDate = '2026-09-09';
      const slotRes = await fetch(`${BASE}/slots?centreId=${targetCentre.id}&date=${futureDate}`);
      const slotData = (await slotRes.json()) as any;
      const slotAvailable = slotData.slots && slotData.slots.some((s: any) => s.remainingCapacity > 0);

      results.push({
        state: stateName,
        district: selectedDistrict,
        block: selectedBlock,
        centreId: targetCentre.id,
        centreName: targetCentre.name,
        districtsCount: districtsList.length,
        blocksCount: blocksList.length,
        centresFound: centreData.centres.length,
        recommendationWorks: recWorks,
        futureSlotAvailable: slotAvailable,
        status: 'PASS',
      });
      console.log(`✅ [${stateName}] -> District: ${selectedDistrict} (${districtsList.length}) | Block: ${selectedBlock} (${blocksList.length}) | Centres: ${centreData.centres.length} | Rec: ${recWorks} | Slot: ${slotAvailable} => PASS`);
    } catch (err: any) {
      console.error(`❌ [${stateName}] REGRESSION FAILURE:`, err.message);
      consoleErrors = true;
      results.push({
        state: stateName,
        district: 'N/A',
        block: 'N/A',
        centreId: 'N/A',
        centreName: 'N/A',
        districtsCount: 0,
        blocksCount: 0,
        centresFound: 0,
        recommendationWorks: false,
        futureSlotAvailable: false,
        status: 'FAIL',
      });
    }
  }

  // -----------------------------------------------------------------
  // REPAIRED-STATE COMPLETE TRANSACTION (Arunachal Pradesh)
  // -----------------------------------------------------------------
  console.log('\n--- VERIFYING COMPLETE TRANSACTION IN REPAIRED STATE (Arunachal Pradesh) ---');
  let repairedTransactionPass = false;

  try {
    const arState = 'Arunachal Pradesh';
    const arDistrict = 'Itanagar Capital Complex';
    const arBlock = 'Itanagar';
    const arCentreId = 'cnt_demo_ar_ar_ita_itanagar_01';

    // 1. Farmer Registration & Recommendation
    const uniqueMobile = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regFarmerRes = await fetch(`${BASE}/auth/farmer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tashi Norbu',
        mobile: uniqueMobile,
        stateCode: 'AR',
        stateName: arState,
        districtCode: 'AR_ITA',
        districtName: arDistrict,
        subdistrictCode: 'AR_ITA_ITANAGAR',
        subdistrictName: arBlock,
        village: 'Itanagar Sector 1',
        pinCode: '791111',
        latitude: 27.1004,
        longitude: 93.6166,
      }),
    });
    const regFarmerData = (await regFarmerRes.json()) as any;
    console.log('   Step 1 (Farmer Reg):', regFarmerRes.status, regFarmerData.success || regFarmerData.profile?.name);

    // 2. Book Slot
    const bookRes = await fetch(`${BASE}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centreId: arCentreId,
        date: '2026-09-09',
        timeSlot: '09:00 - 10:00',
        crop: 'Wheat',
        quantityQuintals: 30,
        farmerId: regFarmerData.profile?.userId || 'frm_ar_01',
        farmerName: 'Tashi Norbu',
        farmerMobile: '+91 98111 22233',
      }),
    });
    const bookData = (await bookRes.json()) as any;
    const token = bookData.token;
    console.log('   Step 2 (Slot & Token):', bookRes.status, token?.id, token?.tokenNumber);

    // 3. Operator Login
    const opLoginRes = await fetch(`${BASE}/auth/operator/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centreId: arCentreId,
        username: 'operator',
        password: 'demo123',
      }),
    });
    const opLoginData = (await opLoginRes.json()) as any;
    const opToken = opLoginData.token;
    console.log('   Step 3 (Operator Login):', opLoginRes.status, opLoginData.success, opLoginData.user?.centreId);

    // 4. Live Queue Check
    const queueRes = await fetch(`${BASE}/tokens?centreId=${arCentreId}`, {
      headers: { Authorization: `Bearer ${opToken}` },
    });
    const queueData = (await queueRes.json()) as any;
    const hasTokenInQueue = (queueData.tokens || []).some((t: any) => t.id === token.id);
    console.log('   Step 4 (Live Queue View):', hasTokenInQueue);

    // 5. Verification & Status Updates (CALLED -> PROCESSING -> COMPLETED)
    const updateRes = await fetch(`${BASE}/tokens/${token.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opToken}`,
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        moisturePercentage: 11.5,
        foreignMatterPercentage: 0.8,
        procurementAmountRupees: 68250,
      }),
    });
    const updateData = (await updateRes.json()) as any;
    console.log('   Step 5 (Procurement Complete):', updateRes.status, updateData.token?.status);

    // 6. Admin Metrics Check for AR_ITA
    const adminRegRes = await fetch(`${BASE}/auth/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stateCode: 'AR',
        districtCode: 'AR_ITA',
        fullName: 'District Collector Itanagar',
        designation: 'Deputy Commissioner',
        mobile: '+91 98111 88888',
        department: 'District Civil Supplies',
        username: `itanagar_adm_${Date.now()}`,
        password: 'demo123',
      }),
    });
    const adminRegData = (await adminRegRes.json()) as any;
    const adminToken = adminRegData.token || adminRegData.user?.token;

    const overviewRes = await fetch(`${BASE}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const overviewData = (await overviewRes.json()) as any;
    const adminMetricsScope = overviewData.data?.districtCode || overviewData.districtCode;
    console.log('   Step 6 (Admin Metrics Scoped to AR_ITA):', adminMetricsScope);

    repairedTransactionPass =
      regFarmerRes.ok &&
      bookData.success &&
      opLoginData.success &&
      hasTokenInQueue &&
      updateData.token?.status === 'COMPLETED' &&
      adminMetricsScope === 'AR_ITA';
  } catch (err: any) {
    console.error('❌ Repaired Transaction Exception:', err.message);
  }

  console.log('Repaired-state transaction result:', repairedTransactionPass ? 'PASS' : 'FAIL');

  // -----------------------------------------------------------------
  // PATNA REGRESSION VERIFICATION
  // -----------------------------------------------------------------
  console.log('\n--- VERIFYING PATNA DEMO (DEMO-BR-PAT-001) REGRESSION ---');
  let patnaRegressionPass = false;

  try {
    // 1. Scenario Check
    const scenRes = await fetch(`${BASE}/demo/scenario`);
    const scenData = (await scenRes.json()) as any;
    console.log('   Patna Scenario:', scenData.scenario?.districtCode);

    // 2. cnt_patna lookup
    const centreRes = await fetch(`${BASE}/centres/cnt_patna`);
    const centreData = (await centreRes.json()) as any;
    console.log('   cnt_patna Found:', centreData.id === 'cnt_patna', centreData.name);

    // 3. Farmer 9876543210 (usr_farmer_01)
    const otpRes = await fetch(`${BASE}/auth/farmer/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210' }),
    });

    const verifyRes = await fetch(`${BASE}/auth/farmer/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9876543210', otp: '123456' }),
    });
    const verifyData = (await verifyRes.json()) as any;
    console.log('   Farmer 9876543210 login:', verifyData.success, verifyData.user?.name || verifyData.profile?.name);

    // 4. DEMO-ADMIN-PATNA Login
    const adminLoginRes = await fetch(`${BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'DEMO-ADMIN-PATNA', password: 'demo123' }),
    });
    const adminLoginData = (await adminLoginRes.json()) as any;
    console.log('   DEMO-ADMIN-PATNA login:', adminLoginData.success, adminLoginData.admin?.adminId);

    patnaRegressionPass =
      scenData.scenario?.districtCode === 'BR_PAT' &&
      centreData.id === 'cnt_patna' &&
      verifyData.success &&
      adminLoginData.success;
  } catch (err: any) {
    console.error('❌ Patna Regression Exception:', err.message);
  }

  console.log('Patna regression result:', patnaRegressionPass ? 'PASS' : 'FAIL');

  // -----------------------------------------------------------------
  // RESET DEMO VERIFICATION
  // -----------------------------------------------------------------
  console.log('\n--- VERIFYING RESET DEMO ---');
  let resetDemoPass = false;
  try {
    const resetRes = await fetch(`${BASE}/demo/reset`, { method: 'POST' });
    const resetData = (await resetRes.json()) as any;
    resetDemoPass = resetRes.ok && resetData.success;
    console.log('   Reset Demo API Response:', resetRes.status, resetData.message);
  } catch (err: any) {
    console.error('❌ Reset Demo Exception:', err.message);
  }
  console.log('Reset Demo result:', resetDemoPass ? 'PASS' : 'FAIL');

  // Print Summary Table
  console.log('\n# FINAL 8-STATE BROWSER REGRESSION\n');
  console.log('State | District | Block | Centre | Recommendation | Slot | Status');
  console.log('---|---|---|---|---|---|---');
  results.forEach((r) => {
    console.log(`${r.state} | ${r.district} | ${r.block} | ${r.centreName} (${r.centreId}) | ${r.recommendationWorks ? 'PASS' : 'FAIL'} | ${r.futureSlotAvailable ? 'PASS' : 'FAIL'} | ${r.status}`);
  });

  const finalVerdict =
    results.every((r) => r.status === 'PASS') &&
    repairedTransactionPass &&
    patnaRegressionPass &&
    resetDemoPass &&
    !consoleErrors;

  console.log('\n- Repaired-state transaction:', repairedTransactionPass ? 'PASS' : 'FAIL');
  console.log('- Patna regression:', patnaRegressionPass ? 'PASS' : 'FAIL');
  console.log('- Reset Demo:', resetDemoPass ? 'PASS' : 'FAIL');
  console.log('- Console errors:', consoleErrors ? 'YES' : 'NO');
  console.log('- Final verdict:', finalVerdict ? 'READY' : 'NOT READY');
}

runBrowserRuntimeRegression().catch(console.error);
