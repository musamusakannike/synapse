import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import User from '../models/user.model';

/**
 * One-time migration: copies user accounts from the old SabiLearn prototype's
 * "synapse" database into this server's "sabilearn" database, so existing
 * accounts (email/password and Google/Apple) keep working here.
 *
 * The old app is untouched — this only reads from it. Non-user data
 * (courses, quizzes, documents, videos, payments) is intentionally NOT
 * migrated; SabiLearn's course/topic/flashcard/mcq model is unrelated to the
 * old app's AI-generated content model.
 */

interface OldUserDoc {
  _id: unknown;
  name?: string;
  email: string;
  password?: string;
  googleAuth?: boolean;
  createdAt?: Date;
}

const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

const run = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set.');
  }

  // Same cluster, old database name — swap the path segment regardless of
  // what this server's own MONGODB_URI currently points at.
  const oldUri = mongoUri.replace(/\/([^/?]*)(\?|$)/, '/synapse$2');

  console.log('Connecting to old database (read-only)...');
  const oldClient = new MongoClient(oldUri);
  await oldClient.connect();
  const oldUsers = await oldClient
    .db('synapse')
    .collection<OldUserDoc>('users')
    .find({})
    .toArray();
  console.log(`Found ${oldUsers.length} users in the old "synapse" database.`);

  console.log('Connecting to new "sabilearn" database...');
  await mongoose.connect(mongoUri);

  let inserted = 0;
  let skipped = 0;
  let withPassword = 0;
  let googleOnly = 0;

  for (const oldUser of oldUsers) {
    const email = (oldUser.email || '').toLowerCase().trim();
    if (!email) {
      skipped++;
      continue;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`  skip (already exists): ${email}`);
      skipped++;
      continue;
    }

    const name = oldUser.name || email.split('@')[0];
    const { firstName, lastName } = splitName(name);
    const hasPassword = typeof oldUser.password === 'string' && oldUser.password.length > 0;

    await User.create({
      email,
      name,
      firstName,
      lastName,
      // Already a bcrypt hash from the old app (also bcryptjs) — compatible as-is.
      ...(hasPassword ? { password: oldUser.password } : {}),
      level: 'beginner',
      role: 'user',
      // firebaseUid intentionally left unset: Google/Apple users are matched
      // and linked by email on their next sign-in (see auth.controller.ts).
      createdAt: oldUser.createdAt || new Date(),
    });

    inserted++;
    if (hasPassword) withPassword++;
    else googleOnly++;
  }

  console.log('\n========================================');
  console.log('User migration complete');
  console.log('========================================');
  console.log(`Migrated:        ${inserted} (${withPassword} email/password, ${googleOnly} Google/Apple-only)`);
  console.log(`Skipped:         ${skipped} (already existed in "sabilearn")`);
  console.log('========================================\n');

  await oldClient.close();
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
