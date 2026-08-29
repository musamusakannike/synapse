import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { fontFamilies, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

interface OnboardingCourseCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
}

export default function OnboardingCourseCard({
  icon,
  title,
  subtitle = 'Free',
  selected,
  onSelect,
}: OnboardingCourseCardProps) {
  const handlePress = () => {
    haptics.selection();
    onSelect();
  };

  return (
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
      <View style={styles.iconWrapper}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.base,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.sm + 2,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamilies.sansBold,
    color: '#0E0E1A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontFamilies.sans,
    color: '#6B6B80',
  },
});
