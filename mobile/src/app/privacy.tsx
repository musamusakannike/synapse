import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconArrowLeft, IconExternalLink } from '@tabler/icons-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTheme, fontFamilies, fontSizes, spacing, radii } from '@/theme';
import Button from '@/components/ui/Button';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  const handleOpenWeb = () => {
    WebBrowser.openBrowserAsync('https://sabilearn.online/privacy');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
        <Pressable onPress={handleOpenWeb} hitSlop={10}>
          <IconExternalLink size={18} color={colors.brandPrimaryHover} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>Last updated: August 2026</Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          SabiLearn collects personal information necessary to provide our educational services, including your name, email address, profile preferences, and learning progress metrics.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. How We Use Your Data</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          Your data is used to personalize flashcard reviews, track course progress, deliver notifications, improve AI tutor recommendations, and sync learning states across your devices.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Data Security & Storage</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We implement industry-standard encryption protocols (TLS/SSL) to protect your account credentials and transmission of study metrics. We do not sell your personal information to third parties.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Your Rights & Account Deletion</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You have full control over your personal data. You can export or delete your profile and account history at any time directly through the app settings or by contacting privacy@sabilearn.online.
        </Text>

        <View style={styles.webBtnWrap}>
          <Button variant="secondary" onPress={handleOpenWeb} icon={<IconExternalLink size={16} color={colors.textPrimary} />}>
            View full policy on web
          </Button>
        </View>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.md },
  lastUpdated: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, marginBottom: spacing.xs },
  sectionTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, marginTop: spacing.xs },
  paragraph: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.6 },
  webBtnWrap: { marginTop: spacing.lg },
});
