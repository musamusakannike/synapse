import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { DocumentAPI, ChatAPI, TopicAPI, QuizAPI, WebsiteAPI } from '../../lib/api';

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
    { title: 'Upload Document', subtitle: 'Add PDFs or text', route: '/(tabs)/documents', color: '#DBEAFE', text: '#1D4ED8' },
    { title: 'Start Chat', subtitle: 'AI study helper', route: '/(tabs)/chat', color: '#DCFCE7', text: '#16A34A' },
    { title: 'Create Topic', subtitle: 'Generate study notes', route: '/(tabs)/topics', color: '#EDE9FE', text: '#7C3AED' },
    { title: 'Take Quiz', subtitle: 'Test your knowledge', route: '/(tabs)/quizzes', color: '#FFEDD5', text: '#EA580C' },
    { title: 'Add Website', subtitle: 'Summarize a URL', route: '/(tabs)/websites', color: '#EEF2FF', text: '#4F46E5' },
    { title: 'Wikipedia', subtitle: 'Search & import', route: '/(tabs)/wikipedia', color: '#E0E7FF', text: '#4338CA' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.brand}>SYNAPSE</Text>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatCard title="Documents" value={stats.documents} color="#1D4ED8" bg="#EFF6FF" />
          <StatCard title="Chats" value={stats.chats} color="#16A34A" bg="#ECFDF5" />
          <StatCard title="Topics" value={stats.topics} color="#7C3AED" bg="#F5F3FF" />
          <StatCard title="Quizzes" value={stats.quizzes} color="#EA580C" bg="#FFF7ED" />
          <StatCard title="Websites" value={stats.websites} color="#4F46E5" bg="#EEF2FF" />
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.title} style={[styles.actionCard, { backgroundColor: a.color }]} onPress={() => router.push(a.route as any)}>
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
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  brand: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  centerBox: { height: 160, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  statCard: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  statLabel: { color: '#6B7280', fontSize: 12 },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  actionTitle: { fontWeight: '700', fontSize: 16 },
  actionSubtitle: { color: '#6B7280', marginTop: 6 },
});
