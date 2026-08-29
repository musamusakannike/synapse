import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { fontFamilies, spacing, radii } from '@/theme';
import * as haptics from '@/lib/haptics';
import { GoalClockIcon } from './OnboardingCourseIcons';

interface OnboardingGoalCardProps {
  title: string;
  subtitle: string;
  isRecommended?: boolean;
  selected: boolean;
  onSelect: () => void;
}

export default function OnboardingGoalCard({
  title,
  subtitle,
  isRecommended = false,
  selected,
  onSelect,
}: OnboardingGoalCardProps) {
  const handlePress = () => {
    haptics.selection();
    onSelect();
  };

  return (
    <View style={styles.container}>
      {isRecommended && (
        <View style={styles.badgeWrapper}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Recommended</Text>
          </View>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          selected ? styles.cardSelected : styles.cardDefault,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.iconWrapper}>
          <GoalClockIcon size={42} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: spacing.base,
  },
  badgeWrapper: {
    position: 'absolute',
    top: -10,
    right: 18,
    zIndex: 10,
  },
  badge: {
    backgroundColor: '#FFEBD6',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#FFD1A4',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamilies.sansBold,
    color: '#E87400',
    letterSpacing: -0.1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: spacing.base,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  cardDefault: {
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#FF8A1E',
    backgroundColor: '#FFFDFB',
    shadowColor: '#FF8A1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  iconWrapper: {
    marginRight: spacing.base,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontFamilies.sans,
    color: '#6B6B80',
    lineHeight: 18,
  },
});
