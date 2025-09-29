import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { WebsiteAPI } from '../../lib/api';

type Site = { _id: string; url: string; title?: string; summary?: string; processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'; processingError?: string };

export default function WebsitesScreen() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try { setLoading(true); const { data } = await WebsiteAPI.list(); setSites(data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!url.trim()) return;
    try { setCreating(true); await WebsiteAPI.create(url.trim()); setUrl(''); await load(); } catch (e) { console.error(e); } finally { setCreating(false); }
  };

  const rescrape = async (id: string) => { try { setActionId(id); await WebsiteAPI.rescrape(id); await load(); } catch (e) { console.error(e); } finally { setActionId(null); } };

  const remove = async (id: string) => {
    Alert.alert('Confirm', 'Delete this website?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { setActionId(id); await WebsiteAPI.delete(id); setSites((p) => p.filter((s) => s._id !== id)); } finally { setActionId(null); } } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Websites</Text>
      <Text style={styles.subtitle}>Summarize website content into study notes</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add</Text>
        <View style={styles.row}>
          <TextInput value={url} onChangeText={setUrl} placeholder="Enter URL (https://...)" style={[styles.input, { flex: 1 }]} />
          <TouchableOpacity disabled={!url.trim() || creating} onPress={create} style={styles.primaryBtn}>
            {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Add</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Your websites</Text>
          <TouchableOpacity onPress={load}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.centerBox}><ActivityIndicator color="#4F46E5" /></View>
        ) : sites.length === 0 ? (
          <Text style={styles.muted}>No websites yet. Add one above.</Text>
        ) : (
          sites.map((s) => (
            <View key={s._id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{s.title || s.url}</Text>
                <Text style={styles.itemMeta} numberOfLines={1}>{s.url}</Text>
                {s.summary ? <Text style={styles.itemSummary} numberOfLines={3}>{s.summary}</Text> : null}
                {s.processingError ? <Text style={styles.error}>{s.processingError}</Text> : null}
                {s.processingStatus ? (
                  <Text style={styles.badge}>{s.processingStatus}</Text>
                ) : null}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => rescrape(s._id)} disabled={actionId === s._id} style={styles.secondaryBtn}>
                  {actionId === s._id ? <ActivityIndicator /> : <Text>Rescrape</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(s._id)} disabled={actionId === s._id} style={[styles.secondaryBtn, { borderColor: '#fecaca' }]}>
                  <Text style={{ color: '#b91c1c' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryBtn: { backgroundColor: '#4F46E5', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  link: { color: '#111827' },
  centerBox: { height: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#6B7280' },
  listItem: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 10 },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  itemSummary: { color: '#374151', marginTop: 6 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  secondaryBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  badge: { marginTop: 6, fontSize: 12, color: '#4338CA', backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  error: { color: '#dc2626', marginTop: 6, fontSize: 12 },
});
