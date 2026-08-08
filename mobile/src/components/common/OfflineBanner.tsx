import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { IconWifiOff } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';

export default function OfflineBanner() {
  const { colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.warningBg }]}>
      <IconWifiOff size={14} color={colors.warning} />
      <Text style={[styles.text, { color: colors.warning }]}>
        You&apos;re offline — progress will sync when you&apos;re back online.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
  },
  text: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansMedium,
    flexShrink: 1,
  },
});
