import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { WikipediaAPI, ChatAPI, QuizAPI } from '../../lib/api';
import * as WebBrowser from 'expo-web-browser';

interface WikiSearchItem {
  id?: number;
  key?: string;
  title: string;
  excerpt?: string;
  description?: string;
  thumbnail?: { url?: string } | null;
}

interface WikiPageDetail {
  lang: string;
  title: string;
  description?: string;
  extract?: string;
  extract_html?: string;
  thumbnail?: { source?: string; url?: string } | null;
  originalimage?: { source?: string } | null;
  url: string;
  contentHtml: string;
  pageid?: number;
}

export default function WikipediaScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'en' | 'de' | 'fr' | 'es' | 'it' | 'pt'>('en');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WikiSearchItem[]>([]);

  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [detail, setDetail] = useState<WikiPageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [importing, setImporting] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const { data } = await WikipediaAPI.search(query.trim(), lang, 20);
      setResults(data?.results || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (title: string) => {
    try {
      setLoadingDetail(true);
      setSelectedTitle(title);
      const { data } = await WikipediaAPI.page(title, lang);
      setDetail(data as WikiPageDetail);
    } catch (err) {
      console.error(err);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const importPage = async (): Promise<{ _id: string } | null> => {
    if (!detail?.title) return null;
    try {
      setImporting(true);
      const { data } = await WikipediaAPI.import(detail.title, lang);
      return data;
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to import page.');
      return null;
    } finally {
      setImporting(false);
    }
  };

  const importAndChat = async () => {
    const site = await importPage();
    if (!site?._id) return;
    try {
      setCreatingChat(true);
      const { data } = await ChatAPI.create({ type: 'website', sourceId: site._id, title: `${detail?.title} - Chat` });
      const chatId = data?.chat?.id;
      if (chatId) {
        router.push(`/(tabs)/chat?open=${chatId}` as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingChat(false);
    }
  };

  const importAndCreateQuiz = async () => {
    const site = await importPage();
    if (!site?._id) return;
    try {
      setCreatingQuiz(true);
      await QuizAPI.create({
        title: `${detail?.title} Quiz`,
        description: detail?.description || undefined,
        sourceType: 'website',
        sourceId: site._id,
        settings: { numberOfQuestions: 10, difficulty: 'mixed', includeCalculations: false },
      });
      router.push('/(tabs)/quizzes' as any);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingQuiz(false);
    }
  };

  const heroImage = useMemo(() => {
    return (
      detail?.originalimage?.source ||
      (detail?.thumbnail as any)?.source ||
      (detail?.thumbnail as any)?.url ||
      undefined
    );
  }, [detail]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Wikipedia</Text>
      <Text style={styles.subtitle}>Search Wikipedia and act on the results with AI</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Search</Text>
        <View style={styles.row}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search Wikipedia (e.g., Quantum mechanics)"
            style={[styles.input, { flex: 1 }]}
          />
        </View>
        <View style={[styles.row, { marginTop: 8, flexWrap: 'wrap' }]}> 
          {(['en','de','fr','es','it','pt'] as const).map((l) => (
            <TouchableOpacity key={l} onPress={() => setLang(l)} style={[styles.chip, lang === l && styles.chipActive]}>
              <Text>{l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity disabled={!query.trim() || loading} onPress={doSearch} style={[styles.primaryBtn, { marginTop: 10 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Search</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, styles.flex1]}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Results</Text>
            <Text style={styles.counter}>{results.length}</Text>
          </View>
          {loading ? (
            <View style={styles.centerBox}><ActivityIndicator color="#4F46E5" /></View>
          ) : results.length === 0 ? (
            <Text style={styles.muted}>No results yet. Try a search above.</Text>
          ) : (
            <ScrollView style={{ maxHeight: 520 }}>
              {results.map((r, idx) => (
                <TouchableOpacity
                  key={(r.key || r.title || String(idx)) + idx}
                  style={[styles.resultItem, selectedTitle === r.title && { backgroundColor: '#EEF2FF' }]}
                  onPress={() => loadDetail(r.title)}
                >
                  {r.thumbnail?.url ? (
                    <Image source={{ uri: r.thumbnail.url }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: '#E5E7EB' }]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{r.title}</Text>
                    {r.description ? <Text style={styles.itemMeta} numberOfLines={1}>{r.description}</Text> : null}
                    {r.excerpt ? (
                      <Text style={styles.excerpt} numberOfLines={2}>{r.excerpt.replace(/<[^>]+>/g, '')}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={[styles.card, styles.flex2]}>
          {!detail ? (
            <View style={[styles.centerBox, { height: 256 }]}>
              <Text style={styles.muted}>Select an article to preview</Text>
            </View>
          ) : (
            <>
              {heroImage ? (
                <View style={{ width: '100%', height: 180, backgroundColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                  <Image source={{ uri: heroImage }} style={{ width: '100%', height: '100%' }} />
                </View>
              ) : null}

              <View style={{ marginTop: 12 }}>
                <Text style={styles.detailTitle}>{detail.title}</Text>
                {detail.description ? <Text style={styles.detailDesc}>{detail.description}</Text> : null}
                {loadingDetail ? (
                  <View style={[styles.centerBox, { height: 96 }]}><ActivityIndicator color="#4F46E5" /></View>
                ) : (
                  <>
                    {detail.extract ? (
                      <Text style={styles.detailExtract}>{detail.extract}</Text>
                    ) : null}
                  </>
                )}

                <View style={[styles.row, { flexWrap: 'wrap', marginTop: 10 }]}> 
                  <TouchableOpacity onPress={importPage} disabled={importing} style={styles.secondaryBtn}>
                    {importing ? <ActivityIndicator /> : <Text>Import to My Websites</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={importAndChat} disabled={importing || creatingChat} style={styles.secondaryBtn}>
                    {creatingChat ? <ActivityIndicator /> : <Text>Import & Start Chat</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={importAndCreateQuiz} disabled={importing || creatingQuiz} style={styles.secondaryBtn}>
                    {creatingQuiz ? <ActivityIndicator /> : <Text>Import & Create Quiz</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => detail?.url && WebBrowser.openBrowserAsync(detail.url)} style={styles.secondaryBtn}>
                    <Text>View on Wikipedia</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
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
  primaryBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  centerBox: { alignItems: 'center', justifyContent: 'center' },
  counter: { color: '#6B7280' },
  resultItem: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  excerpt: { color: '#374151', marginTop: 4 },
  thumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#F3F4F6' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  detailDesc: { color: '#6B7280', marginTop: 2 },
  detailExtract: { color: '#111827', marginTop: 8 },
  chip: { borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#fff' },
  chipActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  secondaryBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  muted: { color: '#6B7280' },
});
