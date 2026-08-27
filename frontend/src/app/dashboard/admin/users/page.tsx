'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, Search, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { userApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (search) params.search = search;
      const res = await userApi.list(params);
      setUsers(res.data.data || []);
      setPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    try {
      await userApi.updateRole(userId, role);
      toast.success('Role updated');
      setEditUser((u) => (u ? { ...u, role } : u));
      fetchUsers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await userApi.remove(deleteTarget._id);
      toast.success('User deleted');
      fetchUsers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader title="Manage users" description={`${total} users registered`} />

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--ink-300)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] py-2.5 pr-4 pl-10 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users className="size-12" />} title="No users found" description="Try adjusting your search." />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u._id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-gold-100)] text-sm font-semibold text-[var(--brand-gold-600)]">
                    {u.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar} alt={u.name} className="size-full object-cover" />
                    ) : (
                      u.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--ink-900)]">{u.name}</p>
                    <p className="truncate text-xs text-[var(--ink-300)]">{u.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={u.role === 'admin' ? 'violet' : 'neutral'}>{u.role}</Badge>
                  <span className="hidden text-xs text-[var(--ink-300)] sm:block">{new Date(u.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}><Pencil className="size-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`size-9 rounded-[var(--radius-md)] text-sm font-semibold ${p === page ? 'bg-[var(--brand-gold)] text-[var(--ink-900)]' : 'border border-[var(--line)] bg-[var(--surface-card)] text-[var(--text-muted)]'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!editUser} onClose={() => setEditUser(null)} title="Manage user">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-gold-100)] font-semibold text-[var(--brand-gold-600)]">
                {editUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editUser.avatar} alt={editUser.name} className="size-full object-cover" />
                ) : (
                  editUser.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[var(--ink-900)]">{editUser.name}</p>
                <p className="text-xs text-[var(--ink-300)]">{editUser.email}</p>
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-[var(--ink-900)]">Role</span>
              <div className="flex gap-2">
                <button onClick={() => handleRoleChange(editUser._id, 'user')} className={`flex-1 cursor-pointer rounded-[var(--radius-md)] py-2.5 text-sm font-semibold ${editUser.role === 'user' ? 'bg-[var(--brand-gold)] text-[var(--ink-900)]' : 'border border-[var(--line)] text-[var(--text-muted)]'}`}>User</button>
                <button onClick={() => handleRoleChange(editUser._id, 'admin')} className={`flex-1 cursor-pointer rounded-[var(--radius-md)] py-2.5 text-sm font-semibold ${editUser.role === 'admin' ? 'bg-[var(--brand-gold)] text-[var(--ink-900)]' : 'border border-[var(--line)] text-[var(--text-muted)]'}`}>Admin</button>
              </div>
            </div>
            <div className="border-t border-[var(--line)] pt-4">
              <Button variant="secondary" fullWidth onClick={() => { setDeleteTarget(editUser); setEditUser(null); }}><Trash2 className="size-4" /> Delete user</Button>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteUser} title="Delete user" message={`Deleting "${deleteTarget?.name}" will permanently remove their account and data.`} confirmLabel="Delete user" />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}
