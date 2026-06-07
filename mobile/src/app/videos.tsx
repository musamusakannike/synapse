import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Video, Play, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { EmptyState } from '@/components/EmptyState';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface VideoItem {
  _id: string;
  topic: string;
  title?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

function VideoCard({ item, index }: { item: VideoItem; index: number }) {
  const { c } = useTheme();
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
      <Pressable
        onPress={() => { haptics.medium(); }}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: pressed ? c.bgHover : c.bgSecondary, borderColor: c.borderSubtle },
        ]}
      >
        {/* Thumbnail */}
        <View style={[styles.thumb, { backgroundColor: c.bgTertiary }]}>
          <View style={[styles.playIcon, { backgroundColor: `${c.accent}cc` }]}>
            <Play size={20} color="#0C0C0E" strokeWidth={0} fill="#0C0C0E" />
          </View>
        </View>
        {/* Info */}
        <View style={styles.cardBody}>
          <Text
            style={[styles.cardTitle, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}
            numberOfLines={2}
          >
            {item.title || item.topic}
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
      </Pressable>
    </Animated.View>
  );
}

export default function VideosScreen() {
  const router = useRouter();
  const { c } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await api.get('/api/ai/video');
      return (res.data?.videos ?? []) as VideoItem[];
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
          Videos
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <FlashList
          data={data ?? []}
          keyExtractor={(item) => item._id}
          estimatedItemSize={100}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => <VideoCard item={item} index={index} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                icon={<Video size={24} color={c.accent} strokeWidth={1.5} />}
                title="No videos yet"
                message="Generate explanatory videos from the web dashboard at sabilearn.online."
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
  list: { padding: spacing.lg },
  skeletons: { padding: spacing.lg, gap: spacing.md },
  empty: { paddingTop: spacing['6xl'] },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumb: {
    width: 80,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  playIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: spacing.xs },
  cardTitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: { fontSize: fontSize['2xs'] },
});
