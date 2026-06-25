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

export function generateRandomString(length: number): string {
  const lettersAndDigits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultStr = '';
  for (let i = 0; i < length; i++) {
    resultStr += lettersAndDigits.charAt(
      Math.floor(Math.random() * lettersAndDigits.length),
    );
  }
  return resultStr;
}

export function capitalizeFirstLetter(string: string): string {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getIntitials(string: string): string {
  if (string.length === 0) {
    return string;
  }

  const words = string.split(' ');
  if (words.length === 1) {
    // Return the first two letters if there is only one word.
    if (words[0].length === 0) {
      return '';
    } else if (words[0].length === 1) {
      return words[0].charAt(0);
    } else {
      return words[0].charAt(0) + words[0].charAt(1);
    }
  }
  let initials = '';
  for (let i = 0; i < words.length; i++) {
    if (initials.length >= 2) {
      break;
    }
    if (words[i].charAt(0)) {
      initials += words[i].charAt(0);
    }
  }
  return initials;
}

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency', // Format as currency
  currency: 'USD', // Use US dollars
  minimumFractionDigits: 2, // Ensure 2 decimal places
  maximumFractionDigits: 2, // Ensure 2 decimal places
});

export const usdFormatterWithNoDecimals = new Intl.NumberFormat('en-US', {
  style: 'currency', // Format as currency
  currency: 'USD', // Use US dollars
  minimumFractionDigits: 0, // Ensure 0 decimal places
  maximumFractionDigits: 0, // Ensure 0 decimal places
});

export const prettyJsonIfValid = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 4); // Pretty-print with 2 spaces
  } catch (error) {
    return input; // Return the original string if it's not valid JSON
  }
};

export const validateNumber = (value: string): boolean => {
  return (
    (/^[\d,.]+$/.test(value) && !isNaN(parseFloat(value.replace(/,/g, '')))) ||
    value === ''
  );
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const formatNumberWithCommas = (
  value: string,
  digits: number = 2,
): string => {
  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');

  if (!cleanValue) return '';

  // Split by decimal point
  const parts = cleanValue.split('.');

  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // If there's a decimal part, limit its length
  if (parts.length > 1) {
    return `${parts[0]}.${parts[1].slice(0, digits)}`;
  }

  return parts[0];
};
