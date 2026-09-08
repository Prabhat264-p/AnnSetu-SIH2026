import fetch from 'node-fetch';

async function testBlockQuery() {
  const url = 'http://localhost:3000/api/centres?state=Arunachal%20Pradesh&district=Itanagar%20Capital%20Complex&block=Itanagar';
  console.log('Fetching:', url);
  const res = await fetch(url);
  const data = await res.json() as any;
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testBlockQuery().catch(console.error);
