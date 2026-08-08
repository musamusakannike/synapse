import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PlaygroundScreen() {
  const { colors } = useTheme();
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Code Playground</Text>
        <Pressable onPress={() => webviewRef.current?.reload()} hitSlop={10}>
          <IconRefresh size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.webviewWrap}>
        <WebView
          ref={webviewRef}
          source={require('../../assets/playground/index.html')}
          onLoadEnd={() => setIsLoading(false)}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          startInLoadingState={false}
          setSupportMultipleWindows={false}
          style={{ backgroundColor: colors.surface }}
        />
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.surface }]}>
            <LoadingSpinner />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Preparing playground…</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold },
  webviewWrap: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans },
});
