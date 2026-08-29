import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSparkles, IconX } from '@tabler/icons-react-native';
import { fontFamilies, fontSizes, radii, spacing } from '@/theme';
import { aiApi } from '@/lib/api';
import { AiFlashcard, AiQuizQuestion } from '@/lib/types';
import * as haptics from '@/lib/haptics';

export type AIToolKind = 'summarizer' | 'quiz' | 'flashcards' | 'qa';

interface AIToolDialogProps {
  kind: AIToolKind | null;
  onClose: () => void;
}

const COPY: Record<AIToolKind, { title: string; helper: string; placeholder: string; cta: string; multiline?: boolean }> = {
  summarizer: {
    title: 'Summarizer',
    helper: 'Paste a lecture note or block of text — get a short, plain summary.',
    placeholder: 'Paste your notes here…',
    cta: 'Summarizing…',
    multiline: true,
  },
  quiz: {
    title: 'Quiz generator',
    helper: 'Tell us the topic — get a short multiple-choice quiz to test yourself.',
    placeholder: 'e.g. JavaScript closures',
    cta: 'Generating…',
  },
  flashcards: {
    title: 'Flashcards generator',
    helper: 'Turn a topic into a starter set of flashcards.',
    placeholder: "e.g. Newton's laws of motion",
    cta: 'Building…',
  },
  qa: {
    title: 'Q&A AI',
    helper: 'Ask a study question and get a direct answer.',
    placeholder: 'e.g. What is the mitochondria?',
    cta: 'Thinking…',
  },
};

type ToolResult =
  | { kind: 'summarizer'; text: string }
  | { kind: 'qa'; text: string }
  | { kind: 'quiz'; questions: AiQuizQuestion[]; historyId: string | null }
  | { kind: 'flashcards'; cards: AiFlashcard[] };

function apiErrorMessage(err: unknown, fallback: string): string {
  const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
  return errorObj?.response?.data?.message || errorObj?.message || fallback;
}

function asStringResult(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function asQuizQuestions(value: unknown): AiQuizQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is AiQuizQuestion =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as AiQuizQuestion).question === 'string' &&
      Array.isArray((item as AiQuizQuestion).options)
  );
}

function asFlashcards(value: unknown): AiFlashcard[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is AiFlashcard =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as AiFlashcard).front === 'string' &&
      typeof (item as AiFlashcard).back === 'string'
  );
}

export default function AIToolDialog({ kind, onClose }: AIToolDialogProps) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);

  const reset = () => {
    setInput('');
    setLoading(false);
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const run = async () => {
    if (!kind || !input.trim() || loading) return;
    const prompt = input.trim();
    setError(null);
    setResult(null);
    setLoading(true);
    haptics.medium();

    try {
      if (kind === 'summarizer') {
        const res = await aiApi.summarize(prompt, false);
        if (!res.data?.success) throw new Error('Summary generation failed.');
        setResult({ kind: 'summarizer', text: asStringResult(res.data.data?.result) });
      } else if (kind === 'quiz') {
        const res = await aiApi.generateQuiz(prompt, 3, false);
        if (!res.data?.success) throw new Error('Quiz generation failed.');
        setResult({
          kind: 'quiz',
          questions: asQuizQuestions(res.data.data?.result),
          historyId: res.data.data?.historyId ?? null,
        });
      } else if (kind === 'flashcards') {
        const res = await aiApi.generateFlashcards(prompt, 5, false);
        if (!res.data?.success) throw new Error('Flashcard generation failed.');
        setResult({ kind: 'flashcards', cards: asFlashcards(res.data.data?.result) });
      } else {
        const res = await aiApi.qa(prompt, undefined, false);
        if (!res.data?.success) throw new Error('Q&A failed.');
        setResult({ kind: 'qa', text: asStringResult(res.data.data?.result) });
      }
      haptics.success();
    } catch (err) {
      setError(apiErrorMessage(err, 'Something went wrong. Check your connection and try again.'));
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  if (!kind) return null;
  const copy = COPY[kind];

  return (
    <Modal visible={!!kind} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} accessibilityLabel="Close dialog" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.base) + spacing.xs }]}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>{copy.title}</Text>
              <Pressable
                onPress={() => {
                  haptics.light();
                  handleClose();
                }}
                hitSlop={12}
                style={styles.closeBtn}
                accessibilityLabel="Close"
              >
                <IconX size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.helper}>{copy.helper}</Text>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={copy.placeholder}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={[styles.input, copy.multiline && styles.inputMultiline]}
                multiline={copy.multiline}
                numberOfLines={copy.multiline ? 5 : 1}
                editable={!loading}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {result?.kind === 'summarizer' && (
                <View style={styles.outputBox}>
                  <Text style={styles.outputTitle}>Summary</Text>
                  <Text style={styles.outputText}>{result.text || 'No summary returned.'}</Text>
                </View>
              )}

              {result?.kind === 'qa' && (
                <View style={styles.outputBox}>
                  <Text style={styles.outputTitle}>Answer</Text>
                  <Text style={styles.outputText}>{result.text || 'No answer returned.'}</Text>
                </View>
              )}

              {result?.kind === 'quiz' && (
                <View style={styles.outputBox}>
                  <Text style={styles.outputTitle}>
                    Generated {result.questions.length} question{result.questions.length === 1 ? '' : 's'}
                  </Text>
                  {result.questions[0] ? (
                    <View style={{ gap: spacing.xs }}>
                      <Text style={styles.outputText}>{result.questions[0].question}</Text>
                      {result.questions[0].options.map((option, index) => (
                        <Text key={`${option.text}-${index}`} style={option.isCorrect ? styles.outputAnswer : styles.outputText}>
                          {String.fromCharCode(65 + index)}. {option.text}
                          {option.isCorrect ? '  ✓' : ''}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.outputText}>Quiz generated. Open the quiz hub to take it.</Text>
                  )}
                  {result.historyId ? (
                    <Pressable
                      onPress={() => {
                        handleClose();
                        router.push(`/ai-quiz/${result.historyId}` as never);
                      }}
                      style={styles.secondaryCta}
                    >
                      <Text style={styles.secondaryCtaLabel}>Take full interactive quiz →</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={() => {
                      handleClose();
                      router.push('/ai-quiz' as never);
                    }}
                    style={styles.linkWrap}
                  >
                    <Text style={styles.linkLabel}>Go to Quiz Hub & History</Text>
                  </Pressable>
                </View>
              )}

              {result?.kind === 'flashcards' && (
                <View style={{ gap: spacing.sm }}>
                  {result.cards.length === 0 ? (
                    <View style={styles.outputBox}>
                      <Text style={styles.outputText}>No flashcards returned.</Text>
                    </View>
                  ) : (
                    result.cards.map((card, index) => (
                      <View key={`${card.front}-${index}`} style={styles.outputBox}>
                        <Text style={styles.outputTitle}>Q: {card.front}</Text>
                        <Text style={styles.outputText}>A: {card.back}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                onPress={run}
                disabled={loading || !input.trim()}
                style={[styles.generateButton, (loading || !input.trim()) && styles.generateButtonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <IconSparkles size={16} color="#FFFFFF" />
                )}
                <Text style={styles.generateLabel}>{loading ? copy.cta : kind === 'qa' ? 'Ask' : 'Generate'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14,14,26,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetWrap: {
    width: '100%',
    height: '82%',
    maxHeight: '92%',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#5B4FE8',
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.displaySemiBold,
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  scrollView: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.base,
  },
  helper: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans,
    color: 'rgba(255,255,255,0.8)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans,
    color: '#FFFFFF',
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansMedium,
    color: '#FBDDB0',
  },
  outputBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    padding: spacing.base,
    gap: spacing.xs,
  },
  outputTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sansSemiBold,
    color: '#FFFFFF',
  },
  outputText: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sans,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: fontSizes.sm * 1.5,
  },
  outputAnswer: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.sansMedium,
    color: '#FBDDB0',
  },
  secondaryCta: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  secondaryCtaLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansSemiBold,
    color: '#FFFFFF',
  },
  linkWrap: {
    marginTop: spacing.xs,
  },
  linkLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansSemiBold,
    color: 'rgba(255,255,255,0.85)',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateLabel: {
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.sansMedium,
    color: '#FFFFFF',
  },
});
