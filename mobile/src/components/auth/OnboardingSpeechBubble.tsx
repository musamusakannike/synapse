import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { fontFamilies, spacing } from '@/theme';

interface OnboardingSpeechBubbleProps {
  text: string;
  avatarSource?: any;
}

export default function OnboardingSpeechBubble({
  text,
  avatarSource = require('@/assets/images/onboarding/tutor-mascot.png'),
}: OnboardingSpeechBubbleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          source={avatarSource}
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bubbleContainer}>
        {/* Left pointing arrow/tail */}
        <View style={styles.arrowWrapper}>
          <Svg width={12} height={16} viewBox="0 0 12 16">
            <Polygon points="12,0 0,8 12,16" fill="#F4F4F6" />
          </Svg>
        </View>

        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  avatarWrapper: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
  },
  bubbleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowWrapper: {
    marginRight: -1,
    zIndex: 1,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#F4F4F6',
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  bubbleText: {
    fontSize: 18,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
});
