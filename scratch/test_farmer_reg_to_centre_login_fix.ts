import { AuthService } from '../server/services/auth.service';
import { CentreService } from '../server/services/centre.service';
import { dbCentres } from '../server/data/db';

async function verifyBackendPayloads() {
  console.log('=== 1. Testing AuthService.loginOperator payload ===');
  const res = AuthService.loginOperator({
    centreId: 'cnt_sinnar',
    username: 'operator',
    password: 'demo123',
  });

  console.log('Status:', res.status);
  console.log('User Object:', res.data.user);
  console.log('Has user.id?:', res.data.user?.id ? 'YES (' + res.data.user.id + ')' : 'NO (BUG)');
  console.log('Has user.role?:', res.data.user?.role);
  console.log('Has user.centreId?:', res.data.user?.centreId);

  console.log('\n=== 2. Testing CentreService.getCentres({}) ===');
  const centresRes = CentreService.getCentres({});
  console.log('Count:', centresRes.data.count);
  console.log('First Centre ID:', centresRes.data.centres[0]?.id);
}

verifyBackendPayloads().catch(console.error);
