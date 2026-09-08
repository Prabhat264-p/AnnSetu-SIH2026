/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sarvam AI WebM Audio Format Diagnostic Test
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { transcribeWithSarvam } from '../server/services/voice/sarvam.service';

async function testWebmFormat() {
  console.log('=== TESTING SARVAM AI WEBM AUDIO FORMAT SUPPORT ===');
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.log('SARVAM_API_KEY is missing');
    return;
  }

  // Create a minimal WebM header / audio buffer or test buffer
  // WebM EBML header magic bytes: 0x1A 0x45 0xDF 0xA3
  const webmHeader = Buffer.from([
    0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81,
    0x04, 0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, 0x42, 0x87, 0x81, 0x04,
    0x42, 0x85, 0x81, 0x02, 0x18, 0x53, 0x80, 0x67,
  ]);

  const testBuffer = Buffer.concat([webmHeader, Buffer.alloc(10000)]);

  try {
    console.log('Sending WebM buffer to Sarvam API...');
    const result = await transcribeWithSarvam(testBuffer, 'audio/webm', 'hi-IN', 'speech.webm');
    console.log('Sarvam WebM Result:', result);
  } catch (err: any) {
    console.log('Sarvam WebM Error:', err.message);
  }
}

testWebmFormat();
