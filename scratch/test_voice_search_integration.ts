import { parseSpokenText } from '../src/services/voice/voiceService';
import { ALL_DEMO_CENTRES } from '../src/data/mockData';

console.log('==================================================');
console.log('ANNSETU VOICE SEARCH INTEGRATION TEST SUITE');
console.log('==================================================\n');

let passCount = 0;
let totalCount = 0;

function assertTest(
  description: string,
  input: string,
  expected: { crop?: string; state?: string; district?: string; block?: string }
) {
  totalCount++;
  console.log(`[TEST ${totalCount}] ${description}`);
  console.log(`  Input: "${input}"`);
  const parsed = parseSpokenText(input);

  let passed = true;
  if (expected.crop !== undefined && parsed.crop !== expected.crop) {
    console.error(`  ❌ Crop mismatch: expected '${expected.crop}', got '${parsed.crop}'`);
    passed = false;
  }
  if (expected.state !== undefined && parsed.state !== expected.state) {
    console.error(`  ❌ State mismatch: expected '${expected.state}', got '${parsed.state}'`);
    passed = false;
  }
  if (expected.district !== undefined && parsed.district !== expected.district) {
    console.error(`  ❌ District mismatch: expected '${expected.district}', got '${parsed.district}'`);
    passed = false;
  }
  if (expected.block !== undefined && parsed.block !== expected.block) {
    console.error(`  ❌ Block mismatch: expected '${expected.block}', got '${parsed.block}'`);
    passed = false;
  }

  if (passed) {
    passCount++;
    console.log(`  ✅ PASS -> Crop: ${parsed.crop}, State: ${parsed.state} (${parsed.stateCode}), District: ${parsed.district} (${parsed.districtCode}), Block: ${parsed.block}`);
  } else {
    console.log('  FULL PARSED RESULT:', parsed);
  }
  console.log('');
}

// 1. Barrackpore English Voice Search (Critical User Bug Case)
assertTest(
  'Barrackpore Wheat English Search',
  'Find Wheat Center at Barrackpore',
  { crop: 'Wheat', state: 'West Bengal', district: 'North 24 Parganas', block: 'Barrackpore' }
);

// 2. Danapur Hindi Voice Search
assertTest(
  'Danapur Wheat Voice Search',
  'Danapur me wheat centre chahiye',
  { crop: 'Wheat', state: 'Bihar', district: 'Patna', block: 'Danapur' }
);

// 3. Nashik English Search
assertTest(
  'Nashik Wheat English Search',
  'Find wheat centres in Nashik',
  { crop: 'Wheat', state: 'Maharashtra', district: 'Nashik', block: 'All Blocks' }
);

// 4. Nashik Hindi Search
assertTest(
  'Nashik Wheat Hindi Search',
  'नाशिक में गेहूं केंद्र चाहिए',
  { crop: 'Wheat', state: 'Maharashtra', district: 'Nashik', block: 'All Blocks' }
);

// 5. Sinnar Marathi Search
assertTest(
  'Sinnar Wheat Marathi Search',
  'Sinnar madhe wheat centre pahije',
  { crop: 'Wheat', state: 'Maharashtra', district: 'Nashik', block: 'Sinnar' }
);

// 6. Panaji Rice Search
assertTest(
  'Panaji Rice English Search',
  'Find rice centre at Panaji',
  { crop: 'Paddy', state: 'Goa', district: 'North Goa', block: 'Panaji' }
);

// 7. Test Centre Dataset Filtering for Barrackpore & Danapur
console.log('--- CENTRE DATASET FETCH & FILTER VERIFICATION ---');
const allCentres = ALL_DEMO_CENTRES;
console.log(`Total generated APMC centres in dataset: ${allCentres.length}`);

// Barrackpore Verification
const barrackporeVoice = parseSpokenText('Find Wheat Center at Barrackpore');
const barrackporeFiltered = allCentres.filter((c) => {
  const matchState = !barrackporeVoice.state || c.state.toLowerCase() === barrackporeVoice.state.toLowerCase();
  const matchDistrict = !barrackporeVoice.district || c.district.toLowerCase() === barrackporeVoice.district.toLowerCase();
  const matchBlock = !barrackporeVoice.block || c.block === 'All Blocks' || c.block.toLowerCase() === barrackporeVoice.block.toLowerCase();
  const matchCrop = !barrackporeVoice.crop || c.supportedCrops.some((cr) => cr.toLowerCase().includes(barrackporeVoice.crop!.toLowerCase()));
  return matchState && matchDistrict && matchBlock && matchCrop;
});

console.log(`Filtered centres matching Barrackpore + Wheat: ${barrackporeFiltered.length}`);
if (barrackporeFiltered.length > 0) {
  barrackporeFiltered.forEach((c) => {
    console.log(`  🏢 [MATCH] ${c.name} | ID: ${c.id} | Location: ${c.block}, ${c.district}, ${c.state} | Crops: ${c.supportedCrops.join(', ')}`);
  });
  console.log('✅ Barrackpore centre fetch filter PASSED!\n');
} else {
  console.error('❌ Failed: No centres found for Barrackpore + Wheat!\n');
}

// Danapur Verification
const danapurVoice = parseSpokenText('Danapur me wheat centre chahiye');
const danapurFiltered = allCentres.filter((c) => {
  const matchState = !danapurVoice.state || c.state.toLowerCase() === danapurVoice.state.toLowerCase();
  const matchDistrict = !danapurVoice.district || c.district.toLowerCase() === danapurVoice.district.toLowerCase();
  const matchBlock = !danapurVoice.block || c.block === 'All Blocks' || c.block.toLowerCase() === danapurVoice.block.toLowerCase();
  const matchCrop = !danapurVoice.crop || c.supportedCrops.some((cr) => cr.toLowerCase().includes(danapurVoice.crop!.toLowerCase()));
  return matchState && matchDistrict && matchBlock && matchCrop;
});

console.log(`Filtered centres matching Danapur + Wheat: ${danapurFiltered.length}`);
if (danapurFiltered.length > 0) {
  danapurFiltered.forEach((c) => {
    console.log(`  🏢 [MATCH] ${c.name} | ID: ${c.id} | Location: ${c.block}, ${c.district}, ${c.state} | Crops: ${c.supportedCrops.join(', ')}`);
  });
  console.log('✅ Danapur centre fetch filter PASSED!\n');
} else {
  console.error('❌ Failed: No centres found for Danapur + Wheat!\n');
}

console.log('==================================================');
console.log(`FINAL TEST RESULTS: ${passCount} / ${totalCount} PASSED`);
console.log('==================================================');

if (passCount !== totalCount || barrackporeFiltered.length === 0 || danapurFiltered.length === 0) {
  process.exit(1);
}
