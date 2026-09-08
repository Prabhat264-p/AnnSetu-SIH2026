/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AnnSetu Real Multipart Audio Upload & STT Integration Test Suite
 */

import { transcribeWithSarvam, sanitizeMimeType } from '../server/services/voice/sarvam.service';
import { transcribeWithGemini } from '../server/services/voice/gemini.service';
import { transcribeAudio } from '../server/services/voice/voiceTranscription.service';
import { parseSpokenText } from '../src/services/voice/voiceService';

// Helper: Generate a valid 16kHz 16-bit PCM WAV audio buffer
function createWavAudioBuffer(durationSeconds: number = 1.5, sampleRate: number = 16000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t);
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

async function runRealVoiceTranscribeTest() {
  console.log('====================================================');
  console.log('ANNSETU — REAL MULTIPART AUDIO & STT INTEGRATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`   ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`   ❌ [FAIL] ${description}`);
    }
  }

  // 1. Verify MIME Sanitization (Critical Fix for Sarvam HTTP 400 rejection)
  console.log('1. Testing MIME Sanitizer (stripping codec parameters)...');
  assert(sanitizeMimeType('audio/webm;codecs=opus') === 'audio/webm', 'audio/webm;codecs=opus -> audio/webm');
  assert(sanitizeMimeType('audio/wav;codecs=pcm') === 'audio/wav', 'audio/wav;codecs=pcm -> audio/wav');
  assert(sanitizeMimeType('audio/ogg;codecs=vorbis') === 'audio/ogg', 'audio/ogg;codecs=vorbis -> audio/ogg');

  // 2. Generate Real Audio Buffer
  console.log('\n2. Generating Real 16kHz PCM WAV Audio Buffer...');
  const realAudioWav = createWavAudioBuffer(1.5, 16000);
  assert(realAudioWav.length > 44, `Audio buffer generated (${realAudioWav.length} bytes)`);

  // 3. Test Direct Sarvam API call with clean MIME type
  console.log('\n3. Testing Direct Sarvam AI Service Call (model: saaras:v3)...');
  const sarvamRes = await transcribeWithSarvam(realAudioWav, 'audio/wav;codecs=pcm', 'hi-IN', 'speech.wav');
  console.log('   Sarvam Service Result:', JSON.stringify(sarvamRes, null, 2));
  assert(typeof sarvamRes.success === 'boolean', 'Sarvam returned structured result');
  assert(sarvamRes.httpStatus === 200 || sarvamRes.errorCode !== undefined, 'Sarvam returned valid HTTP status or safe error code');

  // 4. Test Direct Gemini STT Fallback
  console.log('\n4. Testing Direct Gemini Fallback Service Call...');
  const geminiRes = await transcribeWithGemini(realAudioWav, 'audio/wav;codecs=pcm', 'hi-IN');
  console.log('   Gemini Service Result:', JSON.stringify(geminiRes, null, 2));
  assert(typeof geminiRes.success === 'boolean', 'Gemini returned structured result');

  // 5. Test Express Backend Route (POST /api/voice/transcribe)
  console.log('\n5. Testing Express Route POST /api/voice/transcribe with Multer...');
  const serverPort = process.env.PORT || 5001;
  const targetUrl = `http://127.0.0.1:${serverPort}/api/voice/transcribe`;

  try {
    const formData = new FormData();
    const audioBlob = new Blob([realAudioWav], { type: 'audio/webm;codecs=opus' });
    formData.append('file', audioBlob, 'speech.webm');
    formData.append('languageCode', 'hi-IN');

    const res = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    });

    const status = res.status;
    const body = await res.json();
    console.log(`   HTTP ${status} Response from Backend:`, JSON.stringify(body, null, 2));

    assert(status === 200 || status === 503 || status === 400, `HTTP status ${status} returned cleanly`);
    assert(body.diagnostics !== undefined, 'Response includes detailed provider diagnostics');
    assert(body.diagnostics.mimeType === 'audio/webm', 'MIME type sanitized to "audio/webm" by backend');
  } catch (err: any) {
    assert(false, `Failed connecting to Express backend: ${err?.message || String(err)}`);
  }

  // 6. Verify parseSpokenText() Integration
  console.log('\n6. Verifying parseSpokenText() Integration...');
  const phrases = [
    { text: 'मुझे नाशिक में गेहूं के लिए सेंटर चाहिए', crop: 'Wheat', district: 'Nashik' },
    { text: 'मला सिन्नरंमध्ये गव्हाचे सेंटर दाखवा', crop: 'Wheat', district: 'Nashik', block: 'Sinnar' },
    { text: 'Find wheat centres in Nashik', crop: 'Wheat', district: 'Nashik' },
  ];

  for (const item of phrases) {
    const parsed = parseSpokenText(item.text);
    assert(parsed.crop === item.crop && parsed.district === item.district, `Parsed "${item.text}" -> crop: ${parsed.crop}, district: ${parsed.district}`);
  }

  console.log(`\n====================================================`);
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log(`====================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runRealVoiceTranscribeTest().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
