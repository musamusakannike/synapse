import { Router } from 'express';
import {
  getAppReviewStatus,
  getAllAppReviews,
  updateAppReview,
  bulkUpdateAppReviews,
} from '../controllers/appReview.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint for mobile clients to query OS review status
router.get('/status', getAppReviewStatus);

// Admin-only management endpoints
router.get('/', protect, authorize('admin'), getAllAppReviews);
router.put('/:os', protect, authorize('admin'), updateAppReview);
router.put('/', protect, authorize('admin'), bulkUpdateAppReviews);

export default router;
