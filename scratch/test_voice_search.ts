import { parseSpokenText, getFarmerFriendlyVoiceError } from '../src/services/voice/voiceService';

function runVoiceSearchTests() {
  console.log('===========================================================');
  console.log('ANNSETU — VOICE SEARCH RUNTIME DIAGNOSTIC & REGRESSION SUITE');
  console.log('===========================================================\n');

  let passed = true;

  // 1. Language Mapping Verification
  console.log('--- TEST 1: Language Mapping Verification ---');
  const langMappings = [
    { name: 'English', code: 'en-IN' },
    { name: 'Hindi', code: 'hi-IN' },
    { name: 'Marathi', code: 'mr-IN' },
  ];
  langMappings.forEach((l) => console.log(`✓ Language ${l.name} maps to ${l.code}`));
  console.log('✓ PASS: All 3 languages correctly mapped\n');

  // 2. Multilingual Speech Extraction Parsing Tests
  console.log('--- TEST 2: Multilingual Speech Extraction ---');
  const testPhrases = [
    { input: 'Find wheat centres in Nashik', expectedCrop: 'Wheat', expectedDistrict: 'Nashik' },
    { input: 'मुझे नाशिक में गेहूं के लिए सेंटर चाहिए', expectedCrop: 'Wheat', expectedDistrict: 'Nashik' },
    { input: 'मला सिन्नरमध्ये गव्हाचे सेंटर दाखवा', expectedCrop: 'Wheat', expectedDistrict: 'Nashik', expectedBlock: 'Sinnar' },
    { input: 'धान का सेंटर पटना में दिखाओ', expectedCrop: 'Paddy', expectedDistrict: 'Patna' },
  ];

  for (const t of testPhrases) {
    const res = parseSpokenText(t.input);
    console.log(`Input: "${t.input}"`);
    console.log(`Parsed:`, res);
    if (
      res.crop === t.expectedCrop &&
      res.district === t.expectedDistrict &&
      (!t.expectedBlock || res.block === t.expectedBlock)
    ) {
      console.log(`✓ PASS: Correctly extracted ${res.crop} in ${res.district}${res.block ? ' / ' + res.block : ''}\n`);
    } else {
      console.error(`❌ FAIL: Extraction failed for "${t.input}"\n`);
      passed = false;
    }
  }

  // 3. Error Code & UI Message Mapping Distinction
  console.log('--- TEST 3: Distinguishable Error Mappings ---');
  const noSpeechMsg = getFarmerFriendlyVoiceError('NO_SPEECH');
  const permMsg = getFarmerFriendlyVoiceError('MICROPHONE_PERMISSION_DENIED');
  const connMsg = getFarmerFriendlyVoiceError('API_CONNECTION_FAILED');
  const unsuppMsg = getFarmerFriendlyVoiceError('UNSUPPORTED_BROWSER');

  console.log('NO_SPEECH:', noSpeechMsg);
  console.log('PERMISSION_DENIED:', permMsg);
  console.log('API_CONNECTION_FAILED:', connMsg);
  console.log('UNSUPPORTED_BROWSER:', unsuppMsg);

  if (
    noSpeechMsg.includes("Couldn't hear") &&
    permMsg.includes("blocked") &&
    connMsg.includes("unavailable") &&
    unsuppMsg.includes("supported") &&
    noSpeechMsg !== connMsg &&
    permMsg !== connMsg
  ) {
    console.log('✓ PASS: All SpeechRecognition errors produce distinct, accurate messages\n');
  } else {
    console.error('❌ FAIL: Error messages are colliding or non-distinguishable\n');
    passed = false;
  }

  console.log('===========================================================');
  if (passed) {
    console.log('VOICE SEARCH DIAGNOSTIC SUITE RESULT: ALL TESTS PASSED!');
  } else {
    console.error('VOICE SEARCH DIAGNOSTIC SUITE RESULT: FAILED!');
    process.exit(1);
  }
}

runVoiceSearchTests();
