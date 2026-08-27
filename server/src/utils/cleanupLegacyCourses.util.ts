import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import Topic from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import UserProgress from '../models/userProgress.model';
import { connectDB } from '../config/db.config';

/**
 * Cleanup script to identify and delete courses from the database
 * that do not conform to the current course structure (e.g. missing chapters,
 * orphaned topics, incompatible legacy schema), and cascade-deletes all
 * child documents (chapters, topics, flashcards, MCQs, progress).
 */
const cleanupLegacyCourses = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('\n========================================');
    console.log(' Starting Course Structure Audit & Clean');
    console.log('========================================\n');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} total course(s) in database.\n`);

    let keptCount = 0;
    let deletedCount = 0;

    for (const course of courses) {
      const courseId = course._id.toString();
      const chapters = await Chapter.find({ course: course._id });
      const topics = await Topic.find({ course: course._id });

      console.log(`\n--- Inspecting Course: "${course.title}" (ID: ${courseId}) ---`);
      console.log(`  - Chapters count: ${chapters.length}`);
      console.log(`  - Topics count: ${topics.length}`);
      console.log(`  - Category: ${course.category || 'N/A'}, Difficulty: ${course.difficulty || 'N/A'}`);
      console.log(`  - isFree: ${course.isFree}, Price: ${course.price}`);
      console.log(`  - Authors count: ${course.authors?.length || 0}`);

      // Criteria for modern course structure:
      // 1. Must have at least 1 Chapter.
      // 2. All topics in the course should ideally belong to a valid chapter of this course.
      // 3. Must have valid title, category, difficulty.
      const hasChapters = chapters.length > 0;
      
      // Check if any topics have invalid chapter references
      const chapterIdSet = new Set(chapters.map((c) => c._id.toString()));
      const unassignedTopics = topics.filter((t) => !t.chapter || !chapterIdSet.has(t.chapter.toString()));

      // A course is considered legacy/invalid if it has NO chapters
      // or if it has topics but 0 chapters (old flat course model)
      const isLegacy = !hasChapters;

      if (isLegacy) {
        console.log(`  ❌ INVALID/LEGACY STRUCTURE: Course has ${chapters.length} chapters.`);
        console.log(`     -> Deleting course "${course.title}" and cascading related data...`);

        // Find all topic IDs for this course
        const topicIds = topics.map((t) => t._id);

        // Delete child flashcards & MCQs
        if (topicIds.length > 0) {
          const fcResult = await Flashcard.deleteMany({ topic: { $in: topicIds } });
          const mcqResult = await MCQ.deleteMany({ topic: { $in: topicIds } });
          console.log(`     - Deleted ${fcResult.deletedCount} associated flashcard(s)`);
          console.log(`     - Deleted ${mcqResult.deletedCount} associated MCQ(s)`);
        }

        // Delete child topics
        const topicResult = await Topic.deleteMany({ course: course._id });
        console.log(`     - Deleted ${topicResult.deletedCount} associated topic(s)`);

        // Delete child chapters (if any)
        const chapterResult = await Chapter.deleteMany({ course: course._id });
        console.log(`     - Deleted ${chapterResult.deletedCount} associated chapter(s)`);

        // Delete user progress
        const progResult = await UserProgress.deleteMany({ course: course._id });
        console.log(`     - Deleted ${progResult.deletedCount} associated user progress record(s)`);

        // Delete the course itself
        await Course.findByIdAndDelete(course._id);
        console.log(`     ✓ Successfully removed course: "${course.title}"`);
        deletedCount++;
      } else {
        console.log(`  ✓ VALID STRUCTURE: Course has ${chapters.length} chapter(s) and ${topics.length} topic(s).`);
        if (unassignedTopics.length > 0) {
          console.log(`    Note: ${unassignedTopics.length} topic(s) were unassigned to chapters; assigning to Chapter 1 ("${chapters[0].title}")...`);
          for (const uTopic of unassignedTopics) {
            await Topic.findByIdAndUpdate(uTopic._id, { chapter: chapters[0]._id });
          }
          console.log(`    ✓ Reassigned unassigned topics to Chapter 1.`);
        }
        keptCount++;
      }
    }

    // Step 2: Cleanup any orphaned chapters or topics referencing non-existent courses
    console.log('\n--- Checking for Orphaned Chapters & Topics ---');
    const existingCourseIds = (await Course.find({}, '_id')).map((c) => c._id);

    const orphanedChapters = await Chapter.deleteMany({ course: { $nin: existingCourseIds } });
    console.log(`Deleted ${orphanedChapters.deletedCount} orphaned chapter(s) with invalid course reference.`);

    const orphanedTopics = await Topic.deleteMany({ course: { $nin: existingCourseIds } });
    console.log(`Deleted ${orphanedTopics.deletedCount} orphaned topic(s) with invalid course reference.`);

    const existingTopicIds = (await Topic.find({}, '_id')).map((t) => t._id);
    const orphanedFlashcards = await Flashcard.deleteMany({ topic: { $nin: existingTopicIds } });
    console.log(`Deleted ${orphanedFlashcards.deletedCount} orphaned flashcard(s).`);

    const orphanedMcqs = await MCQ.deleteMany({ topic: { $nin: existingTopicIds } });
    console.log(`Deleted ${orphanedMcqs.deletedCount} orphaned MCQ(s).`);

    const orphanedProgress = await UserProgress.deleteMany({ course: { $nin: existingCourseIds } });
    console.log(`Deleted ${orphanedProgress.deletedCount} orphaned user progress records.`);

    console.log('\n========================================');
    console.log(` Audit & Cleanup Completed!`);
    console.log(` - Valid Courses Kept: ${keptCount}`);
    console.log(` - Legacy Courses Deleted: ${deletedCount}`);
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupLegacyCourses();
