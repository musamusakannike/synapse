import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconBell, IconCircleCheck, IconArrowLeft } from '@tabler/icons-react-native';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/lib/types';
import { mapActionUrlToMobileRoute, setBadgeCount } from '@/lib/notifications';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await notificationApi.list();
      const data: Notification[] = res.data.data;
      setItems(data);
      await setBadgeCount(data.filter((n) => !n.isRead).length);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handlePress = async (n: Notification) => {
    haptics.light();
    if (!n.isRead) {
      try {
        await notificationApi.markRead(n._id);
        setItems((prev) => prev.map((i) => (i._id === n._id ? { ...i, isRead: true } : i)));
        setBadgeCount(items.filter((i) => !i.isRead && i._id !== n._id).length);
      } catch {
        // non-fatal
      }
    }
    if (n.actionUrl) {
      router.push(mapActionUrlToMobileRoute(n.actionUrl) as any);
    }
  };

  const markAllRead = async () => {
    haptics.light();
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setBadgeCount(0);
    } catch {
      // non-fatal
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {router.canGoBack() && (
            <Pressable
              onPress={() => {
                haptics.light();
                router.back();
              }}
              hitSlop={8}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <IconArrowLeft size={22} color={colors.textPrimary} />
            </Pressable>
          )}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Alerts</Text>
        </View>
        {items.some((i) => !i.isRead) && (
          <Pressable onPress={markAllRead}>
            <Text style={[styles.markAll, { color: colors.brandPrimaryHover }]}>Mark all read</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} colors={[colors.brandPrimary]} />}
        renderItem={({ item }) => (
          <Card onPress={() => handlePress(item)} style={!item.isRead ? { borderWidth: 1, borderColor: colors.brandPrimarySoft } : undefined}>
            <View style={styles.row}>
              {!item.isRead ? (
                <View style={[styles.dot, { backgroundColor: colors.brandPrimary }]} />
              ) : (
                <IconCircleCheck size={16} color={colors.textTertiary} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
              </View>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <EmptyState icon={<IconBell size={44} color={colors.textTertiary} />} title="No notifications yet" description="We'll let you know when there's something new." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold },
  markAll: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  notifTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, marginBottom: 2 },
  notifMessage: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, lineHeight: fontSizes.sm * 1.5 },
});
