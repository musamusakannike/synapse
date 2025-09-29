import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { QuizAPI, TopicAPI, DocumentAPI, WebsiteAPI } from '../../lib/api';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../../styles/theme';

type Quiz = {
  _id: string;
  title: string;
  description?: string;
  sourceType: 'topic' | 'document' | 'website';
  sourceId?: string;
  questions: { questionText: string; options: string[]; correctOption: number }[];
  settings?: { numberOfQuestions?: number; difficulty?: string; includeCalculations?: boolean };
};

type Simple = { _id: string; label: string };

export default function QuizzesScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState<'topic' | 'document' | 'website'>('topic');
  const [sourceId, setSourceId] = useState('');
  const [content, setContent] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [includeCalculations, setIncludeCalculations] = useState(false);

  const [topics, setTopics] = useState<Simple[]>([]);
  const [docs, setDocs] = useState<Simple[]>([]);
  const [sites, setSites] = useState<Simple[]>([]);

  const [takingId, setTakingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: q }, { data: t }, { data: d }, { data: w }] = await Promise.all([
        QuizAPI.list(),
        TopicAPI.list(),
        DocumentAPI.list(),
        WebsiteAPI.list(),
      ]);
      setQuizzes(q || []);
      setTopics((t || []).map((x: any) => ({ _id: x._id, label: x.title })));
      setDocs((d || []).map((x: any) => ({ _id: x._id, label: x.originalName })));
      setSites((w || []).map((x: any) => ({ _id: x._id, label: x.title || x.url })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    try {
      setCreating(true);
      const payload: any = { title: title.trim(), description: description.trim() || undefined, sourceType, settings: { numberOfQuestions, difficulty, includeCalculations } };
      if (content.trim()) payload.content = content.trim();
      if (sourceId) payload.sourceId = sourceId;
      await QuizAPI.create(payload);
      setTitle(''); setDescription(''); setContent(''); setSourceId(''); setNumberOfQuestions(10); setDifficulty('mixed'); setIncludeCalculations(false);
      await load();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const sourceOptions = useMemo(() => {
    if (sourceType === 'topic') return topics; if (sourceType === 'document') return docs; return sites;
  }, [sourceType, topics, docs, sites]);

  const currentQuiz = quizzes.find((x) => x._id === takingId) || null;

  const take = (id: string) => { setTakingId(id); setSelected({}); setResult(null); };

  const submit = async () => {
    if (!takingId) return;
    try {
      setSubmitting(true);
      const q = quizzes.find((x) => x._id === takingId);
      const answers = (q?.questions || []).map((_, idx) => ({ questionIndex: idx, selectedOption: typeof selected[idx] === 'number' ? selected[idx] : -1 }));
      const { data } = await QuizAPI.submitAttempt(takingId, answers);
      const attempt = data?.attempt; if (attempt) setResult({ score: attempt.score, total: attempt.totalQuestions });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.content}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Quizzes</Text>
        <Text style={commonStyles.subtitle}>Generate and take quizzes to test your knowledge</Text>
      </View>

      <View style={[commonStyles.card, { backgroundColor: screenThemes.quizzes.background }]}>
        <Text style={commonStyles.cardTitle}>Create Quiz</Text>
        <View style={styles.formContainer}>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Quiz title (required)" 
            style={[commonStyles.input, styles.input]} 
            placeholderTextColor={colors.text.tertiary}
          />
          <TextInput 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Optional description" 
            style={[commonStyles.input, styles.input]} 
            placeholderTextColor={colors.text.tertiary}
          />
          <View style={commonStyles.row}>
            <TextInput 
              value={String(numberOfQuestions)} 
              onChangeText={(v) => setNumberOfQuestions(parseInt(v || '10'))} 
              keyboardType="number-pad" 
              placeholder="# Questions" 
              style={[commonStyles.input, styles.input, { flex: 1 }]} 
              placeholderTextColor={colors.text.tertiary}
            />
            <TouchableOpacity 
              onPress={() => setDifficulty((d) => (d === 'mixed' ? 'easy' : d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : 'mixed'))} 
              style={[commonStyles.secondaryButton, styles.settingButton]}
            >
              <Text style={commonStyles.secondaryButtonText}>Difficulty: {difficulty}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIncludeCalculations((v) => !v)} 
              style={[commonStyles.secondaryButton, styles.settingButton]}
            >
              <Text style={commonStyles.secondaryButtonText}>Calc: {includeCalculations ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
          </View>
          <View style={commonStyles.row}>
            <TouchableOpacity onPress={() => setSourceType('topic')} style={[styles.chip, sourceType === 'topic' && styles.chipActive]}>
              <Text style={commonStyles.secondaryButtonText}>Topic</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSourceType('document')} style={[styles.chip, sourceType === 'document' && styles.chipActive]}>
              <Text style={commonStyles.secondaryButtonText}>Document</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSourceType('website')} style={[styles.chip, sourceType === 'website' && styles.chipActive]}>
              <Text style={commonStyles.secondaryButtonText}>Website</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
            {sourceOptions.map((o) => (
              <TouchableOpacity key={o._id} onPress={() => setSourceId(o._id)} style={[styles.pill, sourceId === o._id && styles.pillActive]}>
                <Text numberOfLines={1} style={{ maxWidth: 160 }}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput 
            value={content} 
            onChangeText={setContent} 
            placeholder="Optional custom content to generate from" 
            style={[commonStyles.input, styles.input]} 
            placeholderTextColor={colors.text.tertiary}
          />
          <TouchableOpacity 
            disabled={!title.trim() || creating} 
            onPress={create} 
            style={[
              commonStyles.primaryButton, 
              styles.createButton,
              (!title.trim() || creating) && styles.buttonDisabled
            ]}
          >
            {creating ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Create Quiz</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={commonStyles.card}>
        <View style={commonStyles.rowBetween}>
          <Text style={commonStyles.cardTitle}>Your Quizzes</Text>
          <TouchableOpacity onPress={load} style={styles.refreshButton}>
            <Text style={commonStyles.link}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={commonStyles.centerBox}>
            <ActivityIndicator color={screenThemes.quizzes.primary} size="large" />
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No quizzes yet</Text>
            <Text style={commonStyles.muted}>Create your first quiz above to get started</Text>
          </View>
        ) : (
          quizzes.map((q) => (
            <View key={q._id} style={[commonStyles.listItem, styles.quizItem]}>
              <View style={commonStyles.rowBetween}>
                <View style={styles.quizContent}>
                  <Text style={commonStyles.itemTitle} numberOfLines={1}>{q.title}</Text>
                  {q.description ? (
                    <Text style={commonStyles.itemMeta} numberOfLines={1}>{q.description}</Text>
                  ) : null}
                  <Text style={commonStyles.itemMeta}>
                    {q.questions?.length || 0} questions • Difficulty: {q.settings?.difficulty || 'mixed'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => take(q._id)} 
                  style={[commonStyles.secondaryButton, styles.takeButton]}
                >
                  <Text style={commonStyles.secondaryButtonText}>Take Quiz</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {currentQuiz && (
        <View style={commonStyles.card}>
          <Text style={commonStyles.cardTitle}>{currentQuiz.title}</Text>
          {currentQuiz.questions.map((qs, idx) => (
            <View key={idx} style={styles.question}>
              <Text style={styles.questionTitle}>Q{idx + 1}. {qs.questionText}</Text>
              {qs.options.map((opt, oi) => (
                <TouchableOpacity 
                  key={oi} 
                  style={[styles.option, selected[idx] === oi && styles.optionActive]} 
                  onPress={() => setSelected((p) => ({ ...p, [idx]: oi }))}
                >
                  <Text style={commonStyles.secondaryButtonText}>{opt}</Text>
                </TouchableOpacity>
              ))}
              {result && (
                <Text style={styles.resultText}>
                  {typeof selected[idx] === 'number' && selected[idx] === currentQuiz.questions[idx].correctOption ? (
                    <Text style={styles.correctAnswer}>Correct ✓</Text>
                  ) : (
                    <Text style={styles.incorrectAnswer}>Incorrect ✗</Text>
                  )}
                </Text>
              )}
            </View>
          ))}
          <TouchableOpacity 
            onPress={submit} 
            disabled={submitting} 
            style={[
              commonStyles.primaryButton, 
              styles.submitButton,
              submitting && styles.buttonDisabled
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Submit Answers</Text>
            )}
          </TouchableOpacity>
          {result && (
            <Text style={styles.resultSummary}>
              Result: {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[2],
  },
  
  formContainer: {
    gap: spacing[3],
  },
  
  input: {
    marginBottom: 0,
  },
  
  settingButton: {
    marginLeft: spacing[2],
  },
  
  createButton: {
    backgroundColor: screenThemes.quizzes.primary,
    marginTop: spacing[2],
  },
  
  refreshButton: {
    padding: spacing[1],
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  
  quizItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  
  quizContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  
  takeButton: {
    backgroundColor: screenThemes.quizzes.background,
    borderColor: screenThemes.quizzes.primary,
  },
  
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  
  chipActive: {
    borderColor: screenThemes.quizzes.primary,
    backgroundColor: screenThemes.quizzes.background,
  },
  
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  
  pillActive: {
    borderColor: screenThemes.quizzes.primary,
    backgroundColor: screenThemes.quizzes.background,
  },
  
  question: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingTop: spacing[3],
    marginTop: spacing[3],
  },
  
  questionTitle: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontSize: typography.fontSize.base,
  },
  
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    marginTop: spacing[2],
    backgroundColor: colors.background,
  },
  
  optionActive: {
    backgroundColor: screenThemes.quizzes.background,
    borderColor: screenThemes.quizzes.primary,
  },
  
  submitButton: {
    backgroundColor: screenThemes.quizzes.primary,
    marginTop: spacing[4],
  },
  
  resultText: {
    marginTop: spacing[2],
  },
  
  correctAnswer: {
    color: colors.success[600],
    fontWeight: typography.fontWeight.medium,
  },
  
  incorrectAnswer: {
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  
  resultSummary: {
    marginTop: spacing[3],
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
});
