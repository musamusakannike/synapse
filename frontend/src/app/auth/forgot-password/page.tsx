'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import AuthLayout from '@/components/auth/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email address.');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout panelTitle="Reset your password" panelSubtitle="We'll email you a secure link to get back to studying.">
      <Link href="/auth/login" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--ink-900)]">
        <ArrowLeft className="size-4" />
        Back to login
      </Link>
      <h1 className="text-4xl font-[var(--font-display)] font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)]">Forgot password?</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Enter your email address and we&apos;ll send you a link to reset your password.</p>

      {success ? (
        <div className="mt-8 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-8 text-center shadow-[var(--shadow-sm)]">
          <CheckCircle2 className="mx-auto size-12 text-[var(--success)]" />
          <h3 className="mt-4 text-lg font-bold text-[var(--ink-900)]">Check your email</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">If an account exists for that email, a reset link has been sent.</p>
          <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-[var(--brand-gold-600)] hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/20 bg-[var(--danger-100)] p-3 text-xs text-[var(--danger)]">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Input label="Email address" type="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button type="submit" disabled={isLoading} fullWidth size="lg">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Send reset link'}
          </Button>
          <div className="pt-2 text-center text-sm text-[var(--text-muted)]">
            Remembered your password?{' '}
            <Link href="/auth/login" className="font-semibold text-[var(--brand-gold-600)] hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
