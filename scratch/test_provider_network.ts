/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Backend Network & Provider Connectivity Diagnostic Suite
 */

import dns from 'dns';
import https from 'https';
import http from 'http';

async function testNetworkConnectivity() {
  console.log('====================================================');
  console.log('ANNSETU — BACKEND OUTBOUND NETWORK DIAGNOSTIC SUITE');
  console.log('====================================================\n');
  console.log(`Node Version: ${process.version}`);
  console.log(`Platform: ${process.platform} (${process.arch})`);
  console.log(`Environment SARVAM_API_KEY: ${process.env.SARVAM_API_KEY ? 'CONFIGURED (' + process.env.SARVAM_API_KEY.length + ' chars)' : 'MISSING'}`);
  console.log(`Environment GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'CONFIGURED (' + process.env.GEMINI_API_KEY.length + ' chars)' : 'MISSING'}\n`);

  const hosts = [
    { name: 'Sarvam AI API', hostname: 'api.sarvam.ai', path: '/speech-to-text', method: 'GET' },
    { name: 'Google Gemini API', hostname: 'generativelanguage.googleapis.com', path: '/v1beta/models', method: 'GET' }
  ];

  for (const target of hosts) {
    console.log(`--- Testing ${target.name} (${target.hostname}) ---`);

    // 1. DNS Lookup Test
    try {
      const addresses = await new Promise<dns.LookupAddress[]>((resolve, reject) => {
        dns.lookup(target.hostname, { all: true }, (err, addrs) => {
          if (err) reject(err);
          else resolve(addrs);
        });
      });
      console.log(`   ✅ DNS Lookup PASS: ${target.hostname} ->`, addresses.map(a => `${a.address} (v${a.family})`).join(', '));
    } catch (err: any) {
      console.error(`   ❌ DNS Lookup FAIL for ${target.hostname}:`, err.code || err.message);
    }

    // 2. Node Native fetch Test
    try {
      const url = `https://${target.hostname}${target.path}`;
      console.log(`   Testing native fetch('${url}')...`);
      const startTime = Date.now();
      const res = await fetch(url, { method: target.method });
      const duration = Date.now() - startTime;
      console.log(`   ✅ Native fetch PASS: HTTP ${res.status} ${res.statusText} (${duration}ms)`);
    } catch (err: any) {
      console.error(`   ❌ Native fetch FAIL for ${target.hostname}:`);
      console.error(`      Error Name: ${err?.name}`);
      console.error(`      Error Message: ${err?.message}`);
      console.error(`      Error Cause:`, err?.cause);
      if (err?.cause) {
        console.error(`      Cause Code: ${err.cause.code}`);
        console.error(`      Cause Message: ${err.cause.message}`);
        console.error(`      Cause Syscall: ${err.cause.syscall}`);
        console.error(`      Cause Errno: ${err.cause.errno}`);
      }
    }

    // 3. Node Native https.request Test
    try {
      console.log(`   Testing node:https request to ${target.hostname}...`);
      const startTime = Date.now();
      const status = await new Promise<number>((resolve, reject) => {
        const req = https.request({
          hostname: target.hostname,
          port: 443,
          path: target.path,
          method: target.method,
          timeout: 5000,
        }, (res) => {
          resolve(res.statusCode || 0);
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('HTTPS Request Timed Out (5s)'));
        });
        req.end();
      });
      const duration = Date.now() - startTime;
      console.log(`   ✅ node:https request PASS: HTTP ${status} (${duration}ms)`);
    } catch (err: any) {
      console.error(`   ❌ node:https request FAIL for ${target.hostname}:`, err.code || err.message);
    }

    console.log('');
  }
}

testNetworkConnectivity().catch(err => {
  console.error('Diagnostic error:', err);
});
