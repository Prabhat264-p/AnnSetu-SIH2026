/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AnnSetu Indian-Language AI STT Provider & Fallback Verification Suite
 */

import { parseSpokenText, getFarmerFriendlyVoiceError } from '../src/services/voice/voiceService';
import { transcribeAudio } from '../server/services/voice/voiceTranscription.service';
import fs from 'fs';
import path from 'path';

async function runVoiceSTTVerificationSuite() {
  console.log('=== ANNSETU VOICE STT INTEGRATION & FALLBACK VERIFICATION ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
    }
  }

  // TEST 1: Multilingual Natural Spoken Text Parsing (Hindi, Marathi, English)
  console.log('1. Testing Natural Spoken Text Parameter Extractor (parseSpokenText)...');

  const hindiParsed = parseSpokenText('मुझे नाशिक में गेहूं के लिए सेंटर चाहिए');
  assert(hindiParsed.crop === 'Wheat', 'Hindi phrase extracts Wheat crop');
  assert(hindiParsed.district === 'Nashik', 'Hindi phrase extracts Nashik district');

  const marathiParsed = parseSpokenText('मला सिन्नरंमध्ये गव्हाचे सेंटर दाखवा');
  assert(marathiParsed.crop === 'Wheat', 'Marathi phrase extracts Wheat crop');
  assert(marathiParsed.district === 'Nashik' && marathiParsed.block === 'Sinnar', 'Marathi phrase extracts Sinnar block & Nashik district');

  const englishParsed = parseSpokenText('Find wheat centres in Nashik');
  assert(englishParsed.crop === 'Wheat' && englishParsed.district === 'Nashik', 'English phrase extracts Wheat crop and Nashik district');

  const qtyParsed = parseSpokenText('मुझे पटना में 50 क्विंटल धान के लिए सेंटर चाहिए');
  assert(qtyParsed.crop === 'Paddy' && qtyParsed.district === 'Patna' && qtyParsed.quantity === 50, 'Quantity phrase extracts 50 Quintals Paddy in Patna');

  // TEST 2: Provider Fallback Logic (When API keys are missing/invalid)
  console.log('\n2. Testing Primary (Sarvam) -> Secondary (Gemini) -> Fallback Error Handling...');
  
  const dummyBuffer = Buffer.from('mock_audio_data_bytes_12345');
  const result = await transcribeAudio(dummyBuffer, 'audio/webm', 'hi-IN');

  assert(typeof result.success === 'boolean', 'Transcribe returns structured result with success boolean');
  if (!result.success) {
    assert(result.errorCode === 'API_CONNECTION_FAILED', 'Returns API_CONNECTION_FAILED when providers fail');
    assert(result.error !== undefined && result.error.length > 0, 'Returns farmer-friendly error message');
  }

  // TEST 3: Farmer-Friendly Error Message Mapping
  console.log('\n3. Testing Farmer-Friendly Error Message Mappings...');
  
  assert(
    getFarmerFriendlyVoiceError('API_CONNECTION_FAILED').includes('unavailable'),
    'API_CONNECTION_FAILED maps to service unavailable message'
  );
  assert(
    getFarmerFriendlyVoiceError('MICROPHONE_PERMISSION_DENIED').includes('permission'),
    'MICROPHONE_PERMISSION_DENIED maps to permission message'
  );
  assert(
    getFarmerFriendlyVoiceError('NO_SPEECH').includes("hear"),
    'NO_SPEECH maps to speech not heard message'
  );

  // TEST 4: Frontend API Key Security Audit
  console.log('\n4. Security Audit: Verifying NO API Keys exposed in src/ directory...');
  
  function scanDirForKeys(dir: string): boolean {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!scanDirForKeys(fullPath)) return false;
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('SARVAM_API_KEY') || content.includes('GEMINI_API_KEY')) {
          console.error(`  ❌ [SECURITY FAILURE] Key string found in ${fullPath}`);
          return false;
        }
      }
    }
    return true;
  }

  const srcDir = path.resolve(process.cwd(), 'src');
  const srcSecure = scanDirForKeys(srcDir);
  assert(srcSecure, 'No API keys or key references found in src/ directory');

  console.log(`\n=== SUMMARY: ${passed}/${total} VERIFICATION CHECKS PASSED ===\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runVoiceSTTVerificationSuite().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
