import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import mongoose from 'mongoose';
import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import Topic, { ITopicContent } from '../models/topic.model';
import { connectDB } from '../config/db.config';
import { formattedChapters3to7 } from './applyFormattingToRemainingChapters.util';

interface TopicData {
  title: string;
  description: string;
  order: number;
  contents: ITopicContent[];
}

interface ChapterData {
  title: string;
  description: string;
  order: number;
  topics: TopicData[];
}

// Chapter 2 data matching user's edited formatting
export const chapter2Data: ChapterData = {
  title: 'Anatomy of an Effective Prompt & Core Frameworks',
  description: 'Learn how to structure prompts so the AI never has to guess your intent.',
  order: 1,
  topics: [
    {
      title: 'The 5 Core Components of a Perfect Prompt',
      description: 'Master the 5 essential building blocks: Role, Task, Context, Constraints, and Output Format.',
      order: 0,
      contents: [
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'Why Vague Prompts Fail\n\nWhen you ask an AI a quick question like "Write a workout plan," the AI has to make a lot of guesses. It does not know who you are, what equipment you have, or how much time you want to spend. Vague instructions lead to generic, boring answers.',
            },
            {
              type: 'text',
              content:
                'Good prompt engineering is just giving the AI the missing puzzle pieces before it starts typing. When you provide clear details, the AI gives you exactly what you need on the first try.\nRemember: If you do not give the AI details, it will make wild guesses to fill in the blanks.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'Why do vague prompts like "Help me write an email" often produce poor results?',
            options: [
              {
                text: 'The AI has to guess the recipient, purpose, and tone because key details are missing',
                isCorrect: true,
              },
              {
                text: 'AI models do not know how to write emails in English',
                isCorrect: false,
              },
              {
                text: 'You must write code to send instructions to an AI',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: If you do not give the AI details, it will make wild guesses to fill in the blanks.',
          },
        },
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'The 5 Core Building Blocks\n\nEvery great prompt has 5 simple parts:\n\n1. **Role:** Who should the AI pretend to be? (e.g., "Act as a fitness coach")\n\n2. **Task:** What exact job must it do? (e.g., "Create a 3-day home workout plan")\n\n3. **Context:** What background facts does it need? (e.g., "I have 30 minutes a day and only two dumbbells")\n',
            },
            {
              type: 'text',
              content:
                'The last two parts make sure the answer looks right:\n\n4. **Constraints:** What rules must it follow? (e.g., "No jumping exercises, keep it beginner-friendly")\n\n5. **Output Format:** How should the result look? (e.g., "Show as a neat table with exercises, sets, and reps")\nRemember: Role, Task, Context, Constraints, and Format are the 5 pillars of a great prompt.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'In the prompt: "Act as a chef and give me a dinner recipe without peanuts formatted as a bulleted list", what is "without peanuts"?',
            options: [
              {
                text: 'A Constraint',
                isCorrect: true,
              },
              {
                text: 'The Role',
                isCorrect: false,
              },
              {
                text: 'The Context Window',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: Constraints are rules or boundaries the AI must strictly respect.',
          },
        },
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'Before & After: Transforming a Weak Prompt\n\nLet\'s see how the 5 building blocks turn a bad prompt into a great one:\n\n❌ **Weak Prompt:**\n"Write an email about our product delay."',
            },
            {
              type: 'text',
              content:
                '✅ **Engineered Prompt:**\n"Act as a Customer Support Manager. Write a polite 2-paragraph email to a customer explaining a 3-day shipping delay due to heavy rain. Apologize sincerely, offer a 10% discount code for their next order, and end with a warm closing."\nRemember: Adding a clear role, context, and format turns a weak request into a perfect result.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'What is the fastest way to turn a weak prompt into a great prompt?',
            options: [
              {
                text: 'Add who the AI should act as, what rules to follow, and how to format the answer',
                isCorrect: true,
              },
              {
                text: 'Type the exact same prompt five times',
                isCorrect: false,
              },
              {
                text: 'Type the entire prompt in capital letters',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: Role, Task, Context, Constraints, and Format give the AI everything it needs.',
          },
        },
      ],
    },
    {
      title: 'Popular Prompt Frameworks (RTF, CREATE, CARE)',
      description: 'Use easy formulas and cheat sheets to write powerful prompts in seconds.',
      order: 1,
      contents: [
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'What is a Prompt Framework?\n\nA framework is simply a recipe or a shortcut formula. Instead of staring at a blank screen wondering what words to type, you follow a simple fill-in-the-blank checklist.',
            },
            {
              type: 'text',
              content:
                'Frameworks make sure you never forget important details like the goal, the format, or the rules.\nRemember: A prompt framework is a simple recipe that guides you to write great prompts quickly.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'What is the main benefit of using a prompt framework?',
            options: [
              {
                text: 'It gives you a proven checklist so you do not forget important details',
                isCorrect: true,
              },
              {
                text: 'It makes the computer run out of memory',
                isCorrect: false,
              },
              {
                text: 'It turns off the AI safety filter',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: A prompt framework is a simple recipe that guides you to write great prompts quickly.',
          },
        },
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'The RTF Framework (Role, Task, Format)\n\n**RTF** is the easiest and most popular formula for daily use:\n\n- **R (Role):** "Act as an English teacher."\n\n- **T (Task):** "Explain the difference between \'there\', \'their\', and \'they\'re\'."\n\n- **F (Format):** "Give 1 short explanation followed by 3 clear example sentences."',
            },
            {
              type: 'text',
              content:
                'Whenever you need a quick answer, just think **R-T-F**: Who is the AI? What is the job? How should the answer look?\nRemember: RTF stands for Role, Task, and Format—the 3 fastest ingredients for daily prompts.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'What does the RTF framework stand for?',
            options: [
              {
                text: 'Role, Task, Format',
                isCorrect: true,
              },
              {
                text: 'Read, Type, Finish',
                isCorrect: false,
              },
              {
                text: 'Random, Text, File',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: RTF stands for Role, Task, and Format.',
          },
        },
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'The CREATE and CARE Frameworks\n\nWhen you work on larger projects, you can use bigger formulas like **CREATE**:\n\n- **C**haracter (Role)\n\n- **R**equest (Task)\n\n- **E**xamples (Show samples)\n\n- **A**djustments (Rules and limits)\n\n- **T**ype of output (Table, bullets, email)\n\n- **E**xtras (Tone and audience)',
            },
            {
              type: 'text',
              content:
                'Another great one is **CARE** (Context, Action, Result, Example). Both formulas remind you to give clear background info, action steps, and examples.\nRemember: Frameworks like RTF and CREATE give you ready-made recipes for both quick tasks and big projects.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'When should you use a detailed framework like CREATE instead of a simple 1-line prompt?',
            options: [
              {
                text: 'When working on important tasks that need specific examples, rules, and formats',
                isCorrect: true,
              },
              {
                text: 'Only when you are playing a video game',
                isCorrect: false,
              },
              {
                text: 'Never, because short prompts are always better',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: Frameworks give structure to complex tasks so the AI gets everything right.',
          },
        },
      ],
    },
    {
      title: 'Delimiters and Clean Formatting',
      description: 'Use simple symbols like quotes and tags to separate your instructions from your data.',
      order: 2,
      contents: [
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'What are Delimiters?\n\nImagine a fence on a farm. The fence keeps the animals in one area and the garden in another area so they do not mix together.',
            },
            {
              type: 'text',
              content:
                'In prompt engineering, **delimiters** are punctuation marks (like triple quotes `"""`, hashes `###`, or tags `<text></text>`) that build a fence between your instructions and the text you want the AI to read.\nRemember: Delimiters are punctuation fences that separate your instructions from your text.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'What is the main purpose of using delimiters in a prompt?',
            options: [
              {
                text: 'To clearly separate your instructions from the text being analyzed',
                isCorrect: true,
              },
              {
                text: 'To make the text look colorful on screen',
                isCorrect: false,
              },
              {
                text: 'To delete old chat history',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: Delimiters are punctuation fences that separate your instructions from your text.',
          },
        },
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'Why Delimiters Prevent AI Confusion\n\nImagine you ask the AI: "Summarize this customer feedback: The customer said do not summarize this message." The AI might get confused and obey the customer instead of you!',
            },
            {
              type: 'text',
              content:
                'When you wrap the customer text inside triple quotes (`"""`), the AI understands that the text inside is just data to work on, not new instructions to follow.\nRemember: Delimiters stop the AI from getting confused by words inside your text.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'Which prompt uses delimiters correctly to summarize a review?',
            options: [
              {
                text: 'Summarize the text inside the triple quotes in 2 bullet points:\n"""The food was great and arrived warm!"""',
                isCorrect: true,
              },
              {
                text: 'Summarize this review The food was great and arrived warm please thanks',
                isCorrect: false,
              },
              {
                text: 'Food review summary fast now',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: Using triple quotes clearly isolates the text from the instruction.',
          },
        },
        {
          type: 'group',
          content: 'Group Section',
          blocks: [
            {
              type: 'text',
              content:
                'Popular Delimiters You Can Use\n\nYou can use any of these easy styles:\n\n- Triple Quotes: `""" [Paste your text here] """`\n\n- XML Tags: `<article> [Paste your text here] </article>`\n\n- Markdown Hashes: `### Text to Translate: [Paste your text here]`',
            },
            {
              type: 'text',
              content:
                'Pick whichever style feels easiest for you to type. They all work like magic to keep your prompt tidy and organized.\nRemember: Triple quotes, XML tags, and markdown hashes are all great ways to fence off your text.',
            },
          ],
        },
        {
          type: 'quiz',
          content: 'Quiz',
          quiz: {
            question: 'Which of the following is a valid delimiter in a prompt?',
            options: [
              {
                text: 'Triple quotes like """ or tags like <text></text>',
                isCorrect: true,
              },
              {
                text: 'Blinking your eyes',
                isCorrect: false,
              },
              {
                text: 'Shaking your phone',
                isCorrect: false,
              },
            ],
            explanation: 'Remember: Triple quotes, XML tags, and markdown hashes are all valid delimiters.',
          },
        },
      ],
    },
  ],
};

export const allChaptersData: ChapterData[] = [
  chapter2Data,
  ...formattedChapters3to7,
];

export const run = async () => {
  try {
    await connectDB();

    console.log('Finding existing "Prompt Engineering" course in MongoDB...');
    const course = await Course.findOne({
      $or: [
        { _id: '6a90b1db030f8605b539daa2' },
        { title: /prompt engineering/i },
      ],
    });

    if (!course) {
      console.error('Error: Could not find Prompt Engineering course.');
      process.exit(1);
    }

    console.log(`Found course: "${course.title}" (ID: ${course._id})`);

    // Find Chapter 1 (the one the user completed)
    const chapter1 = await Chapter.findOne({
      course: course._id,
      order: 0,
    });

    if (!chapter1) {
      console.error('Error: Chapter 1 not found for course.');
      process.exit(1);
    }

    console.log(`Found Chapter 1: "${chapter1.title}" (ID: ${chapter1._id})`);

    // Verify existing Chapter 1 topics
    const ch1Topics = await Topic.find({ chapter: chapter1._id }).sort({ createdAt: 1 });
    console.log(`Chapter 1 has ${ch1Topics.length} completed topics. Preserving them intact.`);
    for (let i = 0; i < ch1Topics.length; i++) {
      ch1Topics[i].order = i;
      await ch1Topics[i].save();
    }

    // Clean up any old chapters with order > 0
    const oldChapters = await Chapter.find({
      course: course._id,
      order: { $gt: 0 },
    });
    const oldChapterIds = oldChapters.map((c) => c._id);

    if (oldChapterIds.length > 0) {
      console.log(`Removing ${oldChapterIds.length} old/stale chapters...`);
      const oldTopics = await Topic.find({ chapter: { $in: oldChapterIds } });
      const oldTopicIds = oldTopics.map((t) => t._id);
      await Topic.deleteMany({ _id: { $in: oldTopicIds } });
      await Chapter.deleteMany({ _id: { $in: oldChapterIds } });
    }

    // Also remove any orphaned topics for this course that don't belong to Chapter 1
    await Topic.deleteMany({
      course: course._id,
      chapter: { $ne: chapter1._id },
    });

    // Create Chapters 2 through 7 and their topics
    let totalChaptersAdded = 0;
    let totalTopicsAdded = 0;

    for (const chData of allChaptersData) {
      console.log(`Creating Chapter ${chData.order}: "${chData.title}"...`);
      const createdChapter = await Chapter.create({
        course: course._id,
        title: chData.title,
        description: chData.description,
        order: chData.order,
      });
      totalChaptersAdded++;

      for (const tData of chData.topics) {
        console.log(`  Adding Topic ${tData.order}: "${tData.title}" (${tData.contents.length} content items)`);
        await Topic.create({
          course: course._id,
          chapter: createdChapter._id,
          title: tData.title,
          description: tData.description,
          order: tData.order,
          contents: tData.contents,
          xp: 50,
          isPublished: true,
        });
        totalTopicsAdded++;
      }
    }

    // Update course metadata
    course.isPublished = true;
    course.isFree = true;
    course.price = 0;
    course.category = 'Artificial Intelligence';
    course.difficulty = 'beginner';
    await course.save();

    console.log('\n========================================');
    console.log('Successfully seeded Prompt Engineering course!');
    console.log('========================================');
    console.log(`Course Title:       ${course.title}`);
    console.log(`Course ID:          ${course._id}`);
    console.log(`Preserved Ch 1:     ${chapter1.title} (${ch1Topics.length} topics preserved)`);
    console.log(`New Chapters Added: ${totalChaptersAdded}`);
    console.log(`New Topics Added:   ${totalTopicsAdded}`);
    console.log(`Total Chapters:     ${totalChaptersAdded + 1}`);
    console.log(`Total Topics:       ${totalTopicsAdded + ch1Topics.length}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating Prompt Engineering course:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}
