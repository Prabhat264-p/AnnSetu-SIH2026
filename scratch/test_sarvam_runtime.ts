/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Standalone Sarvam AI STT Real API Smoke & Diagnosis Test
 */

import 'dotenv/config';

// Helper: Generate a valid 16kHz 16-bit PCM WAV audio buffer with speech-like frequencies
function createWavAudioBuffer(durationSeconds: number = 2.0, sampleRate: number = 16000): Buffer {
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

  // Generate multi-tone audio
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 300 * t) * 0.5 + Math.sin(2 * Math.PI * 800 * t) * 0.3;
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

async function testSarvamRuntime() {
  console.log('=== SARVAM AI REAL RUNTIME DIAGNOSTIC ===');
  const apiKey = process.env.SARVAM_API_KEY;
  console.log('SARVAM_API_KEY Status:', apiKey ? 'CONFIGURED (Length: ' + apiKey.length + ')' : 'MISSING');

  if (!apiKey) {
    console.error('ERROR: SARVAM_API_KEY is missing from process.env');
    return;
  }

  const audioBuffer = createWavAudioBuffer(2.0, 16000);
  console.log(`Audio Buffer prepared: ${audioBuffer.length} bytes, 16kHz WAV`);

  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
  formData.append('file', audioBlob, 'speech.wav');
  formData.append('model', 'saaras:v3');
  formData.append('mode', 'transcribe');
  formData.append('language_code', 'hi-IN');

  try {
    console.log('Posting request to https://api.sarvam.ai/speech-to-text...');
    const startTime = Date.now();
    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey.trim(),
      },
      body: formData,
    });
    const elapsed = Date.now() - startTime;

    console.log(`Sarvam HTTP Status: ${response.status} ${response.statusText} (${elapsed}ms)`);
    const resText = await response.text();
    console.log('Sarvam Response Body:', resText);

    try {
      const json = JSON.parse(resText);
      console.log('Parsed JSON keys:', Object.keys(json));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  } catch (err: any) {
    console.error('Fetch Exception during Sarvam request:', err?.message || String(err));
  }
}

testSarvamRuntime();
