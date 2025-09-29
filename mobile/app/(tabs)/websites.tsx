import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { WebsiteAPI } from '../../lib/api';
import { colors, commonStyles, spacing, borderRadius, shadows, typography, screenThemes } from '../../styles/theme';

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
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.content}>
      <View style={styles.header}>
        <Text style={commonStyles.title}>Websites</Text>
        <Text style={commonStyles.subtitle}>Summarize website content into study notes</Text>
      </View>

      <View style={[commonStyles.card, { backgroundColor: screenThemes.websites.background }]}>
        <Text style={commonStyles.cardTitle}>Add Website</Text>
        <View style={commonStyles.row}>
          <TextInput 
            value={url} 
            onChangeText={setUrl} 
            placeholder="Enter URL (https://...)" 
            style={[commonStyles.input, styles.input, { flex: 1 }]} 
            placeholderTextColor={colors.text.tertiary}
          />
          <TouchableOpacity 
            disabled={!url.trim() || creating} 
            onPress={create} 
            style={[
              commonStyles.primaryButton, 
              styles.addButton,
              (!url.trim() || creating) && styles.buttonDisabled
            ]}
          >
            {creating ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={commonStyles.card}>
        <View style={commonStyles.rowBetween}>
          <Text style={commonStyles.cardTitle}>Your Websites</Text>
          <TouchableOpacity onPress={load} style={styles.refreshButton}>
            <Text style={commonStyles.link}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={commonStyles.centerBox}>
            <ActivityIndicator color={screenThemes.websites.primary} size="large" />
          </View>
        ) : sites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No websites yet</Text>
            <Text style={commonStyles.muted}>Add your first website above to get started</Text>
          </View>
        ) : (
          sites.map((s) => (
            <View key={s._id} style={[commonStyles.listItem, styles.websiteItem]}>
              <View style={styles.websiteContent}>
                <Text style={commonStyles.itemTitle} numberOfLines={1}>{s.title || s.url}</Text>
                <Text style={commonStyles.itemMeta} numberOfLines={1}>{s.url}</Text>
                {s.summary ? (
                  <Text style={commonStyles.itemSummary} numberOfLines={3}>{s.summary}</Text>
                ) : null}
                {s.processingError ? (
                  <Text style={commonStyles.error}>{s.processingError}</Text>
                ) : null}
                {s.processingStatus ? (
                  <Text style={[commonStyles.badge, styles.statusBadge, styles[`status_${s.processingStatus}`]]}>
                    {s.processingStatus.toUpperCase()}
                  </Text>
                ) : null}
              </View>
              <View style={commonStyles.actionsRow}>
                <TouchableOpacity 
                  onPress={() => rescrape(s._id)} 
                  disabled={actionId === s._id} 
                  style={[commonStyles.secondaryButton, actionId === s._id && styles.buttonDisabled]}
                >
                  {actionId === s._id ? (
                    <ActivityIndicator size="small" color={colors.text.secondary} />
                  ) : (
                    <Text style={commonStyles.secondaryButtonText}>Rescrape</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => remove(s._id)} 
                  disabled={actionId === s._id} 
                  style={[commonStyles.secondaryButton, styles.deleteButton, actionId === s._id && styles.buttonDisabled]}
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
    marginRight: spacing[2],
  },
  
  addButton: {
    backgroundColor: screenThemes.websites.primary,
    paddingHorizontal: spacing[4],
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
  
  websiteItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  
  websiteContent: {
    flex: 1,
  },
  
  statusBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  status_pending: {
    color: colors.warning[700],
    backgroundColor: colors.warning[50],
  },
  
  status_processing: {
    color: colors.primary[700],
    backgroundColor: colors.primary[50],
  },
  
  status_completed: {
    color: colors.success[700],
    backgroundColor: colors.success[50],
  },
  
  status_failed: {
    color: colors.error[700],
    backgroundColor: colors.error[50],
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
