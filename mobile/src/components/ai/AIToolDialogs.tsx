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
import { IconSparkles, IconX } from '@tabler/icons-react-native';
import { fontFamilies, fontSizes, radii, spacing } from '@/theme';

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

// UI-only stub: no real AI backend call, matches the web app's mocked-output
// behavior. Every AI-tool surface uses the violet brand color exclusively.
export default function AIToolDialog({ kind, onClose }: AIToolDialogProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setInput('');
    setLoading(false);
    setDone(false);
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const run = () => {
    setDone(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  if (!kind) return null;
  const copy = COPY[kind];

  return (
    <Modal visible={!!kind} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{copy.title}</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <IconX size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              <Text style={styles.helper}>{copy.helper}</Text>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={copy.placeholder}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={[styles.input, copy.multiline && styles.inputMultiline]}
                multiline={copy.multiline}
                numberOfLines={copy.multiline ? 5 : 1}
              />

              {done && <AIToolOutput kind={kind} />}
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
                <Text style={styles.generateLabel}>{loading ? copy.cta : 'Generate'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function AIToolOutput({ kind }: { kind: AIToolKind }) {
  if (kind === 'summarizer') {
    return (
      <View style={styles.outputBox}>
        <Text style={styles.outputTitle}>Summary</Text>
        <Text style={styles.outputText}>
          The passage explains the core idea in three points: definition, why it matters, and one practical
          example. Key terms are bolded in your original notes; review those first before attempting the
          flashcards for this topic.
        </Text>
      </View>
    );
  }
  if (kind === 'quiz') {
    return (
      <View style={styles.outputBox}>
        <Text style={styles.outputTitle}>1. What does a closure capture?</Text>
        <Text style={styles.outputText}>A. Only global variables   B. Its surrounding lexical scope   C. Nothing</Text>
        <Text style={styles.outputAnswer}>Correct answer: B</Text>
      </View>
    );
  }
  if (kind === 'flashcards') {
    return (
      <View style={{ gap: spacing.sm }}>
        <View style={styles.outputBox}>
          <Text style={styles.outputTitle}>Q: What is Newton&apos;s first law?</Text>
          <Text style={styles.outputText}>A: An object stays at rest or in motion unless acted on by a net force.</Text>
        </View>
        <View style={styles.outputBox}>
          <Text style={styles.outputTitle}>Q: What is Newton&apos;s second law?</Text>
          <Text style={styles.outputText}>A: Force equals mass times acceleration (F = ma).</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.outputBox}>
      <Text style={styles.outputTitle}>Answer</Text>
      <Text style={styles.outputText}>
        The mitochondria is the organelle responsible for producing most of a cell&apos;s ATP through cellular
        respiration — often called the "powerhouse of the cell."
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14,14,26,0.5)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#5B4FE8',
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.displaySemiBold,
    color: '#FFFFFF',
  },
  body: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
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
