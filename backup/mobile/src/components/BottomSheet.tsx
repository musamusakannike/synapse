import { type ReactNode, useCallback } from 'react';
import RNBottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/theme';

interface BottomSheetProps {
  sheetRef: React.RefObject<RNBottomSheet>;
  snapPoints?: string[];
  children: ReactNode;
  onClose?: () => void;
  enableDynamicSizing?: boolean;
}

export function BottomSheet({
  sheetRef,
  snapPoints = ['50%'],
  children,
  onClose,
  enableDynamicSizing = false,
}: BottomSheetProps) {
  const { c } = useTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  return (
    <RNBottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={enableDynamicSizing ? undefined : snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={[styles.background, { backgroundColor: c.bgSecondary }]}
      handleIndicatorStyle={{ backgroundColor: c.border }}
    >
      <BottomSheetView style={styles.content}>
        {children}
      </BottomSheetView>
    </RNBottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  content: {
    flex: 1,
  },
});
