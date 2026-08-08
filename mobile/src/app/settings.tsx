import { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Switch, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { IconArrowLeft, IconUser, IconCamera } from '@tabler/icons-react-native';
import { useAuthStore, DEFAULT_SETTINGS } from '@/store/auth.store';
import { userApi } from '@/lib/api';
import { useTheme, fontFamilies, fontSizes, radii, spacing } from '@/theme';
import Button from '@/components/ui/Button';
import * as haptics from '@/lib/haptics';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user, updateProfile, updateSettings, deleteAccount, logout } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const settings = { ...DEFAULT_SETTINGS, ...user?.settings };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setIsUploading(true);
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
    } finally {
      setIsUploading(false);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <IconArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.brandPrimarySoft }]}>
              <IconUser size={28} color={colors.brandPrimaryHover} />
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.brandPrimary }]}>
            <IconCamera size={14} color={colors.brandOnPrimary} />
          </View>
        </Pressable>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Profile</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, { borderColor: colors.borderDefault, color: colors.textPrimary }]}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, { borderColor: colors.borderDefault, color: colors.textPrimary }]}
            />
          </View>
          <Button loading={isSaving} onPress={saveProfile}>Save changes</Button>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <SettingRow label="Push notifications" value={!!settings.pushNotifications} onChange={toggleSetting('pushNotifications')} />
          <SettingRow label="Study reminders" value={!!settings.studyReminders} onChange={toggleSetting('studyReminders')} />
          <SettingRow label="Streak alerts" value={!!settings.streakAlerts} onChange={toggleSetting('streakAlerts')} />
          <SettingRow label="Email notifications" value={!!settings.emailNotifications} onChange={toggleSetting('emailNotifications')} />
          <SettingRow label="Weekly progress email" value={!!settings.weeklyProgress} onChange={toggleSetting('weeklyProgress')} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger zone</Text>
          <Button variant="secondary" onPress={handleDeleteAccount} style={{ borderColor: colors.danger }}>
            Delete account
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderDefault, true: colors.brandPrimary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  headerTitle: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.xl },
  avatarWrap: { alignSelf: 'center', marginTop: spacing.sm },
  avatar: { width: 88, height: 88, borderRadius: radii.full },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSizes.lg, fontFamily: fontFamilies.sansSemiBold, marginBottom: spacing.xs },
  field: { gap: spacing.xs },
  label: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sansMedium },
  input: { borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.md, fontSize: fontSizes.base, fontFamily: fontFamilies.sans },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  settingLabel: { fontSize: fontSizes.base, fontFamily: fontFamilies.sans },
});
