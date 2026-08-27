'use client';

import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { userApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile, fetchMe } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    level: user?.level || 'beginner',
  });

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated');
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Failed to update profile.');
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await userApi.uploadAvatar(fd);
      if (res.data.success) {
        await fetchMe();
        toast.success('Avatar updated');
      }
    } catch {
      toast.error('Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-[var(--ink-900)]">Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your account information</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-gold-100)] text-2xl font-bold text-[var(--brand-gold-600)]">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="size-full object-cover" />
              ) : (
                user.firstName?.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute right-0 bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-gold)] text-[var(--ink-900)] hover:opacity-80 disabled:opacity-50"
            >
              {isUploading ? <LoadingSpinner size="sm" /> : <Camera className="size-4" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-[var(--ink-900)]">{user.name}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{user.email}</p>
            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
              <Badge tone="gold">{user.level}</Badge>
              {user.role === 'admin' && <Badge tone="success">Admin</Badge>}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--ink-900)]">Personal information</h2>
          {!isEditing ? (
            <Button variant="ghost" onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', bio: user.bio || '', level: user.level });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="First name" disabled={!isEditing} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          <Input label="Last name" disabled={!isEditing} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          <Input label="Email" type="email" disabled={!isEditing} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Phone" disabled={!isEditing} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Not set" />
          <div className="md:col-span-2">
            <Select
              label="Level"
              disabled={!isEditing}
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
              options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]}
            />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Bio</span>
            <textarea
              disabled={!isEditing}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself…"
              rows={3}
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)] disabled:bg-[var(--surface-sunken)]"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
