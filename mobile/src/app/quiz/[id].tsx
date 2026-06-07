import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, HelpCircle, CheckCircle, XCircle, Trophy } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface Option {
  label: string;
  text: string;
}

interface Question {
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation?: string;
}

interface Quiz {
  _id: string;
  topic: string;
  title?: string;
  questions: Question[];
  createdAt: string;
}

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const toast = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const { data: quiz, isLoading } = useQuery<Quiz>({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const res = await api.get(`/api/ai/quiz?id=${id}`);
      return res.data?.quiz;
    },
    enabled: !!id,
  });

  const questions = quiz?.questions ?? [];
  const currentQ = questions[currentIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === currentQ?.correctAnswer;

  const handleSelect = (label: string) => {
    if (selected) return;
    setSelected(label);
    setAnswers((prev) => ({ ...prev, [currentIndex]: label }));
    if (label === currentQ.correctAnswer) {
      haptics.success();
    } else {
      haptics.error();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(answers[currentIndex + 1] ?? null);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelected(answers[currentIndex - 1] ?? null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswers({});
    setShowResult(false);
  };

  const correctCount = Object.entries(answers).filter(([idx, ans]) => {
    const q = questions[parseInt(idx, 10)];
    return q && ans === q.correctAnswer;
  }).length;

  const scorePercent = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  const scoreColor =
    scorePercent >= 80 ? c.success :
    scorePercent >= 50 ? c.warning :
    c.danger;

  if (showResult) {
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
            Results
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.resultHero}>
            <View style={[styles.trophyWrap, { backgroundColor: `${scoreColor}22` }]}>
              <Trophy size={36} color={scoreColor} strokeWidth={1.5} />
            </View>
            <Text style={[styles.resultScore, { color: scoreColor, fontFamily: typography.display.extraBold }]}>
              {scorePercent}%
            </Text>
            <Text style={[styles.resultLabel, { color: c.textPrimary, fontFamily: typography.display.bold }]}>
              {scorePercent >= 80 ? 'Excellent work!' : scorePercent >= 50 ? 'Good effort!' : 'Keep practicing!'}
            </Text>
            <Text style={[styles.resultSub, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              {correctCount} of {questions.length} correct
            </Text>
          </Animated.View>

          {/* Per-question review */}
          <View style={styles.reviewList}>
            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const correct = userAns === q.correctAnswer;
              return (
                <Animated.View
                  key={idx}
                  entering={FadeInDown.delay(idx * 40).duration(300)}
                  style={[
                    styles.reviewCard,
                    {
                      backgroundColor: c.bgSecondary,
                      borderColor: correct ? `${c.success}44` : `${c.danger}44`,
                    },
                  ]}
                >
                  <View style={styles.reviewRow}>
                    {correct
                      ? <CheckCircle size={16} color={c.success} strokeWidth={2} />
                      : <XCircle size={16} color={c.danger} strokeWidth={2} />
                    }
                    <Text
                      style={[styles.reviewQ, { color: c.textPrimary, fontFamily: typography.body.medium }]}
                      numberOfLines={3}
                    >
                      {q.question}
                    </Text>
                  </View>
                  {!correct && userAns ? (
                    <Text style={[styles.reviewAns, { color: c.danger, fontFamily: typography.body.regular }]}>
                      Your answer: {userAns}
                    </Text>
                  ) : null}
                  <Text style={[styles.reviewAns, { color: c.success, fontFamily: typography.body.regular }]}>
                    Correct: {q.correctAnswer}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          <Button onPress={handleRestart} fullWidth>
            Retake Quiz
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        <Text
          style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
          numberOfLines={1}
        >
          {quiz?.title ?? quiz?.topic ?? 'Quiz'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : !quiz || questions.length === 0 ? (
        <View style={styles.loadingState}>
          <Text style={[{ color: c.textMuted, fontFamily: typography.body.regular, fontSize: fontSize.sm }]}>
            No questions found.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, { backgroundColor: c.bgTertiary }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: c.accent,
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              {currentIndex + 1}/{questions.length}
            </Text>
          </View>

          {/* Question */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.questionCard, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
          >
            <View style={[styles.questionIcon, { backgroundColor: c.accentMuted }]}>
              <HelpCircle size={16} color={c.accent} strokeWidth={2} />
            </View>
            <Text
              style={[styles.questionText, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}
            >
              {currentQ.question}
            </Text>
          </Animated.View>

          {/* Options */}
          <View style={styles.options}>
            {currentQ.options.map((opt) => {
              const isSelected = selected === opt.label;
              const isRight = isAnswered && opt.label === currentQ.correctAnswer;
              const isWrong = isAnswered && isSelected && !isRight;

              let borderColor: string = c.border;
              let bg: string = c.bgSecondary;
              let textColor: string = c.textPrimary;

              if (isRight) { borderColor = c.success; bg = `${c.success}18`; textColor = c.success; }
              else if (isWrong) { borderColor = c.danger; bg = `${c.danger}18`; textColor = c.danger; }
              else if (isSelected) { borderColor = c.accent; bg = c.accentMuted; textColor = c.accent; }

              return (
                <Pressable
                  key={opt.label}
                  onPress={() => handleSelect(opt.label)}
                  disabled={!!selected}
                  style={[
                    styles.optionBtn,
                    { backgroundColor: bg, borderColor },
                  ]}
                >
                  <View style={[styles.optionLabel, { backgroundColor: `${borderColor}33` }]}>
                    <Text style={[styles.optionLabelText, { color: textColor, fontFamily: typography.display.bold }]}>
                      {opt.label}
                    </Text>
                  </View>
                  <Text
                    style={[styles.optionText, { color: textColor, fontFamily: typography.body.medium }]}
                  >
                    {opt.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Explanation */}
          {isAnswered && currentQ.explanation ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[styles.explanation, { backgroundColor: c.bgElevated, borderColor: c.border }]}
            >
              <Text style={[styles.expLabel, { color: c.accent, fontFamily: typography.body.bold }]}>
                Explanation
              </Text>
              <Text style={[styles.expText, { color: c.textSecondary, fontFamily: typography.body.regular }]}>
                {currentQ.explanation}
              </Text>
            </Animated.View>
          ) : null}

          {/* Navigation */}
          <View style={styles.navRow}>
            <Button
              onPress={handlePrev}
              variant="secondary"
              disabled={currentIndex === 0}
              style={{ flex: 1 }}
            >
              Previous
            </Button>
            <Button
              onPress={handleNext}
              disabled={!isAnswered}
              style={{ flex: 1 }}
            >
              {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: { fontSize: fontSize.xs, flexShrink: 0 },
  questionCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  questionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: fontSize.md,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  options: { gap: spacing.sm },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionLabelText: { fontSize: fontSize.sm },
  optionText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  explanation: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  expLabel: { fontSize: fontSize.xs, letterSpacing: 0.5 },
  expText: { fontSize: fontSize.sm, lineHeight: 20 },
  navRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultScroll: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  resultHero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
  },
  trophyWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  resultScore: {
    fontSize: 48,
    letterSpacing: -2,
  },
  resultLabel: {
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
  },
  resultSub: { fontSize: fontSize.sm },
  reviewList: { gap: spacing.sm },
  reviewCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  reviewQ: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  reviewAns: {
    fontSize: fontSize.xs,
    marginLeft: 24,
  },
});
