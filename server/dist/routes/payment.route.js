"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// Registered with express.raw() so the handler gets the exact bytes Paystack signed;
// express.json() elsewhere would parse/re-serialize the body and break signature verification.
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), payment_controller_1.handleWebhook);
router.post('/courses/:courseId/initialize', auth_middleware_1.protect, payment_controller_1.initializeCoursePurchase);
router.post('/subscription/initialize', auth_middleware_1.protect, payment_controller_1.initializeSubscription);
router.post('/subscription/manual/initialize', auth_middleware_1.protect, payment_controller_1.initializeManualSubscription);
router.get('/verify/:reference', auth_middleware_1.protect, payment_controller_1.verifyReference);
router.get('/me', auth_middleware_1.protect, payment_controller_1.getMyPaymentStatus);
exports.default = router;
