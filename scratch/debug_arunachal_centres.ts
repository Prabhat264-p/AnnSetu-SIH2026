import fetch from 'node-fetch';
import { dbCentres } from '../server/data/db';
import { generateAllDemoCentres } from '../src/services/centre/centreGeneratorService';
import { INITIAL_CENTRES } from '../src/data/mockData';

async function debugCentres() {
  console.log('--- DIRECT dbCentres IN MEMORY ---');
  const allGenerated = generateAllDemoCentres([...INITIAL_CENTRES]);
  console.log('Total generated centres:', allGenerated.length);

  const arCentres = allGenerated.filter((c) => c.state === 'Arunachal Pradesh');
  console.log('Arunachal Pradesh centres count in generator:', arCentres.length);
  if (arCentres.length > 0) {
    console.log('First AR centre:', {
      id: arCentres[0].id,
      state: arCentres[0].state,
      district: arCentres[0].district,
      block: arCentres[0].block,
    });
  }

  console.log('\n--- LIVE SERVER GET /api/centres ---');
  const res = await fetch('http://localhost:3000/api/centres');
  const data = await res.json() as any;
  console.log('Live server total centres count:', data.count || data.centres?.length);
  
  if (data.centres) {
    const liveAr = data.centres.filter((c: any) => c.state === 'Arunachal Pradesh');
    console.log('Live server Arunachal Pradesh centres count:', liveAr.length);
  }

  console.log('\n--- LIVE SERVER GET /api/centres?state=Arunachal%20Pradesh ---');
  const resAr = await fetch('http://localhost:3000/api/centres?state=Arunachal%20Pradesh');
  const dataAr = await resAr.json() as any;
  console.log('Live server filter by state=Arunachal Pradesh count:', dataAr.count || dataAr.centres?.length);

  console.log('\n--- LIVE SERVER GET /api/centres?state=Arunachal%20Pradesh&district=Itanagar%20Capital%20Complex ---');
  const resArDist = await fetch('http://localhost:3000/api/centres?state=Arunachal%20Pradesh&district=Itanagar%20Capital%20Complex');
  const dataArDist = await resArDist.json() as any;
  console.log('Live server filter by district count:', dataArDist.count || dataArDist.centres?.length);
}

debugCentres().catch(console.error);
