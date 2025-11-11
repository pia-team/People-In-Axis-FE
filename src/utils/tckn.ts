export const isValidTCKN = (t: string | undefined | null): boolean => {
  if (!t) return false;
  if (!/^\d{11}$/.test(t)) return false;
  const digits = t.split('').map(Number);
  if (digits[0] === 0) return false;
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const d10 = ((oddSum * 7) - evenSum) % 10;
  const d11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
  return digits[9] === d10 && digits[10] === d11;
};

export const maskTCKN = (t: string | undefined | null): string => {
  if (!t) return '';
  if (t.length <= 2) return t;
  return '*'.repeat(t.length - 2) + t.slice(-2);
};
