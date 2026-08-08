import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { uploadToR2 } from '../utils/r2.util';

interface MulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80);

export const uploadMedia = async (req: MulterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const kind = req.file.mimetype.startsWith('video/') ? 'videos' : 'images';
    const fileKey = `topics/${kind}/${Date.now()}-${sanitizeFileName(req.file.originalname)}`;
    const url = await uploadToR2(req.file.buffer, fileKey, req.file.mimetype);

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
  } catch (error) {
    next(error);
  }
};
