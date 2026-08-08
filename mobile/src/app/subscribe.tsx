import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { IconArrowLeft, IconSparkles, IconCheck, IconInfinity, IconBuildingBank, IconCreditCard } from '@tabler/icons-react-native';
import { paymentApi } from '@/lib/api';
import { PaymentStatus } from '@/lib/types';
import { formatKobo } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

const DISPLAY_PRICE_KOBO = Number(Constants.expoConfig?.extra?.subscriptionPriceKobo ?? 0);

const PERKS = [
  'Every premium course, current and future',
  'No per-course purchases — one flat monthly price',
];

export default function SubscribeScreen() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  const load = useCallback(() => {
    paymentApi
      .me()
      .then((res) => {
        const data: PaymentStatus = res.data.data;
        setStatus(data);
        if (data.subscription.currentPeriodEnd) {
          setDaysLeft(Math.max(0, Math.ceil((new Date(data.subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(load);

  const sub = status?.subscription;
  const isActive = sub?.status === 'active';
  const isManual = sub?.billingType === 'manual';

  const goToCheckout = (type: 'subscription' | 'subscription-manual') => {
    haptics.light();
    router.push({ pathname: '/checkout', params: { type } } as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Subscription</Text>
        <View style={{ width: 20 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.iconWrap, { backgroundColor: colors.brandPrimarySoft }]}>
            <IconSparkles size={24} color={colors.brandPrimaryHover} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>All-access subscription</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Unlock every premium course on SabiLearn for one monthly price.
          </Text>

          {isActive && (
            <Card style={{ marginTop: spacing.lg, width: '100%' }}>
              <View style={styles.activeWrap}>
                <Badge variant="success">Active</Badge>
                <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                  You have all-access.
                  {sub?.currentPeriodEnd
                    ? ` ${isManual ? 'Access ends' : 'Renews'} on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}${isManual && daysLeft !== null ? ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)` : ''}.`
                    : ''}
                </Text>
                {isManual && (
                  <Text style={[styles.subtitle, { color: colors.textTertiary, marginTop: spacing.xs }]}>
                    This plan doesn&apos;t auto-renew — pay again any time before it ends to avoid a gap.
                  </Text>
                )}
              </View>
            </Card>
          )}

          {(!isActive || isManual) && (
            <Card style={{ marginTop: spacing.lg, width: '100%' }}>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.textPrimary }]}>{formatKobo(DISPLAY_PRICE_KOBO)}</Text>
                <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/month</Text>
              </View>
              {sub?.status === 'expired' && (
                <Text style={[styles.pastDue, { color: colors.danger }]}>
                  Your subscription expired — pay again to restore access.
                </Text>
              )}
              {sub?.status === 'past_due' && (
                <Text style={[styles.pastDue, { color: colors.danger }]}>
                  Your last card payment failed — resubscribe to restore access.
                </Text>
              )}
              <View style={{ gap: spacing.sm, marginVertical: spacing.lg }}>
                {PERKS.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <View style={[styles.perkIcon, { backgroundColor: colors.successBg }]}>
                      <IconCheck size={12} color={colors.success} />
                    </View>
                    <Text style={[styles.perkText, { color: colors.textSecondary }]}>{perk}</Text>
                  </View>
                ))}
                <View style={styles.perkRow}>
                  <View style={[styles.perkIcon, { backgroundColor: colors.successBg }]}>
                    <IconInfinity size={12} color={colors.success} />
                  </View>
                  <Text style={[styles.perkText, { color: colors.textSecondary }]}>
                    Prefer to pay once? Every course also has a one-off price on its own page.
                  </Text>
                </View>
              </View>

              <Button fullWidth icon={<IconBuildingBank size={16} color={colors.brandOnPrimary} />} onPress={() => goToCheckout('subscription-manual')}>
                {isManual ? 'Renew now' : 'Subscribe'} with bank transfer / USSD
              </Button>
              <Text style={[styles.hint, { color: colors.textTertiary }]}>No card needed — pays instantly, renew manually each month.</Text>

              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
                <Text style={[styles.dividerLabel, { color: colors.textTertiary }]}>or</Text>
                <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
              </View>

              <Button
                fullWidth
                variant="secondary"
                icon={<IconCreditCard size={16} color={colors.textPrimary} />}
                onPress={() => goToCheckout('subscription')}
              >
                Subscribe with card (auto-renews)
              </Button>
            </Card>
          )}
        </ScrollView>
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
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing['2xl'], alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold, marginTop: spacing.md, textAlign: 'center' },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, textAlign: 'center', marginTop: spacing.xs },
  activeWrap: { alignItems: 'center', paddingVertical: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: spacing.xs },
  price: { fontSize: fontSizes['2xl'], fontFamily: fontFamilies.displaySemiBold },
  pricePeriod: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, marginBottom: 4 },
  pastDue: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, textAlign: 'center', marginTop: spacing.sm },
  perkRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  perkIcon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  perkText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
  hint: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, textAlign: 'center', marginTop: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.base },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans },
});
