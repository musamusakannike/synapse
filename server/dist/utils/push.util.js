"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = sendPushNotification;
exports.sendPushToUser = sendPushToUser;
exports.sendPushToAllUsers = sendPushToAllUsers;
const expo_server_sdk_1 = __importDefault(require("expo-server-sdk"));
const user_model_1 = __importDefault(require("../models/user.model"));
const expo = new expo_server_sdk_1.default();
async function sendPushNotification(pushToken, title, body, data) {
    if (!expo_server_sdk_1.default.isExpoPushToken(pushToken)) {
        return;
    }
    const messages = [
        {
            to: pushToken,
            title,
            body,
            data,
            sound: 'default',
        },
    ];
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
        try {
            await expo.sendPushNotificationsAsync(chunk);
        }
        catch (error) {
            console.error('Failed to send push notification:', error);
        }
    }
}
async function sendPushToUser(userId, title, body, data) {
    const user = await user_model_1.default.findById(userId);
    if (!user?.expoPushToken)
        return;
    const pushEnabled = user.settings?.pushNotifications !== false;
    if (!pushEnabled)
        return;
    await sendPushNotification(user.expoPushToken, title, body, data);
}
async function sendPushToAllUsers(title, body, data) {
    const users = await user_model_1.default.find({ expoPushToken: { $ne: '', $exists: true } });
    for (const user of users) {
        const pushEnabled = user.settings?.pushNotifications !== false;
        if (pushEnabled && user.expoPushToken) {
            await sendPushNotification(user.expoPushToken, title, body, data);
        }
    }
}
