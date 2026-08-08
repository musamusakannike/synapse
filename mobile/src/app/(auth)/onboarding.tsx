import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconBook2 } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, spacing, radii } from '@/theme';
import { useOnboardingStore } from '@/store/onboarding.store';
import Button from '@/components/ui/Button';
import AuthBackground from '@/components/common/AuthBackground';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { completeOnboarding } = useOnboardingStore();

  const handleContinue = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: colors.brandPrimarySoft }]}>
            <IconBook2 size={40} color={colors.brandPrimaryHover} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Learn a skill. Sabi it for life.</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Study courses built for you, with flashcards, practice questions, and AI tools that help you learn faster.
          </Text>
        </View>
        <View style={styles.footer}>
          <Button fullWidth onPress={handleContinue}>Get started</Button>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.base,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.displayBold,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sans,
    lineHeight: fontSizes.base * 1.65,
  },
  footer: {
    gap: spacing.sm,
  },
});
