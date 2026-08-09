'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Globe, Shield, LogOut, Target } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { userApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';

const settingLabels: Record<string, string> = {
  emailNotifications: 'Email notifications',
  pushNotifications: 'Push notifications',
  weeklyProgress: 'Weekly progress report',
};

export default function SettingsPage() {
  const { user, logout, updateSettings } = useAuthStore();
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    pushNotifications: user?.settings?.pushNotifications ?? false,
    weeklyProgress: user?.settings?.weeklyProgress ?? true,
    language: user?.settings?.language ?? 'en',
    dailyGoalMinutes: user?.settings?.dailyGoalMinutes ?? 15,
  });

  useEffect(() => {
    userApi
      .profile()
      .then((res) => { if (res.data.success && res.data.data?.settings) setSettings(res.data.data.settings); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const toggleSetting = async (key: 'emailNotifications' | 'pushNotifications' | 'weeklyProgress') => {
    const next = !settings[key];
    const prev = settings;
    setSettings({ ...settings, [key]: next });
    const result = await updateSettings({ [key]: next });
    if (result.success) {
      toast.success(`${settingLabels[key]} ${next ? 'enabled' : 'disabled'}`);
    } else {
      setSettings(prev);
      toast.error(result.error || 'Failed to update setting.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-1">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your preferences and account</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">Notifications</h2>
        <div className="space-y-4">
          {(['emailNotifications', 'pushNotifications', 'weeklyProgress'] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--ink-900)]">{settingLabels[key]}</p>
                </div>
              </div>
              <Switch checked={settings[key]} onChange={() => toggleSetting(key)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">Preferences</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <p className="text-sm font-medium text-[var(--ink-900)]">Language</p>
              <p className="text-xs text-[var(--ink-300)]">Interface language</p>
            </div>
          </div>
          <div className="w-40">
            <Select
              value={settings.language}
              onChange={async (e) => {
                const newLang = e.target.value;
                const prev = settings.language;
                setSettings({ ...settings, language: newLang });
                const result = await updateSettings({ language: newLang });
                if (!result.success) {
                  setSettings({ ...settings, language: prev });
                  toast.error(result.error || 'Failed to update language.');
                }
              }}
              options={[{ value: 'en', label: 'English' }, { value: 'fr', label: 'French' }, { value: 'es', label: 'Spanish' }]}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <p className="text-sm font-medium text-[var(--ink-900)]">Daily study goal</p>
              <p className="text-xs text-[var(--ink-300)]">Minutes per day used to track your daily progress</p>
            </div>
          </div>
          <div className="w-24">
            <Input
              type="number"
              min={1}
              max={480}
              value={settings.dailyGoalMinutes}
              onChange={(e) => setSettings({ ...settings, dailyGoalMinutes: Number(e.target.value) })}
              onBlur={async () => {
                const minutes = Math.min(480, Math.max(1, Math.round(settings.dailyGoalMinutes) || 15));
                setSettings({ ...settings, dailyGoalMinutes: minutes });
                const result = await updateSettings({ dailyGoalMinutes: minutes });
                if (result.success) {
                  toast.success('Daily goal updated');
                } else {
                  toast.error(result.error || 'Failed to update daily goal.');
                }
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--text-muted)]" />
              <div>
                <p className="text-sm font-medium text-[var(--ink-900)]">Role</p>
                <p className="text-xs text-[var(--ink-300)]">{user?.role}</p>
              </div>
            </div>
            <Badge tone={user?.role === 'admin' ? 'success' : 'neutral'}>{user?.role}</Badge>
          </div>
          <div className="pt-4 border-t border-[var(--line)]">
            <Button variant="secondary" onClick={handleLogout}><LogOut className="w-4 h-4" /> Sign out</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
