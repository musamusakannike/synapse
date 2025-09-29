import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentAPI } from '../../lib/api';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../../styles/theme';

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
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.content}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Documents</Text>
        <Text style={commonStyles.subtitle}>Upload and summarize your study materials</Text>
      </View>

      <View style={[commonStyles.card, { backgroundColor: screenThemes.documents.background }]}>
        <Text style={commonStyles.cardTitle}>Upload Document</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Optional: custom summary prompt"
          style={[commonStyles.input, styles.input]}
          placeholderTextColor={colors.text.tertiary}
        />
        <TouchableOpacity 
          onPress={pickAndUpload} 
          style={[commonStyles.primaryButton, styles.uploadButton, uploading && styles.buttonDisabled]} 
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Pick & Upload Document</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={commonStyles.card}>
        <View style={commonStyles.rowBetween}>
          <Text style={commonStyles.cardTitle}>Your Documents</Text>
          <TouchableOpacity onPress={load} style={styles.refreshButton}>
            <Text style={commonStyles.link}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={commonStyles.centerBox}>
            <ActivityIndicator color={screenThemes.documents.primary} size="large" />
          </View>
        ) : docs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No documents yet</Text>
            <Text style={commonStyles.muted}>Upload your first document above to get started</Text>
          </View>
        ) : (
          docs.map((d) => (
            <View key={d._id} style={[commonStyles.listItem, styles.documentItem]}>
              <View style={styles.documentContent}>
                <Text style={commonStyles.itemTitle} numberOfLines={1}>{d.originalName}</Text>
                <Text style={commonStyles.itemMeta}>
                  {d.mimeType} • {(d.size / 1024).toFixed(1)} KB
                  {d.processingStatus && (
                    <Text style={[styles.statusBadge, styles[`status_${d.processingStatus}`]]}>
                      {' • '}{d.processingStatus.toUpperCase()}
                    </Text>
                  )}
                </Text>
                {d.summary ? (
                  <Text style={commonStyles.itemSummary} numberOfLines={3}>{d.summary}</Text>
                ) : null}
                {d.processingError ? (
                  <Text style={commonStyles.error}>{d.processingError}</Text>
                ) : null}
              </View>
              <View style={commonStyles.actionsRow}>
                <TouchableOpacity 
                  onPress={() => reprocess(d._id)} 
                  disabled={actionId === d._id} 
                  style={[commonStyles.secondaryButton, actionId === d._id && styles.buttonDisabled]}
                >
                  {actionId === d._id ? (
                    <ActivityIndicator size="small" color={colors.text.secondary} />
                  ) : (
                    <Text style={commonStyles.secondaryButtonText}>Reprocess</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => remove(d._id)} 
                  disabled={actionId === d._id} 
                  style={[commonStyles.secondaryButton, styles.deleteButton, actionId === d._id && styles.buttonDisabled]}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
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
  header: {
    marginBottom: spacing[2],
  },
  
  input: {
    marginBottom: spacing[3],
  },
  
  uploadButton: {
    backgroundColor: screenThemes.documents.primary,
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
  
  documentItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  
  documentContent: {
    flex: 1,
  },
  
  statusBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  status_pending: {
    color: colors.warning[600],
  },
  
  status_processing: {
    color: colors.primary[600],
  },
  
  status_completed: {
    color: colors.success[600],
  },
  
  status_failed: {
    color: colors.error[600],
  },
  
  deleteButton: {
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
  },
  
  deleteButtonText: {
    color: colors.error[600],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
});
