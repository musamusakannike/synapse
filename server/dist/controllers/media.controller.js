"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = void 0;
const r2_util_1 = require("../utils/r2.util");
const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80);
const uploadMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded.' });
            return;
        }
        const kind = req.file.mimetype.startsWith('video/') ? 'videos' : 'images';
        const fileKey = `topics/${kind}/${Date.now()}-${sanitizeFileName(req.file.originalname)}`;
        const url = await (0, r2_util_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
        res.status(201).json({
            success: true,
            data: {
                url,
                key: fileKey,
                type: kind === 'videos' ? 'video' : 'image',
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadMedia = uploadMedia;
