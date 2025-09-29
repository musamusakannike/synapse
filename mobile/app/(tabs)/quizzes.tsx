import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { QuizAPI, TopicAPI, DocumentAPI, WebsiteAPI } from '../../lib/api';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Quizzes</Text>
      <Text style={styles.subtitle}>Generate and take quizzes to test your knowledge</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create</Text>
        <View style={{ gap: 8 }}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Quiz title (required)" style={styles.input} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Optional description" style={styles.input} />
          <View style={styles.row}>
            <TextInput value={String(numberOfQuestions)} onChangeText={(v) => setNumberOfQuestions(parseInt(v || '10'))} keyboardType="number-pad" placeholder="# Questions" style={[styles.input, { flex: 1 }]} />
            <TouchableOpacity onPress={() => setDifficulty((d) => (d === 'mixed' ? 'easy' : d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : 'mixed'))} style={styles.secondaryBtn}>
              <Text>Difficulty: {difficulty}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIncludeCalculations((v) => !v)} style={styles.secondaryBtn}>
              <Text>Calc: {includeCalculations ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setSourceType('topic')} style={[styles.chip, sourceType === 'topic' && styles.chipActive]}><Text>Topic</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setSourceType('document')} style={[styles.chip, sourceType === 'document' && styles.chipActive]}><Text>Document</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setSourceType('website')} style={[styles.chip, sourceType === 'website' && styles.chipActive]}><Text>Website</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {sourceOptions.map((o) => (
              <TouchableOpacity key={o._id} onPress={() => setSourceId(o._id)} style={[styles.pill, sourceId === o._id && styles.pillActive]}>
                <Text numberOfLines={1} style={{ maxWidth: 160 }}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput value={content} onChangeText={setContent} placeholder="Optional custom content to generate from" style={styles.input} />
          <TouchableOpacity disabled={!title.trim() || creating} onPress={create} style={styles.primaryBtn}>
            {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Create Quiz</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Your quizzes</Text>
          <TouchableOpacity onPress={load}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.centerBox}><ActivityIndicator color="#EA580C" /></View>
        ) : quizzes.length === 0 ? (
          <Text style={styles.muted}>No quizzes yet. Create one above.</Text>
        ) : (
          quizzes.map((q) => (
            <View key={q._id} style={styles.listItem}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{q.title}</Text>
                  {q.description ? <Text style={styles.itemMeta} numberOfLines={1}>{q.description}</Text> : null}
                  <Text style={styles.itemMeta}>{q.questions?.length || 0} questions • Difficulty: {q.settings?.difficulty || 'mixed'}</Text>
                </View>
                <TouchableOpacity onPress={() => take(q._id)} style={styles.secondaryBtn}><Text>Take</Text></TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {currentQuiz && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{currentQuiz.title}</Text>
          {currentQuiz.questions.map((qs, idx) => (
            <View key={idx} style={styles.question}>
              <Text style={styles.questionTitle}>Q{idx + 1}. {qs.questionText}</Text>
              {qs.options.map((opt, oi) => (
                <TouchableOpacity key={oi} style={[styles.option, selected[idx] === oi && styles.optionActive]} onPress={() => setSelected((p) => ({ ...p, [idx]: oi }))}>
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}
              {result && (
                <Text style={{ marginTop: 4 }}>
                  {typeof selected[idx] === 'number' && selected[idx] === currentQuiz.questions[idx].correctOption ? (
                    <Text style={{ color: '#15803D' }}>Correct ✓</Text>
                  ) : (
                    <Text style={{ color: '#B91C1C' }}>Incorrect ✗</Text>
                  )}
                </Text>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={submit} disabled={submitting} style={styles.primaryBtn}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Submit answers</Text>}
          </TouchableOpacity>
          {result && <Text style={{ marginTop: 8 }}>Result: {result.score}/{result.total}</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6B7280', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryBtn: { backgroundColor: '#EA580C', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '600' },
  link: { color: '#111827' },
  centerBox: { height: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#6B7280' },
  listItem: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 10 },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  question: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginTop: 10 },
  questionTitle: { fontWeight: '600', color: '#111827', marginBottom: 6 },
  option: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginTop: 6 },
  optionActive: { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
  chip: { borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#fff' },
  chipActive: { borderColor: '#EA580C', backgroundColor: '#FFF7ED' },
  pill: { borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#fff' },
  pillActive: { borderColor: '#EA580C', backgroundColor: '#FFF7ED' },
});
