import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconCheck, IconCreditCard, IconBuildingBank, IconSparkles } from '@tabler/icons-react-native';
import { paymentApi } from '@/lib/api';
import { formatKobo } from '@/lib/money';
import { SUBSCRIPTION_PRICE_KOBO } from '@/lib/paystack';
import { PaymentStatus, VerifyResponse } from '@/lib/types';
import { useAppReview } from '@/hooks/useAppReview';
import { usePaystackPayment } from '@/hooks/usePaystackPayment';
import { NotInReview } from '@/components/common/ReviewGuard';
import PaystackCheckoutModal from '@/components/payments/PaystackCheckoutModal';
import ScreenBackdrop from '@/components/common/ScreenBackdrop';
import ScreenHeader from '@/components/common/ScreenHeader';
import GlassSurface from '@/components/ui/GlassSurface';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fontFamilies, spacing } from '@/theme';
import { ACCENT, INK, MUTED, TINT_GLASS, TINT_ORANGE } from '@/theme/brand';
import * as haptics from '@/lib/haptics';

const PERKS = [
  'Every premium course, current and future',
  'No per-course purchases — one flat monthly price',
];

export default function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const { inReview } = useAppReview();
  const { session, busy, verifying, initialize, closeSession, verifyReference } = usePaystackPayment();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await paymentApi.me();
      setStatus(res.data?.data ?? null);
    } catch {
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (inReview) {
      router.replace('/(tabs)/profile');
      return;
    }
    void load();
  }, [inReview, load]);

  const onRefresh = useCallback(async () => {
    haptics.light();
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleVerified = useCallback(
    async (result: VerifyResponse | null) => {
      if (result?.status === 'success') {
        Alert.alert('Payment successful', 'You now have all-access. It may take a few seconds to show everywhere.');
        await load();
      } else if (result?.status === 'pending') {
        Alert.alert('Payment pending', "We're still waiting for confirmation. Pull to refresh in a moment.");
      } else if (result?.status === 'failed') {
        Alert.alert('Payment failed', "Your payment wasn't completed. No charge should have been made.");
      }
    },
    [load]
  );

  const start = (kind: 'manual' | 'recurring') => {
    void initialize(kind, { amountKobo: SUBSCRIPTION_PRICE_KOBO }, handleVerified);
  };

  if (inReview) return null;
  if (isLoading) return <LoadingSpinner />;

  const sub = status?.subscription;
  const isActive = sub?.status === 'active';
  const isManual = sub?.billingType === 'manual';
  const daysLeft =
    sub?.currentPeriodEnd != null
      ? Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <NotInReview>
      <View style={styles.container}>
        <ScreenBackdrop />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="All-access" subtitle="Unlock every premium course for one monthly price." showBack />

          {isActive && (
            <GlassSurface style={styles.card} tintColor={TINT_ORANGE}>
              <Badge variant="success">Active</Badge>
              <Text style={styles.body}>
                You have all-access.
                {sub?.currentPeriodEnd ? (
                  <>
                    {' '}
                    {isManual ? 'Access ends' : 'Renews'} on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    {isManual && daysLeft != null ? ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)` : ''}.
                  </>
                ) : null}
              </Text>
              {isManual ? (
                <Text style={styles.hint}>This plan doesn't auto-renew — pay again before it ends to keep access.</Text>
              ) : null}
            </GlassSurface>
          )}

          {(!isActive || isManual) && (
            <GlassSurface style={styles.card} tintColor={TINT_GLASS}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatKobo(SUBSCRIPTION_PRICE_KOBO)}</Text>
                <Text style={styles.per}>/month</Text>
              </View>
              {sub?.status === 'expired' && (
                <Text style={styles.warn}>Your subscription expired — pay again to restore access.</Text>
              )}
              {sub?.status === 'past_due' && (
                <Text style={styles.warn}>Your last card payment failed — resubscribe to restore access.</Text>
              )}

              {PERKS.map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <IconCheck size={16} color="#1F9D55" />
                  <Text style={styles.perk}>{perk}</Text>
                </View>
              ))}
              <View style={styles.perkRow}>
                <IconSparkles size={16} color="#1F9D55" />
                <Text style={styles.perk}>Prefer to pay once? Each course also has a one-off price on its page.</Text>
              </View>

              <Button
                fullWidth
                loading={busy === 'manual' || verifying}
                disabled={busy === 'recurring'}
                onPress={() => start('manual')}
                icon={<IconBuildingBank size={18} color={INK} />}
              >
                {isManual ? 'Renew now' : 'Subscribe'} with bank transfer / USSD
              </Button>
              <Text style={styles.hint}>No card needed — pays instantly, renew manually each month.</Text>

              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.or}>or</Text>
                <View style={styles.line} />
              </View>

              <Button
                fullWidth
                variant="secondary"
                loading={busy === 'recurring'}
                disabled={busy === 'manual' || verifying}
                onPress={() => start('recurring')}
                icon={<IconCreditCard size={18} color={INK} />}
              >
                Subscribe with card (auto-renews)
              </Button>
            </GlassSurface>
          )}
        </ScrollView>

        <PaystackCheckoutModal
          visible={!!session}
          authorizationUrl={session?.authorizationUrl ?? null}
          fallbackReference={session?.reference ?? null}
          onClose={closeSession}
          onSettled={(reference) => {
            void verifyReference(reference).then(handleVerified);
          }}
        />
      </View>
    </NotInReview>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'], gap: spacing.md },
  card: { borderRadius: 20, padding: spacing.base, gap: spacing.sm, overflow: 'hidden' },
  body: { fontSize: 14, fontFamily: fontFamilies.sans, color: MUTED, lineHeight: 20 },
  hint: { fontSize: 12, fontFamily: fontFamilies.sans, color: MUTED, textAlign: 'center', lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  price: { fontSize: 32, fontFamily: fontFamilies.sansBold, color: INK, letterSpacing: -0.6 },
  per: { fontSize: 14, fontFamily: fontFamilies.sans, color: MUTED, marginBottom: 6 },
  warn: { fontSize: 12, fontFamily: fontFamilies.sansMedium, color: '#E5484D', textAlign: 'center' },
  perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  perk: { flex: 1, fontSize: 14, fontFamily: fontFamilies.sans, color: MUTED, lineHeight: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E8E8EE' },
  or: { fontSize: 12, fontFamily: fontFamilies.sans, color: MUTED },
});
