import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const getSecretKey = (): string => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured.');
  }
  return key;
};

const paystackRequest = async <T = any>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    throw new Error(data.message || 'Paystack request failed.');
  }

  return data;
};

export const initializeTransaction = (params: {
  email: string;
  amount: number;
  reference: string;
  plan?: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}) => {
  return paystackRequest('/transaction/initialize', {
    method: 'POST',
    body: params,
  });
};

export const verifyTransaction = (reference: string) => {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
};

/**
 * Verifies the `x-paystack-signature` header against the raw request body.
 * Must be computed over the raw (unparsed) JSON body, not a re-serialized object,
 * since key ordering/whitespace differences would break the HMAC comparison.
 */
export const verifyWebhookSignature = (rawBody: Buffer, signature: string | undefined): boolean => {
  if (!signature) return false;

  const hash = crypto.createHmac('sha512', getSecretKey()).update(rawBody).digest('hex');
  const hashBuffer = Buffer.from(hash);
  const signatureBuffer = Buffer.from(signature);

  if (hashBuffer.length !== signatureBuffer.length) return false;

  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
};
