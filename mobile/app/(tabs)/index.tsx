import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { DocumentAPI, ChatAPI, TopicAPI, QuizAPI, WebsiteAPI } from '../../lib/api';
import { colors, commonStyles, spacing, borderRadius, shadows, typography } from '../../styles/theme';

export default function OverviewScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ documents: 0, chats: 0, topics: 0, quizzes: 0, websites: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [documentsRes, chatsRes, topicsRes, quizzesRes, websitesRes] = await Promise.all([
          DocumentAPI.list(),
          ChatAPI.list(),
          TopicAPI.list(),
          QuizAPI.list(),
          WebsiteAPI.list(),
        ]);
        setStats({
          documents: documentsRes.data?.length || 0,
          chats: (chatsRes.data?.chats?.length as number) || 0,
          topics: topicsRes.data?.length || 0,
          quizzes: quizzesRes.data?.length || 0,
          websites: websitesRes.data?.length || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { title: 'Upload Document', subtitle: 'Add PDFs or text', route: '/(tabs)/documents', color: colors.primary[50], text: colors.primary[700], icon: '📄' },
    { title: 'Start Chat', subtitle: 'AI study helper', route: '/(tabs)/chat', color: colors.success[50], text: colors.success[700], icon: '💬' },
    { title: 'Create Topic', subtitle: 'Generate study notes', route: '/(tabs)/topics', color: colors.secondary[50], text: colors.secondary[700], icon: '📚' },
    { title: 'Take Quiz', subtitle: 'Test your knowledge', route: '/(tabs)/quizzes', color: colors.warning[50], text: colors.warning[700], icon: '🧠' },
    { title: 'Add Website', subtitle: 'Summarize a URL', route: '/(tabs)/websites', color: '#EEF2FF', text: '#4F46E5', icon: '🌐' },
    { title: 'Wikipedia', subtitle: 'Search & import', route: '/(tabs)/wikipedia', color: '#E0E7FF', text: '#4338CA', icon: '📖' },
  ];

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.content}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.brandText}>SYNAPSE</Text>
        </View>
        <Text style={styles.tagline}>Your AI-powered study companion</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      ) : (
        <View style={styles.statsSection}>
          <Text style={commonStyles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Documents" value={stats.documents} color={colors.primary[700]} bg={colors.primary[50]} />
            <StatCard title="Chats" value={stats.chats} color={colors.success[700]} bg={colors.success[50]} />
            <StatCard title="Topics" value={stats.topics} color={colors.secondary[700]} bg={colors.secondary[50]} />
            <StatCard title="Quizzes" value={stats.quizzes} color={colors.warning[700]} bg={colors.warning[50]} />
            <StatCard title="Websites" value={stats.websites} color="#4F46E5" bg="#EEF2FF" />
          </View>
        </View>
      )}

      <View style={styles.actionsSection}>
        <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity 
              key={a.title} 
              style={[styles.actionCard, { backgroundColor: a.color }]} 
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={[styles.actionTitle, { color: a.text }]}>{a.title}</Text>
              <Text style={styles.actionSubtitle}>{a.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, color, bg }: { title: string; value: number; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}> 
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[6],
  },
  
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  
  welcomeText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  
  brandText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    letterSpacing: 1,
  },
  
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  
  statsSection: {
    marginBottom: spacing[6],
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  
  statCard: {
    width: '48%',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  actionsSection: {
    marginBottom: spacing[4],
  },
  
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  
  actionCard: {
    width: '48%',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  
  actionIcon: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing[2],
  },
  
  actionTitle: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  
  actionSubtitle: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});
