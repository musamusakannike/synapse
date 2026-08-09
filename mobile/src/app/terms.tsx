import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconArrowLeft, IconExternalLink } from '@tabler/icons-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import Button from '@/components/ui/Button';

export default function TermsOfServiceScreen() {
  const { colors } = useTheme();

  const handleOpenWeb = () => {
    WebBrowser.openBrowserAsync('https://sabilearn.online/terms');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Terms of Service</Text>
        <Pressable onPress={handleOpenWeb} hitSlop={10}>
          <IconExternalLink size={18} color={colors.brandPrimaryHover} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>Last updated: August 2026</Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Agreement to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          By creating an account or using the SabiLearn mobile app, you agree to comply with and be bound by these Terms of Service.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. User Accounts & Access</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You are responsible for maintaining the confidentiality of your credentials. You agree not to share account access or misuse AI tutoring and course material.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Content & Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          All study materials, flashcards, MCQs, and software rights belong to SabiLearn. You are granted a personal, non-exclusive license to use materials for personal learning.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Service Availability</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We continuously update learning content and system features. We reserve the right to modify or temporarily suspend aspects of the service for scheduled maintenance.
        </Text>

        <View style={styles.webBtnWrap}>
          <Button variant="secondary" onPress={handleOpenWeb} icon={<IconExternalLink size={16} color={colors.textPrimary} />}>
            View full terms on web
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
