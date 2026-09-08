import fetch from 'node-fetch';

async function testLiveServer() {
  console.log('=== TESTING LIVE SERVER COVERAGE & CONSISTENCY ENDPOINTS ===\n');
  const covRes = await fetch('http://localhost:3000/api/dev/demo-coverage');
  const covData = await covRes.json();
  console.log('GET /api/dev/demo-coverage Report:', JSON.stringify(covData, null, 2));

  const conRes = await fetch('http://localhost:3000/api/dev/centre-consistency');
  const conData = await conRes.json();
  console.log('\nGET /api/dev/centre-consistency Report:', JSON.stringify(conData, null, 2));
}

testLiveServer().catch(console.error);
