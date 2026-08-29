import { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { IconRefresh } from '@tabler/icons-react-native';
import { fontFamilies, spacing } from '@/theme';
import { INK, MUTED } from '@/theme/brand';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ScreenBackdrop from '@/components/common/ScreenBackdrop';
import ScreenHeader from '@/components/common/ScreenHeader';
import GlassIconButton from '@/components/common/GlassIconButton';
import GlassSurface from '@/components/ui/GlassSurface';

export default function PlaygroundScreen() {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      <ScreenBackdrop />
      <View style={[styles.headerPad, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader
          title="Playground"
          subtitle="Write and run HTML, CSS, JS and Python."
          showBack
          onBack={() => router.back()}
          right={
            <GlassIconButton onPress={() => webviewRef.current?.reload()} accessibilityLabel="Reload playground">
              <IconRefresh size={20} color={INK} />
            </GlassIconButton>
          }
        />
      </View>

      <GlassSurface style={styles.webviewCard} tintColor="rgba(255,255,255,0.45)">
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
          style={{ backgroundColor: 'transparent', flex: 1 }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <LoadingSpinner fill={false} />
            <Text style={styles.loadingText}>Preparing playground…</Text>
          </View>
        )}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerPad: { paddingHorizontal: spacing.lg },
  webviewCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loadingText: { fontSize: 14, fontFamily: fontFamilies.sans, color: MUTED },
});
