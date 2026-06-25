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

import { isValidDateString } from '@/lib/misc-helpers/date-helpers';

export function getPageAndItemsPerPageFromSearchParams(
  searchParams: URLSearchParams,
): { page: number; itemsPerPage: number } {
  const pageString = searchParams.get('page');
  const itemsPerPageString = searchParams.get('itemsPerPage');
  let page = 0;
  let itemsPerPage = 100;
  if (pageString && !isNaN(parseInt(pageString)) && parseInt(pageString) >= 0) {
    page = parseInt(pageString);
  }
  if (
    itemsPerPageString &&
    !isNaN(parseInt(itemsPerPageString)) &&
    parseInt(itemsPerPageString) >= 0
  ) {
    itemsPerPage = parseInt(itemsPerPageString);
  }
  return { page, itemsPerPage };
}

/**
 * Defaults to 14 days ago for start date and today for end date.
 * @param searchParams Search params to get the start and end date from.
 * @returns Parsed start and end date.
 */
export function getStartDateAndEndDateFromSearchParams(
  searchParams: URLSearchParams,
): { startDate: Date; endDate: Date } {
  const startDateString = searchParams.get('startDate');
  const endDateString = searchParams.get('endDate');
  const now = new Date();
  const startDateDefault = new Date(now);
  startDateDefault.setUTCDate(now.getUTCDate() - 14);
  let startDate = startOfUtcDay(startDateDefault);
  let endDate = endOfUtcDay(now);
  if (startDateString && isValidDateString(startDateString)) {
    startDate = new Date(startDateString);
  }
  if (endDateString && isValidDateString(endDateString)) {
    endDate = new Date(endDateString);
  }
  return { startDate, endDate };
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}
