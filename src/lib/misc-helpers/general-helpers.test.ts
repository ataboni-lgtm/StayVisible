import {
  isArrayEqual,
} from '@/lib/misc-helpers/array-helpers';
import { escapeCsvField } from '@/lib/misc-helpers/csv-helpers';
import {
  isValidDateString,
  parseDateArg,
  timeAgo,
  timeDifference,
} from '@/lib/misc-helpers/date-helpers';
import { oklchToHex, parseOklchString } from '@/lib/misc-helpers/oklch-helpers';
import {
  getPageAndItemsPerPageFromSearchParams,
  getStartDateAndEndDateFromSearchParams,
} from '@/lib/misc-helpers/search-param-helpers';
import { sleep } from '@/lib/misc-helpers/sleep';
import {
  isErrorResponse,
  isInConstArray,
  iso8601String,
  numberWithCommasSchema,
} from '@/lib/misc-helpers/typeguard';
import { ZodHelpers } from '@/lib/misc-helpers/zod-helpers';
import { z } from 'zod';

describe('array helpers', () => {
  it('compares arrays by serialized value and order', () => {
    expect(isArrayEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isArrayEqual([1, 2, 3], [3, 2, 1])).toBe(false);
  });
});

describe('csv helpers', () => {
  it('escapes commas, quotes, and nullish values', () => {
    expect(escapeCsvField('plain')).toBe('plain');
    expect(escapeCsvField('a,b')).toBe('"a,b"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
    expect(escapeCsvField(42)).toBe('42');
  });
});

describe('date helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates date strings', () => {
    expect(isValidDateString('2026-04-19')).toBe(true);
    expect(isValidDateString('not-a-date')).toBe(false);
    expect(isValidDateString(null)).toBe(false);
  });

  it('formats relative time across units', () => {
    expect(timeAgo(new Date('2025-04-19T12:00:00.000Z'))).toBe('1 year ago');
    expect(timeAgo(new Date('2026-03-19T12:00:00.000Z'))).toBe('1 month ago');
    expect(timeAgo(new Date('2026-04-18T12:00:00.000Z'))).toBe('1 day ago');
    expect(timeAgo(new Date('2026-04-19T11:00:00.000Z'))).toBe('1 hour ago');
    expect(timeAgo(new Date('2026-04-19T11:59:00.000Z'))).toBe('1 minute ago');
    expect(timeAgo(new Date('2026-04-19T11:59:55.000Z'))).toBe('5 seconds ago');
  });

  it('formats absolute time differences', () => {
    expect(
      timeDifference(
        new Date('2026-04-19T12:00:00.000Z'),
        new Date('2026-04-21T12:00:00.000Z'),
      ),
    ).toBe('2 days');
    expect(
      timeDifference(
        new Date('2026-04-19T12:00:00.000Z'),
        new Date('2026-04-19T15:00:00.000Z'),
      ),
    ).toBe('3 hours');
    expect(
      timeDifference(
        new Date('2026-04-19T12:00:00.000Z'),
        new Date('2026-04-19T12:02:00.000Z'),
      ),
    ).toBe('2 minutes');
    expect(
      timeDifference(
        new Date('2026-04-19T12:00:00.000Z'),
        new Date('2026-04-19T12:00:05.000Z'),
      ),
    ).toBe('5 seconds');
    expect(
      timeDifference(
        new Date('2026-04-19T12:00:00.000Z'),
        new Date('2026-04-19T12:00:00.000Z'),
      ),
    ).toBe('');
  });

  it('parses date arguments from different input types', () => {
    expect(parseDateArg(new Date('2026-04-19T12:00:00.000Z'))).toEqual(
      new Date('2026-04-19T12:00:00.000Z'),
    );
    expect(parseDateArg('2026-04-19T12:00:00.000Z')).toEqual(
      new Date('2026-04-19T12:00:00.000Z'),
    );
    expect(parseDateArg(Date.parse('2026-04-19T12:00:00.000Z'))).toEqual(
      new Date('2026-04-19T12:00:00.000Z'),
    );
    expect(parseDateArg('invalid')).toBeUndefined();
    expect(parseDateArg(Number.NaN)).toBeUndefined();
    expect(parseDateArg()).toBeUndefined();
  });
});

describe('oklch helpers', () => {
  it('parses valid strings and falls back for invalid ones', () => {
    expect(parseOklchString('oklch(0.7 0.2 120)')).toEqual({
      l: 0.7,
      c: 0.2,
      h: 120,
    });
    expect(parseOklchString('nope')).toEqual({ l: 0, c: 0, h: 0 });
  });

  it('converts oklch values to a hex string', () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe('#ffffff');
    expect(oklchToHex({ l: Number.NaN, c: 0, h: 0 })).toBe('#NaNNaNNaN');
  });
});

describe('search param helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-19T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('extracts pagination values with defaults for invalid input', () => {
    expect(
      getPageAndItemsPerPageFromSearchParams(
        new URLSearchParams({ page: '2', itemsPerPage: '25' }),
      ),
    ).toEqual({ page: 2, itemsPerPage: 25 });
    expect(
      getPageAndItemsPerPageFromSearchParams(
        new URLSearchParams({ page: '-1', itemsPerPage: 'abc' }),
      ),
    ).toEqual({ page: 0, itemsPerPage: 100 });
  });

  it('extracts date filters and falls back to the default window', () => {
    const explicit = getStartDateAndEndDateFromSearchParams(
      new URLSearchParams({
        startDate: '2026-04-01T10:00:00.000Z',
        endDate: '2026-04-10T16:30:00.000Z',
      }),
    );

    expect(explicit.startDate).toEqual(new Date('2026-04-01T10:00:00.000Z'));
    expect(explicit.endDate).toEqual(new Date('2026-04-10T16:30:00.000Z'));

    const fallback = getStartDateAndEndDateFromSearchParams(
      new URLSearchParams({
        startDate: 'invalid',
        endDate: 'still-invalid',
      }),
    );

    expect(fallback.startDate).toEqual(new Date('2026-04-05T00:00:00.000Z'));
    expect(fallback.endDate).toEqual(new Date('2026-04-19T23:59:59.999Z'));
  });
});

describe('sleep helper', () => {
  it('resolves after the provided delay', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    const promise = sleep(25).then(callback);

    expect(callback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(25);
    await promise;

    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('typeguard helpers', () => {
  it('identifies error responses and constant array membership', () => {
    expect(isErrorResponse({ error: 'bad' })).toBe(true);
    expect(isErrorResponse({ ok: true })).toBe(false);

    const values = ['alpha', 'beta'] as const;
    expect(isInConstArray(values, 'alpha')).toBe(true);
    expect(isInConstArray(values, 'gamma')).toBe(false);
  });

  it('validates iso-8601 strings', () => {
    expect(iso8601String.parse('2026-04-19T12:00:00Z')).toBe(
      '2026-04-19T12:00:00Z',
    );
    expect(() => iso8601String.parse('2026-04-19')).toThrow(
      'Invalid ISO8601 date string',
    );
  });

  it('parses numbers with commas', () => {
    expect(numberWithCommasSchema.parse('1,234.56')).toBe(1234.56);
  });
});

describe('zod helpers', () => {
  it('accepts schema values or N/A via Maybe', () => {
    const schema = ZodHelpers.Maybe(z.string().min(2));

    expect(schema.parse('ok')).toBe('ok');
    expect(schema.parse('N/A')).toBe('N/A');
    expect(() => schema.parse('x')).toThrow();
  });

  it('parses non-negative numbers with commas', () => {
    expect(ZodHelpers.numberWithCommas.parse('1,234')).toBe(1234);
    expect(() => ZodHelpers.numberWithCommas.parse('-1')).toThrow(
      'Please enter a valid number',
    );
  });
});
