import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft, IconCircleCheck, IconCircleX, IconClock } from '@tabler/icons-react-native';
import { paymentApi, PAYMENT_CALLBACK_URL } from '@/lib/api';
import { VerifyResponse } from '@/lib/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';

type Phase = 'initializing' | 'checkout' | 'verifying' | 'result' | 'error';

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const { type, courseId } = useLocalSearchParams<{ type: 'course' | 'subscription' | 'subscription-manual'; courseId?: string }>();
  const webviewRef = useRef<WebView>(null);
  const [phase, setPhase] = useState<Phase>('initializing');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasHandledCallback = useRef(false);

  const startCheckout = useCallback(async () => {
    setPhase('initializing');
    setErrorMessage(null);
    hasHandledCallback.current = false;
    try {
      const res =
        type === 'subscription'
          ? await paymentApi.initializeSubscription()
          : type === 'subscription-manual'
            ? await paymentApi.initializeManualSubscription()
            : await paymentApi.initializeCoursePurchase(courseId!);
      setCheckoutUrl(res.data.data.authorizationUrl);
      setPhase('checkout');
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErrorMessage(message || 'Could not start checkout. Please try again.');
      setPhase('error');
    }
  }, [type, courseId]);

  useEffect(() => {
    startCheckout();
  }, [startCheckout]);

  const verifyReference = useCallback(async (reference: string) => {
    setPhase('verifying');
    try {
      const res = await paymentApi.verify(reference);
      setResult(res.data.data);
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErrorMessage(message || 'Could not confirm payment status.');
    } finally {
      setPhase('result');
    }
  }, []);

  const handleNavigationChange = (navState: WebViewNavigation) => {
    if (hasHandledCallback.current || !navState.url.startsWith(PAYMENT_CALLBACK_URL)) return;
    hasHandledCallback.current = true;

    const queryString = navState.url.split('?')[1] ?? '';
    const params = new URLSearchParams(queryString);
    const reference = params.get('reference') || params.get('trxref');
    if (reference) {
      verifyReference(reference);
    } else {
      setErrorMessage('Payment reference missing from callback.');
      setPhase('result');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Checkout</Text>
        <View style={{ width: 20 }} />
      </View>

      {phase === 'initializing' && <LoadingSpinner />}

      {phase === 'checkout' && checkoutUrl && (
        <View style={styles.webviewWrap}>
          <WebView
            ref={webviewRef}
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleNavigationChange}
            onShouldStartLoadWithRequest={(req) => {
              if (req.url.startsWith(PAYMENT_CALLBACK_URL)) {
                handleNavigationChange(req as WebViewNavigation);
                return false;
              }
              return true;
            }}
            startInLoadingState
            renderLoading={() => <LoadingSpinner />}
          />
        </View>
      )}

      {phase === 'verifying' && (
        <View style={styles.centerFill}>
          <LoadingSpinner size="small" fill={false} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>Confirming your payment…</Text>
        </View>
      )}

      {phase === 'error' && (
        <View style={styles.centerFill}>
          <IconCircleX size={48} color={colors.danger} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Something went wrong</Text>
          {errorMessage && <Text style={[styles.message, { color: colors.textSecondary }]}>{errorMessage}</Text>}
          <Button onPress={startCheckout} style={{ marginTop: spacing.lg }}>
            Try again
          </Button>
        </View>
      )}

      {phase === 'result' && (
        <View style={styles.centerFill}>
          {result?.status === 'success' ? (
            <>
              <IconCircleCheck size={48} color={colors.success} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>Payment successful</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {result.type === 'subscription' ? 'You now have all-access.' : 'This course is now unlocked.'}
              </Text>
            </>
          ) : result?.status === 'pending' ? (
            <>
              <IconClock size={48} color={colors.warning} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>Payment pending</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                We&apos;re still waiting for confirmation. Check back shortly.
              </Text>
            </>
          ) : (
            <>
              <IconCircleX size={48} color={colors.danger} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {errorMessage ? 'Something went wrong' : 'Payment failed'}
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                {errorMessage || "Your payment wasn't completed. No charge should have been made."}
              </Text>
            </>
          )}
          <Button onPress={() => router.back()} style={{ marginTop: spacing.lg }}>
            Done
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold },
  webviewWrap: { flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  title: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold, marginTop: spacing.sm, textAlign: 'center' },
  message: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, textAlign: 'center' },
});
