import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { IconX, IconCheck, IconArrowRight, IconBolt } from '@tabler/icons-react-native';
import { Topic } from '@/lib/types';
import InfoStepBlock from '@/components/lesson/InfoStepBlock';
import Button from '@/components/ui/Button';
import { useTheme, fontFamilies, fontSizes, radii, spacing, shadows } from '@/theme';
import * as haptics from '@/lib/haptics';

interface TopicReaderSheetProps {
  open: boolean;
  onClose: () => void;
  topic: Topic | null;
  onCompleteTopic: () => void;
  onTakeExercise: () => void;
  isCompleting?: boolean;
}

export default function TopicReaderSheet({
  open,
  onClose,
  topic,
  onCompleteTopic,
  onTakeExercise,
  isCompleting = false,
}: TopicReaderSheetProps) {
  const { colors } = useTheme();

  if (!open || !topic) return null;

  const s = makeStyles(colors);
  const xp = topic.xp || 50;

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.subHeader}>Lesson Content</Text>
            <Text style={s.title} numberOfLines={2}>{topic.title}</Text>
          </View>
          <Pressable
            onPress={() => {
              haptics.light();
              onClose();
            }}
            style={s.closeBtn}
            hitSlop={12}
            accessibilityLabel="Close lesson"
          >
            <IconX size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={s.scrollContent}>
          {topic.contents && topic.contents.length > 0 ? (
            topic.contents.map((content, idx) => (
              <View key={idx} style={s.contentCard}>
                {content.title ? (
                  <Text style={s.contentTitle}>{content.title}</Text>
                ) : null}
                <InfoStepBlock content={content} />
              </View>
            ))
          ) : (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>Reading content for this topic.</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.xpRow}>
            <IconBolt size={16} color="#F59E0B" />
            <Text style={s.xpText}>Earn +{xp} XP</Text>
          </View>

          {topic.exercise ? (
            <Button
              variant="primary"
              size="md"
              icon={<IconArrowRight size={18} color={colors.brandOnPrimary} />}
              onPress={() => {
                haptics.medium();
                onTakeExercise();
              }}
            >
              Take Exercise
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              loading={isCompleting}
              icon={<IconCheck size={18} color={colors.brandOnPrimary} />}
              onPress={() => {
                haptics.medium();
                onCompleteTopic();
              }}
            >
              Complete Topic
            </Button>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function makeStyles(c: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgApp,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
      backgroundColor: c.surfaceCard,
    },
    subHeader: {
      fontSize: 11,
      fontFamily: fontFamilies.sansSemiBold,
      color: c.brandPrimaryHover,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    title: {
      fontSize: fontSizes.lg,
      fontFamily: fontFamilies.displaySemiBold,
      color: c.textPrimary,
    },
    closeBtn: {
      padding: spacing.sm,
      borderRadius: radii.full,
      backgroundColor: c.surfaceSunken,
      marginLeft: spacing.md,
    },
    scrollContent: {
      padding: spacing.xl,
      gap: spacing.base,
      paddingBottom: spacing['3xl'],
    },
    contentCard: {
      backgroundColor: c.surfaceCard,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      padding: spacing.base,
      gap: spacing.sm,
      ...shadows.xs,
    },
    contentTitle: {
      fontSize: fontSizes.base,
      fontFamily: fontFamilies.sansSemiBold,
      color: c.textPrimary,
      marginBottom: spacing.xs,
    },
    emptyWrap: {
      paddingVertical: spacing['2xl'],
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSizes.sm,
      fontFamily: fontFamilies.sans,
      color: c.textTertiary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.base,
      borderTopWidth: 1,
      borderTopColor: c.borderSubtle,
      backgroundColor: c.surfaceCard,
    },
    xpRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    xpText: {
      fontSize: fontSizes.sm,
      fontFamily: fontFamilies.sansSemiBold,
      color: '#D97706',
    },
  });
}
