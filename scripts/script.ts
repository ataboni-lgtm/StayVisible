/**
 * @author Mark Chang
 * Execute Script
 *
 * Execute whichever script passed into this file. You can use this using the npm package.json file.
 * When running the command pass in the script you want to run as a relative path to this file.
 *
 * @important Any script that is run must have a default export function called `execute`.
 *
 * For example:
 *
 * @example
 * npm run script -- ./seed.ts
 * 
 * @license
 * MIT License

    Copyright (c) 2025 AC Autonomous Systems

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Execution function setups necessary services for all scripts. These services currently include the database.
 */
async function execute(script: string): Promise<void> {
  try {
    console.info(`Executing ${script}`);
    const start = Date.now();
    const exec = await import(`${script}`);

    await exec.default();
    const elapsedMilli = Date.now() - start;
    console.info(`Finished Executing -- ${elapsedMilli / 1000}s`);
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  // Grab the first agurment to the script
  if (process.argv.length != 3) {
    throw new Error(
      'Please pass in the script you desire to run. You may only pass in one script!'
    );
  }

  const scriptPath = path.resolve(process.cwd(), process.argv[2]);

  if (!scriptPath.endsWith('.ts')) {
    throw new Error('Please pass in a valid script path');
  }

  await execute(scriptPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

main();
