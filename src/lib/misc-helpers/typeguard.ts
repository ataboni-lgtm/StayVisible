/**
  MIT License

  Copyright (c) 2025 AC Autonomous Systems, LLC

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the “Software”), to deal
  in the Software without restriction, including without limitation the rights  
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
  copies of the Software, and to permit persons to whom the Software is  
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all  
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
  SOFTWARE.
 */

import { z } from 'zod';

export const isErrorResponse = (
  response: any | { error: string },
): response is { error: string } => {
  return (response as { error: string }).error !== undefined;
};

export const isInConstArray = <T extends readonly string[]>(
  array: T,
  value: string,
): value is T[number] => {
  return array.includes(value as T[number]);
};

// ISO 8601 regex for basic validation
const iso8601Regex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[\+\-]\d{2}:\d{2})$/;

export const iso8601String = z
  .string()
  .refine((val) => iso8601Regex.test(val) && !isNaN(Date.parse(val)), {
    message: 'Invalid ISO8601 date string',
  });

export const numberWithCommasSchema = z
  .string()
  .transform((val) => {
    // Remove thousands separators (commas) and replace decimal commas with dots if applicable
    const cleanedVal = val.replace(/,/g, ''); // Removes commas used as thousands separators
    // If your locale uses comma as decimal separator, you'd also need:
    // const cleanedVal = val.replace(/\./g, '').replace(/,/g, '.'); // For locales where . is thousands and , is decimal

    return Number(cleanedVal);
  })
  .pipe(z.number());
