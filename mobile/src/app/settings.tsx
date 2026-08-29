import { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Switch, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { IconUser, IconCamera, IconShieldCheck, IconFileText, IconChevronRight, IconSparkles, IconDeviceMobile } from '@tabler/icons-react-native';
import { useAuthStore, DEFAULT_SETTINGS } from '@/store/auth.store';
import { useAppReview } from '@/hooks/useAppReview';
import { InReview, ReviewGuard } from '@/components/common/ReviewGuard';
import { userApi } from '@/lib/api';
import { fontFamilies, spacing } from '@/theme';
import { ACCENT, INK, MUTED, TINT_GLASS } from '@/theme/brand';
import GlassSurface from '@/components/ui/GlassSurface';
import ScreenBackdrop from '@/components/common/ScreenBackdrop';
import ScreenHeader from '@/components/common/ScreenHeader';
import * as haptics from '@/lib/haptics';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile, updateSettings, deleteAccount } = useAuthStore();
  const { inReview, os, refresh } = useAppReview();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const settings = { ...DEFAULT_SETTINGS, ...user?.settings };

  const pickAvatar = async () => {
    if (Platform.OS === 'ios') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);
      await userApi.uploadAvatar(formData);
      haptics.success();
    } catch {
      haptics.error();
      Alert.alert('Upload failed', 'Could not upload your photo. Try again.');
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    const result = await updateProfile({ firstName, lastName });
    setIsSaving(false);
    if (result.success) haptics.success();
    else Alert.alert('Could not save', result.error);
  };

  const toggleSetting = (key: keyof typeof settings) => (value: boolean) => {
    haptics.selection();
    updateSettings({ [key]: value } as any);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount();
            if (result.success) router.replace('/(auth)/login');
            else Alert.alert('Could not delete account', result.error);
          },
        },
      ]
    );
  };

  return (
    <View collapsable={false} style={styles.container}>
      <ScreenBackdrop />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Settings" subtitle="Profile, alerts, and account." showBack />

        <InReview>
          <GlassSurface style={styles.reviewBanner} tintColor={TINT_GLASS}>
            <View style={styles.reviewHeaderRow}>
              <View style={styles.reviewBadge}>
                <IconShieldCheck size={14} color="#D97706" />
                <Text style={styles.reviewBadgeText}>{os.toUpperCase()} REVIEW MODE</Text>
              </View>
              <Pressable
                onPress={() => {
                  haptics.light();
                  void refresh();
                }}
                hitSlop={8}
              >
                <Text style={styles.reviewRefreshText}>Sync Status</Text>
              </Pressable>
            </View>
            <Text style={styles.reviewBodyText}>
              Review compliance mode is active for {os.toUpperCase()}. Testing and reviewer-safe components are currently displayed.
            </Text>
          </GlassSurface>
        </InReview>

        <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <IconUser size={28} color={ACCENT} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <IconCamera size={14} color={INK} />
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Profile</Text>
        <GlassSurface style={styles.sectionCard} tintColor={TINT_GLASS}>
          <View style={styles.field}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFocused('first')}
              onBlur={() => setFocused(null)}
              style={[styles.input, focused === 'first' && styles.inputFocused]}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setFocused('last')}
              onBlur={() => setFocused(null)}
              style={[styles.input, focused === 'last' && styles.inputFocused]}
            />
          </View>
          <Pressable
            onPress={saveProfile}
            disabled={isSaving}
            style={({ pressed }) => [styles.primaryBtn, (pressed || isSaving) && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryBtnText}>{isSaving ? 'Saving…' : 'Save changes'}</Text>
          </Pressable>
        </GlassSurface>

        <Text style={styles.sectionTitle}>Notifications</Text>
        <GlassSurface style={styles.sectionCard} tintColor={TINT_GLASS}>
          <SettingRow label="Push notifications" value={!!settings.pushNotifications} onChange={toggleSetting('pushNotifications')} />
          <SettingRow label="Study reminders" value={!!settings.studyReminders} onChange={toggleSetting('studyReminders')} />
          <SettingRow label="Streak alerts" value={!!settings.streakAlerts} onChange={toggleSetting('streakAlerts')} />
          <SettingRow label="Email notifications" value={!!settings.emailNotifications} onChange={toggleSetting('emailNotifications')} />
          <SettingRow label="Weekly progress email" value={!!settings.weeklyProgress} onChange={toggleSetting('weeklyProgress')} last />
        </GlassSurface>

        <Text style={styles.sectionTitle}>Legal & Privacy</Text>
        <View style={{ gap: spacing.sm }}>
          <Pressable onPress={() => router.push('/privacy')} style={({ pressed }) => [pressed && styles.pressed]}>
            <GlassSurface style={styles.linkRow} isInteractive tintColor={TINT_GLASS}>
              <IconShieldCheck size={18} color={INK} />
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <IconChevronRight size={16} color={MUTED} />
            </GlassSurface>
          </Pressable>
          <Pressable onPress={() => router.push('/terms')} style={({ pressed }) => [pressed && styles.pressed]}>
            <GlassSurface style={styles.linkRow} isInteractive tintColor={TINT_GLASS}>
              <IconFileText size={18} color={INK} />
              <Text style={styles.linkLabel}>Terms of Service</Text>
              <IconChevronRight size={16} color={MUTED} />
            </GlassSurface>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: '#E5484D' }]}>Danger zone</Text>
        <Pressable onPress={handleDeleteAccount} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.deleteBtnText}>Delete account</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !last && styles.settingRowBorder]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#E8E8EE', true: ACCENT }} thumbColor="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  reviewBanner: {
    borderRadius: 18,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,138,30,0.3)',
    gap: spacing.xs,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,138,30,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontFamily: fontFamilies.sansBold,
    color: '#D97706',
    letterSpacing: 0.5,
  },
  reviewRefreshText: {
    fontSize: 11,
    fontFamily: fontFamilies.sansSemiBold,
    color: ACCENT,
  },
  reviewBodyText: {
    fontSize: 12,
    fontFamily: fontFamilies.sans,
    color: INK,
    lineHeight: 16,
  },
  avatarWrap: { alignSelf: 'center', marginBottom: spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,138,30,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fontFamilies.sansBold,
    color: INK,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionCard: { borderRadius: 20, padding: spacing.base, overflow: 'hidden', gap: spacing.md },
  field: { gap: 6 },
  label: { fontSize: 14, fontFamily: fontFamilies.sansBold, color: INK, letterSpacing: -0.2 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EB',
    borderRadius: 16,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: fontFamilies.sans,
    color: INK,
  },
  inputFocused: { borderColor: ACCENT },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontFamily: fontFamilies.sansBold, color: INK, letterSpacing: -0.2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  settingRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8E8EE' },
  settingLabel: { fontSize: 16, fontFamily: fontFamilies.sans, color: INK, flex: 1, paddingRight: spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.base, borderRadius: 18, overflow: 'hidden' },
  linkLabel: { flex: 1, fontSize: 16, fontFamily: fontFamilies.sansMedium, color: INK },
  deleteBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5484D',
  },
  deleteBtnText: { fontSize: 16, fontFamily: fontFamilies.sansBold, color: '#E5484D' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
