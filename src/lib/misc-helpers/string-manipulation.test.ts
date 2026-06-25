import {
  capitalizeFirstLetter,
  formatNumberWithCommas,
  generateRandomString,
  getIntitials,
  normalizeEmail,
  prettyJsonIfValid,
  usdFormatter,
  usdFormatterWithNoDecimals,
  validateNumber,
} from '@/lib/misc-helpers/string-manipulation';

describe('string-manipulation helpers', () => {
  it('generates alpha-numeric strings of the requested length', () => {
    const value = generateRandomString(24);

    expect(value).toHaveLength(24);
    expect(value).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('capitalizes the first letter and preserves the rest', () => {
    expect(capitalizeFirstLetter('backend')).toBe('Backend');
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('returns initials for single-word and multi-word names', () => {
    expect(getIntitials('Ada Lovelace')).toBe('AL');
    expect(getIntitials('Plato')).toBe('Pl');
    expect(getIntitials('Q')).toBe('Q');
    expect(getIntitials('Ada Byron Lovelace')).toBe('AB');
    expect(getIntitials('')).toBe('');
  });

  it('pretty prints valid json and leaves invalid json unchanged', () => {
    expect(prettyJsonIfValid('{"ok":true}')).toBe('{\n    "ok": true\n}');
    expect(prettyJsonIfValid('not-json')).toBe('not-json');
  });

  it('validates user-facing number inputs', () => {
    expect(validateNumber('1,234.56')).toBe(true);
    expect(validateNumber('')).toBe(true);
    expect(validateNumber('12x')).toBe(false);
  });

  it('normalizes email casing and whitespace', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
  });

  it('formats numeric strings with grouping and decimal limits', () => {
    expect(formatNumberWithCommas('1234567.891', 2)).toBe('1,234,567.89');
    expect(formatNumberWithCommas('$1000000')).toBe('1,000,000');
    expect(formatNumberWithCommas('1234.5678', 0)).toBe('1,234.');
    expect(formatNumberWithCommas('')).toBe('');
  });

  it('formats usd values with and without decimals', () => {
    expect(usdFormatter.format(1234.5)).toBe('$1,234.50');
    expect(usdFormatterWithNoDecimals.format(1234.5)).toBe('$1,235');
  });
});
