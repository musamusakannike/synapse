'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { authApi, userApi } from '@/lib/api';

export default function DeleteAccountClient() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Email form state
  const [requestEmail, setRequestEmail] = useState('');
  const [reason, setReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Direct deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sabilearn_token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('sabilearn_user') : null;

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore JSON parse error
      }
    }

    if (token) {
      userApi
        .profile()
        .then((res) => {
          if (res.data?.data) {
            setUser({ email: res.data.data.email, name: res.data.data.name });
            setRequestEmail(res.data.data.email);
          }
        })
        .catch(() => {
          // Token invalid or expired
        })
        .finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(null);

    if (!requestEmail || !requestEmail.includes('@')) {
      setRequestError('Please enter a valid email address.');
      return;
    }

    if (!agreedToTerms) {
      setRequestError('Please confirm that you understand this action will permanently delete your account data.');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const res = await authApi.requestAccountDeletion(requestEmail, reason);
      setRequestSuccess(
        res.data?.message || 'Deletion request received. If an account exists for this email address, instructions have been sent.'
      );
      setRequestEmail('');
      setReason('');
      setAgreedToTerms(false);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit deletion request. Please try again or contact privacy@sabilearn.org.';
      setRequestError(errorMessage);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleDirectDelete = async () => {
    if (confirmText.trim().toLowerCase() !== 'delete') {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      await userApi.deleteAccount();
      setDeleteSuccess(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sabilearn_token');
        localStorage.removeItem('sabilearn_user');
      }
      setTimeout(() => {
        window.location.href = '/';
      }, 3500);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Account deletion failed. Please try again or submit an email deletion request below.';
      setDeleteError(errorMessage);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-page)] text-[var(--ink-900)]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Header Badge & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Google Play Data Safety Compliance
          </div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--ink-900)] mb-3">
            Account & Data Deletion Request
          </h1>
          <p className="text-[var(--text-muted)] text-base max-w-2xl mx-auto leading-relaxed">
            SabiLearn allows you to delete your account and all associated personal data at any time. Review the information below to proceed with permanent account deletion.
          </p>
        </div>

        {/* Data Scope Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* What gets deleted */}
          <div className="bg-[var(--surface-card)] border border-red-200 dark:border-red-950/40 rounded-[var(--radius-xl)] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--ink-900)]">Data That Will Be Deleted</h3>
                <p className="text-xs text-red-600 font-medium">Permanently removed upon completion</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Profile Information:</strong> Full name, email address, password, level, and avatar image.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Study & Progress Records:</strong> Quiz scores, flashcard sessions, course completion history, and streak statistics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>AI Assistant Logs:</strong> Generation history, saved prompts, and conversation logs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span><strong>Device Registrations:</strong> Push notification tokens and saved preferences.</span>
              </li>
            </ul>
          </div>

          {/* What is retained */}
          <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--ink-900)]">Data Retained & Security</h3>
                <p className="text-xs text-blue-600 font-medium">Compliance & Legal requirements</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Financial Transaction Records:</strong> In accordance with financial auditing and tax laws, payment receipts and billing logs are securely archived for statutory periods.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Anonymized Metrics:</strong> Aggregated, non-personally identifiable analytical data may be retained to improve platform security and system performance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>Processing Timeline:</strong> Instant execution when logged in; processed within 7 business days for email requests.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 1: Immediate Self-Service Account Deletion */}
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-6 sm:p-8 mb-10 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--ink-900)] mb-2 flex items-center gap-2">
            <span>Option 1: Direct In-App & Web Account Deletion</span>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Recommended & Instant
            </span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            If you have an active account, you can log in to delete your account and all associated data immediately.
          </p>

          {!isCheckingAuth && user ? (
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-[var(--radius-lg)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Logged in as:</p>
                <p className="font-semibold text-sm text-[var(--ink-900)]">{user.name} ({user.email})</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-[var(--radius-md)] transition-colors shadow-sm"
              >
                Delete Account Now
              </button>
            </div>
          ) : (
            <div className="p-5 bg-[var(--surface-sunken)] border border-[var(--line)] rounded-[var(--radius-lg)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--ink-900)]">Log into your SabiLearn account</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Sign in to execute instant account deletion from your settings.</p>
              </div>
              <Link
                href="/auth/login?redirect=/delete-account"
                className="w-full sm:w-auto text-center bg-[var(--ink-900)] hover:opacity-90 text-white font-semibold text-sm px-6 py-2.5 rounded-[var(--radius-md)] transition-opacity"
              >
                Log In to Delete
              </Link>
            </div>
          )}
        </div>

        {/* Section 2: Account Deletion Request Form (Unauthenticated / App Uninstalled) */}
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-6 sm:p-8 mb-12 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--ink-900)] mb-2">
            Option 2: Submit Account Deletion Request
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Use this form if you no longer have access to the SabiLearn mobile app, cannot log in, or have uninstalled the app from your device.
          </p>

          {requestSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-[var(--radius-lg)] flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold">Request Received!</p>
                <p className="mt-1">{requestSuccess}</p>
              </div>
            </div>
          )}

          {requestError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-sm rounded-[var(--radius-lg)] flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Error Submitting Request</p>
                <p className="mt-1">{requestError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-5">
            <div>
              <label htmlFor="requestEmail" className="block text-sm font-semibold text-[var(--ink-900)] mb-1.5">
                Registered Account Email <span className="text-red-500">*</span>
              </label>
              <input
                id="requestEmail"
                type="email"
                required
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                placeholder="e.g., student@example.com"
                className="w-full px-4 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-[var(--ink-900)] mb-1.5">
                Reason for Account Deletion <span className="text-xs text-[var(--text-muted)] font-normal">(Optional)</span>
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
              >
                <option value="">Select a reason...</option>
                <option value="No longer using the application">No longer using the application</option>
                <option value="Created duplicate account">Created a duplicate account</option>
                <option value="Privacy or data concerns">Privacy or data security concerns</option>
                <option value="Switched to another platform">Switched to another platform</option>
                <option value="Technical issues or app bugs">Technical issues or app bugs</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                id="agreedToTerms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-[var(--brand-gold-600)] border-[var(--line)] rounded focus:ring-[var(--brand-gold)]"
              />
              <label htmlFor="agreedToTerms" className="text-xs text-[var(--text-muted)] leading-relaxed">
                I understand that submitting this request will initiate the permanent deletion of my SabiLearn profile, learning history, quiz records, and personal data. This process cannot be reversed.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingRequest || !agreedToTerms}
              className="w-full sm:w-auto bg-[var(--brand-gold)] text-[var(--ink-900)] font-semibold text-sm px-8 py-3 rounded-[var(--radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmittingRequest ? 'Submitting Request...' : 'Submit Account Deletion Request'}
            </button>
          </form>
        </div>

        {/* Section 3: Frequently Asked Questions */}
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--ink-900)] mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 text-sm">
            <div>
              <h4 className="font-semibold text-[var(--ink-900)] mb-1">
                How long does the account deletion process take?
              </h4>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Direct deletion via your logged-in account takes effect immediately. Deletion requests submitted via email or web form are validated and completed within 7 business days.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--ink-900)] mb-1">
                Will my active store subscriptions be automatically canceled?
              </h4>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Deleting your account deletes your app profile, but active store subscriptions managed directly through Google Play Store or Apple App Store must be canceled via your Google Play or Apple ID subscription settings to avoid future store billing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--ink-900)] mb-1">
                Need additional assistance or privacy inquiries?
              </h4>
              <p className="text-[var(--text-muted)] leading-relaxed">
                For further questions regarding your data privacy, you can reach out to our privacy team at{' '}
                <a href="mailto:privacy@sabilearn.org" className="text-[var(--brand-gold-600)] underline font-medium">
                  privacy@sabilearn.org
                </a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            {deleteSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--ink-900)] mb-2">Account Deleted</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">Your account and all associated data have been permanently deleted. Redirecting to home page...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ink-900)]">Confirm Account Deletion</h3>
                    <p className="text-xs text-red-600 font-semibold">This action cannot be undone.</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                  Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)? All your quiz results, progress, and settings will be removed permanently.
                </p>

                {deleteError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-[var(--radius-md)]">
                    {deleteError}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[var(--ink-900)] mb-1">
                    Type <span className="font-mono text-red-600">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 bg-[var(--surface-page)] border border-[var(--line)] rounded-[var(--radius-md)] text-sm font-mono text-[var(--ink-900)] focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setConfirmText('');
                      setDeleteError(null);
                    }}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 text-sm font-semibold text-[var(--ink-700)] hover:text-[var(--ink-900)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDirectDelete}
                    disabled={isDeletingAccount || confirmText.trim().toLowerCase() !== 'delete'}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2 rounded-[var(--radius-md)] transition-colors disabled:opacity-50"
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
