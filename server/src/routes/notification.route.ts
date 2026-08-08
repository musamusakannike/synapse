import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, createNotification, deleteNotification } from '../controllers/notification.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateCreateNotification } from '../validations/notification.validation';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/', protect, authorize('admin'), validateCreateNotification, createNotification);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

export default router;
