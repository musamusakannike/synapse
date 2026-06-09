/**
 * Database repair script for cloned course lesson references.
 *
 * Find all courses that were cloned (have `clonedFrom`),
 * find their cloned lessons, and map the course outline's
 * `generatedLessonId` fields to point to the cloned lessons instead
 * of the original creator's lessons.
 *
 * Usage:
 *   node --env-file-if-exists=.env.local scripts/repair-cloned-courses.mjs
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "sabilearn";

if (!uri) {
  console.error(
    "MONGODB_URI is not defined. Set it in .env.local or pass it inline, e.g.\n" +
      "  MONGODB_URI=mongodb://localhost:27017 node scripts/repair-cloned-courses.mjs"
  );
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to database "${dbName}". Identifying cloned courses needing repair...`);

  // Find all courses that are clones (i.e. clonedFrom exists)
  const clonedCourses = await db.collection("courses").find({
    clonedFrom: { $exists: true, $ne: null }
  }).toArray();

  console.log(`Found ${clonedCourses.length} cloned course(s) to inspect.`);

  let repairedCount = 0;
  let skippedCount = 0;

  for (const course of clonedCourses) {
    const courseIdStr = course._id.toString();
    const originalCourseIdStr = course.clonedFrom;

    console.log(`\nInspecting course "${course.title}" (ID: ${courseIdStr}) cloned from (ID: ${originalCourseIdStr})`);

    // Get original lessons
    const originalLessons = await db.collection("lessons").find({ courseId: originalCourseIdStr }).toArray();
    // Get cloned lessons
    const clonedLessons = await db.collection("lessons").find({ courseId: courseIdStr }).toArray();

    console.log(`  - Original lessons count: ${originalLessons.length}`);
    console.log(`  - Cloned lessons count: ${clonedLessons.length}`);

    if (originalLessons.length === 0 || clonedLessons.length === 0) {
      console.log(`  - Skipping: no lessons found for original or cloned course.`);
      skippedCount++;
      continue;
    }

    // Create a map to match original lessons to cloned lessons by module & lesson title
    // Key: moduleTitle + "|||" + lessonTitle
    const clonedLessonsMap = new Map();
    for (const clonedLesson of clonedLessons) {
      const key = `${clonedLesson.moduleTitle.trim()}|||${clonedLesson.lessonTitle.trim()}`;
      clonedLessonsMap.set(key, clonedLesson._id.toString());
    }

    // Map original lesson ID -> cloned lesson ID
    const lessonIdMap = {};
    for (const origLesson of originalLessons) {
      const key = `${origLesson.moduleTitle.trim()}|||${origLesson.lessonTitle.trim()}`;
      if (clonedLessonsMap.has(key)) {
        lessonIdMap[origLesson._id.toString()] = clonedLessonsMap.get(key);
      }
    }

    // Check course outline and update generatedLessonIds
    let updated = false;
    let totalUpdatedIds = 0;

    if (course.outline && course.outline.modules) {
      const updatedModules = course.outline.modules.map((mod) => {
        if (!mod.lessons) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map((lesson) => {
            const oldId = lesson.generatedLessonId;
            if (oldId && lessonIdMap[oldId]) {
              const newId = lessonIdMap[oldId];
              if (oldId !== newId) {
                console.log(`    Mapping lesson "${lesson.title}": ${oldId} -> ${newId}`);
                totalUpdatedIds++;
                updated = true;
                return {
                  ...lesson,
                  generatedLessonId: newId
                };
              }
            }
            return lesson;
          })
        };
      });

      if (updated) {
        await db.collection("courses").updateOne(
          { _id: course._id },
          { $set: { "outline.modules": updatedModules } }
        );
        console.log(`  ✓ Successfully updated outline for "${course.title}" with ${totalUpdatedIds} mapped lesson ID(s).`);
        repairedCount++;
      } else {
        console.log(`  - Already up to date (no lesson ID mappings needed).`);
        skippedCount++;
      }
    } else {
      console.log(`  - Skipping: course outline structure is missing or invalid.`);
      skippedCount++;
    }
  }

  await client.close();
  console.log(`\nMaintenance run complete:`);
  console.log(`  - Total cloned courses inspected: ${clonedCourses.length}`);
  console.log(`  - Total courses repaired: ${repairedCount}`);
  console.log(`  - Total courses skipped/correct: ${skippedCount}`);
}

main().catch((error) => {
  console.error("Repair run failed:", error);
  process.exit(1);
});
