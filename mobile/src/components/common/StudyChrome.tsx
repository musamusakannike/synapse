import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { spacing } from '@/theme';
import ScreenBackdrop from './ScreenBackdrop';
import ScreenHeader from './ScreenHeader';

export default function StudyChrome({ title, children }: { title: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <ScreenBackdrop />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <ScreenHeader title={title} showBack onBack={() => router.back()} />
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: spacing.lg },
  body: { flex: 1, paddingHorizontal: spacing.lg },
});
