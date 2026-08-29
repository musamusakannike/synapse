import { useAppReviewStore } from '@/store/appReview.store';

/**
 * Hook for reading and reacting to OS-based App Review state.
 *
 * @example
 * ```tsx
 * const { inReview, isComponentHidden } = useAppReview();
 *
 * if (inReview) {
 *   return <ReviewAlternativeBanner />;
 * }
 * ```
 */
export function useAppReview() {
  const inReview = useAppReviewStore((s) => (s.devOverride !== null ? s.devOverride : s.inReview));
  const iosInReview = useAppReviewStore((s) => s.iosInReview);
  const androidInReview = useAppReviewStore((s) => s.androidInReview);
  const isLoading = useAppReviewStore((s) => s.isLoading);
  const isInitialized = useAppReviewStore((s) => s.isInitialized);
  const os = useAppReviewStore((s) => s.os);
  const config = useAppReviewStore((s) => s.config);
  const hiddenComponents = useAppReviewStore((s) => s.hiddenComponents);
  const isComponentHidden = useAppReviewStore((s) => s.isComponentHidden);
  const refresh = useAppReviewStore((s) => s.fetchReviewStatus);
  const setDevOverride = useAppReviewStore((s) => s.setDevOverride);

  return {
    inReview,
    iosInReview,
    androidInReview,
    isLoading,
    isInitialized,
    os,
    config,
    hiddenComponents,
    isComponentHidden,
    refresh,
    setDevOverride,
  };
}

export default useAppReview;
