import { Router } from 'express';
import { register, login, getMe, googleAuth, appleAuth, forgotPassword, requestAccountDeletion } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateRegister, validateLogin, validateForgotPassword, validateRequestAccountDeletion } from '../validations/auth.validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/request-account-deletion', validateRequestAccountDeletion, requestAccountDeletion);
router.get('/me', protect, getMe);

export default router;

