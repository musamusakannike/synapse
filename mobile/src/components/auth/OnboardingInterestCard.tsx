import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { fontFamilies, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

interface OnboardingInterestCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}

export default function OnboardingInterestCard({
  icon,
  title,
  subtitle,
  selected,
  onSelect,
}: OnboardingInterestCardProps) {
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
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 154,
    borderRadius: 20,
    padding: spacing.base,
    justifyContent: 'space-between',
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
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 17,
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
