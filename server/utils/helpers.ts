/**
 * Normalizes an Indian mobile number to 10 digits
 */
export function normalizeMobileNumber(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}
