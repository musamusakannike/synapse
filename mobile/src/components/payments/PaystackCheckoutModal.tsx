import { useRef } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconX } from '@tabler/icons-react-native';
import { fontFamilies, spacing } from '@/theme';
import { INK, MUTED, PAGE } from '@/theme/brand';
import { extractPaystackReference, isPaystackCallbackUrl } from '@/lib/paystack';
import * as haptics from '@/lib/haptics';

interface PaystackCheckoutModalProps {
  visible: boolean;
  authorizationUrl: string | null;
  fallbackReference: string | null;
  onClose: () => void;
  onSettled: (reference: string) => void;
}

export default function PaystackCheckoutModal({
  visible,
  authorizationUrl,
  fallbackReference,
  onClose,
  onSettled,
}: PaystackCheckoutModalProps) {
  const settled = useRef(false);

  const finish = (url: string) => {
    if (settled.current) return;
    settled.current = true;
    const reference = extractPaystackReference(url) || fallbackReference;
    if (reference) onSettled(reference);
    else onClose();
  };

  const handleNav = (nav: WebViewNavigation | { url: string }) => {
    if (!nav.url) return;
    if (isPaystackCallbackUrl(nav.url)) {
      finish(nav.url);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={() => {
        settled.current = false;
      }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Pay with Paystack</Text>
          <Pressable
            onPress={() => {
              haptics.light();
              onClose();
            }}
            hitSlop={12}
            accessibilityLabel="Close checkout"
          >
            <IconX size={22} color={INK} />
          </Pressable>
        </View>
        {authorizationUrl ? (
          <WebView
            style={styles.webview}
            source={{ uri: authorizationUrl }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            userAgent="SabiLearn-Mobile;Webview"
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={INK} />
                <Text style={styles.loadingText}>Opening Paystack…</Text>
              </View>
            )}
            onNavigationStateChange={handleNav}
            onShouldStartLoadWithRequest={(request) => {
              if (isPaystackCallbackUrl(request.url)) {
                finish(request.url);
                return false;
              }
              return true;
            }}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={INK} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: PAGE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8EE',
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamilies.sansBold,
    color: INK,
  },
  webview: {
    flex: 1,
    backgroundColor: PAGE,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: PAGE,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fontFamilies.sans,
    color: MUTED,
  },
});
