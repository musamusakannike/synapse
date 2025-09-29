import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { TopicAPI } from '../../lib/api';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../../styles/theme';

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
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.content}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Topics</Text>
        <Text style={commonStyles.subtitle}>Generate and manage study topics</Text>
      </View>

      <View style={[commonStyles.card, { backgroundColor: screenThemes.topics.background }]}>
        <Text style={commonStyles.cardTitle}>Create New Topic</Text>
        <View style={styles.formContainer}>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Topic title (required)" 
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
          <TextInput 
            value={content} 
            onChangeText={setContent} 
            placeholder="Optional content (otherwise AI generates)" 
            style={[commonStyles.input, styles.input, styles.textArea]} 
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={3}
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
              <Text style={commonStyles.primaryButtonText}>Create Topic</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={commonStyles.card}>
        <View style={commonStyles.rowBetween}>
          <Text style={commonStyles.cardTitle}>Your Topics</Text>
          <TouchableOpacity onPress={load} style={styles.refreshButton}>
            <Text style={commonStyles.link}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={commonStyles.centerBox}>
            <ActivityIndicator color={screenThemes.topics.primary} size="large" />
          </View>
        ) : topics.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No topics yet</Text>
            <Text style={commonStyles.muted}>Create your first topic above to get started</Text>
          </View>
        ) : (
          topics.map((t) => (
            <View key={t._id} style={[commonStyles.listItem, styles.topicItem]}>
              {editId === t._id ? (
                <View style={styles.editForm}>
                  <TextInput 
                    value={edit.title || ''} 
                    onChangeText={(v) => setEdit((p) => ({ ...p, title: v }))} 
                    style={[commonStyles.input, styles.editInput]} 
                    placeholder="Title"
                    placeholderTextColor={colors.text.tertiary}
                  />
                  <TextInput 
                    value={edit.description || ''} 
                    onChangeText={(v) => setEdit((p) => ({ ...p, description: v }))} 
                    style={[commonStyles.input, styles.editInput]} 
                    placeholder="Description"
                    placeholderTextColor={colors.text.tertiary}
                  />
                  <TextInput 
                    value={edit.content || ''} 
                    onChangeText={(v) => setEdit((p) => ({ ...p, content: v }))} 
                    style={[commonStyles.input, styles.editInput, styles.editTextArea]} 
                    placeholder="Content" 
                    placeholderTextColor={colors.text.tertiary}
                    multiline 
                    numberOfLines={4}
                  />
                </View>
              ) : (
                <View style={styles.topicContent}>
                  <Text style={commonStyles.itemTitle}>{t.title}</Text>
                  {t.description ? (
                    <Text style={commonStyles.itemMeta}>{t.description}</Text>
                  ) : null}
                  <Text numberOfLines={4} style={commonStyles.itemSummary}>
                    {t.content || t.generatedContent}
                  </Text>
                </View>
              )}

              <View style={commonStyles.actionsRow}>
                {editId === t._id ? (
                  <TouchableOpacity 
                    onPress={saveEdit} 
                    disabled={actionId === t._id} 
                    style={[commonStyles.secondaryButton, actionId === t._id && styles.buttonDisabled]}
                  >
                    {actionId === t._id ? (
                      <ActivityIndicator size="small" color={colors.text.secondary} />
                    ) : (
                      <Text style={commonStyles.secondaryButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => startEdit(t)} style={commonStyles.secondaryButton}>
                    <Text style={commonStyles.secondaryButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  onPress={() => regenerate(t._id)} 
                  disabled={actionId === t._id} 
                  style={[commonStyles.secondaryButton, actionId === t._id && styles.buttonDisabled]}
                >
                  {actionId === t._id ? (
                    <ActivityIndicator size="small" color={colors.text.secondary} />
                  ) : (
                    <Text style={commonStyles.secondaryButtonText}>Regenerate</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => remove(t._id)} 
                  disabled={actionId === t._id} 
                  style={[commonStyles.secondaryButton, styles.deleteButton, actionId === t._id && styles.buttonDisabled]}
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
  
  formContainer: {
    gap: spacing[3],
  },
  
  input: {
    marginBottom: 0,
  },
  
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  createButton: {
    backgroundColor: screenThemes.topics.primary,
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
  
  topicItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  
  topicContent: {
    flex: 1,
  },
  
  editForm: {
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  
  editInput: {
    marginBottom: 0,
  },
  
  editTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
