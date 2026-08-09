"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.getMyPaymentStatus = exports.verifyReference = exports.initializeManualSubscription = exports.initializeSubscription = exports.initializeCoursePurchase = void 0;
const crypto_1 = __importDefault(require("crypto"));
const course_model_1 = __importDefault(require("../models/course.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const subscription_util_1 = require("../utils/subscription.util");
const paystack_service_1 = require("../services/paystack.service");
const generateReference = (prefix) => `${prefix}_${crypto_1.default.randomBytes(12).toString('hex')}`;
/** Web sends its own callback route; mobile (deep link) will override via req.body.callbackUrl. */
const resolveCallbackUrl = (req) => {
    const override = req.body?.callbackUrl;
    if (typeof override === 'string' && override.length > 0)
        return override;
    const base = process.env.CLIENT_URL;
    return base ? `${base}/dashboard/checkout/callback` : undefined;
};
const initializeCoursePurchase = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const user = req.user;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        if (course.isFree) {
            res.status(400).json({ success: false, message: 'This course is free and does not require purchase.' });
            return;
        }
        const existingPurchase = await transaction_model_1.default.findOne({
            user: user._id,
            course: course._id,
            type: 'course_purchase',
            status: 'success',
        });
        if (existingPurchase) {
            res.status(400).json({ success: false, message: 'You already have access to this course.' });
            return;
        }
        const reference = generateReference('course');
        const transaction = await transaction_model_1.default.create({
            user: user._id,
            reference,
            type: 'course_purchase',
            course: course._id,
            amount: course.price,
            status: 'pending',
        });
        const paystackRes = await (0, paystack_service_1.initializeTransaction)({
            email: user.email,
            amount: course.price,
            reference,
            callback_url: resolveCallbackUrl(req),
            metadata: {
                userId: String(user._id),
                courseId: String(course._id),
                type: 'course_purchase',
            },
        });
        res.status(200).json({
            success: true,
            data: {
                authorizationUrl: paystackRes.data.authorization_url,
                accessCode: paystackRes.data.access_code,
                reference: transaction.reference,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.initializeCoursePurchase = initializeCoursePurchase;
const initializeSubscription = async (req, res, next) => {
    try {
        const user = req.user;
        const planCode = process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE;
        const amount = Number(process.env.SUBSCRIPTION_AMOUNT_KOBO);
        if (!planCode || !amount) {
            res.status(500).json({ success: false, message: 'Subscription plan is not configured.' });
            return;
        }
        const existingSub = await subscription_model_1.default.findOne({ user: user._id });
        if ((0, subscription_util_1.isSubscriptionActive)(existingSub)) {
            res.status(400).json({ success: false, message: 'You already have an active subscription.' });
            return;
        }
        const reference = generateReference('sub');
        await transaction_model_1.default.create({
            user: user._id,
            reference,
            type: 'subscription',
            billingType: 'recurring',
            amount,
            status: 'pending',
        });
        const paystackRes = await (0, paystack_service_1.initializeTransaction)({
            email: user.email,
            amount,
            reference,
            plan: planCode,
            callback_url: resolveCallbackUrl(req),
            metadata: {
                userId: String(user._id),
                type: 'subscription',
            },
        });
        res.status(200).json({
            success: true,
            data: {
                authorizationUrl: paystackRes.data.authorization_url,
                accessCode: paystackRes.data.access_code,
                reference,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.initializeSubscription = initializeSubscription;
/**
 * Bank transfer / USSD-friendly alternative to the card-only recurring plan above —
 * most entry-level Nigerian students don't have a debit card Paystack can authorize
 * for recurring billing. This is a plain one-off charge (no `plan`, so every channel
 * Paystack has enabled is offered) that grants MANUAL_SUBSCRIPTION_DAYS of access.
 * There's no auto-renewal: the user has to come back and pay again next month.
 */
const initializeManualSubscription = async (req, res, next) => {
    try {
        const user = req.user;
        const amount = Number(process.env.SUBSCRIPTION_AMOUNT_KOBO);
        if (!amount) {
            res.status(500).json({ success: false, message: 'Subscription pricing is not configured.' });
            return;
        }
        const existingSub = await subscription_model_1.default.findOne({ user: user._id });
        if ((0, subscription_util_1.isSubscriptionActive)(existingSub)) {
            res.status(400).json({ success: false, message: 'You already have an active subscription.' });
            return;
        }
        const reference = generateReference('submanual');
        await transaction_model_1.default.create({
            user: user._id,
            reference,
            type: 'subscription',
            billingType: 'manual',
            amount,
            status: 'pending',
        });
        const paystackRes = await (0, paystack_service_1.initializeTransaction)({
            email: user.email,
            amount,
            reference,
            callback_url: resolveCallbackUrl(req),
            metadata: {
                userId: String(user._id),
                type: 'subscription',
                billingType: 'manual',
            },
        });
        res.status(200).json({
            success: true,
            data: {
                authorizationUrl: paystackRes.data.authorization_url,
                accessCode: paystackRes.data.access_code,
                reference,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.initializeManualSubscription = initializeManualSubscription;
/**
 * UX-only confirmation for the client right after checkout. The webhook remains
 * the sole source of truth for actually granting access — this just checks
 * Paystack directly so the UI isn't stuck waiting on a webhook that may be delayed.
 */
const verifyReference = async (req, res, next) => {
    try {
        const reference = String(req.params.reference);
        const transaction = await transaction_model_1.default.findOne({ reference, user: req.user._id });
        if (!transaction) {
            res.status(404).json({ success: false, message: 'Transaction not found.' });
            return;
        }
        if (transaction.status === 'pending') {
            const paystackRes = await (0, paystack_service_1.verifyTransaction)(reference);
            if (paystackRes.data.status === 'success' || paystackRes.data.status === 'failed') {
                // Reflects the latest state for the UI; the webhook independently performs the actual grant.
                transaction.status = paystackRes.data.status === 'success' ? 'success' : 'failed';
                await transaction.save();
            }
        }
        res.status(200).json({ success: true, data: { status: transaction.status, type: transaction.type } });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyReference = verifyReference;
const getMyPaymentStatus = async (req, res, next) => {
    try {
        const user = req.user;
        const subscription = await subscription_model_1.default.findOne({ user: user._id });
        const purchasedCourses = await transaction_model_1.default.find({
            user: user._id,
            type: 'course_purchase',
            status: 'success',
        }).select('course');
        // 'expired' only makes sense for the manual, non-webhook-backed billing type —
        // a recurring subscription's `status` is already kept current by Paystack's webhooks.
        const isExpiredManual = !!subscription &&
            subscription.status === 'active' &&
            subscription.billingType === 'manual' &&
            !(0, subscription_util_1.isSubscriptionActive)(subscription);
        res.status(200).json({
            success: true,
            data: {
                subscription: subscription
                    ? {
                        status: isExpiredManual ? 'expired' : subscription.status,
                        billingType: subscription.billingType,
                        currentPeriodEnd: subscription.currentPeriodEnd,
                    }
                    : { status: 'none' },
                purchasedCourseIds: purchasedCourses.map((t) => t.course),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyPaymentStatus = getMyPaymentStatus;
const handleWebhook = async (req, res) => {
    const signatureHeader = req.headers['x-paystack-signature'];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    const rawBody = req.body;
    if (!(0, paystack_service_1.verifyWebhookSignature)(rawBody, signature)) {
        res.status(401).json({ success: false, message: 'Invalid signature.' });
        return;
    }
    // Acknowledge immediately; Paystack retries on non-2xx/timeout, and we don't
    // want a slow downstream side-effect (email, push) to cause spurious retries.
    res.status(200).json({ received: true });
    let event;
    try {
        event = JSON.parse(rawBody.toString('utf8'));
    }
    catch {
        return;
    }
    try {
        switch (event.event) {
            case 'charge.success':
                await handleChargeSuccess(event.data);
                break;
            case 'subscription.create':
                await handleSubscriptionCreate(event.data);
                break;
            case 'subscription.disable':
                await handleSubscriptionDisable(event.data);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data);
                break;
            default:
                break;
        }
    }
    catch (error) {
        console.error(`[Paystack Webhook] Failed to process event ${event.event}:`, error);
    }
};
exports.handleWebhook = handleWebhook;
const handleChargeSuccess = async (data) => {
    const reference = data.reference;
    const transaction = await transaction_model_1.default.findOne({ reference });
    if (!transaction || transaction.status === 'success')
        return; // already processed (idempotency)
    transaction.status = 'success';
    transaction.paystackPayload = data;
    await transaction.save();
    if (transaction.type === 'subscription' && transaction.billingType === 'manual') {
        const existing = await subscription_model_1.default.findOne({ user: transaction.user });
        // Renewing before expiry extends from the current end date rather than from
        // "now", so paying a few days early doesn't cost the user those days.
        const base = existing?.currentPeriodEnd && existing.currentPeriodEnd.getTime() > Date.now() ? existing.currentPeriodEnd : new Date();
        const currentPeriodEnd = new Date(base.getTime() + subscription_util_1.MANUAL_SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);
        await subscription_model_1.default.findOneAndUpdate({ user: transaction.user }, {
            user: transaction.user,
            billingType: 'manual',
            status: 'active',
            currentPeriodEnd,
        }, { upsert: true });
    }
    else if (transaction.type === 'subscription') {
        // Recurring (card, Paystack Plan) charge — subscription.create carries the
        // subscription/plan codes, this just flips access on immediately.
        await subscription_model_1.default.findOneAndUpdate({ user: transaction.user }, {
            user: transaction.user,
            billingType: 'recurring',
            planCode: data.plan?.plan_code || process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE,
            paystackCustomerCode: data.customer?.customer_code,
            status: 'active',
        }, { upsert: true });
    }
    // course_purchase access is derived from Transaction.status === 'success', no further write needed.
};
const handleSubscriptionCreate = async (data) => {
    await subscription_model_1.default.findOneAndUpdate({ paystackCustomerCode: data.customer?.customer_code }, {
        paystackSubscriptionCode: data.subscription_code,
        paystackEmailToken: data.email_token,
        status: data.status === 'active' ? 'active' : 'past_due',
        currentPeriodEnd: data.next_payment_date ? new Date(data.next_payment_date) : undefined,
    });
};
const handleSubscriptionDisable = async (data) => {
    await subscription_model_1.default.findOneAndUpdate({ paystackSubscriptionCode: data.subscription_code }, { status: 'cancelled' });
};
const handleInvoicePaymentFailed = async (data) => {
    await subscription_model_1.default.findOneAndUpdate({ paystackCustomerCode: data.customer?.customer_code }, { status: 'past_due' });
};
