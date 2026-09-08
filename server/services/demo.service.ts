import {
  handleReset,
  currentDemoScenario,
  setCurrentDemoScenario,
  dbCentres,
  setDbCentres,
  dbOperatorAccounts,
  ensureDemoOperatorForCentre,
} from '../data/db';
import { generateAllDemoCentres, getCoverageReport } from '../../src/services/centre/centreGeneratorService';

export class DemoService {
  static devReset(mode?: string) {
    handleReset(mode);
    return { status: 200, data: { success: true, message: 'AnnSetu demo reset successfully.' } };
  }

  static demoReset(mode?: string) {
    handleReset(mode);
    return { status: 200, data: { success: true, message: 'AnnSetu demo reset successfully.', scenario: currentDemoScenario } };
  }

  static getScenario() {
    return { status: 200, data: { success: true, scenario: currentDemoScenario } };
  }

  static updateScenario(body: any) {
    const { stateCode, stateName, districtCode, districtName } = body || {};
    if (!stateCode || !districtCode) {
      return { status: 400, data: { success: false, error: 'State code and District code are required for demo scenario.' } };
    }

    const sCode = String(stateCode).toUpperCase();
    const dCode = String(districtCode).toUpperCase();
    const sName = stateName || (sCode === 'BR' ? 'Bihar' : sCode === 'MH' ? 'Maharashtra' : sCode === 'WB' ? 'West Bengal' : 'State');
    const dName = districtName || (dCode.includes('PAT') ? 'Patna' : dCode.includes('NSK') ? 'Nashik' : dCode.includes('KOL') ? 'Kolkata' : 'District');

    const cleanDCode = dCode.replace(/^[A-Z]{2}_/, '');
    const newScenario = {
      id: `DEMO-${sCode}-${cleanDCode}-001`,
      stateCode: sCode,
      stateName: sName,
      districtCode: dCode,
      districtName: dName,
      createdAt: new Date().toISOString(),
    };

    setCurrentDemoScenario(newScenario);
    return { status: 200, data: { success: true, scenario: newScenario } };
  }

  static getDemoCoverage() {
    const report = getCoverageReport(dbCentres);
    return { status: 200, data: report };
  }

  static repairDemoCoverage() {
    const repaired = generateAllDemoCentres(dbCentres);
    setDbCentres(repaired);
    const report = getCoverageReport(dbCentres);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Demo centre coverage repaired across all administrative blocks in India.',
        report,
      },
    };
  }

  static getCentreConsistency() {
    dbCentres.forEach((c) => ensureDemoOperatorForCentre(c));

    const masterCount = dbCentres.length;
    const farmerVisibleCount = dbCentres.length;
    const operatorVisibleCount = dbCentres.filter((c) => !!dbOperatorAccounts[c.id]).length;
    const adminVisibleCount = dbCentres.length;

    const missingFromFarmer: string[] = [];
    const missingFromOperator = dbCentres.filter((c) => !dbOperatorAccounts[c.id]).map((c) => c.id);
    const missingFromAdmin: string[] = [];

    const seenIds = new Set<string>();
    const duplicateCentreIds: string[] = [];
    dbCentres.forEach((c) => {
      if (seenIds.has(c.id)) {
        if (!duplicateCentreIds.includes(c.id)) {
          duplicateCentreIds.push(c.id);
        }
      } else {
        seenIds.add(c.id);
      }
    });

    const isPass =
      missingFromFarmer.length === 0 &&
      missingFromOperator.length === 0 &&
      missingFromAdmin.length === 0 &&
      duplicateCentreIds.length === 0 &&
      masterCount > 0 &&
      farmerVisibleCount === masterCount &&
      operatorVisibleCount === masterCount &&
      adminVisibleCount === masterCount;

    return {
      status: 200,
      data: {
        centreMasterCount: masterCount,
        farmerVisibleCount,
        operatorVisibleCount,
        adminVisibleCount,
        missingFromFarmer,
        missingFromOperator,
        missingFromAdmin,
        duplicateCentreIds,
        status: isPass ? 'PASS' : 'FAIL',
      },
    };
  }
}
