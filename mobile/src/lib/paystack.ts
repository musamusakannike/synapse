import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

export const PAYSTACK_PUBLIC_KEY: string =
  (typeof extra.paystackPublicKey === 'string' && extra.paystackPublicKey) ||
  'pk_live_0a6cd813f6db93dc88bd7c4657cc27ca5ba07941';

/** Display-only. Must match server SUBSCRIPTION_AMOUNT_KOBO. */
export const SUBSCRIPTION_PRICE_KOBO: number = Number(
  extra.subscriptionPriceKobo ?? 300000
);

export const PAYSTACK_CHANNELS = [
  'card',
  'bank',
  'ussd',
  'bank_transfer',
  'qr',
] as const;

export function extractPaystackReference(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('reference') || parsed.searchParams.get('trxref');
  } catch {
    const match = url.match(/[?&](?:reference|trxref)=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export function isPaystackCallbackUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.startsWith('sabilearn://') ||
    lower.includes('payment-callback') ||
    lower.includes('standard.paystack.co/close') ||
    lower.includes('paystack.co/close')
  );
}
