/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AnnSetu Centre Resolver & Canonical Identification Utilities
 */

import { ProcurementCentre } from '../../types';

/**
 * Safely resolves a ProcurementCentre object from a list of centres
 * by matching any canonical centre identifier:
 * - c.id (e.g. 'cnt_sinnar', 'cnt_demo_br_br_pat_fatwah_01')
 * - c.officialId (e.g. 'MH-NSK-PRC-001', 'BR-PTN-DEMO-01')
 * - c.centreId / c.official_centre_id
 * 
 * Case-insensitive fallback is supported.
 * Returns undefined if input ID is empty, list is empty, or no match is found.
 */
export function resolveCentreById(
  id: string | undefined | null,
  centresList: ProcurementCentre[]
): ProcurementCentre | undefined {
  if (!id || !centresList || centresList.length === 0) {
    return undefined;
  }

  const cleanId = String(id).trim();
  const lowerCleanId = cleanId.toLowerCase();

  // 1. Exact match on id or officialId or legacy fields
  const exactMatch = centresList.find(
    (c) =>
      c &&
      (c.id === cleanId ||
        c.officialId === cleanId ||
        (c as any).centreId === cleanId ||
        (c as any).official_centre_id === cleanId)
  );

  if (exactMatch) {
    return exactMatch;
  }

  // 2. Case-insensitive match on id or officialId or legacy fields
  const caseInsensitiveMatch = centresList.find(
    (c) =>
      c &&
      ((c.id && c.id.toLowerCase() === lowerCleanId) ||
        (c.officialId && c.officialId.toLowerCase() === lowerCleanId) ||
        ((c as any).centreId && String((c as any).centreId).toLowerCase() === lowerCleanId) ||
        ((c as any).official_centre_id && String((c as any).official_centre_id).toLowerCase() === lowerCleanId))
  );

  return caseInsensitiveMatch || undefined;
}

/**
 * Safely resolves a ProcurementCentre object, falling back to the first available
 * centre in the list if the specific ID match fails, or returning undefined
 * if the list is empty.
 */
export function getCentreSafe(
  id: string | undefined | null,
  centresList: ProcurementCentre[]
): ProcurementCentre | undefined {
  const resolved = resolveCentreById(id, centresList);
  if (resolved) {
    return resolved;
  }

  // Fallback to first available centre if list is non-empty
  if (centresList && centresList.length > 0) {
    return centresList[0];
  }

  return undefined;
}
