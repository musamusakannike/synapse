import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Crown, Check, ExternalLink, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

const FREE_FEATURES = [
  '10 AI generations per day',
  'Ask any academic question',
  'Generate course outlines',
  'Create practice quizzes',
  'Upload documents for context',
];

const PREMIUM_FEATURES = [
  'Unlimited AI generations',
  'Priority AI responses',
  'Explanatory video generation',
  'Advanced quiz analytics',
  'All free features included',
];

export default function BillingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { c } = useTheme();
  const toast = useToast();

  const handleUpgrade = () => {
    haptics.medium();
    Linking.openURL('https://sabilearn.online/dashboard/billing').catch(() => {
      toast.error('Could not open browser', 'Please visit sabilearn.online/dashboard/billing');
    });
  };

  const handleManage = () => {
    haptics.light();
    Linking.openURL('https://sabilearn.online/dashboard/billing').catch(() => {
      toast.error('Could not open browser');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
          Billing
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Status card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[
            styles.statusCard,
            {
              backgroundColor: user?.premium ? `${c.accent}18` : c.bgSecondary,
              borderColor: user?.premium ? `${c.accent}44` : c.borderSubtle,
            },
          ]}
        >
          <View style={[styles.statusIcon, { backgroundColor: user?.premium ? c.accentMuted : c.bgTertiary }]}>
            {user?.premium
              ? <Crown size={22} color={c.accent} strokeWidth={1.5} />
              : <Zap size={22} color={c.textSecondary} strokeWidth={1.5} />
            }
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusPlan, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
              {user?.premium ? 'Premium Plan' : 'Free Plan'}
            </Text>
            <Text style={[styles.statusSub, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              {user?.premium
                ? 'Unlimited AI generations active'
                : '10 generations per day'}
            </Text>
          </View>
        </Animated.View>

        {/* Current plan */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={[styles.planLabel, { color: c.textMuted, fontFamily: typography.body.medium }]}>
            {user?.premium ? 'YOUR PLAN — PREMIUM' : 'YOUR PLAN — FREE'}
          </Text>
          <View style={[styles.planCard, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
            {(user?.premium ? PREMIUM_FEATURES : FREE_FEATURES).map((feat) => (
              <View key={feat} style={styles.featureRow}>
                <Check size={16} color={user?.premium ? c.accent : c.success} strokeWidth={2.5} />
                <Text style={[styles.featureText, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                  {feat}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Upgrade / manage */}
        {!user?.premium ? (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.upgradeSection}>
            <View style={[styles.upgradeBadge, { backgroundColor: c.accentMuted, borderColor: `${c.accent}44` }]}>
              <Crown size={14} color={c.accent} strokeWidth={2} />
              <Text style={[styles.upgradeBadgeText, { color: c.accent, fontFamily: typography.body.bold }]}>
                PREMIUM
              </Text>
            </View>
            <Text style={[styles.upgradeTitle, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
              Unlock unlimited learning
            </Text>
            <Text style={[styles.upgradeSub, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              Get unlimited AI generations, priority responses, and video generation. Billed monthly.
            </Text>
            <View style={[styles.priceRow, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
              {PREMIUM_FEATURES.map((feat) => (
                <View key={feat} style={styles.featureRow}>
                  <Check size={16} color={c.accent} strokeWidth={2.5} />
                  <Text style={[styles.featureText, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                    {feat}
                  </Text>
                </View>
              ))}
            </View>
            <Button onPress={handleUpgrade} fullWidth>
              <View style={styles.btnInner}>
                <ExternalLink size={16} color="#0C0C0E" strokeWidth={2.5} />
                <Text style={[styles.btnText, { fontFamily: typography.body.semiBold }]}>
                  Upgrade on Web
                </Text>
              </View>
            </Button>
            <Text style={[styles.upgradeNote, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              Payments are processed securely on sabilearn.online
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Button onPress={handleManage} variant="secondary" fullWidth>
              <View style={styles.btnInner}>
                <ExternalLink size={16} color={c.textSecondary} strokeWidth={2} />
                <Text style={[styles.manageBtnText, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
                  Manage Subscription
                </Text>
              </View>
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusInfo: { flex: 1, gap: 3 },
  statusPlan: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
  },
  statusSub: { fontSize: fontSize.xs },
  planLabel: {
    fontSize: fontSize['2xs'],
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  planCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: { fontSize: fontSize.sm },
  upgradeSection: { gap: spacing.md },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  upgradeBadgeText: { fontSize: fontSize.xs },
  upgradeTitle: {
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
  },
  upgradeSub: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  priceRow: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnText: {
    color: '#0C0C0E',
    fontSize: fontSize.sm,
  },
  manageBtnText: { fontSize: fontSize.sm },
  upgradeNote: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
