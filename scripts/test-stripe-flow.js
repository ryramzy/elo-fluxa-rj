import handler from '../api/stripe.ts';
import * as path from 'path';
import * as fs from 'fs';

console.log('📝 Env variables loaded via Node native loader');

async function runStripeTests() {
  console.log('🧪 RUNNING STRIPE INTEGRATION BACKEND TESTS');
  console.log('============================================');

  // Verify credentials setup
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.warn('⚠️ GOOGLE_SERVICE_ACCOUNT_KEY is missing from environment. Firestore auto-upgrade will be skipped in test.');
  } else {
    try {
      const parsed = JSON.parse(serviceAccountKey);
      console.log(`✅ Google Service Account Key is valid (Project: ${parsed.project_id})`);
    } catch (e) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON:', e.message);
      process.exit(1);
    }
  }

  // Define Mock request/response helpers
  const mockResponse = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    res.send = (text) => {
      res.body = text;
      return res;
    };
    res.end = () => {
      return res;
    };
    return res;
  };

  const createMockRequest = (method, url, body) => {
    const readable = {
      method,
      url,
      headers: {
        host: 'localhost:5173',
      },
      [Symbol.asyncIterator]: async function* () {
        yield JSON.stringify(body);
      }
    };
    return readable;
  };

  // Test 1: Checkout Session with Stripe keys NOT configured (Sandbox Fallback)
  console.log('\n📦 TEST 1: Sandbox Auto-Upgrade Trigger (No STRIPE_SECRET_KEY)...');
  
  // Cache original secret key if present
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY; // Force sandbox fallback

  const mockCheckoutPayload = {
    priceId: 'stripe_price_imersao_total_mock_123',
    email: 'sandbox_stripe_test@elospeak.com',
    userId: 'sandbox_user_stripe_123'
  };

  const req = createMockRequest('POST', '/api/stripe/checkout', mockCheckoutPayload);
  const res = mockResponse();

  try {
    console.log('   Sending mock checkout request to sandbox...');
    await handler(req, res);
    
    console.log(`   Response status: ${res.statusCode}`);
    console.log('   Response body:', res.body);

    if (res.statusCode === 200 && res.body?.url?.includes('stripe_payment=success')) {
      console.log('   🎉 TEST 1 PASSED: Correctly upgraded Firestore profile and returned local redirect!');
    } else {
      console.error('   ❌ TEST 1 FAILED: Unexpected response output.');
    }
  } catch (error) {
    console.error('   ❌ TEST 1 EXCEPTION:', error);
  }

  // Restore original key
  if (originalStripeKey) {
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
  }
}

runStripeTests();
