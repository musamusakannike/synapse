import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, User, BookOpen, Target, Pencil } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

const STYLES = ['textual', 'visual', 'auditory', 'kinesthetic'];
const LEVELS = ['self-learner', 'high school', 'undergraduate', 'graduate', 'professional'];

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.sectionTitleRow}>
      {icon}
      <Text style={[styles.sectionTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
        {title}
      </Text>
    </View>
  );
}

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => { haptics.light(); onChange(opt); }}
            style={[
              styles.chip,
              {
                backgroundColor: active ? c.accentMuted : c.bgSecondary,
                borderColor: active ? c.accent : c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: active ? c.accent : c.textSecondary,
                  fontFamily: active ? typography.body.semiBold : typography.body.regular,
                },
              ]}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { c } = useTheme();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [style, setStyle] = useState(user?.style ?? 'textual');
  const [level, setLevel] = useState(user?.level ?? 'self-learner');
  const [goals, setGoals] = useState(user?.goals ?? '');

  const mutation = useMutation({
    mutationFn: () => api.put('/api/auth/me', { name, style, level, goals }),
    onSuccess: async () => {
      await refreshUser();
      toast.success('Saved', 'Your preferences have been updated.');
      haptics.success();
    },
    onError: (err: any) => {
      toast.error('Save failed', err.response?.data?.error ?? 'Please try again.');
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderSubtle }]}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: c.bgSecondary }]}
        >
          <ChevronLeft size={20} color={c.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary, fontFamily: typography.display.semiBold }]}>
          Settings
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Profile */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
        >
          <SectionHeader
            title="Profile"
            icon={<User size={16} color={c.accent} strokeWidth={2} />}
          />
          <Input
            label="Display name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
            iconLeft={<Pencil size={16} color={c.textMuted} strokeWidth={1.5} />}
          />
          <View style={[styles.readOnly, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
            <Text style={[styles.readOnlyLabel, { color: c.textMuted, fontFamily: typography.body.regular }]}>
              Email
            </Text>
            <Text style={[styles.readOnlyValue, { color: c.textSecondary, fontFamily: typography.body.medium }]}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </Animated.View>

        {/* Learning style */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
        >
          <SectionHeader
            title="Learning Style"
            icon={<BookOpen size={16} color={c.accent} strokeWidth={2} />}
          />
          <Text style={[styles.fieldLabel, { color: c.textMuted, fontFamily: typography.body.medium }]}>
            How do you learn best?
          </Text>
          <ChipSelect options={STYLES} value={style} onChange={setStyle} />
        </Animated.View>

        {/* Level */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
        >
          <SectionHeader
            title="Knowledge Level"
            icon={<Target size={16} color={c.accent} strokeWidth={2} />}
          />
          <Text style={[styles.fieldLabel, { color: c.textMuted, fontFamily: typography.body.medium }]}>
            What's your current level?
          </Text>
          <ChipSelect options={LEVELS} value={level} onChange={setLevel} />
        </Animated.View>

        {/* Goals */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
        >
          <SectionHeader
            title="Learning Goals"
            icon={<Target size={16} color={c.accent} strokeWidth={2} />}
          />
          <Input
            label="What do you want to achieve?"
            value={goals}
            onChangeText={setGoals}
            placeholder="e.g. Prepare for JAMB, learn programming..."
            multiline
            numberOfLines={3}
            containerStyle={styles.multilineInput}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Button
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            fullWidth
          >
            Save changes
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  section: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    letterSpacing: -0.2,
  },
  readOnly: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: 2,
  },
  readOnlyLabel: { fontSize: fontSize['2xs'] },
  readOnlyValue: { fontSize: fontSize.sm },
  fieldLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: fontSize.xs },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
