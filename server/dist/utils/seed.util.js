"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const studySession_model_1 = __importDefault(require("../models/studySession.model"));
const userProgress_model_1 = __importDefault(require("../models/userProgress.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const db_config_1 = require("../config/db.config");
const coursesSeed = [
    {
        course: {
            title: 'Python Programming Fundamentals',
            description: 'Learn to write real Python code from scratch.',
            longDescription: 'A hands-on introduction to Python covering variables, control flow, functions, and data structures — with runnable code examples throughout.',
            category: 'Programming',
            difficulty: 'beginner',
            whatYouWillLearn: [
                'Write and run Python scripts',
                'Use variables, loops, and conditionals',
                'Define and call functions',
                'Work with lists and dictionaries',
            ],
            isPublished: true,
            order: 1,
        },
        topics: [
            {
                title: 'Variables and Data Types',
                description: 'How Python stores and labels data.',
                contents: [
                    { type: 'text', content: 'Python variables are created the moment you assign a value to them — no declarations needed. Every value has a type, but Python figures it out for you.' },
                    {
                        type: 'code',
                        content: "name = \"Ada\"\nage = 28\nis_student = False\n\nprint(f\"{name} is {age} years old\")",
                        language: 'python',
                    },
                    { type: 'text', content: 'Common built-in types include str, int, float, bool, list, and dict.' },
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
                    { type: 'text', content: 'if/elif/else statements let your program branch based on conditions. for and while loops let it repeat.' },
                    {
                        type: 'code',
                        content: 'for n in range(1, 6):\n    if n % 2 == 0:\n        print(f"{n} is even")\n    else:\n        print(f"{n} is odd")',
                        language: 'python',
                    },
                ],
                flashcards: [
                    { question: 'What does range(1, 6) produce?', answer: 'The integers 1, 2, 3, 4, 5 (stops before 6).' },
                    { question: 'What keyword starts a loop condition check without a counter?', answer: 'while' },
                ],
                mcqs: [
                    {
                        question: 'Which operator checks the remainder of a division in Python?',
                        options: [
                            { text: '%', isCorrect: true },
                            { text: '//', isCorrect: false },
                            { text: '**', isCorrect: false },
                            { text: '&', isCorrect: false },
                        ],
                        explanation: '% is the modulo operator, returning the remainder of division.',
                    },
                ],
            },
            {
                title: 'Functions',
                description: 'Packaging reusable logic with def.',
                contents: [
                    { type: 'text', content: 'Functions are defined with def, can take parameters with default values, and return a value with return.' },
                    {
                        type: 'code',
                        content: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Chidi"))\nprint(greet("Amara", greeting="Sabi"))',
                        language: 'python',
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
    },
    {
        course: {
            title: 'Study Skills for Self-Learners',
            description: 'Build habits that make independent learning stick.',
            longDescription: 'Practical, non-technical strategies for staying consistent, retaining what you study, and avoiding burnout — useful alongside any course on SabiLearn.',
            category: 'Study Skills',
            difficulty: 'beginner',
            whatYouWillLearn: [
                'Build a sustainable daily study streak',
                'Use spaced repetition effectively',
                'Set realistic weekly goals',
            ],
            isPublished: true,
            order: 2,
        },
        topics: [
            {
                title: 'Building a Study Streak',
                description: 'Why consistency beats cramming.',
                contents: [
                    { type: 'text', content: 'A short daily session beats a long weekly one. SabiLearn tracks your streak automatically — study once a day, at your own pace, in your own timezone.' },
                ],
                flashcards: [
                    { question: 'What matters more for retention: session length or consistency?', answer: 'Consistency — frequent short sessions beat infrequent long ones.' },
                ],
                mcqs: [
                    {
                        question: 'What resets a SabiLearn study streak?',
                        options: [
                            { text: 'Missing a full local day without studying', isCorrect: true },
                            { text: 'Studying a different course', isCorrect: false },
                            { text: 'Logging out', isCorrect: false },
                            { text: 'Switching devices', isCorrect: false },
                        ],
                        explanation: 'Streaks are tracked per local day; a missed day resets the streak.',
                    },
                ],
            },
        ],
    },
];
const seedDatabase = async () => {
    try {
        await (0, db_config_1.connectDB)();
        console.log('Clearing existing data...');
        await Promise.all([
            user_model_1.default.deleteMany({}),
            course_model_1.default.deleteMany({}),
            topic_model_1.default.deleteMany({}),
            flashcard_model_1.default.deleteMany({}),
            mcq_model_1.default.deleteMany({}),
            studySession_model_1.default.deleteMany({}),
            userProgress_model_1.default.deleteMany({}),
            notification_model_1.default.deleteMany({}),
        ]);
        console.log('Creating users...');
        const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
        const userPassword = await bcryptjs_1.default.hash('user123', 10);
        const admin = await user_model_1.default.create({
            email: 'admin@sabilearn.online',
            password: adminPassword,
            name: 'Admin User',
            firstName: 'Admin',
            lastName: 'User',
            level: 'advanced',
            role: 'admin',
            bio: 'System administrator for SabiLearn.',
        });
        const user = await user_model_1.default.create({
            email: 'student@sabilearn.online',
            password: userPassword,
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            level: 'intermediate',
            role: 'user',
            bio: 'Learning to code and build better study habits on SabiLearn.',
        });
        console.log('Creating courses, topics, flashcards, and MCQs...');
        let totalTopics = 0;
        let totalFlashcards = 0;
        let totalMcqs = 0;
        for (const seed of coursesSeed) {
            const course = await course_model_1.default.create(seed.course);
            for (let i = 0; i < seed.topics.length; i++) {
                const topicSeed = seed.topics[i];
                const topic = await topic_model_1.default.create({
                    course: course._id,
                    title: topicSeed.title,
                    description: topicSeed.description,
                    contents: topicSeed.contents,
                    order: i + 1,
                    isPublished: true,
                });
                totalTopics++;
                if (topicSeed.flashcards.length > 0) {
                    const flashcardDocs = topicSeed.flashcards.map((f) => ({
                        topic: topic._id,
                        question: f.question,
                        answer: f.answer,
                    }));
                    await flashcard_model_1.default.insertMany(flashcardDocs);
                    totalFlashcards += flashcardDocs.length;
                }
                if (topicSeed.mcqs.length > 0) {
                    const mcqDocs = topicSeed.mcqs.map((m) => ({
                        topic: topic._id,
                        question: m.question,
                        options: m.options,
                        explanation: m.explanation,
                    }));
                    await mcq_model_1.default.insertMany(mcqDocs);
                    totalMcqs += mcqDocs.length;
                }
            }
        }
        console.log('Creating notifications...');
        const pythonCourse = await course_model_1.default.findOne({ category: 'Programming' });
        const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        await notification_model_1.default.create([
            {
                user: user._id,
                type: 'announcement',
                category: 'welcome',
                title: 'Welcome to SabiLearn!',
                message: 'Start your learning journey by exploring our courses.',
                actionUrl: '/dashboard/courses',
                isRead: false,
                sentAt: new Date(),
                dedupeKey: `welcome:${user._id}`,
            },
            {
                user: null,
                type: 'info',
                category: 'course',
                title: 'New Course Available',
                message: 'Python Programming Fundamentals is now available.',
                isRead: false,
                actionUrl: pythonCourse ? `/dashboard/courses/${pythonCourse._id}` : '/dashboard/courses',
                sentAt: new Date(),
                dedupeKey: pythonCourse ? `course-published:${pythonCourse._id}` : undefined,
            },
            {
                user: user._id,
                type: 'success',
                category: 'achievement',
                title: 'Study Streak Achievement',
                message: 'You have completed your first study session. Keep it up!',
                actionUrl: '/dashboard/progress',
                isRead: false,
                sentAt: new Date(),
                dedupeKey: `achievement:first-session:${user._id}`,
            },
            {
                user: null,
                type: 'warning',
                category: 'system',
                title: 'Scheduled Maintenance',
                message: 'The platform will undergo maintenance this Sunday from 2-4 AM EST.',
                isRead: false,
                scheduledFor: inTwoDays,
                sentAt: null,
            },
        ]);
        console.log('\n========================================');
        console.log('Seed completed successfully!');
        console.log('========================================');
        console.log('Admin login:  admin@sabilearn.online / admin123');
        console.log('User login:   student@sabilearn.online / user123');
        console.log(`Created: ${coursesSeed.length} courses, ${totalTopics} topics, ${totalFlashcards} flashcards, ${totalMcqs} MCQs`);
        console.log('========================================\n');
        await mongoose_1.default.connection.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};
seedDatabase();
