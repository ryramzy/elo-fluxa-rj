import handler from '../api/stripe.ts';
import * as path from 'path';
import * as fs from 'fs';
import Stripe from 'stripe';
import * as crypto from 'crypto';

console.log('📝 Env variables loaded via Node native loader');

// Mock Stripe SDK using Object.defineProperty getters/setters to allow constructor runs
let webhooksMock = {
  constructEvent: (rawBody) => JSON.parse(rawBody.toString('utf8'))
};
Object.defineProperty(Stripe.prototype, 'webhooks', {
  get() { return webhooksMock; },
  set(v) { /* Ignore constructor assignment */ },
  configurable: true
});

let customersMock = {
  retrieve: async (id) => ({
    id,
    metadata: {
      firebaseUid: id.includes('referrer') ? 'student_with_referrer' : 'sandbox_user_stripe_123'
    }
  })
};
Object.defineProperty(Stripe.prototype, 'customers', {
  get() { return customersMock; },
  set(v) { /* Ignore constructor assignment */ },
  configurable: true
});

let checkoutMock = {
  sessions: {
    create: async (params) => ({
      id: 'cs_mock_session_123',
      url: `${params.success_url}`
    })
  }
};
Object.defineProperty(Stripe.prototype, 'checkout', {
  get() { return checkoutMock; },
  set(v) { /* Ignore constructor assignment */ },
  configurable: true
});

// Virtual Firestore Database for Hermetic Local Testing
let mockDb = {
  users: {
    'sandbox_user_stripe_123': {
      fields: {
        plan: { stringValue: 'free' },
        bookingLimit: { integerValue: '0' },
        paymentPastDue: { booleanValue: false }
      }
    },
    'student_with_referrer': {
      fields: {
        plan: { stringValue: 'free' },
        referredBy: { stringValue: 'referrer_matt_999' },
        hasReferredRewardBeenPaid: { booleanValue: false }
      }
    },
    'referrer_matt_999': {
      fields: {
        corporateCredits: { integerValue: '3' }
      }
    }
  },
  audit_logs: [],
  notifications: []
};

// Dynamically generate a valid RSA private key to satisfy cryptographic signatures
console.log('🔑 Generating mock 2048-bit RSA key pair for testing...');
const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Supply Mock Service Account Key using the real generated RSA key
const originalServiceKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({
  project_id: 'mock-project-id-123',
  client_email: 'mock-service@mock-project.iam.gserviceaccount.com',
  private_key: privateKey
});

// Global Fetch Interceptor
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  // If it's a mock credential request, intercept it
  if (!originalServiceKey || url.includes('mock-project-id-123') || url.includes('oauth2.googleapis.com')) {
    // 1. Google OAuth Token mock
    if (url.includes('oauth2.googleapis.com')) {
      return {
        ok: true,
        text: async () => JSON.stringify({ access_token: 'mock_token_123', expires_in: 3600, token_type: 'Bearer' }),
        json: async () => ({ access_token: 'mock_token_123', expires_in: 3600, token_type: 'Bearer' })
      };
    }
    // 2. Firestore Document REST endpoints mock
    if (url.includes('firestore.googleapis.com')) {
      const pathPart = url.split('/documents/')[1] ?? '';
      const cleanPath = pathPart.split('?')[0]; // Split query params first
      const parts = cleanPath.split('/');
      const collection = parts[0];
      const docId = parts[1];

      if (options?.method === 'PATCH' || options?.method === 'POST') {
        const body = JSON.parse(options.body);
        if (collection === 'notifications' || parts[2] === 'notifications') {
          mockDb.notifications.push({ userId: docId || parts[1], ...body });
          return { ok: true, text: async () => '{}' };
        }
        if (collection === 'users') {
          if (!mockDb.users[docId]) mockDb.users[docId] = { fields: {} };
          mockDb.users[docId].fields = {
            ...mockDb.users[docId].fields,
            ...body.fields
          };
          return { ok: true, text: async () => JSON.stringify(mockDb.users[docId]) };
        }
        if (collection === 'audit_logs') {
          mockDb.audit_logs.push(body);
          return { ok: true, text: async () => '{}' };
        }
      }

      if (!options?.method || options.method === 'GET') {
        if (collection === 'users' && mockDb.users[docId]) {
          return { ok: true, json: async () => mockDb.users[docId] };
        }
        return { ok: false, text: async () => 'Document not found in virtual DB' };
      }
    }
  }
  return originalFetch(url, options);
};

async function runStripeTests() {
  console.log('🧪 RUNNING STRIPE INTEGRATION BACKEND TESTS');
  console.log('============================================');

  // Response helper
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

  const createMockRequest = (method, url, headers, body) => {
    return {
      method,
      url,
      headers: {
        host: 'localhost:5173',
        ...headers
      },
      [Symbol.asyncIterator]: async function* () {
        yield JSON.stringify(body);
      }
    };
  };

  // ----------------------------------------------------
  // TEST 1: Sandbox Auto-Upgrade Trigger (No Stripe Secrets)
  // ----------------------------------------------------
  console.log('\n📦 TEST 1: Sandbox Auto-Upgrade Trigger...');
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY; // Force sandbox fallback

  const mockCheckoutPayload = {
    priceId: 'stripe_price_imersao_total_mock_123',
    email: 'sandbox_stripe_test@elospeak.com',
    userId: 'sandbox_user_stripe_123'
  };

  let req = createMockRequest('POST', '/api/stripe/checkout', {}, mockCheckoutPayload);
  let res = mockResponse();

  try {
    await handler(req, res);
    console.log(`   Response code: ${res.statusCode}`);
    console.log(`   Redirect URL: ${res.body?.url}`);
    
    // Check virtual database state changes
    const user = mockDb.users['sandbox_user_stripe_123'];
    console.log(`   Virtual DB check: User plan is now: "${user?.fields?.plan?.stringValue}"`);
    if (user?.fields?.plan?.stringValue === 'elite' && res.statusCode === 200) {
      console.log('   🎉 TEST 1 PASSED: Correctly auto-upgraded and redirected user!');
    } else {
      console.error('   ❌ TEST 1 FAILED!');
    }
  } catch (error) {
    console.error('   ❌ TEST 1 EXCEPTION:', error);
  }

  // Restore original key
  if (originalStripeKey) {
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
  }
  
  // Set secrets for Webhook signature checks mock
  process.env.STRIPE_SECRET_KEY = 'mock_stripe_secret';
  process.env.STRIPE_WEBHOOK_SECRET = 'mock_webhook_secret';

  // ----------------------------------------------------
  // TEST 2: Webhook paid (invoice.paid) - Pro Upgrade
  // ----------------------------------------------------
  console.log('\n💳 TEST 2: Webhook Paid Event (invoice.paid)...');
  
  const mockWebhookPaidPayload = {
    type: 'invoice.paid',
    data: {
      object: {
        id: 'in_mock_paid_pro_999',
        customer: 'cus_mock_student_123',
        client_reference_id: 'sandbox_user_stripe_123',
        amount_paid: 9700,
        lines: {
          data: [
            {
              price: {
                id: 'price_mock_pro_fluente_123'
              }
            }
          ]
        }
      }
    }
  };

  req = createMockRequest('POST', '/api/stripe/webhook', { 'stripe-signature': 'mock_sig_1' }, mockWebhookPaidPayload);
  res = mockResponse();

  try {
    await handler(req, res);
    console.log(`   Response code: ${res.statusCode}`);
    
    const user = mockDb.users['sandbox_user_stripe_123'];
    console.log(`   Virtual DB Check: User plan is: "${user?.fields?.plan?.stringValue}", limit: ${user?.fields?.bookingLimit?.integerValue}`);
    if (user?.fields?.plan?.stringValue === 'pro' && Number(user?.fields?.bookingLimit?.integerValue) === 4) {
      console.log('   🎉 TEST 2 PASSED: Plan successfully configured via Webhook paid!');
    } else {
      console.error('   ❌ TEST 2 FAILED!');
    }
  } catch (error) {
    console.error('   ❌ TEST 2 EXCEPTION:', error);
  }

  // ----------------------------------------------------
  // TEST 3: Webhook paid (invoice.paid) - Referral Credit Processing
  // ----------------------------------------------------
  console.log('\n🎁 TEST 3: Webhook Referral Credit Incrementor...');
  
  const mockWebhookReferralPaidPayload = {
    type: 'invoice.paid',
    data: {
      object: {
        id: 'in_mock_paid_ref_888',
        customer: 'cus_student_with_referrer_456',
        client_reference_id: 'student_with_referrer',
        amount_paid: 9700,
        lines: {
          data: [{ price: { id: 'price_mock_pro_fluente_123' } }]
        }
      }
    }
  };

  req = createMockRequest('POST', '/api/stripe/webhook', { 'stripe-signature': 'mock_sig_2' }, mockWebhookReferralPaidPayload);
  res = mockResponse();

  try {
    await handler(req, res);
    console.log(`   Response code: ${res.statusCode}`);
    
    const referrer = mockDb.users['referrer_matt_999'];
    const student = mockDb.users['student_with_referrer'];
    console.log(`   Referrer Credits count: ${referrer?.fields?.corporateCredits?.integerValue}`);
    console.log(`   Student Reward Paid Status: ${student?.fields?.hasReferredRewardBeenPaid?.booleanValue}`);
    
    if (
      Number(referrer?.fields?.corporateCredits?.integerValue) === 4 && 
      student?.fields?.hasReferredRewardBeenPaid?.booleanValue === true
    ) {
      console.log('   🎉 TEST 3 PASSED: Referral reward +1 credit processed and logged successfully!');
    } else {
      console.error('   ❌ TEST 3 FAILED!');
    }
  } catch (error) {
    console.error('   ❌ TEST 3 EXCEPTION:', error);
  }

  // ----------------------------------------------------
  // TEST 4: Webhook payment failed (invoice.payment_failed)
  // ----------------------------------------------------
  console.log('\n⚠️ TEST 4: Webhook Payment Failed (invoice.payment_failed)...');
  
  const mockWebhookFailPayload = {
    type: 'invoice.payment_failed',
    data: {
      object: {
        customer: 'cus_mock_student_123',
        client_reference_id: 'sandbox_user_stripe_123'
      }
    }
  };

  req = createMockRequest('POST', '/api/stripe/webhook', { 'stripe-signature': 'mock_sig_3' }, mockWebhookFailPayload);
  res = mockResponse();

  try {
    await handler(req, res);
    console.log(`   Response code: ${res.statusCode}`);
    
    const user = mockDb.users['sandbox_user_stripe_123'];
    console.log(`   Virtual DB Check: User paymentPastDue flag: ${user?.fields?.paymentPastDue?.booleanValue}`);
    console.log(`   Total App Notifications logged: ${mockDb.notifications.length}`);
    
    if (user?.fields?.paymentPastDue?.booleanValue === true && mockDb.notifications.length > 0) {
      console.log('   🎉 TEST 4 PASSED: User flagged as past due and warning notification created!');
    } else {
      console.error('   ❌ TEST 4 FAILED!');
    }
  } catch (error) {
    console.error('   ❌ TEST 4 EXCEPTION:', error);
  }

  // ----------------------------------------------------
  // TEST 5: Webhook deleted (customer.subscription.deleted)
  // ----------------------------------------------------
  console.log('\n🚫 TEST 5: Webhook Subscription Deleted (customer.subscription.deleted)...');
  
  const mockWebhookDeletePayload = {
    type: 'customer.subscription.deleted',
    data: {
      object: {
        customer: 'cus_mock_student_123',
        client_reference_id: 'sandbox_user_stripe_123'
      }
    }
  };

  req = createMockRequest('POST', '/api/stripe/webhook', { 'stripe-signature': 'mock_sig_4' }, mockWebhookDeletePayload);
  res = mockResponse();

  try {
    await handler(req, res);
    console.log(`   Response code: ${res.statusCode}`);
    
    const user = mockDb.users['sandbox_user_stripe_123'];
    console.log(`   Virtual DB Check: User plan: "${user?.fields?.plan?.stringValue}", paymentPastDue: ${user?.fields?.paymentPastDue?.booleanValue}`);
    
    if (user?.fields?.plan?.stringValue === 'free' && user?.fields?.paymentPastDue?.booleanValue === false) {
      console.log('   🎉 TEST 5 PASSED: Plan successfully downgraded back to Free!');
    } else {
      console.error('   ❌ TEST 5 FAILED!');
    }
  } catch (error) {
    console.error('   ❌ TEST 5 EXCEPTION:', error);
  }
  
  // Clean up mock service key if we set it
  if (originalServiceKey) {
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = originalServiceKey;
  } else {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  }
}

runStripeTests();
