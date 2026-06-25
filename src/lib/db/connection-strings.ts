import * as dotenv from 'dotenv';
dotenv.config({
  path: '.env.local',
});

const DB_CONNECTION_STRING_KEY = 'DB_CONNECTION_STRING';
const TEST_DB_CONNECTION_STRING_KEY = 'TEST_DB_CONNECTION_STRING';

type EnvMap = NodeJS.ProcessEnv;

function isTruthyEnvFlag(value: string | undefined): boolean {
  const normalizedValue = value?.trim().toLowerCase();

  return (
    !!normalizedValue && normalizedValue !== '0' && normalizedValue !== 'false'
  );
}

export function isTestDatabaseRuntime(env: EnvMap = process.env): boolean {
  return env.NODE_ENV === 'test' || isTruthyEnvFlag(env.VITEST);
}

function readRequiredConnectionString(env: EnvMap, key: string): string {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is not set`);
  }

  return value;
}

function readOptionalConnectionString(env: EnvMap, key: string): string | null {
  const value = env[key]?.trim();

  return value || null;
}

export function assertDistinctDatabaseConnectionStrings(
  env: EnvMap = process.env,
) {
  const dbConnectionString = readRequiredConnectionString(
    env,
    DB_CONNECTION_STRING_KEY,
  );
  const testDbConnectionString = readOptionalConnectionString(
    env,
    TEST_DB_CONNECTION_STRING_KEY,
  );

  if (testDbConnectionString && dbConnectionString === testDbConnectionString) {
    throw new Error(
      'DB_CONNECTION_STRING and TEST_DB_CONNECTION_STRING must be different',
    );
  }

  return {
    dbConnectionString,
    testDbConnectionString,
  };
}

export function assertSafeTestDatabaseConfiguration(env: EnvMap = process.env) {
  const dbConnectionString = readRequiredConnectionString(
    env,
    DB_CONNECTION_STRING_KEY,
  );
  const testDbConnectionString = readRequiredConnectionString(
    env,
    TEST_DB_CONNECTION_STRING_KEY,
  );

  if (dbConnectionString === testDbConnectionString) {
    throw new Error(
      'Vitest aborted: DB_CONNECTION_STRING and TEST_DB_CONNECTION_STRING must be different',
    );
  }

  return {
    dbConnectionString,
    testDbConnectionString,
  };
}

export function getDatabaseConnectionString(env: EnvMap = process.env): string {
  const isTestRuntime = isTestDatabaseRuntime(env);
  const { dbConnectionString, testDbConnectionString } = isTestRuntime
    ? assertSafeTestDatabaseConfiguration(env)
    : assertDistinctDatabaseConnectionStrings(env);

  if (isTestRuntime) {
    if (!testDbConnectionString) {
      throw new Error('TEST_DB_CONNECTION_STRING is not set');
    }

    return testDbConnectionString;
  }

  return dbConnectionString;
}
