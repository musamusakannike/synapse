import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconArrowLeft,
  IconBrain,
  IconSparkles,
  IconPlayerPlay,
  IconTrash,
  IconRefresh,
  IconHelpCircle,
  IconCalendar,
} from '@tabler/icons-react-native';
import { aiApi } from '@/lib/api';
import { AiHistoryItem } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OfflineBanner from '@/components/common/OfflineBanner';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function MobileAIQuizHubScreen() {
  const { colors } = useTheme();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<AiHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const s = makeStyles(colors);

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await aiApi.history({ type: 'quiz', limit: 20 });
      if (res.data?.success) {
        setHistoryItems(res.data.data || []);
      }
    } catch {
      // silently handle network error
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchHistory();
    })();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.light();
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    haptics.medium();

    try {
      setGenerating(true);
      setError(null);
      const res = await aiApi.generateQuiz(topic.trim(), count, false);

      if (res.data?.success && res.data?.data?.historyId) {
        const historyId = res.data.data.historyId;
        setTopic('');
        router.push(`/ai-quiz/${historyId}` as any);
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error generating quiz. Check internet connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteHistory = (id: string) => {
    haptics.medium();
    Alert.alert('Delete Quiz', 'Are you sure you want to delete this quiz history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await aiApi.deleteHistory(id);
            setHistoryItems((prev) => prev.filter((item) => item._id !== id));
            haptics.success();
          } catch {
            Alert.alert('Error', 'Failed to delete quiz item.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <OfflineBanner />

      {/* Header */}
      <View style={s.topBar}>
        <Pressable
          onPress={() => {
            haptics.light();
            router.back();
          }}
          style={s.backBtn}
        >
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.pageTitle}>AI Quiz Hub</Text>
          <Text style={s.pageSubtitle}>Generate & practice custom quizzes</Text>
        </View>
        <Pressable onPress={onRefresh} style={s.refreshBtn}>
          <IconRefresh size={18} color={colors.brandPrimaryHover} />
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B4FE8" />}
      >
        {/* Generator Card */}
        <View style={s.generatorCard}>
          <View style={s.generatorHeader}>
            <View style={s.brainIconWrap}>
              <IconBrain size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.generatorTitle}>Create New Quiz</Text>
              <Text style={s.generatorSub}>Enter any subject or study topic</Text>
            </View>
          </View>

          {error && <Text style={s.errorText}>{error}</Text>}

          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Organic Chemistry..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={s.topicInput}
            editable={!generating}
          />

          <View style={s.countRow}>
            <Text style={s.countLabel}>Questions:</Text>
            <View style={s.pillsRow}>
              {[3, 5, 10].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => {
                    haptics.selection();
                    setCount(num);
                  }}
                  disabled={generating}
                  style={[s.countPill, count === num && s.countPillActive]}
                >
                  <Text style={[s.countPillText, count === num && s.countPillTextActive]}>{num}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={handleGenerate}
            disabled={generating || !topic.trim()}
            style={[s.generateBtn, (generating || !topic.trim()) && s.generateBtnDisabled]}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSparkles size={18} color="#FFFFFF" />
            )}
            <Text style={s.generateBtnLabel}>{generating ? 'Generating Quiz...' : 'Generate Quiz'}</Text>
          </Pressable>
        </View>

        {/* Quiz History Section */}
        <View style={s.historySection}>
          <View style={s.historyHeaderRow}>
            <Text style={s.historySectionTitle}>Quiz History</Text>
            <Badge>{historyItems.length}</Badge>
          </View>

          {loadingHistory && !refreshing ? (
            <LoadingSpinner />
          ) : historyItems.length === 0 ? (
            <EmptyState
              icon={<IconBrain size={40} color={colors.textTertiary} />}
              title="No Quizzes Yet"
              description="Enter a topic above to generate your first multiple-choice quiz."
            />
          ) : (
            <View style={s.historyList}>
              {historyItems.map((item) => {
                const questionCount = Array.isArray(item.result) ? item.result.length : (item.metadata?.count || 0);
                const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <Card
                    key={item._id}
                    onPress={() => {
                      haptics.light();
                      router.push(`/ai-quiz/${item._id}` as any);
                    }}
                  >
                    <View style={s.cardTopRow}>
                      <View style={s.topicBadge}>
                        <Text style={s.topicBadgeText} numberOfLines={1}>
                          {item.prompt || 'Topic'}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteHistory(item._id)}
                        hitSlop={10}
                        style={s.trashBtn}
                      >
                        <IconTrash size={16} color={colors.danger} />
                      </Pressable>
                    </View>

                    <Text style={s.quizTitle} numberOfLines={2}>
                      {item.title || `Quiz: ${item.prompt}`}
                    </Text>

                    <View style={s.metaRow}>
                      <View style={s.metaItem}>
                        <IconHelpCircle size={14} color={colors.textTertiary} />
                        <Text style={s.metaText}>{questionCount} Questions</Text>
                      </View>
                      <View style={s.metaItem}>
                        <IconCalendar size={14} color={colors.textTertiary} />
                        <Text style={s.metaText}>{formattedDate}</Text>
                      </View>
                    </View>

                    <View style={s.cardBottom}>
                      <Text style={s.takeQuizLabel}>Take / Review Quiz</Text>
                      <IconPlayerPlay size={14} color={colors.brandPrimaryHover} />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bgApp },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: radii.full,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    refreshBtn: {
      width: 36,
      height: 36,
      borderRadius: radii.full,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    pageTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.displaySemiBold, color: c.textPrimary },
    pageSubtitle: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, color: c.textSecondary },
    scroll: { flex: 1 },
    content: { padding: spacing.xl, gap: spacing['2xl'] },
    generatorCard: {
      backgroundColor: '#5B4FE8',
      borderRadius: radii['2xl'],
      padding: spacing.xl,
      gap: spacing.md,
    },
    generatorHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    brainIconWrap: {
      width: 42,
      height: 42,
      borderRadius: radii.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    generatorTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, color: '#FFFFFF' },
    generatorSub: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, color: 'rgba(255,255,255,0.8)' },
    topicInput: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      borderRadius: radii.md,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.sm,
      fontFamily: fontFamilies.sans,
      color: '#FFFFFF',
    },
    errorText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: '#FBDDB0' },
    countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    countLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: 'rgba(255,255,255,0.9)' },
    pillsRow: { flexDirection: 'row', gap: spacing.xs },
    countPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radii.full,
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    countPillActive: { backgroundColor: '#FFFFFF' },
    countPillText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: '#FFFFFF' },
    countPillTextActive: { color: '#5B4FE8' },
    generateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      marginTop: spacing.xs,
    },
    generateBtnDisabled: { opacity: 0.5 },
    generateBtnLabel: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansSemiBold, color: '#FFFFFF' },
    historySection: { gap: spacing.md },
    historyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    historySectionTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary },
    historyList: { gap: spacing.md },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
    topicBadge: {
      backgroundColor: 'rgba(91,79,232,0.12)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: radii.full,
      maxWidth: '80%',
    },
    topicBadgeText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: '#5B4FE8' },
    trashBtn: { padding: spacing.xs },
    quizTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary, marginBottom: spacing.sm },
    metaRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    metaText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, color: c.textSecondary },
    cardBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: c.borderSubtle,
      paddingTop: spacing.sm,
    },
    takeQuizLabel: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansSemiBold, color: c.brandPrimaryHover },
  });
}
