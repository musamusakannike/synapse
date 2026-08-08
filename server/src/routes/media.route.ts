import { Router } from 'express';
import multer from 'multer';
import { uploadMedia } from '../controllers/media.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed.'));
    }
  },
});

router.post('/upload', protect, authorize('admin'), upload.single('file'), uploadMedia);

export default router;
