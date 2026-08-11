"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAccountDeletion = exports.forgotPassword = exports.appleAuth = exports.googleAuth = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("firebase-admin/auth");
const user_model_1 = __importDefault(require("../models/user.model"));
const token_util_1 = require("../utils/token.util");
const email_util_1 = require("../utils/email.util");
const notification_service_1 = require("../services/notification.service");
/**
 * Register a new user
 */
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, level } = req.body;
        const name = `${firstName} ${lastName}`;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Email is already registered.' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await user_model_1.default.create({
            email,
            password: hashedPassword,
            name,
            firstName,
            lastName,
            level: level || 'beginner',
        });
        const token = (0, token_util_1.generateToken)({ id: newUser.id, role: newUser.role });
        try {
            await (0, email_util_1.sendEmail)({
                to: email,
                subject: 'Welcome to SabiLearn!',
                html: `<p>Hi ${firstName},</p><p>Welcome to SabiLearn! Your account has been created successfully. Start exploring courses and ace your exams.</p>`,
            });
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        // Fire-and-forget: the account exists, so a failed nudge must not fail signup.
        void (0, notification_service_1.sendWelcomeNotification)(newUser);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                level: newUser.level,
                role: newUser.role,
                settings: newUser.settings,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
/**
 * Login user with email & password
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email }).select('+password');
        if (!user || !user.password) {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
            return;
        }
        const token = (0, token_util_1.generateToken)({ id: user.id, role: user.role });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                level: user.level,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
/**
 * Get current user profile
 */
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phone: req.user.phone,
                bio: req.user.bio,
                avatar: req.user.avatar,
                level: req.user.level,
                role: req.user.role,
                firebaseUid: req.user.firebaseUid,
                settings: req.user.settings || {
                    emailNotifications: true,
                    pushNotifications: false,
                    weeklyProgress: true,
                    language: 'en',
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
/**
 * Google OAuth login — verifies Firebase ID token and syncs user to MongoDB
 */
const googleAuth = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
            return;
        }
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        if (!email) {
            res.status(400).json({ success: false, message: 'Google account must have an email address.' });
            return;
        }
        let user = await user_model_1.default.findOne({ $or: [{ firebaseUid: uid }, { email }] });
        if (!user) {
            const displayName = name || email.split('@')[0];
            const firstName = name ? name.split(' ')[0] : '';
            const lastName = name ? name.split(' ').slice(1).join(' ') : '';
            user = await user_model_1.default.create({
                email,
                name: displayName,
                firstName,
                lastName,
                avatar: picture || '',
                firebaseUid: uid,
                level: 'beginner',
                role: 'user',
            });
            // Only on first sign-in — returning users take the branch below.
            void (0, notification_service_1.sendWelcomeNotification)(user);
        }
        else {
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
            }
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            await user.save();
        }
        const token = (0, token_util_1.generateToken)({ id: user.id, role: user.role });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                level: user.level,
                role: user.role,
                avatar: user.avatar,
                firebaseUid: user.firebaseUid,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.googleAuth = googleAuth;
/**
 * Apple OAuth login — verifies Firebase ID token (from Apple sign-in) and syncs user to MongoDB
 */
const appleAuth = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
            return;
        }
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        if (!email) {
            res.status(400).json({ success: false, message: 'Apple account must have an email address.' });
            return;
        }
        let user = await user_model_1.default.findOne({ $or: [{ firebaseUid: uid }, { email }] });
        if (!user) {
            const displayName = name || email.split('@')[0];
            const firstName = name ? name.split(' ')[0] : '';
            const lastName = name ? name.split(' ').slice(1).join(' ') : '';
            user = await user_model_1.default.create({
                email,
                name: displayName,
                firstName,
                lastName,
                avatar: picture || '',
                firebaseUid: uid,
                level: 'beginner',
                role: 'user',
            });
            // Only on first sign-in — returning users take the branch below.
            void (0, notification_service_1.sendWelcomeNotification)(user);
        }
        else {
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
            }
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            await user.save();
        }
        const token = (0, token_util_1.generateToken)({ id: user.id, role: user.role });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                level: user.level,
                role: user.role,
                avatar: user.avatar,
                firebaseUid: user.firebaseUid,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.appleAuth = appleAuth;
/**
 * Forgot password — sends a Firebase password reset link via email
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            res.status(400).json({ success: false, message: 'A valid email address is required.' });
            return;
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            res.status(200).json({ success: true, message: 'If an account exists for that email, a password reset link has been sent.' });
            return;
        }
        const link = await (0, auth_1.getAuth)().generatePasswordResetLink(email);
        try {
            await (0, email_util_1.sendEmail)({
                to: email,
                subject: 'Reset your SabiLearn password',
                html: `<p>You requested a password reset for your SabiLearn account.</p><p>Click <a href="${link}">here</a> to reset your password.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
            });
        }
        catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }
        res.status(200).json({ success: true, message: 'If an account exists for that email, a password reset link has been sent.' });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Request account deletion via email (for Play Store web requirement)
 */
const requestAccountDeletion = async (req, res, next) => {
    try {
        const { email, reason } = req.body;
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            res.status(400).json({ success: false, message: 'A valid email address is required.' });
            return;
        }
        const user = await user_model_1.default.findOne({ email });
        if (user) {
            try {
                await (0, email_util_1.sendEmail)({
                    to: email,
                    subject: 'Account Deletion Request Received - SabiLearn',
                    html: `<p>Hi ${user.firstName || user.name || 'there'},</p>
                 <p>We received a request to delete your SabiLearn account associated with this email address.</p>
                 <p><strong>Reason provided:</strong> ${reason ? String(reason) : 'None provided'}</p>
                 <p>If you wish to proceed immediately, you can log in to your account on our website and confirm deletion directly. Otherwise, our team will process your deletion request within 7 business days.</p>
                 <p>If you did not request this deletion, please log into your account immediately and change your password.</p>
                 <p>Best regards,<br/>SabiLearn Privacy Team</p>`,
                });
            }
            catch (emailError) {
                console.error('Failed to send deletion request email:', emailError);
            }
        }
        res.status(200).json({
            success: true,
            message: 'If an account exists for that email, account deletion instructions have been sent.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.requestAccountDeletion = requestAccountDeletion;
