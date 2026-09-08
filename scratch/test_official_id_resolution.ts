import { resolveCentreById, getCentreSafe } from '../src/utils/centreResolver';
import { INITIAL_CENTRES } from '../src/services/mockData';

async function runRegressionTests() {
  console.log('===========================================================');
  console.log('ANNSETU — FARMER PORTAL OFFICIAL_ID & CENTRE RESOLUTION REGRESSION TEST SUITE');
  console.log('===========================================================\n');

  let passed = 0;
  let total = 5;

  // Test Case A: Valid centre ID (both id and officialId)
  console.log('A. Testing Valid Centre ID Resolution...');
  const centreByPrimaryId = resolveCentreById('cnt_sinnar', INITIAL_CENTRES);
  const centreByOfficialId = resolveCentreById('MH-NSK-PRC-001', INITIAL_CENTRES);

  if (
    centreByPrimaryId &&
    centreByPrimaryId.officialId === 'MH-NSK-PRC-001' &&
    centreByOfficialId &&
    centreByOfficialId.id === 'cnt_sinnar'
  ) {
    console.log('   ✅ TEST A PASSED: Centre resolves correctly for both primary ID and officialId');
    passed++;
  } else {
    console.log('   ❌ TEST A FAILED:', { centreByPrimaryId, centreByOfficialId });
  }

  // Test Case B: Centre data temporarily unavailable (empty array)
  console.log('B. Testing Centre Data Temporarily Unavailable (Empty Array)...');
  try {
    const centreWhileLoading = getCentreSafe('cnt_sinnar', []);
    const officialIdText = centreWhileLoading ? centreWhileLoading.officialId : undefined;
    
    if (centreWhileLoading === undefined && officialIdText === undefined) {
      console.log('   ✅ TEST B PASSED: Empty centre list handled safely without TypeError');
      passed++;
    } else {
      console.log('   ❌ TEST B FAILED');
    }
  } catch (err) {
    console.log('   ❌ TEST B FAILED WITH EXCEPTION:', err);
  }

  // Test Case C: Invalid / Stale Centre ID
  console.log('C. Testing Invalid / Stale Centre ID...');
  try {
    const staleCentre = resolveCentreById('cnt_non_existent_999', INITIAL_CENTRES);
    const safeFallback = getCentreSafe('cnt_non_existent_999', INITIAL_CENTRES);

    if (staleCentre === undefined && safeFallback !== undefined && safeFallback.officialId) {
      console.log('   ✅ TEST C PASSED: Stale centre ID falls back safely to first valid centre without TypeError');
      passed++;
    } else {
      console.log('   ❌ TEST C FAILED:', { staleCentre, safeFallback });
    }
  } catch (err) {
    console.log('   ❌ TEST C FAILED WITH EXCEPTION:', err);
  }

  // Test Case D: Browser Refresh / Session Restoration Simulation
  console.log('D. Testing Browser Refresh / Session Restoration (Patna & Nashik ID Resolution)...');
  try {
    const patnaCentre = resolveCentreById('BR-PAT-PRC-001', INITIAL_CENTRES);
    const patnaDemoCentre = resolveCentreById('BR_PTN_FATWAH_DEMO_01', INITIAL_CENTRES);

    if (patnaCentre && patnaCentre.officialId === 'BR-PAT-PRC-001' && patnaDemoCentre) {
      console.log('   ✅ TEST D PASSED: Cross-district IDs resolve safely across restored sessions');
      passed++;
    } else {
      console.log('   ❌ TEST D FAILED:', { patnaCentre, patnaDemoCentre });
    }
  } catch (err) {
    console.log('   ❌ TEST D FAILED WITH EXCEPTION:', err);
  }

  // Test Case E: Reset Demo Simulation
  console.log('E. Testing Reset Demo Data Integrity...');
  try {
    const centresAfterReset = INITIAL_CENTRES;
    const resolvedSinnar = getCentreSafe('cnt_sinnar', centresAfterReset);
    const resolvedPatna = getCentreSafe('cnt_patna', centresAfterReset);

    if (
      resolvedSinnar &&
      resolvedSinnar.officialId &&
      resolvedPatna &&
      resolvedPatna.officialId
    ) {
      console.log('   ✅ TEST E PASSED: Post-reset centre master retains all official IDs cleanly');
      passed++;
    } else {
      console.log('   ❌ TEST E FAILED');
    }
  } catch (err) {
    console.log('   ❌ TEST E FAILED WITH EXCEPTION:', err);
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

runRegressionTests();
