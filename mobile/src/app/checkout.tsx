import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconArrowLeft, IconSparkles, IconDeviceLaptop } from '@tabler/icons-react-native';
import Button from '@/components/ui/Button';
import { useTheme, fontFamilies, fontSizes, spacing, radii } from '@/theme';

export default function CheckoutScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Account Management</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.centerFill}>
        <View style={[styles.iconWrap, { backgroundColor: colors.brandPrimarySoft }]}>
          <IconSparkles size={32} color={colors.brandPrimaryHover} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Subscription & Billing</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Course purchases and plan upgrades sync automatically across all devices signed into your account.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surfaceSunken, borderColor: colors.borderSubtle }]}>
          <IconDeviceLaptop size={24} color={colors.brandPrimaryHover} />
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Feature access and active subscriptions associated with your account will update automatically in this app.
          </Text>
        </View>

        <Button onPress={() => router.back()} style={{ marginTop: spacing.lg, width: '100%' }}>
          Return to App
        </Button>
      </View>
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
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold, textAlign: 'center' },
  message: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, textAlign: 'center', lineHeight: fontSizes.sm * 1.5 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  cardText: { flex: 1, fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, lineHeight: fontSizes.xs * 1.5 },
});
