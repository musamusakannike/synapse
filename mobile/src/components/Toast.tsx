import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing, radius, fontSize } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  show: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const SCREEN_WIDTH = Dimensions.get('window').width;

function ToastItem({ toast, onDismiss }: { toast: ToastConfig; onDismiss: (id: string) => void }) {
  const { c } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const typeConfig = {
    success: { color: c.success, icon: CircleCheck, label: 'Success' },
    error: { color: c.danger, icon: CircleX, label: 'Error' },
    info: { color: c.accent, icon: Info, label: 'Info' },
    warning: { color: c.warning, icon: TriangleAlert, label: 'Warning' },
  };

  const config = typeConfig[toast.type];
  const IconComponent = config.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useState(() => {
    // Trigger haptic on mount
    if (toast.type === 'success') haptics.success();
    else if (toast.type === 'error') haptics.error();
    else if (toast.type === 'warning') haptics.warning();
    else haptics.light();

    // Animate in
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss
    const duration = toast.duration || 3500;
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-100, { duration: 300 }, () => {
        runOnJS(onDismiss)(toast.id);
      });
    }, duration);

    return () => clearTimeout(timer);
  });

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        animatedStyle,
        {
          backgroundColor: c.bgElevated,
          borderColor: c.border,
          borderLeftColor: config.color,
          shadowColor: '#000',
        },
      ]}
    >
      <IconComponent size={18} color={config.color} strokeWidth={2} />
      <Animated.View style={styles.toastContent}>
        <Text
          style={[styles.toastTitle, { color: c.textPrimary, fontFamily: typography.body.semiBold }]}
          numberOfLines={1}
        >
          {toast.title}
        </Text>
        {toast.message ? (
          <Text
            style={[styles.toastMessage, { color: c.textSecondary, fontFamily: typography.body.regular }]}
            numberOfLines={2}
          >
            {toast.message}
          </Text>
        ) : null}
      </Animated.View>
      <Pressable
        onPress={() => {
          haptics.light();
          opacity.value = withTiming(0, { duration: 150 });
          translateY.value = withTiming(-100, { duration: 200 }, () => {
            runOnJS(onDismiss)(toast.id);
          });
        }}
        hitSlop={12}
      >
        <X size={14} color={c.textMuted} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => {
      // Keep max 3 toasts
      const trimmed = prev.length >= 3 ? prev.slice(1) : prev;
      return [...trimmed, { id, type, title, message, duration }];
    });
  }, []);

  const success = useCallback((title: string, message?: string) => show('success', title, message), [show]);
  const error = useCallback((title: string, message?: string) => show('error', title, message), [show]);
  const info = useCallback((title: string, message?: string) => show('info', title, message), [show]);
  const warning = useCallback((title: string, message?: string) => show('warning', title, message), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning }}>
      {children}
      <Animated.View
        style={[styles.toastWrapper, { top: insets.top + spacing.sm }]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toastContent: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    fontSize: fontSize.sm,
    letterSpacing: -0.2,
  },
  toastMessage: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
