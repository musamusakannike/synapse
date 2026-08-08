import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/user.model';
import { connectDB } from '../config/db.config';

/**
 * One-off backfill for the notification/streak fields.
 *
 * Schema defaults only apply to newly created documents, so accounts that
 * existed before those fields were added still carry the old values — most
 * importantly `settings.pushNotifications: false`, which silently suppressed
 * every push for users who had already granted OS permission.
 *
 * Safe to re-run: each step only touches documents still missing the field.
 */
const migrate = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('Backfilling notification preferences...');
    const prefs = await User.updateMany(
      { 'settings.studyReminders': { $exists: false } },
      {
        $set: {
          'settings.studyReminders': true,
          'settings.streakAlerts': true,
          'settings.reminderHour': 19,
          'settings.reminderMinute': 0,
          'settings.timezoneOffset': 0,
        },
      }
    );
    console.log(`  ${prefs.modifiedCount} users updated`);

    // Only flips users who never made an explicit choice — anyone who has a
    // push token but is stored as false was defaulted off, not opted out.
    console.log('Enabling push for users defaulted off...');
    const push = await User.updateMany(
      { 'settings.pushNotifications': false, expoPushToken: { $exists: true, $ne: '' } },
      { $set: { 'settings.pushNotifications': true } }
    );
    console.log(`  ${push.modifiedCount} users updated`);

    console.log('Backfilling streak fields...');
    const streaks = await User.updateMany(
      { currentStreak: { $exists: false } },
      {
        $set: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: null,
          totalStudyDays: 0,
        },
      }
    );
    console.log(`  ${streaks.modifiedCount} users updated`);

    console.log('\nMigration completed successfully.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrate();
