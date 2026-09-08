/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AnnSetu Normalized Date Management & Formatting Utilities
 * Internal Normalized Standard: YYYY-MM-DD
 */

/**
 * Returns current date in normalized YYYY-MM-DD format
 */
export function getTodayNormalized(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalizes any date input (Date object, 'YYYY-MM-DD', 'DD/MM/YYYY', ISO string) into 'YYYY-MM-DD'.
 * Defaults to today's date if empty or invalid.
 */
export function normalizeDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return getTodayNormalized();
  }

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return getTodayNormalized();
    const year = dateInput.getFullYear();
    const month = (dateInput.getMonth() + 1).toString().padStart(2, '0');
    const day = dateInput.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const str = String(dateInput).trim();

  // Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, '0');
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    const year = ddmmyyyyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Match ISO string containing T
  if (str.includes('T')) {
    const part = str.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
      return part;
    }
  }

  // Handle "05 Jun 2025" or "05 Jun" format
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const textualMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]{3,9})(?:\s+(\d{4}))?$/);
  if (textualMatch) {
    const day = textualMatch[1].padStart(2, '0');
    const monthStr = textualMatch[2].toLowerCase().substring(0, 3);
    const year = textualMatch[3] || new Date().getFullYear().toString();
    const month = monthMap[monthStr] || '01';
    return `${year}-${month}-${day}`;
  }

  // Try standard JS Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
    const day = parsed.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return getTodayNormalized();
}

/**
 * Formats a normalized YYYY-MM-DD date into user-friendly display string (e.g. "05 Sep 2026")
 */
export function formatDisplayDate(isoDateStr?: string): string {
  const normalized = normalizeDate(isoDateStr);
  const [year, month, day] = normalized.split('-');
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthIdx = parseInt(month, 10) - 1;
  const monthName = monthNames[monthIdx] || month;

  return `${day} ${monthName} ${year}`;
}

/**
 * Formats normalized YYYY-MM-DD date as DD/MM/YYYY
 */
export function formatDDMMYYYY(isoDateStr?: string): string {
  const normalized = normalizeDate(isoDateStr);
  const [year, month, day] = normalized.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Returns dynamic quick dates starting from base date (Today, Tomorrow, Day after)
 */
export function getQuickDates(baseDateStr?: string): Array<{ date: string; label: string }> {
  const normalizedBase = normalizeDate(baseDateStr);
  const [y, m, d] = normalizedBase.split('-').map(Number);
  const baseObj = new Date(y, m - 1, d);

  const result = [];
  for (let i = 0; i < 3; i++) {
    const temp = new Date(baseObj);
    temp.setDate(temp.getDate() + i);
    const iso = normalizeDate(temp);
    
    let label = formatDisplayDate(iso);
    if (i === 0) label = `Today (${formatDisplayDate(iso).slice(0, 6)})`;
    else if (i === 1) label = `Tomorrow (${formatDisplayDate(iso).slice(0, 6)})`;

    result.push({ date: iso, label });
  }

  return result;
}
