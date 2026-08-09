import { Router } from 'express';
import multer from 'multer';
import {
  getBlogPosts,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blog.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validateCreateBlogPost, validateUpdateBlogPost } from '../validations/blog.validation';
import { validatePagination } from '../validations/pagination.validation';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

router.get('/', validatePagination, getBlogPosts);
router.get('/categories', getBlogCategories);
router.get('/slug/:slug', getBlogPostBySlug);
router.get('/:id', protect, authorize('admin'), getBlogPostById);
router.post('/', protect, authorize('admin'), upload.single('coverImage'), validateCreateBlogPost, createBlogPost);
router.put('/:id', protect, authorize('admin'), upload.single('coverImage'), validateUpdateBlogPost, updateBlogPost);
router.delete('/:id', protect, authorize('admin'), deleteBlogPost);

export default router;
