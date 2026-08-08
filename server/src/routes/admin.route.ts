import { Router } from 'express';
import { getAnalytics, getCoursePerformance, getUserGrowth, getRecentActivity } from '../controllers/admin.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/course-performance', protect, authorize('admin'), getCoursePerformance);
router.get('/user-growth', protect, authorize('admin'), getUserGrowth);
router.get('/recent-activity', protect, authorize('admin'), getRecentActivity);

export default router;
