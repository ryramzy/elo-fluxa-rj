import { test, expect } from '@playwright/test';
import { generateKeyPairSync } from 'node:crypto';
import handler from '../api/health';

const originalFetch = globalThis.fetch;
const originalKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const originalProject = process.env.VITE_FIREBASE_PROJECT_ID;
const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

test.beforeEach(() => {
  process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
    project_id: 'test-project', client_email: 'test@test-project.iam.gserviceaccount.com', private_key: privateKey,
  });
});

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  else process.env.GOOGLE_SERVICE_ACCOUNT_KEY = originalKey;
  if (originalProject === undefined) delete process.env.VITE_FIREBASE_PROJECT_ID;
  else process.env.VITE_FIREBASE_PROJECT_ID = originalProject;
});

function mockGoogle(databaseStatus: number) {
  globalThis.fetch = async input => {
    const url = String(input);
    if (url === 'https://oauth2.googleapis.com/token') {
      return new Response(JSON.stringify({ access_token: 'test-only-token' }), { status: 200 });
    }
    if (url === 'https://firestore.googleapis.com/v1/projects/test-project/databases/(default)') {
      return new Response('{}', { status: databaseStatus });
    }
    throw new Error('Unexpected health-check request');
  };
}

async function health() {
  const result = { status: 0, body: {} as any };
  const res = {
    status(code: number) { result.status = code; return this; },
    json(body: unknown) { result.body = body; return this; },
  };
  await handler({ method: 'GET' } as any, res as any);
  return result;
}

test('Health requires both valid credentials and an accessible database', async () => {
  mockGoogle(200);
  const result = await health();
  expect(result.status).toBe(200);
  expect(result.body).toMatchObject({ status: 'healthy', authGateway: 'active', firestore: 'active' });
});

test('A valid Google token cannot hide a missing database', async () => {
  mockGoogle(404);
  const result = await health();
  expect(result.status).toBe(500);
  expect(result.body).toMatchObject({ status: 'unhealthy', firestore: 'unavailable' });
});

test('A service account for another Firebase project blocks release', async () => {
  mockGoogle(200);
  process.env.VITE_FIREBASE_PROJECT_ID = 'different-project';
  const result = await health();
  expect(result.status).toBe(500);
  expect(result.body.error).toContain('does not match');
});
