import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { IconCheck, IconRotate, IconX } from '@tabler/icons-react-native';
import { Flashcard } from '@/lib/types';
import { useProgressStore } from '@/store/progress.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { useTheme, fontFamilies, fontSizes, radii, spacing, shadows } from '@/theme';
import * as haptics from '@/lib/haptics';

interface FlashcardDeckProps {
  courseId: string;
  topicId?: string;
  flashcards: Flashcard[];
  isLoading: boolean;
}

export default function FlashcardDeck({ courseId, topicId, flashcards, isLoading }: FlashcardDeckProps) {
  const { colors } = useTheme();
  const { submitFlashcardSession } = useProgressStore();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setReview(0);
    setFinished(false);
    startedAt.current = Date.now();
  }, [flashcards.length]);

  const finishSession = (finalKnown: number, finalReview: number) => {
    setFinished(true);
    const duration = Math.round((Date.now() - startedAt.current) / 1000);
    submitFlashcardSession({
      course: courseId,
      topic: topicId,
      flashcardsStudied: flashcards.length,
      duration,
      knownCount: finalKnown,
      reviewCount: finalReview,
    });
  };

  const advance = (isKnown: boolean) => {
    haptics.selection();
    const nextKnown = known + (isKnown ? 1 : 0);
    const nextReview = review + (isKnown ? 0 : 1);
    setKnown(nextKnown);
    setReview(nextReview);
    setFlipped(false);
    if (index + 1 >= flashcards.length) {
      finishSession(nextKnown, nextReview);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setReview(0);
    setFinished(false);
    startedAt.current = Date.now();
  };

  if (isLoading) return <LoadingSpinner fill={false} />;
  if (flashcards.length === 0) {
    return <EmptyState title="No flashcards yet" description="Check back once flashcards are added to this topic." />;
  }

  if (finished) {
    return (
      <View style={styles.finishedWrap}>
        <Text style={[styles.finishedTitle, { color: colors.textPrimary }]}>Session complete</Text>
        <Text style={[styles.finishedSubtitle, { color: colors.textSecondary }]}>
          {known} known {'·'} {review} to review
        </Text>
        <Button onPress={restart}>Study again</Button>
      </View>
    );
  }

  const card = flashcards[index];
  const progressPct = (index / flashcards.length) * 100;

  return (
    <View style={styles.container}>
      <ProgressBar value={progressPct} />
      <Text style={[styles.counter, { color: colors.textTertiary }]}>{index + 1} / {flashcards.length}</Text>

      <Pressable onPress={() => { haptics.light(); setFlipped((f) => !f); }} style={[styles.card, { backgroundColor: colors.surfaceCard }, shadows.md]}>
        <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{flipped ? 'Answer' : 'Question'}</Text>
        <Text style={[styles.cardText, { color: colors.textPrimary }]}>{flipped ? card.answer : card.question}</Text>
        <View style={styles.flipHint}>
          <IconRotate size={14} color={colors.textTertiary} />
          <Text style={[styles.flipHintText, { color: colors.textTertiary }]}>Tap to flip</Text>
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
        <Button variant="secondary" onPress={() => advance(false)} icon={<IconX size={16} color={colors.danger} />} style={{ flex: 1 }}>
          Review again
        </Button>
        <Button variant="primary" onPress={() => advance(true)} icon={<IconCheck size={16} color={colors.brandOnPrimary} />} style={{ flex: 1 }}>
          I knew it
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.base },
  counter: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, alignSelf: 'center' },
  card: { borderRadius: radii.xl, padding: spacing.xl, minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  cardLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, textTransform: 'uppercase', letterSpacing: 0.6 },
  cardText: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansMedium, textAlign: 'center', lineHeight: fontSizes.lg * 1.4 },
  flipHint: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  flipHintText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  finishedWrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing['3xl'] },
  finishedTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold },
  finishedSubtitle: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans },
});
