import { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useTheme, radii } from '@/theme';
import LoadingSpinner from './LoadingSpinner';

interface YouTubePlayerProps {
  /** A full YouTube URL or a raw 11-char video id. */
  source: string;
  /** Aspect ratio width/height. Defaults to 16:9. */
  aspectRatio?: number;
  /** Optional height override. When provided, aspectRatio is ignored. */
  height?: number;
}

/** Extracts the 11-character YouTube video id from a URL or returns the raw id. */
export function parseYouTubeId(source: string): string | null {
  if (!source) return null;
  const trimmed = source.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const longMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:[^&]*&)*v=|embed\/|shorts\/|live\/|v\/)|m\.youtube\.com\/watch\?(?:[^&]*&)*v=)([a-zA-Z0-9_-]{11})/,
  );
  if (longMatch) return longMatch[1];

  const fallback = trimmed.match(/([a-zA-Z0-9_-]{11})/);
  return fallback ? fallback[1] : null;
}

export default function YouTubePlayer({
  source,
  aspectRatio = 16 / 9,
  height,
}: YouTubePlayerProps) {
  const { colors } = useTheme();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const videoId = parseYouTubeId(source);
  const computedHeight = height ?? (containerWidth > 0 ? Math.round(containerWidth / aspectRatio) : 200);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const onReady = useCallback(() => setIsReady(true), []);

  if (!videoId) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.surfaceCard }]}>
        <LoadingSpinner size="small" fill={false} />
      </View>
    );
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        { backgroundColor: colors.surfaceCard, borderRadius: radii.lg },
        height ? { height } : null,
      ]}
    >
      {!isReady && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <LoadingSpinner size="small" fill={false} />
        </View>
      )}
      <YoutubePlayer
        ref={playerRef}
        videoId={videoId}
        height={computedHeight}
        width={containerWidth || undefined}
        play={false}
        onReady={onReady}
        webViewStyle={styles.webview}
        initialPlayerParams={{ preventFullScreen: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fallback: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});
