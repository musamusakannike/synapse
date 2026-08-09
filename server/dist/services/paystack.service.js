"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = exports.verifyTransaction = exports.initializeTransaction = void 0;
const crypto_1 = __importDefault(require("crypto"));
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const getSecretKey = () => {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
        throw new Error('PAYSTACK_SECRET_KEY is not configured.');
    }
    return key;
};
const paystackRequest = async (path, options = {}) => {
    const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
        method: options.method || 'GET',
        headers: {
            Authorization: `Bearer ${getSecretKey()}`,
            'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json();
    if (!response.ok || data.status === false) {
        throw new Error(data.message || 'Paystack request failed.');
    }
    return data;
};
const initializeTransaction = (params) => {
    return paystackRequest('/transaction/initialize', {
        method: 'POST',
        body: params,
    });
};
exports.initializeTransaction = initializeTransaction;
const verifyTransaction = (reference) => {
    return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
};
exports.verifyTransaction = verifyTransaction;
/**
 * Verifies the `x-paystack-signature` header against the raw request body.
 * Must be computed over the raw (unparsed) JSON body, not a re-serialized object,
 * since key ordering/whitespace differences would break the HMAC comparison.
 */
const verifyWebhookSignature = (rawBody, signature) => {
    if (!signature)
        return false;
    const hash = crypto_1.default.createHmac('sha512', getSecretKey()).update(rawBody).digest('hex');
    const hashBuffer = Buffer.from(hash);
    const signatureBuffer = Buffer.from(signature);
    if (hashBuffer.length !== signatureBuffer.length)
        return false;
    return crypto_1.default.timingSafeEqual(hashBuffer, signatureBuffer);
};
exports.verifyWebhookSignature = verifyWebhookSignature;
