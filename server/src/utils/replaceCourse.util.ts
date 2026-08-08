import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Course, { ICourse } from '../models/course.model';
import Topic, { ITopicContent } from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import UserProgress from '../models/userProgress.model';
import StudySession from '../models/studySession.model';
import { connectDB } from '../config/db.config';

interface TopicSeed {
  title: string;
  description: string;
  contents: ITopicContent[];
  flashcards: { question: string; answer: string }[];
  mcqs: { question: string; options: { text: string; isCorrect: boolean }[]; explanation: string }[];
}

const courseSeed: { course: Partial<ICourse>; topics: TopicSeed[] } = {
  course: {
    title: 'Python 3: Basics to Advanced',
    description: 'Learn Python step by step with guided lessons, quizzes, and runnable exercises.',
    longDescription:
      'A hands-on Python course that walks you through core concepts one small step at a time — reading, watching, answering quizzes, and running real code in the browser — before moving to the next idea.',
    category: 'Programming',
    difficulty: 'beginner',
    whatYouWillLearn: [
      'Display output with print()',
      'Store and use data with variables',
      'Control program flow with conditionals and loops',
      'Write and call your own functions',
    ],
    isPublished: true,
    order: 1,
  },
  topics: [
    {
      title: 'Module 1: First Steps into Python',
      description:
        'Get learners running their first lines of code instantly without overwhelming theory. Covers: Welcome to Programming (what is code and how computers follow instructions), Your First Line of Code (print()), Working with Text (printing multiple items and \\n line breaks), Comments (# for notes), and Understanding Errors (reading basic SyntaxError messages).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 2: Storing Information (Variables & Data Types)',
      description:
        'Understand memory and the foundational building blocks of data. Covers: What is a Variable (labelled boxes), Text Data (str, single/double quotes), Numbers (int & float), True or False (bool), and Naming Rules (snake_case, conventions, reserved keywords).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 3: Making Programs Interactive (Math & Inputs)',
      description:
        'Combine user input with basic arithmetic to create dynamic programs. Covers: Basic Math Operators (+, -, *, /), Advanced Math Operators (**, //, %), Getting User Input (input()), Type Casting (str(), int(), float()), and a Mini Project: Bill & Tip Calculator.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 4: Control Flow (Making Decisions)',
      description:
        'Teach programs how to choose different execution paths based on conditions. Covers: Comparison Operators (>, <, >=, <=, ==, !=), if/else Statements, Indentation in Python, Multiple Conditions (elif), Logical Operators (and, or, not), Nested Decisions, and a Mini Project: Choose-Your-Own-Adventure Game or Grade Classifier.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 5: Loops & Repetition (Automating Tasks)',
      description:
        'Eliminate repeated code using loops. Covers: for Loops, the range() Function, while Loops, Loop Control (continue, break), Infinite Loops (why they happen and how to avoid them), and a Mini Project: Guess the Secret Number Game.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 6: Grouping Data (Collections)',
      description:
        'Manage lists of items and structured records efficiently. Covers: Lists Basics, Modifying Lists (append, insert, pop, remove), Looping through Lists, Tuples (immutable lists), Dictionaries (key-value pairs), Working with Dictionaries (reading, updating, iterating), and Sets (bonus: unique elements).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 7: Functions (Reusable Code)',
      description:
        'Modularize code to prevent repetition and improve readability. Covers: What is a Function (def and calling), Parameters & Arguments, Return Values (return vs print()), Default Arguments, Variable Scope (local vs global), and a Mini Project: Unit Converter (Miles to KM, Celsius to Fahrenheit).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 8: Mastering Text & Strings',
      description:
        'Manipulate string data effectively for formatting and display. Covers: f-Strings, String Methods (.upper(), .lower(), .strip(), .replace()), String Slicing, and Splitting & Joining (.split() and .join()).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 9: Error Handling & Debugging',
      description:
        'Prevent app crashes and handle unexpected situations gracefully. Covers: Types of Bugs (Syntax, Runtime, Logic errors), try/except Blocks, and Handling Specific Errors (ValueError, ZeroDivisionError, KeyError).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 10: Using Built-in Modules',
      description:
        "Leverage Python's standard library modules. Covers: Importing Modules (import statements), Randomness (random: randint(), choice(), shuffle()), Math & Time (math, time modules), and Reading & Writing Files (open(), basic read/write).",
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 11: Intro to Object-Oriented Programming (OOP)',
      description:
        'Conceptual introduction to classes and objects. Covers: What is OOP (objects, properties, actions), Classes & Instances, the __init__() Constructor (self), and Class Methods.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 12: Hands-On Capstone Projects',
      description:
        'Synthesize all learned concepts into full applications. Projects: Interactive Trivia Quiz App (conditions, lists/dicts, functions), Command-Line To-Do List (loops, lists/dicts, functions, try/except), and Password Generator (strings, random module, functions, loops).',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
  ],
};

const run = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('Removing existing course(s) and their related data...');
    const existingCourses = await Course.find({});
    const existingCourseIds = existingCourses.map((c) => c._id);

    if (existingCourseIds.length > 0) {
      const existingTopics = await Topic.find({ course: { $in: existingCourseIds } });
      const existingTopicIds = existingTopics.map((t) => t._id);

      await Promise.all([
        Flashcard.deleteMany({ topic: { $in: existingTopicIds } }),
        MCQ.deleteMany({ topic: { $in: existingTopicIds } }),
        UserProgress.deleteMany({ course: { $in: existingCourseIds } }),
        StudySession.deleteMany({ course: { $in: existingCourseIds } }),
      ]);
      await Topic.deleteMany({ course: { $in: existingCourseIds } });
      await Course.deleteMany({ _id: { $in: existingCourseIds } });

      console.log(`Removed ${existingCourseIds.length} course(s), ${existingTopicIds.length} topic(s), and their flashcards/MCQs/progress.`);
    } else {
      console.log('No existing courses found.');
    }

    console.log('Seeding sample course...');
    const course = await Course.create(courseSeed.course);

    let totalTopics = 0;
    let totalFlashcards = 0;
    let totalMcqs = 0;

    for (let i = 0; i < courseSeed.topics.length; i++) {
      const topicSeed = courseSeed.topics[i];
      const topic = await Topic.create({
        course: course._id,
        title: topicSeed.title,
        description: topicSeed.description,
        contents: topicSeed.contents,
        order: i + 1,
        isPublished: true,
      });
      totalTopics++;

      if (topicSeed.flashcards.length > 0) {
        await Flashcard.insertMany(topicSeed.flashcards.map((f) => ({ topic: topic._id, question: f.question, answer: f.answer })));
        totalFlashcards += topicSeed.flashcards.length;
      }

      if (topicSeed.mcqs.length > 0) {
        await MCQ.insertMany(topicSeed.mcqs.map((m) => ({ topic: topic._id, question: m.question, options: m.options, explanation: m.explanation })));
        totalMcqs += topicSeed.mcqs.length;
      }
    }

    console.log('\n========================================');
    console.log('Course replaced successfully!');
    console.log('========================================');
    console.log(`Created course "${course.title}" with ${totalTopics} topics, ${totalFlashcards} flashcards, ${totalMcqs} MCQs`);
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Replace-course error:', error);
    process.exit(1);
  }
};

run();
