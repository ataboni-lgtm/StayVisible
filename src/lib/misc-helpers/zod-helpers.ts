import z, { ZodSchema } from 'zod';

export class ZodHelpers {
  static Maybe = <T extends ZodSchema>(schema: T) => {
    return z.union([schema, z.literal('N/A')]);
  };

  /**
   * This validates a number with commas as thousand separators.
   * It also removes any leading or trailing whitespace.
   * Example: 1,000,000 becomes 1000000
   *          1-000-000 fails.
   *          123aksdfi fails.
   */
  static numberWithCommas = z
    .string()
    .refine((val) => {
      const cleanedValue = val.replace(/,/g, '');
      return !isNaN(Number(cleanedValue)) && Number(cleanedValue) >= 0;
    }, 'Please enter a valid number')
    .transform((val) => Number(val.replace(/,/g, '')));
}
