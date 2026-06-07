import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  History,
  Search,
  Pin,
  Trash2,
  Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface QA {
  _id: string;
  question: string;
  answer: string;
  pinned?: boolean;
  createdAt: string;
}

function QACard({ item, index }: { item: QA; index: number }) {
  const { c } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: (pinned: boolean) =>
      api.patch('/api/ai/history', { questionId: item._id, pinned }),
    onSuccess: (_, pinned) => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success(pinned ? 'Pinned' : 'Unpinned');
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/ai/history?id=${item._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success('Deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete this entry?',
      'This will permanently remove the question and its answer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => { haptics.heavy(); deleteMutation.mutate(); },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
      <View style={[styles.card, { backgroundColor: c.bgSecondary, borderColor: item.pinned ? `${c.accent}44` : c.borderSubtle }]}>
        <View style={styles.cardTop}>
          <Text
            style={[styles.cardQ, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}
            numberOfLines={2}
          >
            {item.question}
          </Text>
          <View style={styles.cardActions}>
            <Pressable
              onPress={() => { haptics.light(); pinMutation.mutate(!item.pinned); }}
              hitSlop={8}
            >
              <Pin
                size={16}
                color={item.pinned ? c.accent : c.textMuted}
                strokeWidth={2}
                fill={item.pinned ? c.accent : 'none'}
              />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Trash2 size={16} color={c.danger} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>
        <Text
          style={[styles.cardA, { color: c.textMuted, fontFamily: typography.body.regular }]}
          numberOfLines={3}
        >
          {item.answer}
        </Text>
        <View style={styles.cardMeta}>
          <Clock size={11} color={c.textMuted} strokeWidth={1.5} />
          <Text style={[styles.metaText, { color: c.textMuted, fontFamily: typography.body.regular }]}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const [search, setSearch] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['history', pinnedOnly],
    queryFn: async () => {
      const url = pinnedOnly ? '/api/ai/history?pinned=true' : '/api/ai/history';
      const res = await api.get(url);
      return (res.data?.questions ?? []) as QA[];
    },
  });

  const filtered = (data ?? []).filter(
    (q) =>
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
          History
        </Text>
        <Pressable
          onPress={() => setPinnedOnly((v) => !v)}
          style={[
            styles.filterBtn,
            { backgroundColor: pinnedOnly ? c.accentMuted : c.bgSecondary, borderColor: pinnedOnly ? c.accent : c.border },
          ]}
        >
          <Pin size={14} color={pinnedOnly ? c.accent : c.textMuted} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: c.bgSecondary, borderColor: c.border }]}>
        <Search size={16} color={c.textMuted} strokeWidth={1.5} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions..."
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.textPrimary, fontFamily: typography.body.regular }]}
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <LegendList
          data={filtered}
          keyExtractor={(item: QA) => item._id}
          estimatedItemSize={120}
          recycleItems
          contentInset={{ top: spacing.sm, bottom: spacing.lg }}
          renderItem={({ item, index }: LegendListRenderItemProps<QA>) => <QACard item={item} index={index} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                icon={<History size={24} color={c.accent} strokeWidth={1.5} />}
                title="No history yet"
                message="Your AI questions and answers will appear here."
              />
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    paddingVertical: 0,
  },
  list: { padding: spacing.lg, paddingTop: spacing.sm },
  skeletons: { padding: spacing.lg, gap: spacing.md },
  empty: { paddingTop: spacing['6xl'] },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardQ: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    flexShrink: 0,
  },
  cardA: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  metaText: { fontSize: fontSize['2xs'] },
});
