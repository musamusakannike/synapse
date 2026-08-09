"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protectFirebase = exports.protect = void 0;
const auth_1 = require("firebase-admin/auth");
const token_util_1 = require("../utils/token.util");
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * Middleware to protect routes using local JWT authentication.
 */
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
            return;
        }
        try {
            const decoded = (0, token_util_1.verifyToken)(token);
            const user = await user_model_1.default.findById(decoded.id);
            if (!user) {
                res.status(401).json({ success: false, message: 'User associated with this token not found.' });
                return;
            }
            req.user = user;
            next();
        }
        catch (err) {
            res.status(401).json({ success: false, message: 'Not authorized, token verification failed.' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
/**
 * Middleware to protect routes using Firebase ID Token authentication.
 * Syncs the authenticated Firebase user with MongoDB representation.
 */
const protectFirebase = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized, no Firebase token provided.' });
            return;
        }
        try {
            const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(token);
            req.firebaseUser = decodedToken;
            // Sync or lookup the user in MongoDB
            let user = await user_model_1.default.findOne({ firebaseUid: decodedToken.uid });
            if (!user && decodedToken.email) {
                user = await user_model_1.default.create({
                    email: decodedToken.email,
                    name: decodedToken.name || 'Firebase User',
                    firebaseUid: decodedToken.uid,
                    role: 'user',
                });
            }
            if (user) {
                req.user = user;
            }
            next();
        }
        catch (err) {
            res.status(401).json({ success: false, message: 'Not authorized, Firebase token verification failed.' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protectFirebase = protectFirebase;
/**
 * Middleware to restrict access to specific roles.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Access forbidden: Insufficient permissions.' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
