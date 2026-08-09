import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { IconArrowLeft, IconSparkles, IconCheck, IconShieldCheck, IconDeviceLaptop } from '@tabler/icons-react-native';
import { paymentApi } from '@/lib/api';
import { PaymentStatus } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

const PREMIUM_PERKS = [
  'Access to all generated courses and study modules',
  'Unlimited AI Tutor questions & practice quizzes',
  'Document analysis and custom course generation',
  'Multi-device syncing across Web and Mobile',
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
          setDaysLeft(
            Math.max(0, Math.ceil((new Date(data.subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(load);

  const sub = status?.subscription;
  const isActive = sub?.status === 'active';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Account Plan</Text>
        <View style={{ width: 20 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.iconWrap, { backgroundColor: colors.brandPrimarySoft }]}>
            <IconSparkles size={24} color={colors.brandPrimaryHover} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>SabiLearn Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your account subscription status and feature availability.
          </Text>

          {isActive ? (
            <Card style={{ marginTop: spacing.lg, width: '100%' }}>
              <View style={styles.activeWrap}>
                <Badge variant="success">Active Premium</Badge>
                <Text style={[styles.activeTitle, { color: colors.textPrimary, marginTop: spacing.sm }]}>
                  All-Access Active
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  {sub?.currentPeriodEnd
                    ? `Your premium subscription is active until ${new Date(sub.currentPeriodEnd).toLocaleDateString()}${daysLeft !== null ? ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining)` : ''}.`
                    : 'You have full access to all premium features.'}
                </Text>
              </View>
            </Card>
          ) : (
            <Card style={{ marginTop: spacing.lg, width: '100%' }}>
              <View style={styles.activeWrap}>
                <Badge variant="default">Free Account</Badge>
                <Text style={[styles.activeTitle, { color: colors.textPrimary, marginTop: spacing.sm }]}>
                  Standard Access
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  You are currently on the Free Plan.
                </Text>
                <View style={[styles.noticeBox, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderSubtle }]}>
                  <IconDeviceLaptop size={20} color={colors.brandPrimaryHover} />
                  <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                    Account plan status and feature access sync automatically across all devices signed into your account.
                  </Text>
                </View>
              </View>
            </Card>
          )}

          <View style={{ width: '100%', marginTop: spacing.xl }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Included Features</Text>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              {PREMIUM_PERKS.map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <View style={[styles.perkIcon, { backgroundColor: colors.successBg }]}>
                    <IconCheck size={12} color={colors.success} />
                  </View>
                  <Text style={[styles.perkText, { color: colors.textSecondary }]}>{perk}</Text>
                </View>
              ))}
            </View>
          </View>
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
  subtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, textAlign: 'center', marginTop: spacing.xs, lineHeight: fontSizes.sm * 1.5 },
  activeWrap: { alignItems: 'center', paddingVertical: spacing.sm },
  activeTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  noticeText: { flex: 1, fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, lineHeight: fontSizes.xs * 1.5 },
  sectionTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold },
  perkRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  perkIcon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  perkText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
});
