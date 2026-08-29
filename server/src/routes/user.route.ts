import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, uploadAvatar, getAllUsers, updateUserRole, deleteUser, deleteMyAccount, updateSettings, savePushToken, removePushToken } from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateUpdateProfile, validateUpdateRole, validateUpdateSettings } from '../validations/user.validation';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

router.get('/me', protect, getProfile);
router.delete('/me', protect, deleteMyAccount);
router.put('/me', protect, validateUpdateProfile, updateProfile);
router.put('/me/settings', protect, validateUpdateSettings, updateSettings);
router.patch('/me/settings', protect, validateUpdateSettings, updateSettings);
router.post('/me/push-token', protect, savePushToken);
router.delete('/me/push-token', protect, removePushToken);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/role', protect, authorize('admin'), validateUpdateRole, updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
