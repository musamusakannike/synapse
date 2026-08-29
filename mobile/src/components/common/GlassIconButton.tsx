import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import GlassSurface from '@/components/ui/GlassSurface';
import * as haptics from '@/lib/haptics';

interface GlassIconButtonProps {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}

export default function GlassIconButton({ children, onPress, accessibilityLabel }: GlassIconButtonProps) {
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <GlassSurface style={styles.btn} glassEffectStyle="clear" isInteractive tintColor="rgba(255,255,255,0.45)">
        {children}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
