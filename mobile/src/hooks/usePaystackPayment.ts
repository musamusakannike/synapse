import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';
import { useAuthStore } from '@/store/auth.store';
import { useAppReview } from '@/hooks/useAppReview';
import { paymentApi } from '@/lib/api';
import { PAYSTACK_PUBLIC_KEY } from '@/lib/paystack';
import type { CheckoutInitResponse, VerifyResponse } from '@/lib/types';
import * as haptics from '@/lib/haptics';

type CheckoutKind = 'manual' | 'recurring' | 'course';

export type PaystackSession = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  kind: CheckoutKind;
};

function apiErrorMessage(err: unknown, fallback: string): string {
  const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
  return errorObj?.response?.data?.message || errorObj?.message || fallback;
}

function extractReference(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.reference === 'string') return data.reference;
  if (typeof data.transactionRef === 'string') return data.transactionRef;
  const nested = data.data;
  if (nested && typeof nested === 'object' && typeof (nested as { reference?: string }).reference === 'string') {
    return (nested as { reference: string }).reference;
  }
  return fallback;
}

/**
 * Starts a server-initialized Paystack charge, then completes it in-app.
 * Prefers react-native-paystack-webview popup when a public key is configured;
 * otherwise loads the authorization URL (same Paystack checkout).
 */
export function usePaystackPayment() {
  const { inReview } = useAppReview();
  const user = useAuthStore((s) => s.user);
  const { popup } = usePaystack();
  const [session, setSession] = useState<PaystackSession | null>(null);
  const [busy, setBusy] = useState<CheckoutKind | null>(null);
  const [verifying, setVerifying] = useState(false);

  const closeSession = useCallback(() => setSession(null), []);

  const verifyReference = useCallback(async (reference: string): Promise<VerifyResponse | null> => {
    setVerifying(true);
    try {
      const res = await paymentApi.verify(reference);
      const data: VerifyResponse | undefined = res.data?.data;
      if (data?.status === 'success') haptics.success();
      else if (data?.status === 'failed') haptics.error();
      return data ?? null;
    } catch (err) {
      haptics.error();
      Alert.alert('Could not confirm payment', apiErrorMessage(err, 'Please try again in a moment.'));
      return null;
    } finally {
      setVerifying(false);
      setSession(null);
      setBusy(null);
    }
  }, []);

  const completeWithPopup = useCallback(
    (
      init: CheckoutInitResponse,
      amountKobo: number,
      kind: CheckoutKind,
      onVerified: (result: VerifyResponse | null) => void
    ) => {
      if (!user?.email || !PAYSTACK_PUBLIC_KEY) return false;
      popup.checkout({
        email: user.email,
        amount: amountKobo / 100,
        reference: init.reference,
        metadata: { cancel_action: 'sabilearn://payment-callback' },
        onSuccess: (res) => {
          void verifyReference(extractReference(res, init.reference)).then(onVerified);
        },
        onCancel: () => {
          setBusy(null);
          onVerified(null);
        },
        onError: () => {
          setSession({
            authorizationUrl: init.authorizationUrl,
            accessCode: init.accessCode,
            reference: init.reference,
            kind,
          });
        },
      });
      return true;
    },
    [popup, user?.email, verifyReference]
  );

  const initialize = useCallback(
    async (
      kind: CheckoutKind,
      opts: { courseId?: string; amountKobo: number },
      onVerified?: (result: VerifyResponse | null) => void
    ) => {
      if (inReview) {
        Alert.alert('Unavailable', 'Purchases are hidden while this app version is in review.');
        return;
      }
      if (!user?.email) {
        Alert.alert('Sign in required', 'Sign in to continue to checkout.');
        return;
      }

      setBusy(kind);
      try {
        const res =
          kind === 'course'
            ? await paymentApi.initializeCoursePurchase(opts.courseId!)
            : kind === 'recurring'
              ? await paymentApi.initializeSubscription()
              : await paymentApi.initializeManualSubscription();

        const init: CheckoutInitResponse | undefined = res.data?.data;
        if (!init?.authorizationUrl || !init.reference) {
          throw new Error('Checkout could not be started.');
        }

        const handled = completeWithPopup(init, opts.amountKobo, kind, onVerified ?? (() => {}));
        if (!handled) {
          setSession({ ...init, kind });
        }
        setBusy(null);
      } catch (err) {
        setBusy(null);
        haptics.error();
        Alert.alert('Could not start checkout', apiErrorMessage(err, 'Please try again.'));
      }
    },
    [inReview, user?.email, completeWithPopup]
  );

  return {
    session,
    busy,
    verifying,
    initialize,
    closeSession,
    verifyReference,
  };
}
