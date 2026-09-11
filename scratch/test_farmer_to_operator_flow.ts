import { AuthService } from '../server/services/auth.service';
import { CentreService } from '../server/services/centre.service';
import { dbCentres, dbSessions, dbFarmerProfiles, dbOperatorAccounts } from '../server/data/db';

async function runTest() {
  console.log('--- Initial State ---');
  console.log('Total dbCentres:', dbCentres.length);

  const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  // 1. Farmer Registration
  console.log('\n--- Step 1: Farmer Registration ---');
  const farmerRegRes = AuthService.registerFarmer({
    mobile: testMobile,
    name: 'Ramesh Patel',
    stateName: 'Gujarat',
    districtName: 'Ahmedabad',
    subdistrictName: 'Daskroi',
    village: 'Sanand Road',
  });
  console.log('Farmer Reg Result:', farmerRegRes.status, farmerRegRes.data);
  console.log('Total dbCentres after farmer reg:', dbCentres.length);

  // 2. Farmer OTP verify
  console.log('\n--- Step 2: Farmer OTP verify ---');
  const otpRes = AuthService.verifyFarmerOtp(testMobile, '123456');
  console.log('Farmer OTP Result:', otpRes.status, otpRes.data.success, 'Token:', otpRes.data.token ? 'YES' : 'NO');
  const farmerToken = otpRes.data.token;

  // 3. GET /api/auth/me for farmer
  const meResFarmer = AuthService.getAuthMe({ headers: { authorization: `Bearer ${farmerToken}` } } as any);
  console.log('GET /auth/me for Farmer:', meResFarmer.status, meResFarmer.data.user?.role, meResFarmer.data.user?.district);

  // 4. Operator Login
  console.log('\n--- Step 4: Centre / Operator Login ---');
  const opLoginRes = AuthService.loginOperator({
    centreId: 'cnt_sinnar',
    username: 'operator',
    password: 'demo123',
  });
  console.log('Operator Login Result:', opLoginRes.status, opLoginRes.data.success, 'Token:', opLoginRes.data.token ? 'YES' : 'NO');
  const opToken = opLoginRes.data.token;

  // 5. GET /api/auth/me for Operator
  const meResOp = AuthService.getAuthMe({ headers: { authorization: `Bearer ${opToken}` } } as any);
  console.log('GET /auth/me for Operator:', meResOp.status, meResOp.data.user?.role, meResOp.data.user?.centreId);

  // 6. Get Operator Centre
  const opCentreRes = CentreService.getOperatorCentre({ headers: { authorization: `Bearer ${opToken}` } } as any);
  console.log('Get Operator Centre:', opCentreRes.status, opCentreRes.data.success, opCentreRes.data.centre?.name);

  // 7. Get All Centres
  const allCentresRes = CentreService.getCentres({});
  console.log('Get All Centres Count:', allCentresRes.data.count);
}

runTest().catch(console.error);
