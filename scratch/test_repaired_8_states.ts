import {
  validateLocationMaster,
  getStatesList,
  getDistrictsForState,
  getBlocksForDistrict,
  DISTRICTS_MASTER,
  INDIA_STATES_UTS,
} from '../src/services/location/locationService';
import {
  generateAllDemoCentres,
  getCoverageReport,
  validateDemoCentresCoverage,
} from '../src/services/centre/centreGeneratorService';
import { INITIAL_CENTRES } from '../src/data/mockData';

console.log('=== ANNSETU 8-STATE REPAIR VERIFICATION ===\n');

// 1. Location Master Integrity
const locValidation = validateLocationMaster();
console.log('1. Location Master Validation:');
console.log('   isValid:', locValidation.isValid);
console.log('   stateCount:', locValidation.stateCount);
console.log('   utCount:', locValidation.utCount);
console.log('   total:', locValidation.total);
console.log('   errors:', locValidation.errors);

// 2. Check 8 Repaired States in DISTRICTS_MASTER
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

console.log('\n2. Repaired 8 States Details:');
repairedStates.forEach((stateName) => {
  const districts = DISTRICTS_MASTER[stateName];
  if (!districts) {
    console.error(`   ERROR: ${stateName} missing from DISTRICTS_MASTER!`);
  } else {
    console.log(`   State: ${stateName}`);
    districts.forEach((d) => {
      console.log(`     District: ${d.name} (${d.code}) -> Blocks (${d.blocks.length}): ${d.blocks.join(', ')}`);
    });
  }
});

// 3. Complete Master Statistics
let totalDistricts = 0;
let totalBlocks = 0;
let statesInMaster = Object.keys(DISTRICTS_MASTER).length;

Object.entries(DISTRICTS_MASTER).forEach(([state, dists]) => {
  totalDistricts += dists.length;
  dists.forEach((d) => {
    totalBlocks += d.blocks.length;
  });
});

console.log('\n3. Location Master Statistics:');
console.log(`   Total States/UTs in INDIA_STATES_UTS: ${INDIA_STATES_UTS.length}`);
console.log(`   Total States/UTs in DISTRICTS_MASTER: ${statesInMaster}`);
console.log(`   Total Districts in DISTRICTS_MASTER: ${totalDistricts}`);
console.log(`   Total Blocks in DISTRICTS_MASTER: ${totalBlocks}`);

// 4. Generate Demo Centres & Audit Coverage
const centres = generateAllDemoCentres([...INITIAL_CENTRES]);
console.log('\n4. Demo Centres Summary:');
console.log(`   Total Generated Demo Centres: ${centres.length}`);

const covReport = getCoverageReport(centres);
console.log('\n5. Coverage Audit Report:');
console.log('   Total Subdistricts (Blocks):', covReport.totalSubdistricts);
console.log('   Blocks with 3 Centres:', covReport.subdistrictsWith3Centres);
console.log('   Blocks with 2 Centres:', covReport.subdistrictsWith2Centres);
console.log('   Blocks with 1 Centre:', covReport.subdistrictsWith1Centre);
console.log('   Blocks with 0 Centres:', covReport.subdistrictsWith0Centres);
console.log('   Coverage Percentage:', covReport.coveragePercentage + '%');

const demoValidation = validateDemoCentresCoverage(centres);
console.log('\n6. Demo Centre Coverage Validation:');
console.log('   isValid:', demoValidation.isValid);
console.log('   minCentresPerBlock:', demoValidation.minCentresPerBlock);
console.log('   errors count:', demoValidation.errors.length);
if (demoValidation.errors.length > 0) {
  console.log('   First 5 errors:', demoValidation.errors.slice(0, 5));
}

// 7. Verify Patna Demo Centre Preservation
const patnaDemo = centres.find((c) => c.officialId === 'DEMO-BR-PAT-001' || c.id === 'cnt_demo_br_pat_danapur_01' || c.id === 'BR_PTN_FATWAH_DEMO_01');
console.log('\n7. Patna Demo Centre Check:');
console.log('   Patna Demo Centre Found:', !!patnaDemo);
if (patnaDemo) {
  console.log(`   ID: ${patnaDemo.id}, Name: ${patnaDemo.name}, Official ID: ${patnaDemo.officialId}`);
}

console.log('\n=== VERIFICATION COMPLETE ===');
