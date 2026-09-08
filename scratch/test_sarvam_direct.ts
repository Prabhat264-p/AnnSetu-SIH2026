/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Direct Sarvam AI STT Real API Smoke Test
 */

import 'dotenv/config';
import { transcribeWithSarvam } from '../server/services/voice/sarvam.service';

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

async function testSarvamDirect() {
  console.log('--- DIRECT SARVAM AI API SMOKE TEST ---');
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.log('SARVAM_API_KEY NOT CONFIGURED');
    return;
  }

  const audioBuffer = createWavAudioBuffer(1.5, 16000);
  try {
    const res = await transcribeWithSarvam(audioBuffer, 'audio/wav', 'hi-IN', 'speech.wav');
    console.log('Sarvam API Response Succeeded! Transcript:', res.transcript);
  } catch (err: any) {
    console.log('Sarvam API returned error:', err.message);
  }
}

testSarvamDirect();
