import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentAPI } from '../../lib/api';

interface Doc {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  summary?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
}

export default function DocumentsScreen() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await DocumentAPI.list();
      setDocs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pickAndUpload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: false });
      if ((res as any).canceled) return;
      const file = (res as any).assets?.[0] || (res as any);
      if (!file?.uri) return;
      setUploading(true);
      const form = new FormData();
      form.append('file', {
        uri: file.uri,
        name: file.name || 'upload',
        type: file.mimeType || 'application/octet-stream',
      } as any);
      if (prompt.trim()) form.append('prompt', prompt.trim());
      await DocumentAPI.upload(form);
      setPrompt('');
      await load();
      Alert.alert('Uploaded', 'Your document will be processed shortly.');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const reprocess = async (id: string) => {
    try {
      setActionId(id);
      await DocumentAPI.reprocess(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string) => {
    try {
      Alert.alert('Confirm', 'Delete this document?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          setActionId(id);
          await DocumentAPI.delete(id);
          setDocs((prev) => prev.filter((d) => d._id !== id));
          setActionId(null);
        }}
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Documents</Text>
      <Text style={styles.subtitle}>Upload and summarize your study materials</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Optional: custom summary prompt"
          style={styles.input}
        />
        <TouchableOpacity onPress={pickAndUpload} style={styles.primaryBtn} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Pick & Upload</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Your documents</Text>
          <TouchableOpacity onPress={load}><Text style={styles.link}>Refresh</Text></TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.centerBox}><ActivityIndicator color="#2563EB" /></View>
        ) : docs.length === 0 ? (
          <Text style={styles.muted}>No documents yet. Upload one above.</Text>
        ) : (
          docs.map((d) => (
            <View key={d._id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{d.originalName}</Text>
                <Text style={styles.itemMeta}>{d.mimeType} • {(d.size / 1024).toFixed(1)} KB</Text>
                {d.summary ? <Text style={styles.itemSummary} numberOfLines={3}>{d.summary}</Text> : null}
                {d.processingError ? <Text style={styles.error}>{d.processingError}</Text> : null}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => reprocess(d._id)} disabled={actionId === d._id} style={styles.secondaryBtn}>
                  {actionId === d._id ? <ActivityIndicator /> : <Text>Reprocess</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(d._id)} disabled={actionId === d._id} style={[styles.secondaryBtn, { borderColor: '#fecaca' }]}>
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  centerBox: { height: 80, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#6B7280' },
  listItem: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 12 },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemMeta: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  itemSummary: { color: '#374151', marginTop: 6 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  secondaryBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  error: { color: '#dc2626', marginTop: 6, fontSize: 12 },
});
