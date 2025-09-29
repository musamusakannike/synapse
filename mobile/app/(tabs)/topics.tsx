import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { TopicAPI } from '../../lib/api';

type Topic = { _id: string; title: string; description?: string; content?: string; generatedContent?: string };

export default function TopicsScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Topic>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await TopicAPI.list();
      setTopics(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    try {
      setCreating(true);
      await TopicAPI.create({ title: title.trim(), description: description.trim() || undefined, content: content.trim() || undefined });
      setTitle(''); setDescription(''); setContent('');
      await load();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const startEdit = (t: Topic) => { setEditId(t._id); setEdit({ title: t.title, description: t.description, content: t.content }); };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      setActionId(editId);
      await TopicAPI.update(editId, { title: edit.title, description: edit.description, content: edit.content });
      setEditId(null); setEdit({});
      await load();
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  const regenerate = async (id: string) => { try { setActionId(id); await TopicAPI.regenerate(id); await load(); } catch (e) { console.error(e); } finally { setActionId(null); } };

  const remove = async (id: string) => {
    Alert.alert('Confirm', 'Delete this topic?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { setActionId(id); await TopicAPI.delete(id); setTopics((p) => p.filter((t) => t._id !== id)); } finally { setActionId(null); } } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Topics</Text>
      <Text style={styles.subtitle}>Generate and manage study topics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create</Text>
        <View style={{ gap: 8 }}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Title (required)" style={styles.input} />
          <TextInput value={description} onChangeText={setDescription} placeholder="Optional description" style={styles.input} />
          <TextInput value={content} onChangeText={setContent} placeholder="Optional content (otherwise AI generates)" style={styles.input} />
          <TouchableOpacity disabled={!title.trim() || creating} onPress={create} style={styles.primaryBtn}>
            {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Create Topic</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Your topics</Text>
          <TouchableOpacity onPress={load}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.centerBox}><ActivityIndicator color="#7C3AED" /></View>
        ) : topics.length === 0 ? (
          <Text style={styles.muted}>No topics yet. Create one above.</Text>
        ) : (
          topics.map((t) => (
            <View key={t._id} style={styles.listItem}>
              {editId === t._id ? (
                <View style={{ gap: 6 }}>
                  <TextInput value={edit.title || ''} onChangeText={(v) => setEdit((p) => ({ ...p, title: v }))} style={styles.input} />
                  <TextInput value={edit.description || ''} onChangeText={(v) => setEdit((p) => ({ ...p, description: v }))} style={styles.input} placeholder="Description" />
                  <TextInput value={edit.content || ''} onChangeText={(v) => setEdit((p) => ({ ...p, content: v }))} style={[styles.input, { minHeight: 80 }]} placeholder="Content" multiline />
                </View>
              ) : (
                <View>
                  <Text style={styles.itemTitle}>{t.title}</Text>
                  {t.description ? <Text style={styles.itemMeta}>{t.description}</Text> : null}
                  <Text numberOfLines={4} style={styles.itemSummary}>{t.content || t.generatedContent}</Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                {editId === t._id ? (
                  <TouchableOpacity onPress={saveEdit} disabled={actionId === t._id} style={styles.secondaryBtn}>
                    {actionId === t._id ? <ActivityIndicator /> : <Text>Save</Text>}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => startEdit(t)} style={styles.secondaryBtn}><Text>Edit</Text></TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => regenerate(t._id)} disabled={actionId === t._id} style={styles.secondaryBtn}>
                  {actionId === t._id ? <ActivityIndicator /> : <Text>Regenerate</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(t._id)} disabled={actionId === t._id} style={[styles.secondaryBtn, { borderColor: '#fecaca' }]}>
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
  primaryBtn: { backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#fff', fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  centerBox: { height: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#6B7280' },
  listItem: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 10 },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  itemSummary: { color: '#374151', marginTop: 6 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  secondaryBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
});
