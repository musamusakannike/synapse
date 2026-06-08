import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

export default function AskScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const toast = useToast();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.warning('Empty question', 'Please enter a question first.');
      return;
    }
    setLoading(true);
    haptics.medium();
    try {
      const res = await api.post('/api/ai/question', { question: question.trim() });
      setAnswer(res.data?.answer ?? '');
    } catch (err: any) {
      if (err.response?.data?.code === 'LIMIT_REACHED') {
        toast.warning('Daily limit reached', 'Upgrade to Premium for unlimited generations.');
      } else {
        toast.error('Failed', err.response?.data?.error ?? 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
          Ask AI
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.heroIcon, { backgroundColor: c.accentMuted }]}>
            <Image
              source={require('@/assets/images/splash-icon.png')}
              style={{ width: 24, height: 24, tintColor: c.accent }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.heading, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
            What would you like to learn?
          </Text>
          <Text style={[styles.subheading, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            Ask any academic question and get a personalized answer.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.form}>
          <Input
            label="Your question"
            placeholder="e.g. Explain Newton's laws of motion in simple terms..."
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={4}
            containerStyle={styles.multilineInput}
          />
          <Button onPress={handleAsk} loading={loading} fullWidth>
            Get Answer
          </Button>
        </Animated.View>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={c.accent} />
            <Text style={[styles.loadingText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              Generating your answer...
            </Text>
          </View>
        )}

        {answer ? (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[styles.answerCard, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
          >
            <View style={styles.answerHeader}>
              <View style={[styles.answerIcon, { backgroundColor: c.accentMuted }]}>
                <Image
                  source={require('@/assets/images/splash-icon.png')}
                  style={{ width: 14, height: 14, tintColor: c.accent }}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.answerLabel, { color: c.accent, fontFamily: typography.body.semiBold }]}>
                AI Response
              </Text>
            </View>
            <ScrollView style={styles.answerScroll} nestedScrollEnabled>
              <Text style={[styles.answerText, { color: c.textPrimary, fontFamily: typography.body.regular }]}>
                {answer}
              </Text>
            </ScrollView>
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollView>
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
    gap: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  form: { gap: spacing.md },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  loadingText: { fontSize: fontSize.sm },
  answerCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  answerIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerLabel: { fontSize: fontSize.sm },
  answerScroll: { maxHeight: 400 },
  answerText: {
    fontSize: fontSize.sm,
    lineHeight: 22,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
});
