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
      title: 'Output',
      description: 'Learn how to show output to the user with print().',
      contents: [
        {
          type: 'text',
          title: 'Show Result',
          content:
            'When you use a software, website, or app, you expect it to do something and show you output. To display output, you need to use a special keyword: print.',
        },
        {
          type: 'exercise',
          title: 'Exercise',
          content: 'Exercise',
          exercise: {
            instructions: 'Tap inside the print keyword and write your name. Then run it to see your name as output.',
            starterCode: 'print("   ")',
            language: 'python',
            expectedOutput: '',
            solution: 'print("Ada")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quiz',
          content: 'Quiz',
          quiz: {
            question: 'What do you need to use to display output?',
            options: [
              { text: 'print()', isCorrect: true },
              { text: 'printing()', isCorrect: false },
              { text: 'print it now()', isCorrect: false },
            ],
            explanation: 'print() is the built-in function Python uses to display output.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Showing Output',
          content:
            'Showing output is one of the core functionalities everywhere. When you search for anything on google.com, you expect to see the search result. Similarly, when you add two numbers in a calculator, you want to see the result.',
        },
        {
          type: 'code',
          title: 'Try it yourself',
          content: 'print("Hello, world!")\nprint("Learning Python is fun.")',
          language: 'python',
        } as ITopicContent,
      ],
      flashcards: [
        { question: 'What function displays output in Python?', answer: 'print()' },
        { question: 'What do you put inside print() to show text?', answer: 'A string, wrapped in quotes — e.g. print("Hello")' },
      ],
      mcqs: [
        {
          question: 'What is the output of print("Hi" + "!")?',
          options: [
            { text: 'Hi!', isCorrect: true },
            { text: 'Hi !', isCorrect: false },
            { text: 'Error', isCorrect: false },
            { text: '"Hi!"', isCorrect: false },
          ],
          explanation: 'The + operator concatenates the two strings with no extra space.',
        },
      ],
    },
    {
      title: 'Variables and Data Types',
      description: 'How Python stores and labels data.',
      contents: [
        {
          type: 'text',
          title: 'Storing values',
          content:
            'Python variables are created the moment you assign a value to them — no declarations needed. Every value has a type, but Python figures it out for you.',
        },
        {
          type: 'code',
          title: 'Example',
          content: 'name = "Ada"\nage = 28\nis_student = False\n\nprint(f"{name} is {age} years old")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a variable called age, set it to your age, then print it.',
            starterCode: 'age = 0\nprint(age)',
            language: 'python',
            expectedOutput: '',
            solution: 'age = 25\nprint(age)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quiz',
          content: 'Quiz',
          quiz: {
            question: 'Which of these is a valid way to create a variable in Python?',
            options: [
              { text: 'x = 5', isCorrect: true },
              { text: 'int x = 5', isCorrect: false },
              { text: 'var x = 5', isCorrect: false },
              { text: 'let x = 5', isCorrect: false },
            ],
            explanation: 'Python has no type declarations — assignment alone creates the variable.',
          },
        } as ITopicContent,
      ],
      flashcards: [
        { question: 'How do you create a variable in Python?', answer: 'Assign a value with =, e.g. x = 5. No type declaration is needed.' },
        { question: 'What function converts a value to a string?', answer: 'str()' },
      ],
      mcqs: [
        {
          question: 'What is the output of print(type(5))?',
          options: [
            { text: "<class 'int'>", isCorrect: true },
            { text: "<class 'float'>", isCorrect: false },
            { text: "<class 'str'>", isCorrect: false },
            { text: "<class 'bool'>", isCorrect: false },
          ],
          explanation: '5 has no decimal point, so Python infers the int type.',
        },
      ],
    },
    {
      title: 'Control Flow',
      description: 'Making decisions and repeating work with if statements and loops.',
      contents: [
        {
          type: 'text',
          title: 'Branching and repeating',
          content: 'if/elif/else statements let your program branch based on conditions. for and while loops let it repeat.',
        },
        {
          type: 'code',
          title: 'Example',
          content: 'for n in range(1, 6):\n    if n % 2 == 0:\n        print(f"{n} is even")\n    else:\n        print(f"{n} is odd")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise',
          content: 'Exercise',
          exercise: {
            instructions: 'Write a loop that prints the numbers 1 through 5.',
            starterCode: 'for n in range(1, 6):\n    print(n)',
            language: 'python',
            expectedOutput: '1\n2\n3\n4\n5',
            solution: 'for n in range(1, 6):\n    print(n)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quiz',
          content: 'Quiz',
          quiz: {
            question: 'Which operator checks the remainder of a division in Python?',
            options: [
              { text: '%', isCorrect: true },
              { text: '//', isCorrect: false },
              { text: '**', isCorrect: false },
              { text: '&', isCorrect: false },
            ],
            explanation: '% is the modulo operator, returning the remainder of division.',
          },
        } as ITopicContent,
      ],
      flashcards: [
        { question: 'What does range(1, 6) produce?', answer: 'The integers 1, 2, 3, 4, 5 (stops before 6).' },
        { question: 'What keyword starts a loop condition check without a counter?', answer: 'while' },
      ],
      mcqs: [
        {
          question: 'What does the "elif" keyword do?',
          options: [
            { text: 'Checks another condition if the previous one was false', isCorrect: true },
            { text: 'Ends a loop early', isCorrect: false },
            { text: 'Repeats a block of code', isCorrect: false },
            { text: 'Defines a function', isCorrect: false },
          ],
          explanation: 'elif ("else if") lets you chain additional conditions after an if.',
        },
      ],
    },
    {
      title: 'Functions',
      description: 'Packaging reusable logic with def.',
      contents: [
        {
          type: 'text',
          title: 'Defining functions',
          content: 'Functions are defined with def, can take parameters with default values, and return a value with return.',
        },
        {
          type: 'code',
          title: 'Example',
          content: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Chidi"))\nprint(greet("Amara", greeting="Sabi"))',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise',
          content: 'Exercise',
          exercise: {
            instructions: 'Write a function called square that takes a number and returns its square, then print square(4).',
            starterCode: 'def square(n):\n    return n * n\n\nprint(square(4))',
            language: 'python',
            expectedOutput: '16',
            solution: 'def square(n):\n    return n * n\n\nprint(square(4))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quiz',
          content: 'Quiz',
          quiz: {
            question: 'What happens if a Python function has no return statement?',
            options: [
              { text: 'It returns None', isCorrect: true },
              { text: 'It raises an error', isCorrect: false },
              { text: 'It returns an empty string', isCorrect: false },
              { text: 'It returns 0', isCorrect: false },
            ],
            explanation: 'Functions without an explicit return implicitly return None.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Wrap up',
          content: "You've learned output, variables, control flow, and functions — the core building blocks of any Python program.",
        },
      ],
      flashcards: [
        { question: 'What keyword defines a function in Python?', answer: 'def' },
        { question: 'What happens if a function has no return statement?', answer: 'It returns None.' },
      ],
      mcqs: [
        {
          question: 'What does greet("Amara", greeting="Sabi") return, given the example above?',
          options: [
            { text: '"Sabi, Amara!"', isCorrect: true },
            { text: '"Hello, Amara!"', isCorrect: false },
            { text: '"Amara, Sabi!"', isCorrect: false },
            { text: 'None', isCorrect: false },
          ],
          explanation: 'The keyword argument greeting="Sabi" overrides the default value "Hello".',
        },
      ],
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
