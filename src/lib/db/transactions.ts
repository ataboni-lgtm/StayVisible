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

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Run a transaction with retries.
 * @param db - The database instance
 * @param fn - The transactional function to execute
 * @param maxRetries - Max number of retry attempts, 30 by default.
 */
export async function runTransactionWithRetries<T>(
  db: PostgresJsDatabase<Record<string, never>> & {
    $client: postgres.Sql;
  },
  fn: (tx: any) => Promise<T>,
  maxRetries: number = 30,
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      return await db.transaction(fn);
    } catch (err) {
      lastError = err;
      attempt++;

      // Optional: add exponential backoff
      await new Promise((res) =>
        setTimeout(res, Math.min(1000 * attempt, 5000)),
      );
    }
  }

  throw lastError;
}
