import React, { ReactNode } from 'react';
import { useAppReview } from '@/hooks/useAppReview';

export interface ReviewGuardProps {
  /**
   * Component or UI rendered when the current Operating System is under review.
   */
  inReviewContent?: ReactNode;
  /**
   * Component or UI rendered when the current Operating System is NOT in review (production mode).
   */
  productionContent?: ReactNode;
  /**
   * Default children rendered if productionContent is not explicitly provided.
   */
  children?: ReactNode;
}

/**
 * Conditionally switches between review-safe content and standard production content
 * based on the Operating System's review status.
 *
 * @example
 * ```tsx
 * <ReviewGuard
 *   inReviewContent={<SimpleDemoBanner />}
 *   productionContent={<PaywallSubscriptionPrompt />}
 * />
 * ```
 */
export function ReviewGuard({ inReviewContent, productionContent, children }: ReviewGuardProps) {
  const { inReview } = useAppReview();

  if (inReview) {
    return inReviewContent ? <>{inReviewContent}</> : null;
  }

  return productionContent ? <>{productionContent}</> : children ? <>{children}</> : null;
}

export interface ReviewConditionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children ONLY when the current OS is in review mode.
 *
 * @example
 * ```tsx
 * <InReview>
 *   <Text>Free evaluation mode for App Store review</Text>
 * </InReview>
 * ```
 */
export function InReview({ children, fallback = null }: ReviewConditionProps) {
  const { inReview } = useAppReview();
  return inReview ? <>{children}</> : <>{fallback}</>;
}

/**
 * Renders children ONLY when the current OS is NOT in review mode (i.e. standard production live mode).
 *
 * @example
 * ```tsx
 * <NotInReview>
 *   <PaymentCheckoutButton />
 * </NotInReview>
 * ```
 */
export function NotInReview({ children, fallback = null }: ReviewConditionProps) {
  const { inReview } = useAppReview();
  return !inReview ? <>{children}</> : <>{fallback}</>;
}

export interface ReviewHiddenProps {
  /**
   * Unique identifier for the component (e.g. 'subscription_paywall', 'external_payment')
   */
  componentTag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally hides children if the specified component tag is marked as hidden
 * in the active OS review configuration.
 *
 * @example
 * ```tsx
 * <ReviewHidden componentTag="subscription_paywall" fallback={<FreeAccessBadge />}>
 *   <PurchaseSubscriptionButton />
 * </ReviewHidden>
 * ```
 */
export function ReviewHidden({ componentTag, children, fallback = null }: ReviewHiddenProps) {
  const { isComponentHidden } = useAppReview();
  const hidden = isComponentHidden(componentTag);

  if (hidden) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ReviewGuard;
