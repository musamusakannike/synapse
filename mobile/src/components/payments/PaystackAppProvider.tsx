import { ReactNode } from 'react';
import { PaystackProvider } from 'react-native-paystack-webview';
import { PAYSTACK_CHANNELS, PAYSTACK_PUBLIC_KEY } from '@/lib/paystack';

/**
 * Paystack public key is required by the SDK provider. When it is missing
 * (local builds without extra.paystackPublicKey), checkout falls back to the
 * authorization URL returned by our server.
 */
export default function PaystackAppProvider({ children }: { children: ReactNode }) {
  return (
    <PaystackProvider
      publicKey={PAYSTACK_PUBLIC_KEY || 'pk_placeholder'}
      currency="NGN"
      defaultChannels={[...PAYSTACK_CHANNELS]}
    >
      {children}
    </PaystackProvider>
  );
}
