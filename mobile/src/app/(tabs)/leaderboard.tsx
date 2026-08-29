import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconTrophy, IconFlame, IconBolt } from '@tabler/icons-react-native';
import { leaderboardApi } from '@/lib/api';
import { LeaderboardUser } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { useTheme, fontFamilies, fontSizes, radii, spacing, shadows } from '@/theme';
import { ACCENT, PAGE } from '@/theme/brand';
import ScreenBackdrop from '@/components/common/ScreenBackdrop';
import ScreenHeader from '@/components/common/ScreenHeader';
import * as haptics from '@/lib/haptics';

type Timeframe = '24h' | '3d' | '1w' | '1m';

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '24h': 'Past 24 Hours',
  '3d': 'Past 3 Days',
  '1w': 'Past 1 Week',
  '1m': 'Past 1 Month',
};

const TIMEFRAME_SHORT: Record<Timeframe, string> = {
  '24h': '24h',
  '3d': '3 Days',
  '1w': '1 Week',
  '1m': '1 Month',
};

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (tf: Timeframe) => {
    try {
      const res = await leaderboardApi.get(tf);
      if (res.data?.success) {
        setLeaderboard(res.data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(timeframe);
  }, [timeframe, fetchData]);

  const onRefresh = useCallback(() => {
    haptics.light();
    setRefreshing(true);
    fetchData(timeframe);
  }, [timeframe, fetchData]);

  const s = makeStyles(colors);
  const topThree = leaderboard.slice(0, 3);

  return (
    <View collapsable={false} style={s.container}>
      <ScreenBackdrop />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 8 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} colors={[ACCENT]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ScreenHeader title="Leaderboard" subtitle="See top learners earning XP." />
        </View>

        {/* Timeframe Tabs */}
        <View style={s.tabRow}>
          {(['24h', '3d', '1w', '1m'] as Timeframe[]).map((tf) => (
            <Pressable
              key={tf}
              onPress={() => { haptics.selection(); setTimeframe(tf); }}
              style={[s.tab, timeframe === tf && s.tabActive]}
            >
              <Text style={[s.tabText, timeframe === tf && s.tabTextActive]}>
                {TIMEFRAME_SHORT[tf]}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : leaderboard.length === 0 ? (
          <EmptyState
            icon={<IconTrophy size={44} color={colors.textTertiary} />}
            title="No XP Earned Yet"
            description={`Be the first to complete a lesson in the ${TIMEFRAME_LABELS[timeframe].toLowerCase()}!`}
          />
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <View style={s.podiumRow}>
                {/* 2nd Place */}
                {topThree[1] && (
                  <View style={[s.podiumCard, s.podiumSide]}>
                    <View style={[s.rankBadge, { backgroundColor: '#CBD5E1' }]}>
                      <Text style={[s.rankText, { color: '#475569' }]}>2</Text>
                    </View>
                    <View style={[s.avatarCircle, s.avatarSide, { borderColor: '#94A3B8' }]}>
                      {topThree[1].avatar ? (
                        <Image source={{ uri: topThree[1].avatar }} style={s.avatarImage} />
                      ) : (
                        <Text style={s.avatarInitial}>{topThree[1].name.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <Text style={s.podiumName} numberOfLines={1}>{topThree[1].name}</Text>
                    <View style={s.xpRow}>
                      <IconBolt size={14} color="#F59E0B" />
                      <Text style={s.xpText}>{topThree[1].periodXp.toLocaleString()} XP</Text>
                    </View>
                  </View>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <View style={[s.podiumCard, s.podiumCenter]}>
                    <View style={[s.rankBadge, s.rankBadgeGold]}>
                      <Text style={[s.rankText, { color: '#1C1917', fontWeight: '800' }]}>1</Text>
                    </View>
                    <View style={[s.avatarCircle, s.avatarCenter, { borderColor: '#FBBF24' }]}>
                      {topThree[0].avatar ? (
                        <Image source={{ uri: topThree[0].avatar }} style={s.avatarImage} />
                      ) : (
                        <Text style={[s.avatarInitial, { fontSize: 22 }]}>{topThree[0].name.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <View style={s.championBadge}>
                      <Text style={s.championText}>Top Champion</Text>
                    </View>
                    <Text style={[s.podiumName, { fontSize: fontSizes.base, fontFamily: fontFamilies.displaySemiBold }]} numberOfLines={1}>
                      {topThree[0].name}
                    </Text>
                    <View style={s.xpRow}>
                      <IconBolt size={16} color="#F59E0B" />
                      <Text style={[s.xpText, { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansSemiBold, color: '#D97706' }]}>
                        {topThree[0].periodXp.toLocaleString()} XP
                      </Text>
                    </View>
                  </View>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <View style={[s.podiumCard, s.podiumSide]}>
                    <View style={[s.rankBadge, { backgroundColor: '#92400E' }]}>
                      <Text style={[s.rankText, { color: '#FEF3C7' }]}>3</Text>
                    </View>
                    <View style={[s.avatarCircle, s.avatarSide, { borderColor: '#B45309' }]}>
                      {topThree[2].avatar ? (
                        <Image source={{ uri: topThree[2].avatar }} style={s.avatarImage} />
                      ) : (
                        <Text style={s.avatarInitial}>{topThree[2].name.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <Text style={s.podiumName} numberOfLines={1}>{topThree[2].name}</Text>
                    <View style={s.xpRow}>
                      <IconBolt size={14} color="#F59E0B" />
                      <Text style={s.xpText}>{topThree[2].periodXp.toLocaleString()} XP</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Full List */}
            <View style={s.listCard}>
              <View style={s.listHeader}>
                <View style={s.listHeaderLeft}>
                  <Text style={s.listHeaderText}>Rank</Text>
                  <Text style={s.listHeaderText}>Learner</Text>
                </View>
                <Text style={s.listHeaderText}>XP</Text>
              </View>

              {leaderboard.map((user, idx) => {
                const rank = idx + 1;
                return (
                  <View
                    key={user._id}
                    style={[s.listRow, rank <= 3 && { backgroundColor: 'rgba(251, 191, 36, 0.06)' }]}
                  >
                    <View style={s.listRowLeft}>
                      <View style={[
                        s.listRankCircle,
                        rank === 1 && { backgroundColor: '#FBBF24' },
                        rank === 2 && { backgroundColor: '#CBD5E1' },
                        rank === 3 && { backgroundColor: '#92400E' },
                        rank > 3 && { backgroundColor: colors.surfaceSunken },
                      ]}>
                        <Text style={[
                          s.listRankText,
                          rank === 1 && { color: '#000' },
                          rank === 2 && { color: '#334155' },
                          rank === 3 && { color: '#FFF' },
                          rank > 3 && { color: colors.textTertiary },
                        ]}>{rank}</Text>
                      </View>

                      <View style={[s.listAvatarCircle, { backgroundColor: colors.brandPrimarySoft }]}>
                        {user.avatar ? (
                          <Image source={{ uri: user.avatar }} style={s.avatarImage} />
                        ) : (
                          <Text style={[s.listAvatarText, { color: colors.brandPrimaryHover }]}>
                            {user.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={s.listName} numberOfLines={1}>{user.name}</Text>
                        <Text style={s.listLevel}>{user.level || 'Learner'}</Text>
                      </View>
                    </View>

                    <View style={s.listRightCol}>
                      {user.currentStreak !== undefined && user.currentStreak > 0 && (
                        <View style={s.streakBadge}>
                          <IconFlame size={12} color="#F59E0B" />
                          <Text style={s.streakText}>{user.currentStreak}d</Text>
                        </View>
                      )}
                      <View style={s.xpRow}>
                        <IconBolt size={14} color="#F59E0B" />
                        <Text style={s.listXpText}>{user.periodXp.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: PAGE },
    scroll: { paddingBottom: spacing['4xl'] },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: radii.lg,
      backgroundColor: c.brandPrimarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold, color: c.textPrimary },
    subtitle: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sans, color: c.textSecondary, marginTop: 2 },
    tabRow: {
      flexDirection: 'row',
      marginHorizontal: spacing.xl,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      padding: 4,
      borderRadius: radii.lg,
      backgroundColor: c.surfaceSunken,
      borderWidth: 1,
      borderColor: c.borderSubtle,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radii.md,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: '#FFFFFF',
      ...shadows.xs,
    },
    tabText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: c.textTertiary },
    tabTextActive: { color: ACCENT, fontFamily: fontFamilies.sansBold },

    // Podium
    podiumRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    podiumCard: {
      alignItems: 'center',
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      backgroundColor: c.surfaceCard,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.base,
      paddingTop: 28,
      ...shadows.xs,
    },
    podiumCenter: {
      flex: 1.2,
      borderColor: '#FCD34D',
      borderWidth: 2,
      paddingTop: 32,
      paddingBottom: spacing.md,
      marginBottom: spacing.xs,
    },
    podiumSide: { flex: 1 },
    rankBadge: {
      position: 'absolute',
      top: -14,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFF',
      ...shadows.sm,
    },
    rankBadgeGold: { backgroundColor: '#FBBF24' },
    rankText: { fontSize: 12, fontFamily: fontFamilies.sansSemiBold },
    avatarCircle: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: c.brandPrimarySoft,
      marginBottom: spacing.sm,
    },
    avatarCenter: { width: 64, height: 64, borderWidth: 3 },
    avatarSide: { width: 48, height: 48, borderWidth: 2 },
    avatarImage: { width: '100%', height: '100%' },
    avatarInitial: { fontSize: 18, fontFamily: fontFamilies.sansSemiBold, color: c.brandPrimaryHover },
    championBadge: {
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radii.full,
      marginBottom: spacing.xs,
    },
    championText: { fontSize: 10, fontFamily: fontFamilies.sansSemiBold, color: '#92400E' },
    podiumName: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary, textAlign: 'center' },
    xpRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    xpText: { fontSize: fontSizes.xs, fontFamily: fontFamilies.sansMedium, color: '#78716C' },

    // Full list
    listCard: {
      marginHorizontal: spacing.xl,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      backgroundColor: c.surfaceCard,
      overflow: 'hidden',
      ...shadows.xs,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
      backgroundColor: c.surfaceSunken,
    },
    listHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    listHeaderText: { fontSize: 10, fontFamily: fontFamilies.sansSemiBold, color: c.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    listRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderSubtle,
    },
    listRowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 },
    listRankCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listRankText: { fontSize: 11, fontFamily: fontFamilies.sansSemiBold },
    listAvatarCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    listAvatarText: { fontSize: 13, fontFamily: fontFamilies.sansSemiBold },
    listName: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary },
    listLevel: { fontSize: 11, fontFamily: fontFamilies.sans, color: c.textTertiary, textTransform: 'capitalize' },
    listRightCol: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#FFFBEB',
      borderWidth: 1,
      borderColor: '#FDE68A',
      borderRadius: radii.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    streakText: { fontSize: 10, fontFamily: fontFamilies.sansMedium, color: '#D97706' },
    listXpText: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansSemiBold, color: c.textPrimary },
  });
}
