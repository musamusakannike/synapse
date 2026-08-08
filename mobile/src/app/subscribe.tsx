import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { IconArrowLeft, IconSparkles, IconCheck, IconInfinity } from '@tabler/icons-react-native';
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
  'Cancel anytime, keep access until the period ends',
];

export default function SubscribeScreen() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    paymentApi
      .me()
      .then((res) => setStatus(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(load);

  const isActive = status?.subscription.status === 'active';

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

          <Card style={{ marginTop: spacing.lg }}>
            {isActive ? (
              <View style={styles.activeWrap}>
                <Badge variant="success">Active</Badge>
                <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                  You have all-access.
                  {status?.subscription.currentPeriodEnd
                    ? ` Renews on ${new Date(status.subscription.currentPeriodEnd).toLocaleDateString()}.`
                    : ''}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.textPrimary }]}>{formatKobo(DISPLAY_PRICE_KOBO)}</Text>
                  <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/month</Text>
                </View>
                {status?.subscription.status === 'past_due' && (
                  <Text style={[styles.pastDue, { color: colors.danger }]}>
                    Your last payment failed — resubscribe to restore access.
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
                <Button
                  fullWidth
                  onPress={() => { haptics.light(); router.push({ pathname: '/checkout', params: { type: 'subscription' } } as any); }}
                >
                  Subscribe monthly
                </Button>
              </>
            )}
          </Card>
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
});
