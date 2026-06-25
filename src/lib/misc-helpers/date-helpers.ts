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

import { type DateArg, parseISO } from "date-fns";

export function isValidDateString(
  dateString: string | null | undefined
): boolean {
  if (!dateString) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
  }
  return Math.floor(seconds) + ' seconds ago';
}

export function timeDifference(date1: Date, date2: Date) {
  // Calculate the difference in milliseconds
  const diffMs = Math.abs(date2.getTime() - date1.getTime());

  // Convert to minutes and seconds
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  // Create the formatted string
  let result = '';
  if (days > 0) {
    result += `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    result += `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    result += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (seconds > 0) {
    result += `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  return result;
}

export function parseDateArg(arg?: undefined | DateArg<Date>) {
  switch (typeof arg) {
    case 'number': {
      const date = new Date(arg);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    case 'string': {
      const date = parseISO(arg);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    default: {
      if (arg instanceof Date) return arg;
      return undefined;
    }
  }
}
