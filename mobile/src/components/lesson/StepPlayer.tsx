import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconX, IconConfetti } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { Topic } from '@/lib/types';
import InfoStepBlock from './InfoStepBlock';
import QuizStep from './QuizStep';
import ExerciseRunner from './ExerciseRunner';

const STEP_LABELS: Record<string, string> = {
  text: 'Reading',
  latex: 'Formula',
  code: 'Code',
  youtube: 'Video',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  quiz: 'Quiz',
  exercise: 'Exercise',
};

export default function StepPlayer({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const { colors } = useTheme();
  const steps = topic.contents || [];
  const [index, setIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const total = steps.length;
  const step = steps[index];
  const isLastStep = index === total - 1;
  const isQuizStep = step?.type === 'quiz';
  const canAdvance = !isQuizStep || quizAnswered;

  const handleNext = () => {
    if (isLastStep) {
      setFinished(true);
      return;
    }
    setQuizAnswered(false);
    setIndex((i) => i + 1);
  };

  if (total === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]}>
        <View style={styles.emptyState}>
          <Text style={{ color: colors.textSecondary, fontFamily: fontFamilies.sans }}>This topic has no lesson steps yet.</Text>
          <Pressable onPress={onClose} style={[styles.doneBtn, { backgroundColor: colors.brandPrimary }]}>
            <Text style={[styles.doneBtnText, { color: colors.brandOnPrimary }]}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={onClose} hitSlop={10}>
            <IconX size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.congratsWrap}>
          <View style={[styles.congratsIcon, { backgroundColor: colors.brandAiSoft }]}>
            <IconConfetti size={40} color={colors.brandAi} />
          </View>
          <Text style={[styles.congratsTitle, { color: colors.textPrimary }]}>Congratulations!</Text>
          <Text style={{ color: colors.textSecondary, fontFamily: fontFamilies.sans, textAlign: 'center' }}>
            You&apos;ve finished &ldquo;{topic.title}&rdquo;.
          </Text>
          <Pressable onPress={onClose} style={[styles.doneBtn, { backgroundColor: colors.brandPrimary }]}>
            <Text style={[styles.doneBtnText, { color: colors.brandOnPrimary }]}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={onClose} hitSlop={10}>
          <IconX size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>{index + 1}/{total}</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSunken }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.success, width: `${((index + 1) / total) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.stepLabel, { color: colors.textTertiary }]}>{STEP_LABELS[step.type] || step.type}</Text>
        {!!step.title && step.type !== 'quiz' && (
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{step.title}</Text>
        )}

        {step.type === 'quiz' && step.quiz ? (
          <QuizStep quiz={step.quiz} onAnswered={() => setQuizAnswered(true)} />
        ) : step.type === 'exercise' && step.exercise ? (
          <ExerciseRunner exercise={step.exercise} />
        ) : (
          <InfoStepBlock content={step} />
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
        <Pressable
          onPress={handleNext}
          disabled={!canAdvance}
          style={[styles.nextBtn, { backgroundColor: colors.danger, opacity: canAdvance ? 1 : 0.5 }]}
        >
          <Text style={styles.nextBtnText}>{isLastStep ? 'Finish' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  progressLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium },
  progressTrack: { height: 6, borderRadius: radii.full, marginHorizontal: spacing.xl, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radii.full },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.base },
  stepLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, textTransform: 'uppercase', letterSpacing: 0.6 },
  stepTitle: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.base, borderTopWidth: 1 },
  nextBtn: { paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontFamily: fontFamilies.sansMedium, fontSize: fontSizes.base },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.base, paddingHorizontal: spacing.xl },
  congratsWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.base, paddingHorizontal: spacing.xl },
  congratsIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  congratsTitle: { fontSize: fontSizes['2xl'], fontFamily: fontFamilies.displaySemiBold },
  doneBtn: { marginTop: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'], borderRadius: radii.md },
  doneBtnText: { fontFamily: fontFamilies.sansMedium, fontSize: fontSizes.base },
});
