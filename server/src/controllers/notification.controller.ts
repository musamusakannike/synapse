import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import Notification from '../models/notification.model';
import { notify } from '../services/notification.service';

export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Anything still queued for a future send must stay hidden until it fires,
    // or a scheduled maintenance warning shows up in the list days early.
    const notifications = await Notification.find({
      $or: [{ user: userId }, { user: null }],
      $and: [{ $or: [{ scheduledFor: null }, { scheduledFor: { $lte: new Date() } }] }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    await Notification.updateMany(
      { $or: [{ user: userId }, { user: null }], isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, type, category, title, message, actionUrl, data, dedupeKey, scheduledFor } = req.body;

    const result = await notify({
      user: user || null,
      type,
      category: category || 'system',
      title,
      message,
      actionUrl,
      data,
      dedupeKey,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    });

    if (!result.notification) {
      res.status(500).json({ success: false, message: 'Failed to create notification.' });
      return;
    }

    if (!result.created) {
      res.status(409).json({
        success: false,
        message: 'A notification with this dedupeKey already exists.',
        data: result.notification,
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: result.notification,
      delivered: result.delivered,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
