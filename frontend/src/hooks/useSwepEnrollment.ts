'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  SWEP_ENROLLMENT_EVENT,
  SWEP_ENROLLMENT_KEY,
  SWEP_FAB_DISMISSED_KEY,
  SWEP_SHEET_SESSION_KEY,
  type SwepEnrollment,
} from '@/lib/swep';

type EnrollmentState = SwepEnrollment | null;



function emit() {
  window.dispatchEvent(new Event(SWEP_ENROLLMENT_EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SWEP_ENROLLMENT_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(SWEP_ENROLLMENT_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function readEnrollment(): EnrollmentState {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(SWEP_ENROLLMENT_KEY);
  if (value === 'yes' || value === 'no') return value;
  return null;
}

function readFabDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SWEP_FAB_DISMISSED_KEY) === '1';
}

function readSessionDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SWEP_SHEET_SESSION_KEY) === '1';
}

export function useSwepEnrollment() {
  const enrollment = useSyncExternalStore(subscribe, readEnrollment, () => null);
  const fabDismissed = useSyncExternalStore(subscribe, readFabDismissed, () => false);
  const sessionDismissed = useSyncExternalStore(subscribe, readSessionDismissed, () => false);

  const persist = useCallback((value: SwepEnrollment) => {
    localStorage.setItem(SWEP_ENROLLMENT_KEY, value);
    emit();
  }, []);

  const dismissSheetForSession = useCallback(() => {
    sessionStorage.setItem(SWEP_SHEET_SESSION_KEY, '1');
    emit();
  }, []);

  const dismissFab = useCallback(() => {
    localStorage.setItem(SWEP_FAB_DISMISSED_KEY, '1');
    emit();
  }, []);

  return {
    enrollment,
    showSheet: enrollment === null && !sessionDismissed,
    showFab: enrollment === 'no' && !fabDismissed,
    accept: () => persist('yes'),
    decline: () => persist('no'),
    dismissSheetForSession,
    dismissFab,
  };
}
