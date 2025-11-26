const { Expo } = require('expo-server-sdk');
const User = require('../models/user.model');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send a push notification to a specific user
 * @param {string} userId - The user ID to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload (optional)
 */
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    // Find user and get their push token
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) {
      console.log(`User ${userId} not found or no push token available`);
      return { success: false, reason: 'No push token' };
    }

    // Check if the token is a valid Expo push token
    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.log(`Invalid Expo push token for user ${userId}: ${user.expoPushToken}`);
      return { success: false, reason: 'Invalid push token' };
    }

    // Create the notification message
    const message = {
      to: user.expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    };

    // Send the notification
    const tickets = await expo.sendPushNotificationsAsync([message]);
    
    // Handle the response
    if (tickets && tickets.length > 0) {
      const ticket = tickets[0];
      
      if (ticket.status === 'ok') {
        console.log(`Notification sent successfully to user ${userId}`);
        return { success: true, ticket };
      } else if (ticket.status === 'error') {
        console.error(`Notification error for user ${userId}:`, ticket.message);
        
        // If the token is no longer valid, clear it from the user
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await User.findByIdAndUpdate(userId, {
            $unset: { expoPushToken: 1, expoPushTokenUpdatedAt: 1 }
          });
          console.log(`Cleared invalid push token for user ${userId}`);
        }
        
        return { success: false, reason: ticket.message };
      }
    }

    return { success: false, reason: 'Unknown error' };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, reason: error.message };
  }
}

/**
 * Send a course generation started notification
 * @param {string} userId - The user ID
 * @param {string} courseTitle - The title of the course being generated
 */
async function sendCourseGenerationStartedNotification(userId, courseTitle) {
  return await sendPushNotification(
    userId,
    'Course Generation Started',
    `Your course "${courseTitle}" is being generated. We'll notify you when it's ready!`,
    {
      type: 'course_generation_started',
      courseTitle,
    }
  );
}

/**
 * Send a course generation completed notification
 * @param {string} userId - The user ID
 * @param {string} courseTitle - The title of the completed course
 * @param {string} courseId - The ID of the completed course
 */
async function sendCourseGenerationCompletedNotification(userId, courseTitle, courseId) {
  return await sendPushNotification(
    userId,
    'Course Ready!',
    `Your course "${courseTitle}" has been generated successfully. Tap to view it!`,
    {
      type: 'course_generation_completed',
      courseTitle,
      courseId,
    }
  );
}

/**
 * Batch send notifications to multiple users
 * @param {Array} notifications - Array of { userId, title, body, data } objects
 */
async function sendBatchPushNotifications(notifications) {
  try {
    // Get all users and their tokens
    const userIds = notifications.map(n => n.userId);
    const users = await User.find({ _id: { $in: userIds }, expoPushToken: { $exists: true } });
    
    // Create a map of userId to user data
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // Prepare messages
    const messages = [];
    for (const notification of notifications) {
      const user = userMap[notification.userId];
      if (!user || !user.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
        continue;
      }

      messages.push({
        to: user.expoPushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: 'high',
      });
    }

    if (messages.length === 0) {
      return { success: false, reason: 'No valid tokens found' };
    }

    // Send batch notifications
    const tickets = await expo.sendPushNotificationsAsync(messages);
    
    // Handle responses and clean up invalid tokens
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const notification = notifications[i];
      
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        await User.findByIdAndUpdate(notification.userId, {
          $unset: { expoPushToken: 1, expoPushTokenUpdatedAt: 1 }
        });
      }
    }

    return { success: true, tickets };
  } catch (error) {
    console.error('Error sending batch push notifications:', error);
    return { success: false, reason: error.message };
  }
}

module.exports = {
  sendPushNotification,
  sendCourseGenerationStartedNotification,
  sendCourseGenerationCompletedNotification,
  sendBatchPushNotifications,
};
