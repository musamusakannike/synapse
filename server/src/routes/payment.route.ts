import { Router } from 'express';
import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  initializeCoursePurchase,
  initializeSubscription,
  verifyReference,
  getMyPaymentStatus,
  handleWebhook,
} from '../controllers/payment.controller';

const router = Router();

// Registered with express.raw() so the handler gets the exact bytes Paystack signed;
// express.json() elsewhere would parse/re-serialize the body and break signature verification.
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/courses/:courseId/initialize', protect, initializeCoursePurchase);
router.post('/subscription/initialize', protect, initializeSubscription);
router.get('/verify/:reference', protect, verifyReference);
router.get('/me', protect, getMyPaymentStatus);

export default router;
