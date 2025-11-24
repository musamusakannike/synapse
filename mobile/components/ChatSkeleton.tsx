import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ChatSkeleton = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Message bubble skeleton */}
      <View style={styles.messageContainer}>
        <Animated.View style={[styles.avatarSkeleton, animatedStyle]} />
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.lineLong, animatedStyle]} />
          <Animated.View style={[styles.lineMedium, animatedStyle]} />
          <Animated.View style={[styles.lineShort, animatedStyle]} />
        </View>
      </View>

      {/* Additional lines */}
      <View style={styles.additionalLines}>
        <Animated.View style={[styles.lineMedium, animatedStyle]} />
        <Animated.View style={[styles.lineLong, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    gap: 8,
  },
  lineLong: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    width: '100%',
  },
  lineMedium: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    width: '80%',
  },
  lineShort: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    width: '60%',
  },
  additionalLines: {
    gap: 8,
    paddingLeft: 48,
  },
});

export default ChatSkeleton;
