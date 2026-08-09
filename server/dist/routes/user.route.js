"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_validation_1 = require("../validations/user.validation");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed.'));
        }
    },
});
router.get('/me', auth_middleware_1.protect, user_controller_1.getProfile);
router.delete('/me', auth_middleware_1.protect, user_controller_1.deleteMyAccount);
router.put('/me', auth_middleware_1.protect, user_validation_1.validateUpdateProfile, user_controller_1.updateProfile);
router.put('/me/settings', auth_middleware_1.protect, user_validation_1.validateUpdateSettings, user_controller_1.updateSettings);
router.post('/me/push-token', auth_middleware_1.protect, user_controller_1.savePushToken);
router.delete('/me/push-token', auth_middleware_1.protect, user_controller_1.removePushToken);
router.post('/me/avatar', auth_middleware_1.protect, upload.single('avatar'), user_controller_1.uploadAvatar);
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), user_controller_1.getAllUsers);
router.put('/:id/role', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), user_validation_1.validateUpdateRole, user_controller_1.updateUserRole);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), user_controller_1.deleteUser);
exports.default = router;
