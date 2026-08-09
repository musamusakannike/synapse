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
      description: 'Write your very first line of code and see it work right away.',
      contents: [
        {
          type: 'text',
          title: 'Welcome to Programming',
          content:
            "Welcome! Before we write any code, let's understand what code even is.\n\nImagine you are teaching a friend to make tea, but your friend has never made tea before and will do EXACTLY what you say — no more, no less. If you say \"put water in the cup\" but forget to say \"boil the water first,\" your friend will pour cold water and stop. They won't guess what you meant. They will only do exactly what you told them.\n\nA computer is like that friend. Code is the list of instructions you give it, step by step, in an order it understands. That's it. That's programming: writing clear, exact instructions for a computer to follow.\n\nMain point to remember: A computer only does exactly what you tell it — nothing more, nothing less. We will repeat this a lot, because it explains almost every mistake beginners make.",
        },
        {
          type: 'text',
          title: 'What is Python?',
          content:
            "Python is a programming language — a way of writing instructions that a computer can understand. Think of it like English, but much stricter and simpler. There is no slang, no guessing, and only one correct way to say most things.\n\nWe write Python instructions as lines of \"code.\" Each line is one instruction, like one step in a recipe.\n\nRemember: Code = instructions. Python = one language we use to write those instructions.",
        },
        {
          type: 'text',
          title: 'Your First Line of Code',
          content:
            "Let's give the computer its first instruction. In Python, if you want the computer to display (show) something on the screen, you use a special word: print.\n\nThink of print() like a megaphone. Whatever you place inside the megaphone's brackets ( ) gets announced out loud on the screen.\n\nHere is the exact pattern:\nprint(\"your message here\")\n\nNotice three things, and try to remember all three:\n1. The word print is always lowercase.\n2. It is followed by round brackets ( ).\n3. Text goes inside quotation marks \" \" so Python knows it's text and not an instruction.\n\nMain point (repeat this!): print() is how you make Python show something on the screen.",
        },
        {
          type: 'code',
          title: 'Try it: your first print()',
          content: 'print("Hello, world!")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'text',
          title: 'Why "Hello, world!"?',
          content:
            "Fun fact: almost every programmer's very first program says \"Hello, world!\" — it's a tradition! You just wrote the same first program that millions of programmers before you have written.\n\nQuick recap so far:\n- Code = instructions for the computer.\n- The computer does EXACTLY what you say — nothing more, nothing less.\n- print(\"...\") shows a message on the screen.",
        },
        {
          type: 'exercise',
          title: 'Exercise: Print your name',
          content: 'Exercise',
          exercise: {
            instructions:
              'Use print() to display your own name on the screen. Replace the blank space inside the quotes with your name, then run the code.',
            starterCode: 'print("   ")',
            language: 'python',
            expectedOutput: '',
            solution: 'print("Ada")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: print()',
          content: 'Quiz',
          quiz: {
            question: 'What does print() do in Python?',
            options: [
              { text: 'It shows (displays) a message on the screen', isCorrect: true },
              { text: 'It deletes a message', isCorrect: false },
              { text: 'It saves a file to your computer', isCorrect: false },
              { text: 'It connects to the internet', isCorrect: false },
            ],
            explanation: 'print() is Python\'s way of showing output on the screen — like a megaphone announcing whatever is inside the brackets.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Working with Text: Printing Multiple Things',
          content:
            "Real life example: imagine a receipt printer at a shop. It doesn't print just one word — it prints your name, the items, and the total, all lined up nicely. Python's print() can do something similar.\n\nYou can print more than one thing at once by separating them with a comma (,). Python will automatically put a space between them:\nprint(\"My name is\", \"Ada\")\n\nThis shows: My name is Ada\n\nMain point (say it with me): a comma inside print() adds a space and joins pieces together when Python displays them.",
        },
        {
          type: 'text',
          title: 'Line Breaks with \\n',
          content:
            'Sometimes you want text on a NEW line, like paragraphs in a letter. Instead of writing several print() lines, you can use \\n inside your text. \\n means "start a new line here" — think of it as pressing the Enter key inside your text.\n\nExample:\nprint("Line one\\nLine two")\n\nThis displays:\nLine one\nLine two\n\nMain point (repeat it): \\n inside quotes means "move to a new line," just like pressing Enter.',
        },
        {
          type: 'code',
          title: 'Try it: commas and \\n together',
          content: 'print("Learning Python is fun.")\nprint("Day", 1, "of my coding journey!")\nprint("First line\\nSecond line")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Two lines, one print()',
          content: 'Exercise',
          exercise: {
            instructions:
              'Using only ONE print() statement and \\n, make the computer display two lines:\nI love Python\nIt is my first language',
            starterCode: 'print("   ")',
            language: 'python',
            expectedOutput: 'I love Python\nIt is my first language',
            solution: 'print("I love Python\\nIt is my first language")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: \\n',
          content: 'Quiz',
          quiz: {
            question: 'What does \\n do inside a print() message?',
            options: [
              { text: 'It moves the following text to a new line', isCorrect: true },
              { text: 'It adds a number', isCorrect: false },
              { text: 'It deletes the text before it', isCorrect: false },
              { text: 'It makes the text bold', isCorrect: false },
            ],
            explanation: '\\n is a special "new line" instruction — like pressing Enter — that tells Python to continue on the next line.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Comments: Notes Just for Humans',
          content:
            "Imagine leaving a sticky note on the fridge that says \"Buy milk — Mum asked twice!\" That note isn't food, and nobody eats it — it's just a reminder for a human. Comments in Python work the same way.\n\nA comment starts with a # symbol. Python completely ignores anything after # on that line — it's not an instruction, it's a note for you (or other programmers) to read later.\n\nExample:\n# This line prints a greeting\nprint(\"Hello!\")\n\nMain point (again, on purpose): # means \"this is a note for humans — Python will skip it.\"\n\nWhy use comments? To remind yourself what your code does, especially when you come back to it days later and forget!",
        },
        {
          type: 'code',
          title: 'Try it: using a comment',
          content: '# This program greets the learner\nprint("Welcome to Python!")  # this line shows the greeting',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Add a comment',
          content: 'Exercise',
          exercise: {
            instructions: 'Add a comment above the print() line explaining what it does. Then keep the print() line so it still runs.',
            starterCode: 'print("I am learning Python!")',
            language: 'python',
            expectedOutput: 'I am learning Python!',
            solution: '# This line prints a message about learning Python\nprint("I am learning Python!")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Comments',
          content: 'Quiz',
          quiz: {
            question: 'What happens when Python runs a line that starts with #?',
            options: [
              { text: 'Python skips it — it is just a note for humans', isCorrect: true },
              { text: 'Python prints it on the screen', isCorrect: false },
              { text: 'Python stops the whole program', isCorrect: false },
              { text: 'Python turns it into a variable', isCorrect: false },
            ],
            explanation: 'Lines starting with # are comments. Python ignores them completely — they exist only to help humans understand the code.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Understanding Errors (Don\'t Be Afraid!)',
          content:
            "Here's a secret every experienced programmer knows: EVERYONE gets errors, all the time — even experts with 20 years of experience. Errors are not a sign that you failed. They are Python's way of saying, \"I didn't understand that instruction, please check it again.\"\n\nReal life example: if you send a text message with a typo, your friend might reply \"Huh? I don't understand.\" That's not a disaster — you just retype it correctly. Python does the same thing when it doesn't understand your code, except it calls this a SyntaxError.\n\nA SyntaxError usually means something is missing or mistyped, like:\n- A missing quotation mark \"\n- A missing bracket )\n- A misspelled word\n\nExample of broken code:\nprint(\"Hello, world!)\n\nSee the problem? The closing quotation mark \" is missing! Python will show a SyntaxError because the message never properly ends.\n\nMain point (one more time, because it matters): an error is not a disaster — it's Python telling you exactly what to fix. Read the error message calmly, find the missing piece, and try again.",
        },
        {
          type: 'code',
          title: 'Example: correct vs broken code',
          content:
            '# This works correctly:\nprint("Hello, world!")\n\n# This would cause a SyntaxError because the closing quote is missing:\n# print("Hello, world!\n\n# Fix: always match your opening and closing quotes and brackets!',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Fix the broken code',
          content: 'Exercise',
          exercise: {
            instructions:
              'The code below has a SyntaxError because it is missing a closing quotation mark. Fix it so it runs without an error and prints: I fixed the error!',
            starterCode: 'print("I fixed the error!)',
            language: 'python',
            expectedOutput: 'I fixed the error!',
            solution: 'print("I fixed the error!")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Errors',
          content: 'Quiz',
          quiz: {
            question: 'What does a SyntaxError usually mean?',
            options: [
              { text: 'Something is missing or mistyped, like a quote mark or bracket', isCorrect: true },
              { text: 'Your computer is broken', isCorrect: false },
              { text: 'Python has crashed permanently', isCorrect: false },
              { text: 'You need to buy a new keyboard', isCorrect: false },
            ],
            explanation: 'A SyntaxError just means Python could not understand your instruction — usually because of a missing quote, bracket, or typo. It is easy to fix once you spot it.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 1 Recap',
          content:
            "Great job! Let's repeat everything you now know, one more time, because repetition helps it stick:\n\n1. Code is a list of exact instructions for a computer — it does exactly what you say, nothing more, nothing less.\n2. print(\"message\") shows (displays) a message on the screen.\n3. A comma inside print() joins multiple pieces together with a space.\n4. \\n inside text means \"start a new line,\" just like pressing Enter.\n5. A comment starts with # and is a note for humans — Python ignores it.\n6. An error, like a SyntaxError, is not scary — it's Python telling you something is missing or mistyped, usually a quote or bracket, so you can fix it and try again.\n\nYou just wrote real Python code, displayed text, added comments, and learned how to handle your first errors. That's the foundation of everything else you'll learn. Well done!",
        },
      ],
      flashcards: [
        { question: 'What is code?', answer: 'A list of exact instructions that tells a computer what to do, step by step.' },
        { question: 'What does print() do?', answer: 'It displays (shows) a message on the screen.' },
        { question: 'How do you display text in Python?', answer: 'Put the text inside quotation marks, inside print(), e.g. print("Hello")' },
        { question: 'What does a comma do inside print()?', answer: 'It joins multiple items together and adds a space between them.' },
        { question: 'What does \\n do inside text?', answer: 'It moves the following text to a new line, like pressing Enter.' },
        { question: 'How do you write a comment in Python?', answer: 'Start the line with a # symbol. Python ignores everything after it on that line.' },
        { question: 'Why do we use comments?', answer: 'To leave notes for ourselves or other people about what the code does, without affecting how the code runs.' },
        { question: 'What is a SyntaxError?', answer: 'A message from Python saying it could not understand your code — usually because of a missing quote, bracket, or typo.' },
        { question: 'Should you be afraid of errors?', answer: 'No — even expert programmers get errors all the time. An error just tells you what to fix.' },
      ],
      mcqs: [
        {
          question: 'Which line of code correctly displays "Good morning" on the screen?',
          options: [
            { text: 'print("Good morning")', isCorrect: true },
            { text: 'print(Good morning)', isCorrect: false },
            { text: 'Print["Good morning"]', isCorrect: false },
            { text: 'display("Good morning")', isCorrect: false },
          ],
          explanation: 'Text must be inside quotation marks and print must be lowercase, followed by round brackets: print("Good morning").',
        },
        {
          question: 'What will print("Hi", "there") display?',
          options: [
            { text: 'Hi there', isCorrect: true },
            { text: 'Hi,there', isCorrect: false },
            { text: 'HiThere', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: 'A comma inside print() joins the items and adds a single space between them, so it displays: Hi there',
        },
        {
          question: 'What will print("A\\nB") display?',
          options: [
            { text: 'A on one line, B on the next line', isCorrect: true },
            { text: 'A\\nB exactly as typed', isCorrect: false },
            { text: 'AB on one line', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: '\\n creates a line break, so "A" prints, then Python moves to a new line before printing "B".',
        },
        {
          question: 'Which of these lines is a comment and will be ignored by Python?',
          options: [
            { text: '# print this message', isCorrect: true },
            { text: 'print(this message)', isCorrect: false },
            { text: '"print this message"', isCorrect: false },
            { text: 'print("this message")', isCorrect: false },
          ],
          explanation: 'Any line starting with # is a comment. Python skips comments completely — they are only notes for humans.',
        },
        {
          question: 'You run print("Hello) and Python shows a SyntaxError. What is most likely wrong?',
          options: [
            { text: 'A closing quotation mark is missing', isCorrect: true },
            { text: 'The computer has no internet connection', isCorrect: false },
            { text: 'Python is not installed correctly', isCorrect: false },
            { text: 'The word print is spelled wrong', isCorrect: false },
          ],
          explanation: 'The text starts with " but never closes with a matching ", so Python cannot tell where the message ends — this causes a SyntaxError.',
        },
      ],
    },
    {
      title: 'Module 2: Storing Information (Variables & Data Types)',
      description: 'Learn how to save and label pieces of information, like text, numbers, and true/false values.',
      contents: [
        {
          type: 'text',
          title: 'What is a Variable?',
          content:
            "Imagine a box with a label on it. You could write \"Toys\" on one box and \"Books\" on another, so you always know what's inside without opening every box. A variable in Python works exactly like that: it's a labelled box that stores a piece of information so you can use it later.\n\nInstead of typing the same value over and over, you store it in a variable once, give it a name, and reuse that name whenever you need the value.\n\nExample:\nage = 20\n\nHere, age is the label on the box, and 20 is what's inside it. The = sign means \"put this value inside this box,\" not \"equals\" like in maths class.\n\nMain point (remember this): a variable is a labelled box that stores a value so you can use it again later.",
        },
        {
          type: 'code',
          title: 'Try it: creating a variable',
          content: 'age = 20\nprint(age)\nprint("My age is", age)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Create your own variable',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a variable called city, set it to the name of your city, then print it.',
            starterCode: 'city = "   "\nprint(city)',
            language: 'python',
            expectedOutput: '',
            solution: 'city = "Lagos"\nprint(city)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Variables',
          content: 'Quiz',
          quiz: {
            question: 'What is a variable?',
            options: [
              { text: 'A labelled box that stores a value so you can use it later', isCorrect: true },
              { text: 'A type of error message', isCorrect: false },
              { text: 'A way to delete data', isCorrect: false },
              { text: 'A picture on the screen', isCorrect: false },
            ],
            explanation: 'A variable stores a value under a name (a label), so you can reuse or change that value later without retyping it.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Text Data (str)',
          content:
            "Think about a name tag at a party — it holds text, like \"Hi, I'm Chidi.\" In Python, text is called a string, and we shorten that to str.\n\nAny piece of text must be wrapped in quotation marks, either single ' ' or double \" \" — both work the same way, just pick one style and stay consistent.\n\nExamples:\nname = \"Chidi\"\ncity = 'Enugu'\n\nMain point (repeat it): text data is called a string (str), and it must always be inside quotation marks — single or double, it doesn't matter, as long as they match.",
        },
        {
          type: 'code',
          title: 'Try it: strings',
          content: 'name = "Chidi"\nfavorite_food = \'Jollof rice\'\nprint(name)\nprint(favorite_food)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'text',
          title: 'Numbers (int & float)',
          content:
            "Now think about a weighing scale. Sometimes it shows a whole number like 5 kg, and sometimes it shows a number with decimals like 5.3 kg. Python has two number types for exactly this difference:\n\n- int (integer): a whole number, with no decimal point. Example: 5, 20, -3\n- float (floating point number): a number with a decimal point. Example: 5.3, 20.75, -3.0\n\nNotice: numbers are NOT wrapped in quotation marks. If you wrap a number in quotes, like \"5\", Python treats it as text (a string), not a number!\n\nMain point (again, because it trips people up): int = whole number, float = decimal number, and neither one uses quotation marks.",
        },
        {
          type: 'code',
          title: 'Try it: int vs float',
          content: 'apples = 5          # this is an int (whole number)\nprice = 5.99        # this is a float (decimal number)\nprint(apples)\nprint(price)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Store a whole number and a decimal',
          content: 'Exercise',
          exercise: {
            instructions:
              'Create a variable called age set to a whole number (int), and a variable called height set to a decimal number (float, e.g. 1.75). Print both.',
            starterCode: 'age = 0\nheight = 0.0\nprint(age)\nprint(height)',
            language: 'python',
            expectedOutput: '',
            solution: 'age = 25\nheight = 1.75\nprint(age)\nprint(height)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: str, int, float',
          content: 'Quiz',
          quiz: {
            question: 'Which of these is a float?',
            options: [
              { text: '3.5', isCorrect: true },
              { text: '3', isCorrect: false },
              { text: '"3"', isCorrect: false },
              { text: 'True', isCorrect: false },
            ],
            explanation: 'A float is a number with a decimal point, like 3.5. Whole numbers without a decimal point are int, and quoted values are str.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'True or False (bool)',
          content:
            "Think of a light switch: it's either ON or OFF — there's no in-between. Python has a data type just for this kind of yes/no, on/off answer, called a boolean, or bool for short. A bool can only ever be one of two values: True or False.\n\nNotice: True and False always start with a capital letter in Python, and they are NEVER in quotation marks (\"True\" would just be text, not a boolean).\n\nExample:\nis_raining = True\nis_weekend = False\n\nMain point (repeat it): bool means True or False only — like a light switch that's either on or off, nothing in between.",
        },
        {
          type: 'code',
          title: 'Try it: booleans',
          content: 'is_student = True\nis_sleeping = False\nprint(is_student)\nprint(is_sleeping)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Create a boolean',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a variable called is_hungry and set it to True or False, based on how you feel right now. Then print it.',
            starterCode: 'is_hungry = False\nprint(is_hungry)',
            language: 'python',
            expectedOutput: '',
            solution: 'is_hungry = True\nprint(is_hungry)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Booleans',
          content: 'Quiz',
          quiz: {
            question: 'Which of these is a valid boolean value in Python?',
            options: [
              { text: 'True', isCorrect: true },
              { text: '"True"', isCorrect: false },
              { text: 'true', isCorrect: false },
              { text: '1.0', isCorrect: false },
            ],
            explanation: 'Booleans in Python are exactly True or False, capitalized and without quotation marks. "True" in quotes is just text (a string).',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Naming Rules for Variables',
          content:
            "Just like labelling boxes, there are rules for naming variables so Python (and other people reading your code) can understand them clearly.\n\nPython's style, called snake_case, means: lowercase words separated by underscores _. Example: first_name, total_price, is_logged_in.\n\nRules to remember (repeat these — they matter):\n1. Names can only contain letters, numbers, and underscores — no spaces, no symbols like $ or -.\n2. Names cannot start with a number (age1 is fine, 1age is not).\n3. Names are case-sensitive: age and Age are two different variables.\n4. You cannot use Python's reserved keywords as variable names, like print, True, False, or if — Python needs those words for itself.\n\nMain point (say it again): use snake_case — lowercase words joined with underscores — and give your variables clear, descriptive names like total_price instead of tp.",
        },
        {
          type: 'code',
          title: 'Try it: good vs bad variable names',
          content:
            '# Good names (snake_case, descriptive):\nfirst_name = "Amara"\ntotal_price = 49.99\nis_logged_in = True\n\n# Bad names (avoid these):\n# 1name = "Amara"       -> starts with a number, not allowed\n# total price = 49.99   -> has a space, not allowed\n# print = "hello"       -> print is a reserved keyword, not allowed',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Fix the variable name',
          content: 'Exercise',
          exercise: {
            instructions:
              'The variable name below breaks the naming rules because it has a space. Fix it using snake_case (lowercase words joined with an underscore), then print it.',
            starterCode: 'first name = "Tunde"\nprint(first name)',
            language: 'python',
            expectedOutput: 'Tunde',
            solution: 'first_name = "Tunde"\nprint(first_name)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Naming Rules',
          content: 'Quiz',
          quiz: {
            question: 'Which of these is a valid, well-styled Python variable name?',
            options: [
              { text: 'total_price', isCorrect: true },
              { text: '1total', isCorrect: false },
              { text: 'total price', isCorrect: false },
              { text: 'print', isCorrect: false },
            ],
            explanation: 'total_price uses snake_case, does not start with a number, has no spaces, and is not a reserved keyword — so it follows all the naming rules.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 2 Recap',
          content:
            "Let's repeat everything you learned, one more time, so it really sticks:\n\n1. A variable is a labelled box that stores a value so you can reuse it later. You create one with =, e.g. age = 20.\n2. Text is called a string (str), and it always goes inside quotation marks: \"like this\" or 'like this'.\n3. Whole numbers are int (5, 20). Numbers with decimals are float (5.3, 20.75). Numbers never use quotation marks.\n4. True/False values are called booleans (bool) — like a light switch, only ON or OFF, always capitalized, never in quotes.\n5. Name your variables using snake_case (lowercase words joined by underscores), keep them descriptive, and never start with a number, use spaces, or use a reserved keyword like print or True.\n\nYou now know how to store and label almost any kind of information in Python. This is the foundation for everything you'll build next!",
        },
      ],
      flashcards: [
        { question: 'What is a variable?', answer: 'A labelled box that stores a value so you can use or reuse it later.' },
        { question: 'How do you create a variable in Python?', answer: 'Give it a name, then use = followed by the value, e.g. age = 20.' },
        { question: 'What is a string (str)?', answer: 'Text data, always written inside quotation marks, e.g. "hello" or \'hello\'.' },
        { question: 'What is the difference between int and float?', answer: 'int is a whole number (no decimal point); float is a number with a decimal point.' },
        { question: 'What is a boolean (bool)?', answer: 'A value that is either True or False — like a light switch that is only ON or OFF.' },
        { question: 'What naming style does Python use for variables?', answer: 'snake_case — lowercase words joined by underscores, e.g. total_price.' },
        { question: 'Can a variable name start with a number?', answer: 'No — variable names cannot start with a number, e.g. 1age is not allowed, but age1 is fine.' },
        { question: 'Are variable names case-sensitive?', answer: 'Yes — age and Age are treated as two completely different variables.' },
      ],
      mcqs: [
        {
          question: 'Which line correctly creates a variable holding text?',
          options: [
            { text: 'name = "Ada"', isCorrect: true },
            { text: 'name = Ada', isCorrect: false },
            { text: '"name" = Ada', isCorrect: false },
            { text: 'name == "Ada"', isCorrect: false },
          ],
          explanation: 'Text must be inside quotation marks, and a single = is used to store the value into the variable name.',
        },
        {
          question: 'What data type is the value 4.5?',
          options: [
            { text: 'float', isCorrect: true },
            { text: 'int', isCorrect: false },
            { text: 'str', isCorrect: false },
            { text: 'bool', isCorrect: false },
          ],
          explanation: '4.5 has a decimal point, so Python treats it as a float, not a whole number (int).',
        },
        {
          question: 'Which of these is a valid boolean value?',
          options: [
            { text: 'False', isCorrect: true },
            { text: '"False"', isCorrect: false },
            { text: 'false', isCorrect: false },
            { text: '0', isCorrect: false },
          ],
          explanation: 'Booleans must be exactly True or False, capitalized and without quotes.',
        },
        {
          question: 'Which variable name follows Python\'s snake_case naming rules?',
          options: [
            { text: 'user_age', isCorrect: true },
            { text: 'UserAge', isCorrect: false },
            { text: '2user', isCorrect: false },
            { text: 'user age', isCorrect: false },
          ],
          explanation: 'user_age is lowercase with an underscore between words — the correct snake_case style. The others break naming rules or use a different style.',
        },
        {
          question: 'What will type(10) return in Python?',
          options: [
            { text: "<class 'int'>", isCorrect: true },
            { text: "<class 'float'>", isCorrect: false },
            { text: "<class 'str'>", isCorrect: false },
            { text: "<class 'bool'>", isCorrect: false },
          ],
          explanation: '10 has no decimal point and no quotation marks, so Python identifies it as an int (whole number).',
        },
      ],
    },
    {
      title: 'Module 3: Making Programs Interactive (Math & Inputs)',
      description: 'Do simple math in Python and let users type things into your program.',
      contents: [
        {
          type: 'text',
          title: 'Python as a Calculator',
          content:
            "Think of Python as a very fast, very obedient calculator. Just like a calculator, you can hand it numbers and an operation, and it gives you the answer instantly — but remember our main rule from Module 1: it only does exactly what you tell it, so the symbols you use matter a lot.\n\nLet's start with the four operators you already know from school:\n+  addition (add two numbers)\n-  subtraction (take one number from another)\n*  multiplication (multiply two numbers) — note it's *, not x\n/  division (divide one number by another)\n\nExample:\nprint(5 + 3)   # shows 8\nprint(10 - 4)  # shows 6\nprint(6 * 2)   # shows 12\nprint(9 / 2)   # shows 4.5\n\nMain point (remember it): +, -, *, / work just like in maths class, except multiplication uses * and NOT x.",
        },
        {
          type: 'code',
          title: 'Try it: basic math',
          content: 'print(5 + 3)\nprint(10 - 4)\nprint(6 * 2)\nprint(9 / 2)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Do the math',
          content: 'Exercise',
          exercise: {
            instructions: 'Print the result of 15 divided by 3, using a single print() statement with the / operator.',
            starterCode: 'print(0)',
            language: 'python',
            expectedOutput: '5.0',
            solution: 'print(15 / 3)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Basic Operators',
          content: 'Quiz',
          quiz: {
            question: 'Which symbol does Python use for multiplication?',
            options: [
              { text: '*', isCorrect: true },
              { text: 'x', isCorrect: false },
              { text: '^', isCorrect: false },
              { text: '×', isCorrect: false },
            ],
            explanation: 'Python uses * for multiplication. The letter x and the symbol × are not valid operators in Python.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Advanced Math Operators',
          content:
            "Beyond the basics, Python has three more useful operators. Think of them as special calculator buttons you may not have used much before:\n\n**  exponent (raises a number to a power). Example: 2 ** 3 means 2 x 2 x 2 = 8\n//  floor division (divides, then drops anything after the decimal point — like cutting off the remainder). Example: 7 // 2 = 3 (not 3.5)\n%  modulo (gives you ONLY the remainder after dividing). Example: 7 % 2 = 1, because 7 divided by 2 is 3 remainder 1\n\nReal life scenario: imagine you have 7 sweets and want to share them equally among 2 friends. // tells you how many whole sweets each friend gets (3), while % tells you how many sweets are left over (1) — the one you get to keep for yourself!\n\nMain point (repeat it): ** = power, // = whole-number division (no decimals), % = remainder only.",
        },
        {
          type: 'code',
          title: 'Try it: advanced operators',
          content: 'print(2 ** 3)   # 8 (2 x 2 x 2)\nprint(7 // 2)   # 3 (whole division, no decimal)\nprint(7 % 2)    # 1 (the remainder)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Sharing sweets',
          content: 'Exercise',
          exercise: {
            instructions:
              'You have 20 sweets to share equally among 3 friends. Print how many whole sweets each friend gets (use //), then print how many are left over (use %).',
            starterCode: 'print(0)\nprint(0)',
            language: 'python',
            expectedOutput: '6\n2',
            solution: 'print(20 // 3)\nprint(20 % 3)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Advanced Operators',
          content: 'Quiz',
          quiz: {
            question: 'What does 7 % 2 return?',
            options: [
              { text: '1 (the remainder)', isCorrect: true },
              { text: '3.5', isCorrect: false },
              { text: '3', isCorrect: false },
              { text: '14', isCorrect: false },
            ],
            explanation: '% (modulo) returns only the remainder after division. 7 divided by 2 is 3 remainder 1, so 7 % 2 = 1.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Getting User Input',
          content:
            "So far, Python only shows things TO us. Now let's make it listen. Imagine a shop assistant who asks, \"What's your name?\" and waits for your answer before continuing — that's exactly what the input() function does.\n\nExample:\nname = input(\"What is your name? \")\nprint(\"Hello,\", name)\n\nWhen this runs, Python pauses, shows the question, waits for you to type something and press Enter, then stores whatever you typed into the variable name.\n\nMain point (remember it): input() pauses the program, asks a question, and saves whatever the user types into a variable.\n\nVery important twist: no matter what the user types — even if they type a number like 25 — input() ALWAYS gives it back as a string (text). We'll fix that next with type casting.",
        },
        {
          type: 'code',
          title: 'Try it: input()',
          content: 'name = input("What is your name? ")\nprint("Hello,", name)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Ask and greet',
          content: 'Exercise',
          exercise: {
            instructions: 'Use input() to ask "What is your favorite color? " and store the answer in a variable called color. Then print "Nice, I like", color, "too!"',
            starterCode: 'color = input("What is your favorite color? ")\nprint(color)',
            language: 'python',
            expectedOutput: '',
            solution: 'color = input("What is your favorite color? ")\nprint("Nice, I like", color, "too!")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: input()',
          content: 'Quiz',
          quiz: {
            question: 'What type of data does input() ALWAYS return, even if the user types a number?',
            options: [
              { text: 'A string (str)', isCorrect: true },
              { text: 'An integer (int)', isCorrect: false },
              { text: 'A float', isCorrect: false },
              { text: 'A boolean', isCorrect: false },
            ],
            explanation: 'input() always returns text (a string), no matter what the user types. If you need a number, you must convert it yourself.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Type Casting (Conversion)',
          content:
            "Remember: input() always gives you a string, even for numbers. But if you try to do math with a string, Python gets confused — you can't add \"5\" + \"3\" and expect 8, because Python sees them as text, not numbers, like trying to add two name tags together.\n\nThe fix is type casting: converting a value from one type to another, on purpose.\n\nstr(x)   converts x into text\nint(x)   converts x into a whole number\nfloat(x) converts x into a decimal number\n\nReal life scenario: imagine a form where you write your age in words on paper, but the computer system needs it as an actual number to calculate things — someone has to convert your handwriting into a number first. That's exactly what int() does.\n\nExample:\nage_text = input(\"How old are you? \")   # this is a string, e.g. \"25\"\nage_number = int(age_text)              # now it's a real number, 25\nprint(age_number + 1)                   # this works because it's a number now\n\nMain point (repeat it, it's important): input() gives strings. Use int() or float() to convert to numbers before doing math.",
        },
        {
          type: 'code',
          title: 'Try it: type casting',
          content: 'age_text = input("How old are you? ")\nage_number = int(age_text)\nprint("Next year you will be", age_number + 1)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Convert and calculate',
          content: 'Exercise',
          exercise: {
            instructions:
              'Ask the user "Enter a number: " with input(), convert their answer to an int using int(), then print the number multiplied by 2.',
            starterCode: 'number = input("Enter a number: ")\nprint(number)',
            language: 'python',
            expectedOutput: '',
            solution: 'number = int(input("Enter a number: "))\nprint(number * 2)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Type Casting',
          content: 'Quiz',
          quiz: {
            question: 'Why do we need to use int() on the result of input() before doing math with it?',
            options: [
              { text: 'Because input() always returns a string, and Python cannot do math on strings the way it does on numbers', isCorrect: true },
              { text: 'Because int() makes the program run faster', isCorrect: false },
              { text: 'Because input() only works with int()', isCorrect: false },
              { text: 'It is not actually necessary', isCorrect: false },
            ],
            explanation: 'input() always returns text (a string). To use the value in math, you must convert it to a number first with int() or float().',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Mini Project: Bill & Tip Calculator',
          content:
            "Let's combine everything from this module — math operators, input(), and type casting — into one small real-world program: a bill and tip calculator, just like the one a waiter might use.\n\nSteps:\n1. Ask the user for the bill amount using input(), and convert it to a float.\n2. Ask the user for the tip percentage using input(), and convert it to a float.\n3. Calculate the tip amount: bill multiplied by (tip percentage / 100).\n4. Calculate the total: bill plus tip amount.\n5. Print the results.\n\nThis mini project uses everything we repeated throughout this module: input() to ask questions, float() to convert answers into numbers, and + and * to calculate the total. This is exactly how real apps, like food delivery or restaurant apps, calculate your total bill!",
        },
        {
          type: 'code',
          title: 'Bill & Tip Calculator (example solution)',
          content:
            'bill = float(input("Enter the bill amount: "))\ntip_percent = float(input("Enter the tip percentage: "))\n\ntip_amount = bill * (tip_percent / 100)\ntotal = bill + tip_amount\n\nprint("Tip amount:", tip_amount)\nprint("Total to pay:", total)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Mini Project: Build your Bill & Tip Calculator',
          content: 'Exercise',
          exercise: {
            instructions:
              'Complete the bill and tip calculator: ask for the bill amount and tip percentage using input() (convert both to float), then print the total amount to pay (bill + tip amount, where tip amount = bill * tip_percent / 100).',
            starterCode:
              'bill = float(input("Enter the bill amount: "))\ntip_percent = float(input("Enter the tip percentage: "))\n\n# calculate tip_amount and total below\n',
            language: 'python',
            expectedOutput: '',
            solution:
              'bill = float(input("Enter the bill amount: "))\ntip_percent = float(input("Enter the tip percentage: "))\n\ntip_amount = bill * (tip_percent / 100)\ntotal = bill + tip_amount\n\nprint("Total to pay:", total)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Bill & Tip Calculator',
          content: 'Quiz',
          quiz: {
            question: 'In the bill and tip calculator, why must we convert the input() values with float() before calculating?',
            options: [
              { text: 'Because input() gives text, and we need real numbers to do math like multiplication and addition', isCorrect: true },
              { text: 'Because float() makes the numbers print in a nicer color', isCorrect: false },
              { text: 'Because bills are always whole numbers', isCorrect: false },
              { text: 'It is optional and does not affect the calculation', isCorrect: false },
            ],
            explanation: 'input() always returns a string. Without converting it with float(), trying to multiply or add it would either error or behave incorrectly.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 3 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. Python works like a calculator: + adds, - subtracts, * multiplies (not x), / divides.\n2. ** raises to a power, // divides and drops the remainder (whole-number division), % gives you ONLY the remainder.\n3. input(\"question\") pauses the program, asks a question, and returns whatever the user types.\n4. input() ALWAYS returns a string, even if the user types a number — this is one of the most important things to remember.\n5. Type casting converts values between types: int() for whole numbers, float() for decimals, str() for text. Convert input() results to numbers before doing math with them.\n6. In our Bill & Tip Calculator mini project, we combined input(), float(), and math operators to build something a real restaurant app could use.\n\nYou can now write programs that talk to the user, do calculations, and react to what people type. That's a huge step — you're building real, interactive programs now!",
        },
      ],
      flashcards: [
        { question: 'What symbol does Python use for multiplication?', answer: '* (not x)' },
        { question: 'What does the ** operator do?', answer: 'Raises a number to a power (exponent). E.g. 2 ** 3 = 8' },
        { question: 'What does // do?', answer: 'Floor (whole-number) division — divides and drops anything after the decimal point.' },
        { question: 'What does % do?', answer: 'Modulo — returns only the remainder after division. E.g. 7 % 2 = 1' },
        { question: 'What does input() do?', answer: 'Pauses the program, shows a question/message, and returns whatever the user types.' },
        { question: 'What data type does input() always return?', answer: 'A string (str) — even if the user types a number.' },
        { question: 'How do you convert a string to a whole number?', answer: 'Use int(), e.g. int("25") becomes 25.' },
        { question: 'How do you convert a string to a decimal number?', answer: 'Use float(), e.g. float("4.5") becomes 4.5.' },
        { question: 'Why must you convert input() before doing math with it?', answer: 'Because input() returns text, and Python cannot do math directly on text — it must be converted to int or float first.' },
      ],
      mcqs: [
        {
          question: 'What is the result of print(2 ** 3)?',
          options: [
            { text: '8', isCorrect: true },
            { text: '6', isCorrect: false },
            { text: '5', isCorrect: false },
            { text: '9', isCorrect: false },
          ],
          explanation: '** is the exponent operator. 2 ** 3 means 2 x 2 x 2, which equals 8.',
        },
        {
          question: 'What is the result of print(17 // 5)?',
          options: [
            { text: '3', isCorrect: true },
            { text: '3.4', isCorrect: false },
            { text: '2', isCorrect: false },
            { text: '85', isCorrect: false },
          ],
          explanation: '// performs whole-number division and drops the decimal part. 17 divided by 5 is 3.4, so // gives 3.',
        },
        {
          question: 'What is the result of print(17 % 5)?',
          options: [
            { text: '2', isCorrect: true },
            { text: '3', isCorrect: false },
            { text: '3.4', isCorrect: false },
            { text: '12', isCorrect: false },
          ],
          explanation: '% returns only the remainder. 17 divided by 5 is 3 remainder 2, so 17 % 5 = 2.',
        },
        {
          question: 'What does age = input("Enter your age: ") store in age, if the user types 30?',
          options: [
            { text: '"30" (a string)', isCorrect: true },
            { text: '30 (an int)', isCorrect: false },
            { text: '30.0 (a float)', isCorrect: false },
            { text: 'True (a boolean)', isCorrect: false },
          ],
          explanation: 'input() always returns a string, so even though the user typed a number, it is stored as the text "30", not the number 30.',
        },
        {
          question: 'Which line correctly converts user input into a number you can do math with?',
          options: [
            { text: 'age = int(input("Enter your age: "))', isCorrect: true },
            { text: 'age = input("Enter your age: ")', isCorrect: false },
            { text: 'age = str(input("Enter your age: "))', isCorrect: false },
            { text: 'age = "input(Enter your age: )"', isCorrect: false },
          ],
          explanation: 'Wrapping input() with int() converts the text the user typed into a real whole number, so it can be used in calculations.',
        },
      ],
    },
    {
      title: 'Module 4: Control Flow (Making Decisions)',
      description: 'Teach your program to make choices, like a person deciding what to do next.',
      contents: [
        {
          type: 'text',
          title: 'Programs That Make Decisions',
          content:
            "Think about your morning routine: \"IF it's raining, take an umbrella. OTHERWISE, wear sunglasses.\" You make decisions like this all day without even noticing. So far, our Python programs have only ever done ONE thing, in order, from top to bottom. Now we'll teach them to choose between different paths, just like you do.\n\nThis is called control flow — controlling which lines of code actually run, based on a condition (a question with a True or False answer).\n\nMain point (remember it): control flow means your program can choose a different path depending on whether something is True or False — just like deciding what to wear based on the weather.",
        },
        {
          type: 'text',
          title: 'Comparison Operators',
          content:
            "Before Python can make a decision, it needs to ask a question that gives a True or False answer — remember bool from Module 2? Comparison operators are how we ask those questions.\n\n>   greater than\n<   less than\n>=  greater than or equal to\n<=  less than or equal to\n==  equal to (TWO equal signs — this checks if two things are the same)\n!=  not equal to\n\nBig warning (repeat this one loudly): = stores a value into a variable (like age = 20), but == compares two values and asks \"are these the same?\" Mixing them up is one of the most common beginner mistakes!\n\nExample:\nage = 20\nprint(age > 18)   # True, because 20 is greater than 18\nprint(age == 18)  # False, because 20 is not equal to 18\n\nMain point (again): == asks a question (are these equal?), = gives an instruction (store this value). Never confuse them.",
        },
        {
          type: 'code',
          title: 'Try it: comparison operators',
          content: 'age = 20\nprint(age > 18)\nprint(age == 18)\nprint(age != 18)\nprint(age >= 20)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Compare two numbers',
          content: 'Exercise',
          exercise: {
            instructions: 'Create two variables, score = 75 and pass_mark = 50. Print whether score is greater than or equal to pass_mark using >=.',
            starterCode: 'score = 75\npass_mark = 50\nprint(0)',
            language: 'python',
            expectedOutput: 'True',
            solution: 'score = 75\npass_mark = 50\nprint(score >= pass_mark)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Comparison Operators',
          content: 'Quiz',
          quiz: {
            question: 'Which operator checks if two values are equal?',
            options: [
              { text: '==', isCorrect: true },
              { text: '=', isCorrect: false },
              { text: '!=', isCorrect: false },
              { text: '<=', isCorrect: false },
            ],
            explanation: '== compares two values and returns True or False. A single = is used only to store a value into a variable, not to compare.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'The if and else Statements',
          content:
            "Now let's actually make decisions. The if statement says: \"IF this condition is True, run this block of code.\" The else statement says: \"OTHERWISE (if it was False), run this other block instead.\"\n\nReal life scenario: \"IF you are 18 or older, you can vote. OTHERWISE, you cannot vote yet.\"\n\nExample:\nage = 20\nif age >= 18:\n    print(\"You can vote\")\nelse:\n    print(\"You cannot vote yet\")\n\nNotice the colon : after the condition, and notice that the code underneath is indented (pushed in with spaces). We'll explain indentation properly next, but for now just remember: every if needs a colon, and the code that runs because of it must be indented.\n\nMain point (repeat it): if condition: runs the block below it ONLY when the condition is True. else: runs its block only when the condition was False.",
        },
        {
          type: 'code',
          title: 'Try it: if and else',
          content: 'age = 20\nif age >= 18:\n    print("You can vote")\nelse:\n    print("You cannot vote yet")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Can you drive?',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a variable age = 16. Print "You can drive" if age is greater than or equal to 18, otherwise print "You cannot drive yet".',
            starterCode: 'age = 16\n',
            language: 'python',
            expectedOutput: 'You cannot drive yet',
            solution: 'age = 16\nif age >= 18:\n    print("You can drive")\nelse:\n    print("You cannot drive yet")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: if/else',
          content: 'Quiz',
          quiz: {
            question: 'When does the code inside the else block run?',
            options: [
              { text: 'Only when the if condition was False', isCorrect: true },
              { text: 'Every single time the program runs', isCorrect: false },
              { text: 'Only when the if condition was True', isCorrect: false },
              { text: 'Never — else is optional decoration', isCorrect: false },
            ],
            explanation: 'else only runs when the matching if condition evaluated to False. It is the "otherwise" path.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Indentation in Python',
          content:
            "Here's something that surprises many beginners coming from other languages: in Python, spacing (indentation) is not just for looks — it's part of the actual instructions!\n\nThink of indentation like paragraphs in an essay: it visually groups related sentences together. In Python, indentation groups lines of code together, showing which lines belong \"inside\" an if, else, loop, or function.\n\nRule to remember: after any line ending in a colon (:), the next lines that belong to it must be indented — usually by 4 spaces (most code editors do this automatically when you press Tab).\n\nif age >= 18:\n    print(\"Adult\")      # indented — belongs to the if\n    print(\"Can vote\")   # also indented — still belongs to the if\nprint(\"Done checking\")  # NOT indented — runs no matter what\n\nMain point (repeat it, because it's crucial): indentation is not decoration in Python — it decides which lines belong together. Missing or incorrect indentation causes errors.",
        },
        {
          type: 'code',
          title: 'Try it: indentation matters',
          content:
            'age = 20\nif age >= 18:\n    print("Adult")      # indented, belongs to the if\n    print("Can vote")   # indented, belongs to the if\nprint("Done checking")  # not indented, always runs',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Indentation',
          content: 'Quiz',
          quiz: {
            question: 'Why is indentation important in Python?',
            options: [
              { text: 'It tells Python which lines of code belong together, like inside an if block', isCorrect: true },
              { text: 'It only makes the code look prettier, with no real effect', isCorrect: false },
              { text: 'It speeds up the program', isCorrect: false },
              { text: 'It is only needed inside comments', isCorrect: false },
            ],
            explanation: 'Unlike many languages, Python uses indentation (spacing) to define which lines are grouped inside an if, else, loop, or function.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Multiple Conditions (elif)',
          content:
            "What if there are more than two possible paths? Real life scenario: \"IF your score is 70 or above, you get an A. ELSE IF it's 50 or above, you get a B. OTHERWISE, you get a C.\" That middle \"else if\" is written in Python as elif.\n\nYou can chain as many elif blocks as you need between if and else. Python checks them in order, top to bottom, and runs the FIRST one that is True, then skips the rest.\n\nExample:\nscore = 65\nif score >= 70:\n    print(\"Grade: A\")\nelif score >= 50:\n    print(\"Grade: B\")\nelse:\n    print(\"Grade: C\")\n\nHere, score is 65: the first condition (>= 70) is False, so Python checks elif (>= 50), which is True — it prints \"Grade: B\" and stops, never even checking further.\n\nMain point (repeat it): elif lets you check multiple conditions in order. Python stops at the first True one it finds.",
        },
        {
          type: 'code',
          title: 'Try it: elif chains',
          content:
            'score = 65\nif score >= 70:\n    print("Grade: A")\nelif score >= 50:\n    print("Grade: B")\nelse:\n    print("Grade: C")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Grade classifier',
          content: 'Exercise',
          exercise: {
            instructions:
              'Create a variable score = 85. Print "A" if score is 80 or above, "B" if it is 60 or above (but less than 80), otherwise print "C".',
            starterCode: 'score = 85\n',
            language: 'python',
            expectedOutput: 'A',
            solution: 'score = 85\nif score >= 80:\n    print("A")\nelif score >= 60:\n    print("B")\nelse:\n    print("C")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: elif',
          content: 'Quiz',
          quiz: {
            question: 'In an if/elif/else chain, how many blocks will actually run?',
            options: [
              { text: 'Only the first one whose condition is True (then Python stops checking)', isCorrect: true },
              { text: 'All of the blocks, every time', isCorrect: false },
              { text: 'Only the last elif, always', isCorrect: false },
              { text: 'None, unless else is missing', isCorrect: false },
            ],
            explanation: 'Python checks conditions top to bottom and runs only the first True one, then skips the rest of the chain.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Logical Operators (and, or, not)',
          content:
            "Sometimes one condition isn't enough. Real life scenario: \"You can enter the amusement park ride IF you are tall enough AND you are calm enough.\" Both conditions must be true. Python gives us three logical operators to combine or flip conditions:\n\nand   both conditions must be True for the whole thing to be True\nor    at least ONE condition must be True for the whole thing to be True\nnot   flips True to False, and False to True\n\nExample:\nage = 20\nhas_ticket = True\nif age >= 18 and has_ticket:\n    print(\"Welcome in!\")\n\nHere, BOTH age >= 18 AND has_ticket must be True for the message to print. If either one is False, nothing happens (no else here, so it just moves on).\n\nMain point (repeat it): and needs everything True, or needs just one thing True, not flips True and False.",
        },
        {
          type: 'code',
          title: 'Try it: and, or, not',
          content:
            'age = 20\nhas_ticket = True\nis_banned = False\n\nprint(age >= 18 and has_ticket)   # True and True -> True\nprint(age < 18 or has_ticket)    # False or True -> True\nprint(not is_banned)             # not False -> True',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Ride eligibility',
          content: 'Exercise',
          exercise: {
            instructions:
              'Create height = 150 and has_adult = False. Print "Can ride" if height is at least 140 AND has_adult is True, otherwise print "Cannot ride".',
            starterCode: 'height = 150\nhas_adult = False\n',
            language: 'python',
            expectedOutput: 'Cannot ride',
            solution:
              'height = 150\nhas_adult = False\nif height >= 140 and has_adult:\n    print("Can ride")\nelse:\n    print("Cannot ride")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Logical Operators',
          content: 'Quiz',
          quiz: {
            question: 'For "True and False", what is the result?',
            options: [
              { text: 'False', isCorrect: true },
              { text: 'True', isCorrect: false },
              { text: 'Error', isCorrect: false },
              { text: 'None', isCorrect: false },
            ],
            explanation: 'and requires BOTH sides to be True to produce True. Since one side is False, the whole expression is False.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Nested Decisions',
          content:
            "Sometimes a decision only makes sense AFTER another decision. Real life scenario: \"IF it's your birthday... THEN, IF you're also on vacation, you get double celebration! Otherwise, just a normal birthday celebration.\" That's a decision inside a decision — a nested if.\n\nIn Python, you simply put an if statement inside another if statement's indented block:\n\nage = 20\nhas_id = True\nif age >= 18:\n    if has_id:\n        print(\"Entry allowed\")\n    else:\n        print(\"Bring your ID\")\nelse:\n    print(\"Too young to enter\")\n\nNotice the inner if/else is indented ONE MORE level than the outer if — this shows Python (and us humans reading it) that it only runs after the outer condition is already True.\n\nMain point (repeat it): a nested if is an if inside another if's block, indented one extra level, used when a decision depends on another decision first.",
        },
        {
          type: 'code',
          title: 'Try it: nested if',
          content:
            'age = 20\nhas_id = True\nif age >= 18:\n    if has_id:\n        print("Entry allowed")\n    else:\n        print("Bring your ID")\nelse:\n    print("Too young to enter")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Nested Decisions',
          content: 'Quiz',
          quiz: {
            question: 'Why would you use a nested if instead of one big if?',
            options: [
              { text: 'When a second decision only matters after the first condition is already True', isCorrect: true },
              { text: 'Nested ifs run faster than normal ifs', isCorrect: false },
              { text: 'Python requires all ifs to be nested', isCorrect: false },
              { text: 'To avoid using elif', isCorrect: false },
            ],
            explanation: 'A nested if is placed inside another if\'s block so its condition is only checked once the outer condition has already been satisfied.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Mini Project: Grade Classifier',
          content:
            "Let's combine everything from this module — comparison operators, if/elif/else, indentation, and logical operators — into one small real-world program: a grade classifier, just like a teacher might use to grade a test automatically.\n\nSteps:\n1. Ask the user for their score using input(), and convert it to an int (remember Module 3!).\n2. Use if/elif/else to check the score against grade boundaries.\n3. Print the matching grade.\n\nThis is exactly how school report card systems and online quiz apps calculate your grade automatically.",
        },
        {
          type: 'code',
          title: 'Grade Classifier (example solution)',
          content:
            'score = int(input("Enter your score: "))\n\nif score >= 80:\n    print("Grade: A")\nelif score >= 60:\n    print("Grade: B")\nelif score >= 40:\n    print("Grade: C")\nelse:\n    print("Grade: F")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Mini Project: Build your Grade Classifier',
          content: 'Exercise',
          exercise: {
            instructions:
              'Complete the grade classifier: given a variable score = 55, print "Grade: A" if score >= 80, "Grade: B" if score >= 60, "Grade: C" if score >= 40, otherwise print "Grade: F".',
            starterCode: 'score = 55\n',
            language: 'python',
            expectedOutput: 'Grade: C',
            solution:
              'score = 55\nif score >= 80:\n    print("Grade: A")\nelif score >= 60:\n    print("Grade: B")\nelif score >= 40:\n    print("Grade: C")\nelse:\n    print("Grade: F")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Grade Classifier',
          content: 'Quiz',
          quiz: {
            question: 'In the grade classifier, if score = 45, which grade is printed?',
            options: [
              { text: 'Grade: C', isCorrect: true },
              { text: 'Grade: A', isCorrect: false },
              { text: 'Grade: B', isCorrect: false },
              { text: 'Grade: F', isCorrect: false },
            ],
            explanation: '45 is not >= 80 and not >= 60, but it is >= 40, so the elif score >= 40 branch runs, printing "Grade: C".',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 4 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. Control flow means your program can choose different paths, like deciding what to wear based on the weather.\n2. Comparison operators (>, <, >=, <=, ==, !=) ask True/False questions. Remember: = stores a value, == compares two values — never confuse them.\n3. if condition: runs its block only when True. else: runs only when the if was False.\n4. Indentation is not decoration — it tells Python which lines belong together. Always indent the lines after a colon.\n5. elif lets you check multiple conditions in order; Python runs only the first True one, then stops.\n6. Logical operators combine conditions: and needs everything True, or needs just one True, not flips True/False.\n7. A nested if is an if inside another if's block, used when a decision depends on a previous decision.\n8. Our Grade Classifier mini project combined all of this into one real, useful program.\n\nYour programs can now think and choose, just like a person deciding what to do next. This is a major milestone — decision-making is at the heart of almost every real program!",
        },
      ],
      flashcards: [
        { question: 'What is control flow?', answer: 'The ability of a program to choose different paths of code to run, based on conditions.' },
        { question: 'What is the difference between = and ==?', answer: '= stores a value into a variable. == compares two values and returns True or False.' },
        { question: 'What does an if statement do?', answer: 'Runs its indented block of code only when its condition is True.' },
        { question: 'When does the else block run?', answer: 'Only when the matching if (and any elif) condition was False.' },
        { question: 'Why does indentation matter in Python?', answer: 'It tells Python which lines of code belong together, like inside an if or else block. It is not just decoration.' },
        { question: 'What does elif let you do?', answer: 'Check another condition if the previous if/elif was False. Python runs only the first True branch.' },
        { question: 'What does the and operator require?', answer: 'Both conditions must be True for the whole expression to be True.' },
        { question: 'What does the or operator require?', answer: 'At least one condition must be True for the whole expression to be True.' },
        { question: 'What does the not operator do?', answer: 'Flips True to False, and False to True.' },
        { question: 'What is a nested if?', answer: 'An if statement placed inside another if\'s block, used when a decision only matters after a previous condition is True.' },
      ],
      mcqs: [
        {
          question: 'What is the result of print(10 == 10)?',
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
            { text: '10', isCorrect: false },
            { text: 'Error', isCorrect: false },
          ],
          explanation: '== compares two values. Since 10 equals 10, the comparison returns True.',
        },
        {
          question: 'What happens if the condition in an if statement is False and there is no else?',
          options: [
            { text: 'Nothing happens — Python just moves on to the next line after the if block', isCorrect: true },
            { text: 'Python raises an error', isCorrect: false },
            { text: 'The if block runs anyway', isCorrect: false },
            { text: 'The program stops completely', isCorrect: false },
          ],
          explanation: 'Without an else, if a condition is False, Python simply skips the if block and continues with the rest of the program.',
        },
        {
          question: 'Why does this code cause an error?\nif age >= 18:\nprint("Adult")',
          options: [
            { text: 'The print line is not indented, so Python does not know it belongs to the if', isCorrect: true },
            { text: 'age >= 18 is not a valid condition', isCorrect: false },
            { text: 'print() cannot be used inside an if', isCorrect: false },
            { text: 'The colon is unnecessary', isCorrect: false },
          ],
          explanation: 'Any line meant to run inside an if block must be indented. Without indentation, Python cannot tell it belongs to the if.',
        },
        {
          question: 'Given score = 72, what does this print?\nif score >= 90: print("A")\nelif score >= 70: print("B")\nelse: print("C")',
          options: [
            { text: 'B', isCorrect: true },
            { text: 'A', isCorrect: false },
            { text: 'C', isCorrect: false },
            { text: 'Nothing', isCorrect: false },
          ],
          explanation: '72 is not >= 90, but it is >= 70, so the elif branch runs and prints "B". Python stops checking after the first True branch.',
        },
        {
          question: 'What is the result of print(True and False)?',
          options: [
            { text: 'False', isCorrect: true },
            { text: 'True', isCorrect: false },
            { text: 'None', isCorrect: false },
            { text: 'Error', isCorrect: false },
          ],
          explanation: 'and requires both sides to be True. Since one side is False, the entire expression evaluates to False.',
        },
      ],
    },
    {
      title: 'Module 5: Loops & Repetition (Automating Tasks)',
      description: 'Get Python to repeat actions for you instead of doing them by hand.',
      contents: [
        {
          type: 'text',
          title: 'Why Do We Need Loops?',
          content:
            "Imagine you had to greet 100 students by typing print(\"Hello, [name]\") 100 separate times. That would be slow, boring, and easy to mess up. Now imagine a teacher who just says, \"Greet EVERY student on this list,\" and it happens automatically, one by one. That's exactly what a loop does in Python — it repeats an action for you, automatically, without retyping the same code over and over.\n\nMain point (remember it): a loop repeats a block of code automatically, so you don't have to copy and paste the same instruction again and again.",
        },
        {
          type: 'text',
          title: 'for Loops',
          content:
            "A for loop is used when you know how many times you want to repeat something, or you want to go through every item in a group (like every student on a list). Think of it like flipping through every page in a book, one page at a time, until you reach the end.\n\nExample:\nfor letter in \"abc\":\n    print(letter)\n\nThis prints:\na\nb\nc\n\nHere's how to read it out loud: \"FOR each letter IN the text 'abc', print that letter.\" Python takes each item one at a time, runs the indented block (remember indentation from Module 4!), then moves to the next item, until there are no items left.\n\nMain point (repeat it): for item in group: repeats the indented block once for every item in the group, automatically.",
        },
        {
          type: 'code',
          title: 'Try it: a simple for loop',
          content: 'for letter in "abc":\n    print(letter)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Loop through your name',
          content: 'Exercise',
          exercise: {
            instructions: 'Use a for loop to print every letter in the word "Python", one letter per line.',
            starterCode: 'for letter in "Python":\n    pass',
            language: 'python',
            expectedOutput: 'P\ny\nt\nh\no\nn',
            solution: 'for letter in "Python":\n    print(letter)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: for Loops',
          content: 'Quiz',
          quiz: {
            question: 'What does a for loop do?',
            options: [
              { text: 'Repeats a block of code once for every item in a group', isCorrect: true },
              { text: 'Runs a block of code exactly once', isCorrect: false },
              { text: 'Deletes items from a group', isCorrect: false },
              { text: 'Stops the program immediately', isCorrect: false },
            ],
            explanation: 'A for loop goes through each item in a group (like a string or a list) one at a time, running the indented block for each one.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'The range() Function',
          content:
            "What if you just want to repeat something a certain number of times, like 5 times, without looping through letters or a list? That's exactly what range() is for — think of it like a ticket dispenser that hands out numbers one at a time: 0, 1, 2, 3... up to (but not including) the number you asked for.\n\nrange(5)          gives 0, 1, 2, 3, 4  (5 numbers, starting at 0, stopping BEFORE 5)\nrange(1, 6)       gives 1, 2, 3, 4, 5  (starts at 1, stops before 6)\nrange(0, 10, 2)   gives 0, 2, 4, 6, 8  (starts at 0, stops before 10, counts in steps of 2)\n\nExample:\nfor n in range(1, 6):\n    print(n)\n\nThis prints the numbers 1 through 5, each on its own line.\n\nMain point (repeat it, because it confuses everyone at first): range(start, stop, step) counts starting at start, and stops BEFORE stop — it never includes the stop number itself.",
        },
        {
          type: 'code',
          title: 'Try it: range()',
          content: 'for n in range(1, 6):\n    print(n)\n\nfor n in range(0, 10, 2):\n    print(n)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Countdown',
          content: 'Exercise',
          exercise: {
            instructions: 'Use a for loop and range() to print the numbers 1 to 5 (inclusive), each on its own line.',
            starterCode: 'for n in range(0):\n    pass',
            language: 'python',
            expectedOutput: '1\n2\n3\n4\n5',
            solution: 'for n in range(1, 6):\n    print(n)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: range()',
          content: 'Quiz',
          quiz: {
            question: 'What numbers does range(1, 6) produce?',
            options: [
              { text: '1, 2, 3, 4, 5', isCorrect: true },
              { text: '1, 2, 3, 4, 5, 6', isCorrect: false },
              { text: '0, 1, 2, 3, 4, 5', isCorrect: false },
              { text: '6, 5, 4, 3, 2, 1', isCorrect: false },
            ],
            explanation: 'range(1, 6) starts at 1 and stops BEFORE 6, so it produces 1, 2, 3, 4, 5 — six is never included.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'while Loops',
          content:
            "A for loop is great when you know how many times to repeat. But sometimes you don't know in advance — you just want to keep repeating AS LONG AS something is True. That's what a while loop is for.\n\nReal life scenario: \"Keep stirring the pot WHILE the soup is not ready yet.\" You don't know exactly how many stirs it will take — you just keep going until the condition changes.\n\nExample:\ncount = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1\n\nThis prints 1, 2, 3, 4, 5, then stops, because once count becomes 6, the condition count <= 5 becomes False.\n\nVery important: you must change something inside the loop (like count = count + 1) so the condition eventually becomes False — otherwise the loop never stops! We'll talk more about that in a moment.\n\nMain point (repeat it): while condition: keeps repeating its indented block for as long as the condition stays True.",
        },
        {
          type: 'code',
          title: 'Try it: a while loop',
          content: 'count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Countdown with while',
          content: 'Exercise',
          exercise: {
            instructions: 'Use a while loop to print the numbers 5, 4, 3, 2, 1 (counting down), then stop.',
            starterCode: 'count = 5\n',
            language: 'python',
            expectedOutput: '5\n4\n3\n2\n1',
            solution: 'count = 5\nwhile count >= 1:\n    print(count)\n    count = count - 1',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: while Loops',
          content: 'Quiz',
          quiz: {
            question: 'When does a while loop stop repeating?',
            options: [
              { text: 'As soon as its condition becomes False', isCorrect: true },
              { text: 'After exactly 10 repeats', isCorrect: false },
              { text: 'It never stops on its own', isCorrect: false },
              { text: 'As soon as it starts', isCorrect: false },
            ],
            explanation: 'A while loop keeps running its block as long as the condition is True, and stops the moment the condition becomes False.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Loop Control: continue and break',
          content:
            "Sometimes you want more control over a loop while it's running. Two special keywords help with that:\n\nbreak     stops the loop immediately and completely, like an emergency exit — even if there were more items left to go through.\ncontinue  skips just the REST of the current round, and jumps straight to the next one, like skipping one song on a playlist instead of turning off the music entirely.\n\nExample:\nfor n in range(1, 6):\n    if n == 3:\n        break\n    print(n)\n# prints 1, 2, then stops completely when n is 3\n\nfor n in range(1, 6):\n    if n == 3:\n        continue\n    print(n)\n# prints 1, 2, 4, 5 — skips only 3, but keeps going\n\nMain point (repeat it): break = stop the whole loop now. continue = skip this one round, but keep looping.",
        },
        {
          type: 'code',
          title: 'Try it: break vs continue',
          content:
            'for n in range(1, 6):\n    if n == 3:\n        break\n    print(n)\n\nprint("---")\n\nfor n in range(1, 6):\n    if n == 3:\n        continue\n    print(n)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Skip the number 3',
          content: 'Exercise',
          exercise: {
            instructions: 'Use a for loop with range(1, 6) to print all numbers 1 to 5, but SKIP printing the number 3 (use continue).',
            starterCode: 'for n in range(1, 6):\n    pass',
            language: 'python',
            expectedOutput: '1\n2\n4\n5',
            solution: 'for n in range(1, 6):\n    if n == 3:\n        continue\n    print(n)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: break and continue',
          content: 'Quiz',
          quiz: {
            question: 'What is the difference between break and continue?',
            options: [
              { text: 'break stops the loop completely; continue only skips the current round and keeps looping', isCorrect: true },
              { text: 'They do exactly the same thing', isCorrect: false },
              { text: 'break skips one round; continue stops the loop completely', isCorrect: false },
              { text: 'Both stop the entire program', isCorrect: false },
            ],
            explanation: 'break exits the loop entirely, like an emergency exit. continue just skips the rest of the current round and moves to the next one.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Infinite Loops (Why They Happen)',
          content:
            "Remember earlier we said a while loop needs something inside it to eventually make its condition False? If you forget that, you get an infinite loop — a loop that never stops, running forever (or until you force it to stop).\n\nReal life scenario: imagine being told \"keep pouring water into the cup WHILE the cup is not full,\" but you never actually check if the cup is full — you'd be pouring water forever!\n\nExample of an infinite loop (don't run this for real!):\ncount = 1\nwhile count <= 5:\n    print(count)\n    # forgot to add count = count + 1 !!\n# count never changes, so count <= 5 is ALWAYS True — this never stops\n\nHow to avoid infinite loops: always make sure something inside your while loop changes the condition, moving it closer to becoming False (like increasing or decreasing a counter).\n\nMain point (repeat it, because it's a classic beginner mistake): a while loop needs its condition to eventually turn False, or it will run forever. Always update the variable inside the loop.",
        },
        {
          type: 'code',
          title: 'Example: fixed vs infinite loop',
          content:
            '# CORRECT: this stops because count changes each time\ncount = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1\n\n# WRONG (do not run): this never stops because count never changes\n# count = 1\n# while count <= 5:\n#     print(count)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Infinite Loops',
          content: 'Quiz',
          quiz: {
            question: 'What usually causes an infinite loop?',
            options: [
              { text: 'The condition in a while loop never becomes False because nothing inside the loop changes it', isCorrect: true },
              { text: 'Using range() instead of a while loop', isCorrect: false },
              { text: 'Using break inside the loop', isCorrect: false },
              { text: 'Printing too many things at once', isCorrect: false },
            ],
            explanation: 'An infinite loop happens when the while condition never becomes False, usually because the loop forgets to update the variable the condition depends on.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Mini Project: Guess the Secret Number Game',
          content:
            "Let's combine everything from this module — while loops, comparisons, input(), type casting, and break — into a real, fun program: a number guessing game.\n\nSteps:\n1. Set a secret number, e.g. secret_number = 7.\n2. Use a while loop that keeps running (while True: is a common pattern — it always keeps looping until we break out of it).\n3. Inside the loop, ask the user to guess using input(), and convert it to an int.\n4. If the guess matches the secret number, print a success message and use break to stop the loop.\n5. Otherwise, tell them to try again, and the loop repeats.\n\nNotice while True: combined with break — this is a very common pattern: \"keep looping forever, UNTIL something inside tells you to stop.\"",
        },
        {
          type: 'code',
          title: 'Guess the Secret Number (example solution)',
          content:
            'secret_number = 7\n\nwhile True:\n    guess = int(input("Guess the number (1-10): "))\n    if guess == secret_number:\n        print("Correct! You guessed it!")\n        break\n    else:\n        print("Wrong, try again!")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Mini Project: Build your Guess the Number Game',
          content: 'Exercise',
          exercise: {
            instructions:
              'Complete the guessing game: secret_number is 4. Use a while True loop that asks the user to guess (input(), converted to int), prints "Correct!" and breaks if the guess matches, otherwise prints "Try again" and keeps looping.',
            starterCode: 'secret_number = 4\n\nwhile True:\n    guess = int(input("Guess the number: "))\n    # add your if/else and break below\n',
            language: 'python',
            expectedOutput: '',
            solution:
              'secret_number = 4\n\nwhile True:\n    guess = int(input("Guess the number: "))\n    if guess == secret_number:\n        print("Correct!")\n        break\n    else:\n        print("Try again")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Guess the Number Game',
          content: 'Quiz',
          quiz: {
            question: 'Why does the guessing game use while True: combined with break, instead of a normal condition?',
            options: [
              { text: 'Because we don\'t know how many guesses it will take, so we keep looping forever until the correct guess triggers break', isCorrect: true },
              { text: 'Because while True: runs exactly once', isCorrect: false },
              { text: 'Because break is required in every while loop', isCorrect: false },
              { text: 'while True: is not allowed in Python', isCorrect: false },
            ],
            explanation: 'while True: loops forever by default. break is what actually stops it, exactly when the guess is correct — perfect for situations where you don\'t know how many repeats you\'ll need in advance.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 5 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. A loop repeats a block of code automatically, so you never have to copy-paste the same instruction again and again.\n2. A for loop repeats once for every item in a group — for item in group:.\n3. range(start, stop, step) generates numbers starting at start and stopping BEFORE stop — the stop number is never included.\n4. A while loop repeats for as long as its condition stays True — while condition:.\n5. break stops a loop completely, like an emergency exit. continue skips only the rest of the current round and keeps looping.\n6. An infinite loop happens when a while loop's condition never becomes False — always make sure something inside the loop updates the condition.\n7. Our Guess the Secret Number Game combined while True:, input(), type casting, comparisons, and break into one fun, real program.\n\nYou can now make Python repeat tasks automatically instead of doing them by hand — this is one of the most powerful things a computer can do for you!",
        },
      ],
      flashcards: [
        { question: 'What does a loop do?', answer: 'It repeats a block of code automatically, so you do not have to write the same instruction many times.' },
        { question: 'When should you use a for loop?', answer: 'When you know how many times to repeat, or want to go through every item in a group, like a string or list.' },
        { question: 'What does range(1, 6) produce?', answer: '1, 2, 3, 4, 5 — it starts at 1 and stops BEFORE 6.' },
        { question: 'When should you use a while loop?', answer: 'When you want to keep repeating for as long as a condition stays True, and you don\'t know in advance how many times.' },
        { question: 'What does break do?', answer: 'Stops the loop completely and immediately, like an emergency exit.' },
        { question: 'What does continue do?', answer: 'Skips the rest of the current round of the loop and moves on to the next round — the loop keeps running.' },
        { question: 'What is an infinite loop?', answer: 'A loop whose condition never becomes False, so it keeps running forever.' },
        { question: 'How do you avoid an infinite loop?', answer: 'Make sure something inside the while loop changes the condition, moving it toward becoming False.' },
        { question: 'What does while True: combined with break do?', answer: 'Loops forever by default, but stops exactly when break runs inside it — useful when you don\'t know how many repeats you\'ll need.' },
      ],
      mcqs: [
        {
          question: 'What will this print?\nfor n in range(3):\n    print(n)',
          options: [
            { text: '0\\n1\\n2', isCorrect: true },
            { text: '1\\n2\\n3', isCorrect: false },
            { text: '0\\n1\\n2\\n3', isCorrect: false },
            { text: '3', isCorrect: false },
          ],
          explanation: 'range(3) with no start given begins at 0 and stops before 3, producing 0, 1, 2.',
        },
        {
          question: 'What will this print?\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1',
          options: [
            { text: '0\\n1\\n2', isCorrect: true },
            { text: '0\\n1\\n2\\n3', isCorrect: false },
            { text: '1\\n2\\n3', isCorrect: false },
            { text: 'This runs forever', isCorrect: false },
          ],
          explanation: 'count starts at 0 and increases by 1 each loop, stopping once count is no longer less than 3, so it prints 0, 1, 2.',
        },
        {
          question: 'What will this print?\nfor n in range(1, 5):\n    if n == 2:\n        break\n    print(n)',
          options: [
            { text: '1', isCorrect: true },
            { text: '1\\n2', isCorrect: false },
            { text: '1\\n3\\n4', isCorrect: false },
            { text: '1\\n2\\n3\\n4', isCorrect: false },
          ],
          explanation: 'Only 1 is printed before n becomes 2, at which point break stops the loop completely.',
        },
        {
          question: 'What will this print?\nfor n in range(1, 5):\n    if n == 2:\n        continue\n    print(n)',
          options: [
            { text: '1\\n3\\n4', isCorrect: true },
            { text: '1', isCorrect: false },
            { text: '1\\n2\\n3\\n4', isCorrect: false },
            { text: '3\\n4', isCorrect: false },
          ],
          explanation: 'continue skips only printing when n is 2, but the loop keeps going, so it prints 1, 3, 4.',
        },
        {
          question: 'What is the main risk with this code?\ncount = 1\nwhile count <= 5:\n    print(count)',
          options: [
            { text: 'It is an infinite loop, because count never changes and the condition stays True forever', isCorrect: true },
            { text: 'It will print 1, 2, 3, 4, 5 and stop normally', isCorrect: false },
            { text: 'It causes a SyntaxError', isCorrect: false },
            { text: 'It only runs once', isCorrect: false },
          ],
          explanation: 'Since count is never updated inside the loop, the condition count <= 5 is always True, so the loop never stops on its own.',
        },
      ],
    },
    {
      title: 'Module 6: Grouping Data (Collections)',
      description: 'Keep many pieces of information together in lists, dictionaries, and more.',
      contents: [
        {
          type: 'text',
          title: 'Why Do We Need Collections?',
          content:
            "So far, every variable has held just ONE value: age = 20, name = \"Ada\". But what if you want to store your entire shopping list — bread, milk, eggs — in one place? You wouldn't want to create separate variables like item1, item2, item3! You'd want ONE container that holds many items, like a shopping bag holding many groceries.\n\nPython gives us several types of containers for grouping data: lists, tuples, dictionaries, and sets. This module teaches you all four, one at a time.\n\nMain point (remember it): a collection is a single variable that can hold MANY values at once, like a bag holding many items.",
        },
        {
          type: 'text',
          title: 'Lists Basics',
          content:
            "A list is like a shopping bag: an ordered collection of items, written inside square brackets [ ], separated by commas.\n\nExample:\nfruits = [\"apple\", \"banana\", \"mango\"]\n\nEach item in a list has a position number, called an index, starting from 0 (NOT 1!). This trips up almost every beginner at first, so repeat it with me: the FIRST item is at index 0, not index 1.\n\nfruits[0]  ->  \"apple\"   (the 1st item)\nfruits[1]  ->  \"banana\"  (the 2nd item)\nfruits[2]  ->  \"mango\"   (the 3rd item)\n\nReal life analogy: think of numbered lockers at a gym, starting at locker 0. Locker 0 is still a real locker — it's just the FIRST one.\n\nMain point (repeat it, it's crucial): lists use square brackets [ ], and positions (indexes) start counting from 0, not 1.",
        },
        {
          type: 'code',
          title: 'Try it: creating and accessing a list',
          content: 'fruits = ["apple", "banana", "mango"]\nprint(fruits)\nprint(fruits[0])\nprint(fruits[1])\nprint(fruits[2])',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Access a list item',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a list called colors with three colors of your choice. Print the SECOND item in the list (remember: index 0 is the first item).',
            starterCode: 'colors = ["red", "green", "blue"]\nprint(0)',
            language: 'python',
            expectedOutput: 'green',
            solution: 'colors = ["red", "green", "blue"]\nprint(colors[1])',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: List Indexing',
          content: 'Quiz',
          quiz: {
            question: 'In fruits = ["apple", "banana", "mango"], what is fruits[0]?',
            options: [
              { text: '"apple" (the first item)', isCorrect: true },
              { text: '"banana" (the second item)', isCorrect: false },
              { text: 'An error, because there is no index 0', isCorrect: false },
              { text: 'The number of items in the list', isCorrect: false },
            ],
            explanation: 'List indexing starts at 0, so fruits[0] refers to the very first item in the list, which is "apple".',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Modifying Lists',
          content:
            "Unlike some data, lists can change after they're created — you can add or remove items any time, like adding or removing groceries from your shopping bag.\n\nappend(item)   adds an item to the END of the list\ninsert(index, item)  adds an item at a SPECIFIC position\npop()          removes and gives you back the LAST item (or a specific index if you provide one)\nremove(item)   removes the first matching item by its VALUE, not its position\n\nExample:\nfruits = [\"apple\", \"banana\"]\nfruits.append(\"mango\")      # fruits is now [\"apple\", \"banana\", \"mango\"]\nfruits.insert(0, \"grape\")   # fruits is now [\"grape\", \"apple\", \"banana\", \"mango\"]\nfruits.remove(\"banana\")     # fruits is now [\"grape\", \"apple\", \"mango\"]\nfruits.pop()                # removes \"mango\", fruits is now [\"grape\", \"apple\"]\n\nMain point (repeat it): append adds to the end, insert adds at a position, remove deletes by value, pop deletes by position (defaulting to the last item).",
        },
        {
          type: 'code',
          title: 'Try it: modifying a list',
          content:
            'fruits = ["apple", "banana"]\nfruits.append("mango")\nprint(fruits)\nfruits.insert(0, "grape")\nprint(fruits)\nfruits.remove("banana")\nprint(fruits)\nfruits.pop()\nprint(fruits)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Modify a list',
          content: 'Exercise',
          exercise: {
            instructions:
              'Start with tasks = ["wake up", "eat"]. Add "sleep" to the end using append(), then print the list.',
            starterCode: 'tasks = ["wake up", "eat"]\n',
            language: 'python',
            expectedOutput: "['wake up', 'eat', 'sleep']",
            solution: 'tasks = ["wake up", "eat"]\ntasks.append("sleep")\nprint(tasks)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Modifying Lists',
          content: 'Quiz',
          quiz: {
            question: 'Which method adds an item to the END of a list?',
            options: [
              { text: 'append()', isCorrect: true },
              { text: 'remove()', isCorrect: false },
              { text: 'pop()', isCorrect: false },
              { text: 'index()', isCorrect: false },
            ],
            explanation: 'append() adds a new item to the end of the list. insert() adds at a specific position, remove() deletes by value, and pop() removes by position.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Looping through Lists',
          content:
            "Remember for loops from Module 5? Lists work perfectly with them! Instead of looping through letters in a word, you loop through items in a list — like going through every item in your shopping bag, one at a time.\n\nExample:\nfruits = [\"apple\", \"banana\", \"mango\"]\nfor fruit in fruits:\n    print(fruit)\n\nThis prints each fruit on its own line, automatically, no matter how many items are in the list.\n\nMain point (repeat it): for item in list: goes through every item in the list, one at a time, running the indented block for each one.",
        },
        {
          type: 'code',
          title: 'Try it: looping through a list',
          content: 'fruits = ["apple", "banana", "mango"]\nfor fruit in fruits:\n    print(fruit)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Print all items',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a list called animals with three animals. Use a for loop to print each one on its own line.',
            starterCode: 'animals = ["cat", "dog", "bird"]\n',
            language: 'python',
            expectedOutput: 'cat\ndog\nbird',
            solution: 'animals = ["cat", "dog", "bird"]\nfor animal in animals:\n    print(animal)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Looping through Lists',
          content: 'Quiz',
          quiz: {
            question: 'What does "for fruit in fruits:" do, if fruits is a list?',
            options: [
              { text: 'It runs the indented block once for each item in fruits, one at a time', isCorrect: true },
              { text: 'It deletes every item in the list', isCorrect: false },
              { text: 'It only runs once, using the first item', isCorrect: false },
              { text: 'It sorts the list', isCorrect: false },
            ],
            explanation: 'A for loop over a list visits each item, one at a time, in order, and runs the loop\'s block for every single one.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Tuples: Lists That Cannot Change',
          content:
            "A tuple looks a lot like a list, but it's written with round brackets ( ) instead of square brackets, and — this is the key difference — once created, it CANNOT be changed. No append, no remove, nothing. It's locked.\n\nReal life analogy: think of your date of birth. It's made up of a set of values (day, month, year) that should NEVER change once recorded — that's a perfect use for a tuple, like coordinates (x, y) that belong together and shouldn't be edited by accident.\n\nExample:\npoint = (3, 4)\nprint(point[0])   # 3\nprint(point[1])   # 4\n\nMain point (repeat it): tuples use round brackets ( ) and are IMMUTABLE — meaning they cannot be changed after creation. Use them for data that should stay fixed.",
        },
        {
          type: 'code',
          title: 'Try it: tuples',
          content: 'point = (3, 4)\nprint(point)\nprint(point[0])\nprint(point[1])',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Tuples',
          content: 'Quiz',
          quiz: {
            question: 'What makes a tuple different from a list?',
            options: [
              { text: 'A tuple uses round brackets and cannot be changed after it is created', isCorrect: true },
              { text: 'A tuple can only hold numbers', isCorrect: false },
              { text: 'A tuple cannot be looped through', isCorrect: false },
              { text: 'There is no real difference', isCorrect: false },
            ],
            explanation: 'Tuples are written with ( ) instead of [ ], and they are immutable — once created, their contents cannot be added to, removed, or changed.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Dictionaries (Key-Value Pairs)',
          content:
            "A list is great when order matters, and you just need a bunch of items. But what if you want to store RELATED information, like a person's name, age, and city — all in one place, each labelled clearly? That's what a dictionary is for.\n\nA dictionary stores data in key-value pairs, written inside curly brackets { }. Think of it like a real dictionary book: you look up a WORD (the key) to find its MEANING (the value). Or think of a school ID card: \"Name\" is the key, and \"Alex\" is the value.\n\nExample:\nperson = {\"name\": \"Alex\", \"age\": 20}\nprint(person[\"name\"])   # Alex\nprint(person[\"age\"])    # 20\n\nMain point (repeat it): a dictionary uses curly brackets { } and stores data as key: value pairs. You look up a value using its key, just like looking up a word in a real dictionary.",
        },
        {
          type: 'code',
          title: 'Try it: dictionaries',
          content: 'person = {"name": "Alex", "age": 20}\nprint(person)\nprint(person["name"])\nprint(person["age"])',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Create a dictionary',
          content: 'Exercise',
          exercise: {
            instructions: 'Create a dictionary called book with keys "title" and "author" (choose any book you like), then print the "title" value.',
            starterCode: 'book = {"title": "   ", "author": "   "}\nprint(0)',
            language: 'python',
            expectedOutput: '',
            solution: 'book = {"title": "Things Fall Apart", "author": "Chinua Achebe"}\nprint(book["title"])',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Dictionaries',
          content: 'Quiz',
          quiz: {
            question: 'In person = {"name": "Alex", "age": 20}, how do you get the value "Alex"?',
            options: [
              { text: 'person["name"]', isCorrect: true },
              { text: 'person[0]', isCorrect: false },
              { text: 'person.name', isCorrect: false },
              { text: 'person["Alex"]', isCorrect: false },
            ],
            explanation: 'Dictionary values are accessed using their KEY inside square brackets, so person["name"] gives you "Alex".',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Working with Dictionaries',
          content:
            "You can also UPDATE a dictionary's values, ADD new key-value pairs, or loop through everything inside it.\n\nUpdate or add a value:\nperson[\"age\"] = 21          # updates age to 21\nperson[\"city\"] = \"Lagos\"    # adds a brand new key-value pair\n\nLoop through all keys and values:\nfor key, value in person.items():\n    print(key, \"=\", value)\n\nThink of .items() as unwrapping every label AND its content from your school ID card, one pair at a time.\n\nMain point (repeat it): use dictionary[\"key\"] = value to add or update, and .items() inside a for loop to go through every key-value pair.",
        },
        {
          type: 'code',
          title: 'Try it: updating and looping a dictionary',
          content:
            'person = {"name": "Alex", "age": 20}\nperson["age"] = 21\nperson["city"] = "Lagos"\n\nfor key, value in person.items():\n    print(key, "=", value)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Update and print a dictionary',
          content: 'Exercise',
          exercise: {
            instructions: 'Start with student = {"name": "Sade", "grade": "B"}. Update "grade" to "A", then print the whole dictionary.',
            starterCode: 'student = {"name": "Sade", "grade": "B"}\n',
            language: 'python',
            expectedOutput: "{'name': 'Sade', 'grade': 'A'}",
            solution: 'student = {"name": "Sade", "grade": "B"}\nstudent["grade"] = "A"\nprint(student)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Working with Dictionaries',
          content: 'Quiz',
          quiz: {
            question: 'What does .items() let you do with a dictionary?',
            options: [
              { text: 'Loop through every key and value pair together', isCorrect: true },
              { text: 'Delete the entire dictionary', isCorrect: false },
              { text: 'Convert the dictionary into a list of numbers', isCorrect: false },
              { text: 'Sort the dictionary alphabetically', isCorrect: false },
            ],
            explanation: '.items() gives you each key-value pair, which you can loop through with "for key, value in dictionary.items():".',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Sets (Bonus): Only Unique Items',
          content:
            "Last one! A set is a collection, written with curly brackets { } like a dictionary, but it holds ONLY values (no key-value pairs), and — this is the special part — it automatically removes duplicates and does not keep any particular order.\n\nReal life analogy: imagine collecting the names of everyone who showed up to a party. If the same name gets called out three times, you only need to write it down ONCE. A set does exactly that automatically.\n\nExample:\nnumbers = {1, 2, 2, 3, 3, 3}\nprint(numbers)   # {1, 2, 3} — duplicates are automatically removed!\n\nMain point (repeat it): a set automatically keeps only UNIQUE items — duplicates disappear on their own, with no extra work from you.",
        },
        {
          type: 'code',
          title: 'Try it: sets remove duplicates',
          content: 'numbers = {1, 2, 2, 3, 3, 3}\nprint(numbers)\n\nnames = {"Ada", "Chidi", "Ada"}\nprint(names)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Sets',
          content: 'Quiz',
          quiz: {
            question: 'What is special about a set compared to a list?',
            options: [
              { text: 'A set automatically removes duplicate values, keeping only unique ones', isCorrect: true },
              { text: 'A set can only hold numbers', isCorrect: false },
              { text: 'A set keeps items in a strict fixed order like a list', isCorrect: false },
              { text: 'A set cannot be created with curly brackets', isCorrect: false },
            ],
            explanation: 'Sets automatically discard duplicate values, so every item in a set is guaranteed to be unique.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 6 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. A collection is a single variable that holds MANY values at once, like a bag holding many items.\n2. A list uses square brackets [ ], keeps order, and CAN be changed. Indexing starts at 0, not 1.\n3. append() adds to the end, insert() adds at a position, remove() deletes by value, pop() removes by position.\n4. for item in list: loops through every item in a list, one at a time.\n5. A tuple uses round brackets ( ) and is IMMUTABLE — it can never be changed once created.\n6. A dictionary uses curly brackets { } and stores key: value pairs. You look up a value using its key, like looking up a word in a real dictionary.\n7. Use dictionary[\"key\"] = value to add or update entries, and .items() to loop through key-value pairs together.\n8. A set uses curly brackets { } but holds only VALUES, and automatically removes duplicates, keeping only unique items.\n\nYou can now group, organize, and manage large amounts of related information — this is one of the biggest jumps toward writing real, useful programs!",
        },
      ],
      flashcards: [
        { question: 'What is a collection in Python?', answer: 'A single variable that can hold many values at once, like a bag holding many items.' },
        { question: 'What brackets do lists use, and where does indexing start?', answer: 'Square brackets [ ]; indexing starts at 0, not 1.' },
        { question: 'How do you add an item to the end of a list?', answer: 'Use the append() method, e.g. my_list.append("item")' },
        { question: 'How do you remove an item from a list by its value?', answer: 'Use the remove() method, e.g. my_list.remove("item")' },
        { question: 'What is a tuple, and how is it different from a list?', answer: 'A tuple uses round brackets ( ) and cannot be changed after creation (it is immutable); a list can be changed.' },
        { question: 'What brackets do dictionaries use, and how do they store data?', answer: 'Curly brackets { }; they store data as key: value pairs, e.g. {"name": "Alex"}' },
        { question: 'How do you access a value in a dictionary?', answer: 'Use its key inside square brackets, e.g. person["name"]' },
        { question: 'What does .items() do on a dictionary?', answer: 'Lets you loop through every key-value pair together, e.g. for key, value in d.items():' },
        { question: 'What is special about a set?', answer: 'It automatically removes duplicate values, keeping only unique items.' },
      ],
      mcqs: [
        {
          question: 'Given fruits = ["apple", "banana", "mango"], what is fruits[1]?',
          options: [
            { text: '"banana"', isCorrect: true },
            { text: '"apple"', isCorrect: false },
            { text: '"mango"', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: 'Indexing starts at 0, so index 1 is the SECOND item in the list, which is "banana".',
        },
        {
          question: 'Which method would you use to add "grape" at the very beginning of a list?',
          options: [
            { text: 'fruits.insert(0, "grape")', isCorrect: true },
            { text: 'fruits.append("grape")', isCorrect: false },
            { text: 'fruits.remove("grape")', isCorrect: false },
            { text: 'fruits.pop("grape")', isCorrect: false },
          ],
          explanation: 'insert(index, item) places an item at a specific position. insert(0, "grape") puts "grape" at the very start (index 0).',
        },
        {
          question: 'Why would you choose a tuple over a list?',
          options: [
            { text: 'When you want to store data that should never change after it is created', isCorrect: true },
            { text: 'When you need to append new items frequently', isCorrect: false },
            { text: 'When you need duplicate values removed automatically', isCorrect: false },
            { text: 'Tuples are always faster to loop through than lists', isCorrect: false },
          ],
          explanation: 'Tuples are immutable, meaning they cannot be modified after creation — ideal for fixed data like coordinates or a date of birth.',
        },
        {
          question: 'Given person = {"name": "Zara", "age": 22}, what does person["age"] return?',
          options: [
            { text: '22', isCorrect: true },
            { text: '"age"', isCorrect: false },
            { text: '"Zara"', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: 'Using the key "age" inside square brackets retrieves its matching value, which is 22.',
        },
        {
          question: 'What will print({1, 2, 2, 3, 3, 3}) show?',
          options: [
            { text: '{1, 2, 3}', isCorrect: true },
            { text: '{1, 2, 2, 3, 3, 3}', isCorrect: false },
            { text: '[1, 2, 3]', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: 'Sets automatically remove duplicate values, so even though 2 and 3 were repeated, the set keeps only one of each.',
        },
      ],
    },
    {
      title: 'Module 7: Functions (Reusable Code)',
      description: 'Build your own mini-tools that you can reuse anytime in your code.',
      contents: [
        {
          type: 'text',
          title: 'What is a Function?',
          content:
            "Think about a blender. You don't rebuild a blender from scratch every time you want a smoothie — you just press the button, and it does the same job every time: blend whatever is inside. A function in Python is exactly like that button: a reusable block of code that performs a specific job, which you can \"press\" (call) as many times as you want, without rewriting the instructions each time.\n\nWe've actually already been using functions this whole course — print() and input() are both functions that Python already built for us! Now we'll learn to build our OWN.\n\nYou create a function using the def keyword (short for \"define\"), followed by a name, round brackets ( ), and a colon :. The code inside runs only when the function is called (used) by its name followed by ( ).\n\nExample:\ndef greet():\n    print(\"Hello there!\")\n\ngreet()   # this is how you CALL (use) the function\ngreet()   # you can call it again and again\n\nMain point (remember it): def name(): creates a reusable block of code. name() calls (runs) it. Nothing inside runs until you actually call it.",
        },
        {
          type: 'code',
          title: 'Try it: your first function',
          content: 'def greet():\n    print("Hello there!")\n\ngreet()\ngreet()\ngreet()',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Write your own function',
          content: 'Exercise',
          exercise: {
            instructions: 'Define a function called say_bye that prints "Goodbye!". Then call it once.',
            starterCode: 'def say_bye():\n    pass\n',
            language: 'python',
            expectedOutput: 'Goodbye!',
            solution: 'def say_bye():\n    print("Goodbye!")\n\nsay_bye()',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Defining Functions',
          content: 'Quiz',
          quiz: {
            question: 'When does the code inside a function actually run?',
            options: [
              { text: 'Only when the function is called by its name, followed by ()', isCorrect: true },
              { text: 'Immediately, as soon as Python reads the def line', isCorrect: false },
              { text: 'Only once, automatically, when the program starts', isCorrect: false },
              { text: 'Never, unless you delete the def line', isCorrect: false },
            ],
            explanation: 'Defining a function with def only sets it up — like installing the blender. The code only runs when you call the function by name, e.g. greet().',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Parameters & Arguments',
          content:
            "A blender is more useful if you can put DIFFERENT ingredients in it each time, instead of always blending the exact same thing. Functions work the same way — you can pass in information for the function to use, through parameters.\n\nA parameter is a placeholder name you write inside the function's brackets when defining it. An argument is the actual value you give it when you call the function.\n\nExample:\ndef greet(name):        # name is the PARAMETER (placeholder)\n    print(\"Hello,\", name)\n\ngreet(\"Ada\")             # \"Ada\" is the ARGUMENT (actual value)\ngreet(\"Chidi\")           # \"Chidi\" is a different argument\n\nEach time you call greet(), you can hand it a different name, and it greets that specific person — just like putting different fruit into the blender each time.\n\nMain point (repeat it): a parameter is the placeholder in the function's definition; an argument is the real value you pass in when calling it.",
        },
        {
          type: 'code',
          title: 'Try it: parameters and arguments',
          content: 'def greet(name):\n    print("Hello,", name)\n\ngreet("Ada")\ngreet("Chidi")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Function with a parameter',
          content: 'Exercise',
          exercise: {
            instructions: 'Define a function called square that takes one parameter, n, and prints n multiplied by itself. Call square(4).',
            starterCode: 'def square(n):\n    pass\n',
            language: 'python',
            expectedOutput: '16',
            solution: 'def square(n):\n    print(n * n)\n\nsquare(4)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Parameters & Arguments',
          content: 'Quiz',
          quiz: {
            question: 'In def greet(name): ... greet("Ada"), what is "Ada"?',
            options: [
              { text: 'An argument — the actual value passed in when the function is called', isCorrect: true },
              { text: 'A parameter — the placeholder in the function definition', isCorrect: false },
              { text: 'The function\'s name', isCorrect: false },
              { text: 'A comment', isCorrect: false },
            ],
            explanation: 'name is the parameter (placeholder). "Ada" is the argument — the real value handed to the function when it is called.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Return Values',
          content:
            "So far our functions have printed things directly. But sometimes you want a function to give you back an answer that you can store or use later, not just display it. That's what return does.\n\nThink of a vending machine: you press a button (call the function), and it GIVES you back a snack (returns a value) — it doesn't just shout the snack's name out loud, it actually hands it to you so you can do something with it, like eat it or share it.\n\nExample:\ndef add(a, b):\n    return a + b\n\nresult = add(3, 4)   # result now holds 7\nprint(result)\n\nCompare that to using print() inside a function — print() only DISPLAYS something on screen; it doesn't hand the value back for later use. return actually gives the value back so you can store it in a variable, like result above.\n\nMain point (repeat it, because it's a common beginner confusion): print() shows something on screen. return sends a value BACK to wherever the function was called, so you can save or reuse it.",
        },
        {
          type: 'code',
          title: 'Try it: return vs print',
          content: 'def add(a, b):\n    return a + b\n\nresult = add(3, 4)\nprint(result)\nprint(add(10, 5))',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Use return',
          content: 'Exercise',
          exercise: {
            instructions: 'Define a function called multiply that takes a and b, and RETURNS a * b (do not print inside the function). Store multiply(3, 5) in a variable called result, then print result.',
            starterCode: 'def multiply(a, b):\n    pass\n',
            language: 'python',
            expectedOutput: '15',
            solution: 'def multiply(a, b):\n    return a * b\n\nresult = multiply(3, 5)\nprint(result)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Return Values',
          content: 'Quiz',
          quiz: {
            question: 'What is the difference between return and print() inside a function?',
            options: [
              { text: 'return sends a value back so it can be stored or reused; print() only displays it on screen', isCorrect: true },
              { text: 'They do exactly the same thing', isCorrect: false },
              { text: 'print() sends a value back; return only displays it', isCorrect: false },
              { text: 'return can only be used with numbers', isCorrect: false },
            ],
            explanation: 'return hands the value back to wherever the function was called, so you can store it in a variable. print() just shows it on the screen and does not give it back.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Default Arguments',
          content:
            "Sometimes you want a parameter to have a sensible \"default\" value that's used automatically if the caller doesn't provide one — like a coffee machine that makes a MEDIUM cup by default, unless you specifically ask for a large one.\n\nYou set a default value in the function definition using =.\n\nExample:\ndef greet(name, greeting=\"Hello\"):\n    print(greeting + \", \" + name + \"!\")\n\ngreet(\"Ada\")                       # uses the default: \"Hello, Ada!\"\ngreet(\"Chidi\", greeting=\"Hi\")      # overrides the default: \"Hi, Chidi!\"\n\nIf you don't provide a value for greeting, Python automatically uses \"Hello\". If you DO provide one, it overrides the default.\n\nMain point (repeat it): a default argument (param=value) is used automatically if the caller doesn't provide their own value — but can always be overridden.",
        },
        {
          type: 'code',
          title: 'Try it: default arguments',
          content:
            'def greet(name, greeting="Hello"):\n    print(greeting + ", " + name + "!")\n\ngreet("Ada")\ngreet("Chidi", greeting="Hi")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Use a default argument',
          content: 'Exercise',
          exercise: {
            instructions:
              'Define a function called power that takes base and exponent=2 (default value of 2), and returns base ** exponent. Print power(5) and print power(2, exponent=3).',
            starterCode: 'def power(base, exponent=2):\n    pass\n',
            language: 'python',
            expectedOutput: '25\n8',
            solution: 'def power(base, exponent=2):\n    return base ** exponent\n\nprint(power(5))\nprint(power(2, exponent=3))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Default Arguments',
          content: 'Quiz',
          quiz: {
            question: 'In def greet(name, greeting="Hello"):, what happens if you call greet("Ada") without a greeting?',
            options: [
              { text: 'Python automatically uses "Hello" as the greeting', isCorrect: true },
              { text: 'Python raises an error because greeting is missing', isCorrect: false },
              { text: 'greeting becomes an empty string', isCorrect: false },
              { text: 'The function refuses to run', isCorrect: false },
            ],
            explanation: 'Since greeting has a default value ("Hello"), Python automatically uses it whenever the caller does not provide their own value.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Variable Scope: Local vs Global',
          content:
            "Imagine a family WhatsApp group versus a private chat with a friend. Something said in your private chat stays there — people in the family group can't see it. Variable scope in Python works similarly.\n\nA variable created INSIDE a function (a local variable) only exists inside that function — nobody outside can see or use it. A variable created OUTSIDE any function (a global variable) can be seen and used everywhere, including inside functions.\n\nExample:\nmessage = \"I am global\"   # global variable — visible everywhere\n\ndef show_message():\n    local_note = \"I am local\"   # local variable — only exists inside this function\n    print(message)               # this works — global variables are visible inside functions\n    print(local_note)\n\nshow_message()\n# print(local_note)   # this would cause an error! local_note doesn't exist out here\n\nMain point (repeat it): a local variable only exists inside the function where it was created. A global variable exists everywhere, including inside functions.",
        },
        {
          type: 'code',
          title: 'Try it: local vs global',
          content:
            'message = "I am global"\n\ndef show_message():\n    local_note = "I am local"\n    print(message)\n    print(local_note)\n\nshow_message()\nprint(message)   # works, message is global\n# print(local_note)   # would cause an error — local_note only exists inside the function',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Variable Scope',
          content: 'Quiz',
          quiz: {
            question: 'What happens if you try to use a local variable OUTSIDE the function it was created in?',
            options: [
              { text: 'Python raises an error — the variable does not exist out there', isCorrect: true },
              { text: 'It works fine, exactly like a global variable', isCorrect: false },
              { text: 'It automatically becomes global', isCorrect: false },
              { text: 'Python replaces it with None', isCorrect: false },
            ],
            explanation: 'A local variable only exists while its function is running, and only inside that function. Trying to use it outside causes an error, because Python has no memory of it there.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Mini Project: Unit Converter',
          content:
            "Let's combine everything from this module — def, parameters, return, and default arguments — into a real, useful tool: a unit converter, just like the ones built into phones and search engines.\n\nSteps:\n1. Write a function miles_to_km(miles) that returns miles * 1.60934.\n2. Write a function celsius_to_fahrenheit(celsius) that returns (celsius * 9/5) + 32.\n3. Call both functions with example values and print the results.\n\nNotice how each function does ONE clear job, takes an input (parameter), and gives back an answer (return) — exactly the reusable \"blender button\" idea from the start of this module.",
        },
        {
          type: 'code',
          title: 'Unit Converter (example solution)',
          content:
            'def miles_to_km(miles):\n    return miles * 1.60934\n\ndef celsius_to_fahrenheit(celsius):\n    return (celsius * 9 / 5) + 32\n\nprint(miles_to_km(10))\nprint(celsius_to_fahrenheit(0))\nprint(celsius_to_fahrenheit(100))',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Mini Project: Build your Unit Converter',
          content: 'Exercise',
          exercise: {
            instructions:
              'Define a function celsius_to_fahrenheit(celsius) that returns (celsius * 9 / 5) + 32. Then print the result of calling it with 20.',
            starterCode: 'def celsius_to_fahrenheit(celsius):\n    pass\n',
            language: 'python',
            expectedOutput: '68.0',
            solution: 'def celsius_to_fahrenheit(celsius):\n    return (celsius * 9 / 5) + 32\n\nprint(celsius_to_fahrenheit(20))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Unit Converter',
          content: 'Quiz',
          quiz: {
            question: 'Why is it useful to write miles_to_km as a function instead of just calculating it inline every time?',
            options: [
              { text: 'You can reuse the exact same conversion logic anywhere, just by calling the function, without rewriting the formula', isCorrect: true },
              { text: 'Functions run faster than normal calculations', isCorrect: false },
              { text: 'It is required by Python syntax rules', isCorrect: false },
              { text: 'It prevents the value from ever changing', isCorrect: false },
            ],
            explanation: 'Functions let you write the logic once and reuse it anywhere by calling it — exactly like pressing a blender button instead of rebuilding the blender every time.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 7 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. A function is a reusable block of code, like a blender button — you define it once with def name():, then call it with name() whenever you need it.\n2. A parameter is the placeholder in the function's definition; an argument is the real value passed in when calling it.\n3. return sends a value back to wherever the function was called, so you can store or reuse it — unlike print(), which only displays it on screen.\n4. A default argument (param=value) is used automatically if the caller doesn't provide their own value, but can always be overridden.\n5. A local variable only exists inside the function where it was created. A global variable exists everywhere, including inside functions.\n6. Our Unit Converter mini project combined all of this into small, reusable, real-world tools.\n\nYou can now package logic into reusable, well-organized building blocks — this is one of the most important skills in all of programming, and you'll use it in every single project from here on!",
        },
      ],
      flashcards: [
        { question: 'What is a function?', answer: 'A reusable block of code that performs a specific job, defined once with def and run by calling its name.' },
        { question: 'How do you define a function in Python?', answer: 'Use def, followed by a name, round brackets ( ), and a colon, e.g. def greet():' },
        { question: 'What is the difference between a parameter and an argument?', answer: 'A parameter is the placeholder in the function definition; an argument is the actual value passed in when calling the function.' },
        { question: 'What does return do?', answer: 'Sends a value back from the function to wherever it was called, so it can be stored in a variable or reused.' },
        { question: 'How is return different from print()?', answer: 'return hands the value back for later use; print() only displays the value on screen and does not give it back.' },
        { question: 'What is a default argument?', answer: 'A parameter with a preset value (param=value) that Python uses automatically if the caller does not provide their own.' },
        { question: 'What is a local variable?', answer: 'A variable created inside a function that only exists and is usable inside that function.' },
        { question: 'What is a global variable?', answer: 'A variable created outside any function, which can be seen and used everywhere, including inside functions.' },
      ],
      mcqs: [
        {
          question: 'What will this print?\ndef greet():\n    print("Hi")\n\nprint("Start")',
          options: [
            { text: 'Only "Start" — greet() was never called', isCorrect: true },
            { text: '"Hi" then "Start"', isCorrect: false },
            { text: '"Start" then "Hi"', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: 'Defining a function with def does not run its code. Since greet() was never called, only "Start" prints.',
        },
        {
          question: 'In def add(a, b): return a + b, what are a and b called?',
          options: [
            { text: 'Parameters', isCorrect: true },
            { text: 'Arguments', isCorrect: false },
            { text: 'Return values', isCorrect: false },
            { text: 'Global variables', isCorrect: false },
          ],
          explanation: 'a and b are the placeholder names written in the function definition — these are called parameters. The real values passed in later are arguments.',
        },
        {
          question: 'What does result = add(3, 4) do, if add returns a + b?',
          options: [
            { text: 'It calls add(3, 4), and stores the returned value (7) in result', isCorrect: true },
            { text: 'It only displays 7 on the screen, without saving it', isCorrect: false },
            { text: 'It defines a new function called result', isCorrect: false },
            { text: 'It causes an error, since add() has no print()', isCorrect: false },
          ],
          explanation: 'Because add uses return, the value it computes is sent back and can be captured in a variable, here stored in result.',
        },
        {
          question: 'Given def greet(name, greeting="Hello"):, what does greet("Zara") print?',
          options: [
            { text: 'Hello, Zara! (using the default greeting)', isCorrect: true },
            { text: 'An error, because greeting was not provided', isCorrect: false },
            { text: ', Zara! (with an empty greeting)', isCorrect: false },
            { text: 'Hello! (without the name)', isCorrect: false },
          ],
          explanation: 'Since greeting has a default value of "Hello", Python uses it automatically when the caller does not provide their own.',
        },
        {
          question: 'Why does this code cause an error?\ndef show():\n    x = 5\n\nshow()\nprint(x)',
          options: [
            { text: 'x is a local variable — it only exists inside show() and cannot be accessed outside it', isCorrect: true },
            { text: 'show() was never called', isCorrect: false },
            { text: 'x is spelled incorrectly', isCorrect: false },
            { text: 'Functions cannot contain variables', isCorrect: false },
          ],
          explanation: 'x is created inside show(), making it a local variable. Once show() finishes running, x no longer exists outside of it, so print(x) fails.',
        },
      ],
    },
    {
      title: 'Module 8: Mastering Text & Strings',
      description: 'Learn fun ways to work with and change text in your programs.',
      contents: [
        {
          type: 'text',
          title: 'Revisiting Text (str)',
          content:
            "Back in Module 2, we learned that text is called a string (str) in Python. So far we've mostly printed strings as-is, or joined them with commas inside print(). Now let's learn how to actually SHAPE and CHANGE text like a pro — combining variables into sentences, cleaning up messy text, slicing out pieces, and splitting text apart.\n\nMain point (remember it): strings are text, and Python gives us many built-in tools to reshape, clean, and combine them.",
        },
        {
          type: 'text',
          title: 'f-Strings: Clean String Formatting',
          content:
            "Imagine filling in a form letter: \"Dear [Name], your order of [Item] will arrive on [Date].\" Instead of gluing pieces together with lots of commas or + signs, Python gives us a cleaner way: f-strings.\n\nAn f-string is a string with an f right before the opening quote. Inside the string, you can place any variable inside curly braces { }, and Python will automatically insert its value.\n\nExample:\nname = \"Ada\"\nscore = 95\nprint(f\"Hello {name}, your score is {score}\")\n\nThis prints: Hello Ada, your score is 95\n\nCompare this to the old way: print(\"Hello \" + name + \", your score is \" + str(score)) — notice how messy that is, and you'd even need str() to convert score to text first! f-strings handle all of that automatically.\n\nMain point (repeat it): an f-string starts with f\" and lets you drop variables directly into { } inside the text — no messy + or str() needed.",
        },
        {
          type: 'code',
          title: 'Try it: f-strings',
          content: 'name = "Ada"\nscore = 95\nprint(f"Hello {name}, your score is {score}")\nprint(f"In two years, {name} will be older")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Build an f-string',
          content: 'Exercise',
          exercise: {
            instructions: 'Create variables city = "Lagos" and population = 15000000. Use an f-string to print: "Lagos has a population of 15000000"',
            starterCode: 'city = "Lagos"\npopulation = 15000000\n',
            language: 'python',
            expectedOutput: 'Lagos has a population of 15000000',
            solution: 'city = "Lagos"\npopulation = 15000000\nprint(f"{city} has a population of {population}")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: f-Strings',
          content: 'Quiz',
          quiz: {
            question: 'What does f"Hello {name}" do, if name = "Ada"?',
            options: [
              { text: 'It automatically inserts the value of name into the text, printing "Hello Ada"', isCorrect: true },
              { text: 'It prints the literal text "Hello {name}"', isCorrect: false },
              { text: 'It causes an error because f is not a valid keyword', isCorrect: false },
              { text: 'It deletes the variable name', isCorrect: false },
            ],
            explanation: 'The f before the quotation mark tells Python this is an f-string — anything inside { } is replaced with the actual value of that variable.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'String Methods',
          content:
            "Strings come with built-in tools (called methods) for cleaning and transforming text. Think of these like buttons on a washing machine — each one does one specific job to your \"laundry\" (your text).\n\n.upper()    converts text to ALL CAPITAL LETTERS\n.lower()    converts text to all lowercase letters\n.strip()    removes extra spaces from the beginning and end (like trimming loose threads)\n.replace(old, new)  swaps one piece of text for another\n\nExample:\nmessage = \"  Hello World  \"\nprint(message.upper())     # \"  HELLO WORLD  \"\nprint(message.lower())     # \"  hello world  \"\nprint(message.strip())     # \"Hello World\" (no extra spaces)\nprint(message.replace(\"World\", \"Python\"))   # \"  Hello Python  \"\n\nReal life scenario: imagine someone typed their email with extra spaces by accident, like \"  ada@email.com  \" — .strip() cleans it up automatically before you save it.\n\nMain point (repeat it): .upper(), .lower(), .strip(), and .replace() are string methods — small, reusable tools attached to any piece of text.",
        },
        {
          type: 'code',
          title: 'Try it: string methods',
          content:
            'message = "  Hello World  "\nprint(message.upper())\nprint(message.lower())\nprint(message.strip())\nprint(message.replace("World", "Python"))',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Clean up text',
          content: 'Exercise',
          exercise: {
            instructions: 'Create email = "  ADA@EMAIL.COM  ". Clean it up by removing extra spaces (.strip()) AND converting it to lowercase (.lower()), then print it.',
            starterCode: 'email = "  ADA@EMAIL.COM  "\n',
            language: 'python',
            expectedOutput: 'ada@email.com',
            solution: 'email = "  ADA@EMAIL.COM  "\nprint(email.strip().lower())',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: String Methods',
          content: 'Quiz',
          quiz: {
            question: 'Which method removes extra spaces from the beginning and end of a string?',
            options: [
              { text: '.strip()', isCorrect: true },
              { text: '.upper()', isCorrect: false },
              { text: '.replace()', isCorrect: false },
              { text: '.lower()', isCorrect: false },
            ],
            explanation: '.strip() trims away extra whitespace from both ends of a string, like removing loose threads from the edges of fabric.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'String Slicing',
          content:
            "Remember index positions from Module 6 (lists start counting at 0)? Strings work the same way — every character has a position, and you can \"slice\" out a piece of text using text[start:stop], just like cutting a specific piece out of a loaf of bread.\n\ntext = \"Python\"\nprint(text[0])      # \"P\" — the character AT position 0\nprint(text[0:3])    # \"Pyt\" — characters from position 0 up to (NOT including) position 3\nprint(text[3:])     # \"hon\" — from position 3 to the end\nprint(text[:3])     # \"Pyt\" — from the start up to (not including) position 3\n\nJust like range() from Module 5, slicing STOPS BEFORE the stop number — it never includes it.\n\nMain point (repeat it): text[start:stop] cuts out characters from start up to (but NOT including) stop — leaving out either number means \"from the beginning\" or \"to the end.\"",
        },
        {
          type: 'code',
          title: 'Try it: string slicing',
          content: 'text = "Python"\nprint(text[0])\nprint(text[0:3])\nprint(text[3:])\nprint(text[:3])',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Slice a string',
          content: 'Exercise',
          exercise: {
            instructions: 'Given word = "Programming", print only the first 4 characters using slicing.',
            starterCode: 'word = "Programming"\nprint(0)',
            language: 'python',
            expectedOutput: 'Prog',
            solution: 'word = "Programming"\nprint(word[0:4])',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Slicing',
          content: 'Quiz',
          quiz: {
            question: 'Given text = "Python", what does text[0:3] return?',
            options: [
              { text: '"Pyt"', isCorrect: true },
              { text: '"Python"', isCorrect: false },
              { text: '"yth"', isCorrect: false },
              { text: '"hon"', isCorrect: false },
            ],
            explanation: 'Slicing [0:3] takes characters starting at index 0 and stops BEFORE index 3, giving positions 0, 1, and 2: "P", "y", "t" -> "Pyt".',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Splitting & Joining',
          content:
            "Sometimes you need to break a sentence into individual words, or glue a list of words back into one sentence. Think of .split() as chopping a sentence into pieces, like cutting a sandwich into slices, and .join() as the opposite — gluing the slices back together.\n\n.split()  breaks a string into a LIST of pieces, using a separator (space by default)\n\".join()  glues a list of strings back into ONE string, using whatever text it's called on as the \"glue\"\n\nExample:\nsentence = \"I love Python\"\nwords = sentence.split()          # [\"I\", \"love\", \"Python\"]\nprint(words)\n\nback_together = \" \".join(words)   # \"I love Python\"\nprint(back_together)\n\nNotice how .join() is called on the GLUE (here, a single space \" \"), not on the list — this trips people up at first, so let's repeat it.\n\nMain point (repeat it): .split() turns a string into a list of pieces. \"glue\".join(list) turns a list back into one string, using \"glue\" to connect each piece.",
        },
        {
          type: 'code',
          title: 'Try it: split and join',
          content:
            'sentence = "I love Python"\nwords = sentence.split()\nprint(words)\n\nback_together = " ".join(words)\nprint(back_together)\n\ncsv_line = "apple,banana,mango"\nfruits = csv_line.split(",")\nprint(fruits)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Split and rejoin with a dash',
          content: 'Exercise',
          exercise: {
            instructions:
              'Given sentence = "Learning Python is fun", split it into words, then join the words back together using a dash "-" instead of a space, and print the result.',
            starterCode: 'sentence = "Learning Python is fun"\nwords = sentence.split()\n',
            language: 'python',
            expectedOutput: 'Learning-Python-is-fun',
            solution: 'sentence = "Learning Python is fun"\nwords = sentence.split()\nprint("-".join(words))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Split & Join',
          content: 'Quiz',
          quiz: {
            question: 'What does "I love Python".split() return?',
            options: [
              { text: '["I", "love", "Python"] — a list of the words', isCorrect: true },
              { text: '"I love Python" — unchanged', isCorrect: false },
              { text: 'A single word, "IlovePython"', isCorrect: false },
              { text: 'An error', isCorrect: false },
            ],
            explanation: '.split() breaks a string apart wherever there is a space (by default), returning a list containing each word as a separate item.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 8 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. Strings (str) are text, and Python gives us many built-in tools to reshape and combine them.\n2. An f-string (f\"...\") lets you drop variables directly into text using { }, without messy + or str() conversions.\n3. String methods like .upper(), .lower(), .strip(), and .replace(old, new) clean and transform text.\n4. Slicing, text[start:stop], cuts out a piece of a string from start up to (but NOT including) stop — just like range() in loops.\n5. .split() breaks a string into a list of pieces. \"glue\".join(list) glues a list of strings back into one string using the glue text.\n\nYou can now format, clean, cut, and rebuild text however you need — a skill you will use constantly, since almost every program deals with text in some form!",
        },
      ],
      flashcards: [
        { question: 'What is an f-string?', answer: 'A string starting with f" that lets you insert variable values directly into text using { }, e.g. f"Hello {name}"' },
        { question: 'What does .upper() do?', answer: 'Converts all the letters in a string to CAPITAL LETTERS.' },
        { question: 'What does .strip() do?', answer: 'Removes extra spaces from the beginning and end of a string.' },
        { question: 'What does .replace(old, new) do?', answer: 'Swaps every occurrence of "old" text with "new" text inside a string.' },
        { question: 'How does string slicing work?', answer: 'text[start:stop] returns characters from position start up to (but not including) position stop.' },
        { question: 'What does .split() do?', answer: 'Breaks a string into a list of pieces, using a separator (a space, by default).' },
        { question: 'What does "-".join(list) do?', answer: 'Glues the items of a list back into one string, placing "-" between each item.' },
      ],
      mcqs: [
        {
          question: 'Given name = "Musa" and age = 30, what does f"{name} is {age}" produce?',
          options: [
            { text: '"Musa is 30"', isCorrect: true },
            { text: '"{name} is {age}"', isCorrect: false },
            { text: '"name is age"', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: 'f-strings replace anything inside { } with the actual value of that variable, producing "Musa is 30".',
        },
        {
          question: 'What does "  Hi There  ".strip() return?',
          options: [
            { text: '"Hi There" (no leading or trailing spaces)', isCorrect: true },
            { text: '"HI THERE"', isCorrect: false },
            { text: '"  Hi There  " (unchanged)', isCorrect: false },
            { text: '"HiThere" (no spaces at all)', isCorrect: false },
          ],
          explanation: '.strip() only removes spaces from the very beginning and end of a string — spaces in the middle are left untouched.',
        },
        {
          question: 'Given text = "Coding", what does text[2:5] return?',
          options: [
            { text: '"din"', isCorrect: true },
            { text: '"Codi"', isCorrect: false },
            { text: '"ding"', isCorrect: false },
            { text: '"Cod"', isCorrect: false },
          ],
          explanation: 'text[2:5] takes characters starting at index 2 up to (not including) index 5: positions 2,3,4 are "d","i","n" -> "din".',
        },
        {
          question: 'What does "apple,banana,mango".split(",") return?',
          options: [
            { text: '["apple", "banana", "mango"]', isCorrect: true },
            { text: '"apple banana mango"', isCorrect: false },
            { text: '"applebananamango"', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: '.split(",") breaks the string apart wherever a comma appears, returning a list of the pieces in between.',
        },
        {
          question: 'What does "-".join(["a", "b", "c"]) return?',
          options: [
            { text: '"a-b-c"', isCorrect: true },
            { text: '["a", "b", "c"]', isCorrect: false },
            { text: '"abc"', isCorrect: false },
            { text: '"-a-b-c-"', isCorrect: false },
          ],
          explanation: 'join() glues the list items together using the string it is called on ("-") as the connector between each item, producing "a-b-c".',
        },
      ],
    },
    {
      title: 'Module 9: Error Handling & Debugging',
      description: 'Learn what to do when your code breaks, so it doesn\'t crash on you.',
      contents: [
        {
          type: 'text',
          title: 'Types of Bugs',
          content:
            "Back in Module 1, we said errors are not scary — they're just Python telling you something needs fixing. Now let's go deeper and meet the three main types of bugs (problems in code) you'll run into:\n\n1. Syntax Errors: broken \"grammar\" — Python cannot even understand your instruction, like a missing quote or bracket. Example: print(\"Hi\" (missing closing bracket). Python catches these BEFORE your program even starts running.\n\n2. Runtime Errors: the grammar is correct, but something goes wrong WHILE the program is running, like dividing by zero, or asking for an item that doesn't exist. Python stops right at that point.\n\n3. Logic Errors: the sneakiest kind! The code runs perfectly fine, with NO error message at all, but it gives the WRONG answer, because the logic (your thinking) was flawed. Example: writing total = a - b when you meant total = a + b.\n\nReal life analogy: a Syntax Error is like writing a sentence with no verb — nobody can understand it. A Runtime Error is like a car breaking down mid-journey. A Logic Error is like following GPS directions perfectly, but the GPS itself was set to the wrong destination — you arrive somewhere, just not where you wanted.\n\nMain point (repeat it): Syntax Errors stop your code before it runs. Runtime Errors stop it while it's running. Logic Errors don't stop anything — they just give you the wrong result.",
        },
        {
          type: 'quiz',
          title: 'Quick Check: Types of Bugs',
          content: 'Quiz',
          quiz: {
            question: 'Your code runs with no error message, but gives the wrong answer. What kind of bug is this?',
            options: [
              { text: 'A Logic Error', isCorrect: true },
              { text: 'A Syntax Error', isCorrect: false },
              { text: 'A Runtime Error', isCorrect: false },
              { text: 'This cannot happen in Python', isCorrect: false },
            ],
            explanation: 'A Logic Error happens when the code runs without crashing, but the reasoning behind it was flawed, producing an incorrect result.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'try and except Blocks',
          content:
            "Imagine walking across a room in the dark. A careful person puts their hands out, ready to catch themselves if they bump into something, instead of falling flat on their face. try and except let your Python code do exactly that: attempt something risky, and \"catch\" the problem gracefully if it goes wrong, instead of crashing.\n\nExample:\ntry:\n    number = int(input(\"Enter a number: \"))\n    print(\"You entered:\", number)\nexcept:\n    print(\"That wasn't a valid number!\")\n\nPython first tries to run everything inside try:. If something goes wrong (like the user typing \"abc\" instead of a number), Python immediately jumps to the except: block INSTEAD of crashing the whole program.\n\nMain point (repeat it): try: holds code that MIGHT fail. except: holds what to do INSTEAD of crashing, if it does fail.",
        },
        {
          type: 'code',
          title: 'Try it: try/except',
          content: 'try:\n    number = int(input("Enter a number: "))\n    print("You entered:", number)\nexcept:\n    print("That wasn\'t a valid number!")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Catch a crash',
          content: 'Exercise',
          exercise: {
            instructions:
              'The code below crashes because "abc" cannot be converted to an int. Wrap it in a try/except so that instead of crashing, it prints "Conversion failed!"',
            starterCode: 'number = int("abc")\nprint(number)',
            language: 'python',
            expectedOutput: 'Conversion failed!',
            solution: 'try:\n    number = int("abc")\n    print(number)\nexcept:\n    print("Conversion failed!")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: try/except',
          content: 'Quiz',
          quiz: {
            question: 'What happens when code inside a try: block fails?',
            options: [
              { text: 'Python jumps to the except: block instead of crashing the whole program', isCorrect: true },
              { text: 'The whole program stops immediately, no matter what', isCorrect: false },
              { text: 'Python ignores the failure and continues as if nothing happened', isCorrect: false },
              { text: 'Python automatically fixes the error', isCorrect: false },
            ],
            explanation: 'try/except lets your program "catch" a failure gracefully — when something inside try: fails, Python runs the except: block instead of crashing.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Handling Specific Errors',
          content:
            "A plain except: catches ANY kind of error, but that's a bit like a doctor treating every illness the exact same way — not very precise! Python lets you catch SPECIFIC types of errors, so you can respond appropriately to each one. Here are three common ones:\n\nValueError       happens when a value is the wrong TYPE or format for what you're trying to do, e.g. int(\"abc\") — \"abc\" isn't a valid number.\nZeroDivisionError  happens when you try to divide a number by 0 — mathematically undefined, so Python raises this specific error.\nKeyError         happens when you look up a dictionary key that doesn't exist, e.g. person[\"height\"] when person has no \"height\" key.\n\nExample:\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print(\"You can't divide by zero!\")\n\ntry:\n    age = int(\"twenty\")\nexcept ValueError:\n    print(\"That's not a valid number!\")\n\ntry:\n    person = {\"name\": \"Ada\"}\n    print(person[\"age\"])\nexcept KeyError:\n    print(\"That key doesn't exist in the dictionary!\")\n\nMain point (repeat it): except ErrorType: lets you catch and respond to a SPECIFIC kind of problem — ValueError for bad conversions, ZeroDivisionError for dividing by 0, KeyError for missing dictionary keys.",
        },
        {
          type: 'code',
          title: 'Try it: specific error types',
          content:
            'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("You can\'t divide by zero!")\n\ntry:\n    age = int("twenty")\nexcept ValueError:\n    print("That\'s not a valid number!")\n\ntry:\n    person = {"name": "Ada"}\n    print(person["age"])\nexcept KeyError:\n    print("That key doesn\'t exist in the dictionary!")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Catch a ZeroDivisionError',
          content: 'Exercise',
          exercise: {
            instructions:
              'Wrap the division below in a try/except that specifically catches ZeroDivisionError, printing "Cannot divide by zero!" instead of crashing.',
            starterCode: 'a = 10\nb = 0\nresult = a / b\nprint(result)',
            language: 'python',
            expectedOutput: 'Cannot divide by zero!',
            solution: 'a = 10\nb = 0\ntry:\n    result = a / b\n    print(result)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Specific Errors',
          content: 'Quiz',
          quiz: {
            question: 'Which error occurs when you try to access a dictionary key that does not exist?',
            options: [
              { text: 'KeyError', isCorrect: true },
              { text: 'ValueError', isCorrect: false },
              { text: 'ZeroDivisionError', isCorrect: false },
              { text: 'SyntaxError', isCorrect: false },
            ],
            explanation: 'KeyError is raised specifically when you try to look up a dictionary key that is not present in the dictionary.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 9 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. There are three types of bugs: Syntax Errors (broken grammar, caught before running), Runtime Errors (something goes wrong while running), and Logic Errors (no crash, but the wrong result, because the reasoning was flawed).\n2. try: holds code that MIGHT fail. except: runs INSTEAD of crashing, if it does fail — like catching yourself before you fall.\n3. A plain except: catches any error, but you can be more precise by catching specific types.\n4. ValueError happens with a bad value/format (like int(\"abc\")). ZeroDivisionError happens when dividing by 0. KeyError happens when a dictionary key doesn't exist.\n\nYou can now write programs that handle unexpected situations gracefully instead of crashing — a critical skill for building real, reliable software that people can actually trust and use!",
        },
      ],
      flashcards: [
        { question: 'What is a Syntax Error?', answer: 'A "broken grammar" mistake, like a missing quote or bracket, that Python catches before the program even runs.' },
        { question: 'What is a Runtime Error?', answer: 'An error that happens WHILE the program is running, like dividing by zero.' },
        { question: 'What is a Logic Error?', answer: 'A bug where the code runs with no error message, but produces the WRONG result because the reasoning was flawed.' },
        { question: 'What does a try/except block do?', answer: 'try: holds code that might fail; except: runs instead of crashing if it does fail.' },
        { question: 'What is a ValueError?', answer: 'An error that occurs when a value has the wrong type or format for the operation, e.g. int("abc").' },
        { question: 'What is a ZeroDivisionError?', answer: 'An error that occurs when you try to divide a number by zero.' },
        { question: 'What is a KeyError?', answer: 'An error that occurs when you try to access a dictionary key that does not exist.' },
      ],
      mcqs: [
        {
          question: 'Which type of bug is caught by Python BEFORE the program even starts running?',
          options: [
            { text: 'Syntax Error', isCorrect: true },
            { text: 'Runtime Error', isCorrect: false },
            { text: 'Logic Error', isCorrect: false },
            { text: 'None of these', isCorrect: false },
          ],
          explanation: 'Syntax Errors are grammar mistakes Python detects while reading the code, before execution even begins.',
        },
        {
          question: 'What will this print?\ntry:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")',
          options: [
            { text: '"Cannot divide by zero"', isCorrect: true },
            { text: 'An unhandled crash', isCorrect: false },
            { text: 'inf', isCorrect: false },
            { text: '0', isCorrect: false },
          ],
          explanation: 'Dividing by zero raises a ZeroDivisionError, which is caught by the except block, printing the message instead of crashing.',
        },
        {
          question: 'What kind of error does int("hello") raise?',
          options: [
            { text: 'ValueError', isCorrect: true },
            { text: 'KeyError', isCorrect: false },
            { text: 'ZeroDivisionError', isCorrect: false },
            { text: 'SyntaxError', isCorrect: false },
          ],
          explanation: '"hello" is not a valid number format, so trying to convert it with int() raises a ValueError.',
        },
        {
          question: 'Given person = {"name": "Ada"}, what error does person["age"] raise?',
          options: [
            { text: 'KeyError', isCorrect: true },
            { text: 'ValueError', isCorrect: false },
            { text: 'ZeroDivisionError', isCorrect: false },
            { text: 'IndexError', isCorrect: false },
          ],
          explanation: 'The dictionary has no "age" key, so trying to access it raises a KeyError.',
        },
        {
          question: 'Why are Logic Errors considered the "sneakiest" type of bug?',
          options: [
            { text: 'Because the program runs without crashing or showing any error message, but still gives the wrong result', isCorrect: true },
            { text: 'Because they always crash the program immediately', isCorrect: false },
            { text: 'Because Python automatically fixes them', isCorrect: false },
            { text: 'Because they only happen in very large programs', isCorrect: false },
          ],
          explanation: 'Logic Errors do not produce any error message — the code runs successfully, but the underlying reasoning was wrong, so the result is incorrect.',
        },
      ],
    },
    {
      title: 'Module 10: Using Built-in Modules',
      description: 'Use handy tools that already come built into Python, like random numbers and file reading.',
      contents: [
        {
          type: 'text',
          title: 'Importing Modules',
          content:
            "Imagine a giant toolbox in your garage, full of specialized tools you didn't have to build yourself — a hammer, a drill, a saw — each one already made and ready to use. Python comes with a huge toolbox of pre-written code called modules (also known as the \"standard library\"), so you don't have to build everything from scratch.\n\nTo use a module, you bring it into your program with the import keyword.\n\nExample:\nimport random\nimport math\n\nOnce imported, you access anything inside a module using dot notation: module_name.something.\n\nExample:\nimport math\nprint(math.sqrt(16))   # 4.0 — using the sqrt tool from the math module\n\nMain point (repeat it): import module_name brings a toolbox into your program, and you use module_name.tool to access something inside it.",
        },
        {
          type: 'code',
          title: 'Try it: importing a module',
          content: 'import math\nprint(math.sqrt(16))\nprint(math.sqrt(81))',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Importing Modules',
          content: 'Quiz',
          quiz: {
            question: 'What does the import keyword do?',
            options: [
              { text: 'Brings a module (a pre-built toolbox of code) into your program so you can use it', isCorrect: true },
              { text: 'Deletes a module from Python permanently', isCorrect: false },
              { text: 'Creates a brand new module from scratch', isCorrect: false },
              { text: 'Runs a module\'s code immediately, without you writing anything else', isCorrect: false },
            ],
            explanation: 'import brings an existing module into your program so you can use the tools (functions, values) inside it with module_name.tool syntax.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Randomness (random)',
          content:
            "Think of a dice roll, a lottery draw, or shuffling a deck of cards — Python's random module lets your programs do exactly this kind of unpredictable, chance-based behavior. This is how games pick random enemies, and how apps shuffle your music playlist.\n\nimport random\n\nrandom.randint(a, b)  gives a random WHOLE number between a and b, INCLUDING both ends\nrandom.choice(list)   picks ONE random item from a list, like pulling a name out of a hat\nrandom.shuffle(list)  mixes up the order of a list in place, like shuffling a deck of cards\n\nExample:\nimport random\n\nprint(random.randint(1, 6))          # simulates rolling a 6-sided die\nfruits = [\"apple\", \"banana\", \"mango\"]\nprint(random.choice(fruits))         # picks one fruit at random\nrandom.shuffle(fruits)\nprint(fruits)                        # fruits is now in a random order\n\nMain point (repeat it): randint(a, b) picks a random whole number (including both ends), choice(list) picks one random item, shuffle(list) mixes up a list's order.",
        },
        {
          type: 'code',
          title: 'Try it: the random module',
          content:
            'import random\n\nprint(random.randint(1, 6))\n\nfruits = ["apple", "banana", "mango"]\nprint(random.choice(fruits))\n\nrandom.shuffle(fruits)\nprint(fruits)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Simulate a dice roll',
          content: 'Exercise',
          exercise: {
            instructions: 'Import the random module and print a random whole number between 1 and 6, simulating a dice roll.',
            starterCode: 'import random\n',
            language: 'python',
            expectedOutput: '',
            solution: 'import random\nprint(random.randint(1, 6))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: random',
          content: 'Quiz',
          quiz: {
            question: 'What does random.choice(["a", "b", "c"]) do?',
            options: [
              { text: 'Picks and returns one random item from the list', isCorrect: true },
              { text: 'Removes an item from the list permanently', isCorrect: false },
              { text: 'Sorts the list alphabetically', isCorrect: false },
              { text: 'Returns every item in the list, one at a time', isCorrect: false },
            ],
            explanation: 'random.choice() picks exactly ONE item from the list at random and returns it, similar to pulling one name out of a hat.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Math & Time',
          content:
            "Two more handy toolboxes: math and time.\n\nThe math module is like a scientific calculator built into Python:\nmath.sqrt(x)     square root of x\nmath.pi          the value of pi (3.14159...)\nmath.floor(x)    rounds x DOWN to the nearest whole number\nmath.ceil(x)     rounds x UP to the nearest whole number\n\nThe time module deals with real-world time, like pausing a program:\ntime.sleep(seconds)   pauses your program for the given number of seconds — like a countdown timer before a race starts\n\nExample:\nimport math\nimport time\n\nprint(math.sqrt(25))     # 5.0\nprint(math.pi)           # 3.141592653589793\n\nprint(\"Get ready...\")\ntime.sleep(2)             # pauses for 2 seconds\nprint(\"Go!\")\n\nMain point (repeat it): math gives you mathematical tools like sqrt() and pi. time.sleep(seconds) pauses your program, like a countdown before something happens.",
        },
        {
          type: 'code',
          title: 'Try it: math and time',
          content: 'import math\nimport time\n\nprint(math.sqrt(25))\nprint(math.pi)\n\nprint("Get ready...")\ntime.sleep(2)\nprint("Go!")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Use the math module',
          content: 'Exercise',
          exercise: {
            instructions: 'Import math and print the square root of 144.',
            starterCode: 'import math\n',
            language: 'python',
            expectedOutput: '12.0',
            solution: 'import math\nprint(math.sqrt(144))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Math & Time',
          content: 'Quiz',
          quiz: {
            question: 'What does time.sleep(3) do?',
            options: [
              { text: 'Pauses the program for 3 seconds before continuing', isCorrect: true },
              { text: 'Stops the program permanently after 3 seconds', isCorrect: false },
              { text: 'Prints the number 3', isCorrect: false },
              { text: 'Speeds the program up by 3 seconds', isCorrect: false },
            ],
            explanation: 'time.sleep(seconds) pauses program execution for the given number of seconds, then continues normally, like a countdown timer.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Reading & Writing Files (Basic)',
          content:
            "So far, everything we've stored disappears the moment the program stops running. But what if you want to SAVE information permanently, like writing in a notebook that's still there tomorrow? That's what files are for.\n\nYou open a file using open(filename, mode). The mode tells Python what you plan to do:\n\"w\"  write mode — creates the file (or erases and starts fresh if it already exists)\n\"r\"  read mode — opens the file to read what's already inside\n\"a\"  append mode — adds new content to the END of the file, without erasing what's there\n\nExample:\n# Writing to a file\nwith open(\"notes.txt\", \"w\") as file:\n    file.write(\"Hello, this is my first note!\")\n\n# Reading from a file\nwith open(\"notes.txt\", \"r\") as file:\n    content = file.read()\n    print(content)\n\nWe use with open(...) as file: because it automatically closes the file for us when we're done — like automatically putting a notebook back on the shelf after you finish writing in it, so nothing gets lost or left open.\n\nMain point (repeat it): open(filename, \"w\") writes to a file (starting fresh), open(filename, \"r\") reads from a file, and with ... as file: makes sure the file closes properly afterward.",
        },
        {
          type: 'code',
          title: 'Try it: writing and reading a file',
          content:
            '# Writing to a file\nwith open("notes.txt", "w") as file:\n    file.write("Hello, this is my first note!")\n\n# Reading from a file\nwith open("notes.txt", "r") as file:\n    content = file.read()\n    print(content)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Files',
          content: 'Quiz',
          quiz: {
            question: 'What does open("notes.txt", "w") do?',
            options: [
              { text: 'Opens notes.txt in write mode, ready for new content to be written (starting fresh)', isCorrect: true },
              { text: 'Opens notes.txt only to read its content', isCorrect: false },
              { text: 'Permanently deletes notes.txt', isCorrect: false },
              { text: 'Adds content to the end of notes.txt without erasing anything', isCorrect: false },
            ],
            explanation: '"w" mode opens a file for writing, creating it if it doesn\'t exist, or erasing its existing content to start fresh. "a" (append) would add to the end instead.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 10 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. A module is a pre-built toolbox of code. import module_name brings it into your program, and you access its tools with module_name.tool.\n2. The random module simulates chance: randint(a, b) picks a random whole number (including both ends), choice(list) picks one random item, shuffle(list) mixes up a list.\n3. The math module gives mathematical tools like math.sqrt() and math.pi. The time module lets you pause your program with time.sleep(seconds).\n4. open(filename, mode) works with files: \"w\" writes (starting fresh), \"r\" reads, \"a\" appends to the end. with open(...) as file: makes sure the file closes automatically.\n\nYou can now tap into Python's massive built-in toolbox instead of building everything from scratch — a skill that will save you enormous amounts of time in every project going forward!",
        },
      ],
      flashcards: [
        { question: 'What is a module?', answer: 'A pre-built toolbox of code that you bring into your program using import.' },
        { question: 'How do you access something inside an imported module?', answer: 'Using dot notation: module_name.tool, e.g. math.sqrt(16)' },
        { question: 'What does random.randint(a, b) do?', answer: 'Returns a random whole number between a and b, including both ends.' },
        { question: 'What does random.choice(list) do?', answer: 'Picks and returns one random item from the list.' },
        { question: 'What does random.shuffle(list) do?', answer: 'Randomly mixes up the order of the items in the list, in place.' },
        { question: 'What does time.sleep(seconds) do?', answer: 'Pauses the program for the given number of seconds before continuing.' },
        { question: 'What does open(filename, "w") do?', answer: 'Opens a file in write mode, creating it (or erasing its contents) so you can write fresh content.' },
        { question: 'What does open(filename, "r") do?', answer: 'Opens a file in read mode, so you can read its existing content.' },
        { question: 'Why use with open(...) as file:?', answer: 'It automatically closes the file for you once you are done, so nothing is left open or lost.' },
      ],
      mcqs: [
        {
          question: 'Which keyword brings a module into your program?',
          options: [
            { text: 'import', isCorrect: true },
            { text: 'include', isCorrect: false },
            { text: 'use', isCorrect: false },
            { text: 'require', isCorrect: false },
          ],
          explanation: 'Python uses the import keyword to bring a module\'s tools into your program, e.g. import math.',
        },
        {
          question: 'What does random.randint(1, 6) simulate?',
          options: [
            { text: 'Rolling a 6-sided die', isCorrect: true },
            { text: 'Shuffling a deck of cards', isCorrect: false },
            { text: 'Picking a name from a list', isCorrect: false },
            { text: 'Flipping a coin', isCorrect: false },
          ],
          explanation: 'randint(1, 6) returns a random whole number from 1 to 6, including both ends — exactly the range of a 6-sided die.',
        },
        {
          question: 'What does math.sqrt(81) return?',
          options: [
            { text: '9.0', isCorrect: true },
            { text: '81.0', isCorrect: false },
            { text: '40.5', isCorrect: false },
            { text: '8.0', isCorrect: false },
          ],
          explanation: 'math.sqrt() returns the square root of a number. The square root of 81 is 9.',
        },
        {
          question: 'What is the purpose of time.sleep(5) in a program?',
          options: [
            { text: 'To pause the program for 5 seconds before continuing', isCorrect: true },
            { text: 'To make the program run 5 times faster', isCorrect: false },
            { text: 'To stop the program permanently', isCorrect: false },
            { text: 'To print the number 5 to the screen', isCorrect: false },
          ],
          explanation: 'time.sleep(seconds) pauses execution for the given duration, then the program continues from where it left off.',
        },
        {
          question: 'Which file mode should you use if you want to ADD content to the end of a file without erasing what is already there?',
          options: [
            { text: '"a" (append mode)', isCorrect: true },
            { text: '"w" (write mode)', isCorrect: false },
            { text: '"r" (read mode)', isCorrect: false },
            { text: '"d" (delete mode)', isCorrect: false },
          ],
          explanation: '"a" (append) mode adds new content to the end of a file, while "w" (write) mode erases the file and starts fresh.',
        },
      ],
    },
    {
      title: 'Module 11: Intro to Object-Oriented Programming (OOP)',
      description: 'Learn a new way to organize code around real-world things, called objects.',
      contents: [
        {
          type: 'text',
          title: 'What is OOP?',
          content:
            "Think about a real dog. A dog HAS properties (its name, its breed, its age) and it CAN DO actions (bark, run, sleep). Object-Oriented Programming, or OOP, is a way of organizing code around exactly this idea: real-world \"things\" (called objects), each with their own properties (information about them) and actions (things they can do).\n\nSo far, we've been writing code that runs top to bottom, using separate variables and functions. OOP lets us bundle related variables and functions TOGETHER into one single \"thing\" — just like a dog naturally bundles its name, breed, and bark all into one dog.\n\nMain point (remember it): OOP organizes code around objects, where each object has properties (data about it) and actions (things it can do) — just like real things in the world.",
        },
        {
          type: 'text',
          title: 'Classes & Instances',
          content:
            "If an object is like an actual dog, a class is like the BLUEPRINT for a dog — a plan that describes what every dog will have (a name, a breed) and what every dog can do (bark), without being any one specific dog itself. Once you have the blueprint, you can build as many actual dogs (instances) from it as you like, and each one can have its own specific details.\n\nYou define a class using the class keyword, followed by a name (by convention, class names start with a capital letter).\n\nExample:\nclass Dog:\n    pass   # empty for now, we'll fill it in soon\n\nmy_dog = Dog()      # my_dog is an INSTANCE of the Dog class — an actual dog built from the blueprint\nanother_dog = Dog()  # a completely separate instance — a different actual dog\n\nMain point (repeat it): a class is the blueprint (the plan). An instance is one actual object BUILT from that blueprint. You can create many different instances from the same class.",
        },
        {
          type: 'code',
          title: 'Try it: a basic class',
          content: 'class Dog:\n    pass\n\nmy_dog = Dog()\nanother_dog = Dog()\n\nprint(my_dog)\nprint(another_dog)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Classes & Instances',
          content: 'Quiz',
          quiz: {
            question: 'What is the relationship between a class and an instance?',
            options: [
              { text: 'A class is the blueprint; an instance is one actual object built from that blueprint', isCorrect: true },
              { text: 'They are exactly the same thing', isCorrect: false },
              { text: 'An instance is the blueprint; a class is built from it', isCorrect: false },
              { text: 'A class can only ever create one instance', isCorrect: false },
            ],
            explanation: 'A class defines the plan (properties and actions), while each instance is a separate, actual object created from that plan — you can make many instances from one class.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'The __init__() Constructor',
          content:
            "When you build an actual dog from the Dog blueprint, you usually want to give it specific details right away — like its name and breed — instead of leaving it completely blank. That's what __init__() is for: a special function that runs AUTOMATICALLY the moment a new instance is created, used to set up its starting properties.\n\nNotice the special word self — it refers to \"this specific instance being created,\" like pointing at yourself when introducing yourself: \"MY name is...\" self.name = name means \"THIS dog's name is whatever was passed in.\"\n\nExample:\nclass Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\nmy_dog = Dog(\"Rex\", \"Labrador\")\nprint(my_dog.name)     # \"Rex\"\nprint(my_dog.breed)    # \"Labrador\"\n\nEvery time you write Dog(\"Rex\", \"Labrador\"), Python automatically calls __init__() behind the scenes, passing \"Rex\" and \"Labrador\" in, and self.name/self.breed store them onto that specific instance.\n\nMain point (repeat it, because self trips people up): __init__() runs automatically when an instance is created, and self always refers to \"this particular instance\" — self.property = value saves that value onto it.",
        },
        {
          type: 'code',
          title: 'Try it: __init__() constructor',
          content:
            'class Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\nmy_dog = Dog("Rex", "Labrador")\nprint(my_dog.name)\nprint(my_dog.breed)\n\nyour_dog = Dog("Bella", "Poodle")\nprint(your_dog.name)\nprint(your_dog.breed)',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Build a Student class',
          content: 'Exercise',
          exercise: {
            instructions:
              'Create a class called Student with an __init__(self, name, age) that stores name and age using self. Create a student called student1 with name "Amara" and age 21, then print student1.name and student1.age.',
            starterCode: 'class Student:\n    def __init__(self, name, age):\n        pass\n',
            language: 'python',
            expectedOutput: 'Amara\n21',
            solution:
              'class Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nstudent1 = Student("Amara", 21)\nprint(student1.name)\nprint(student1.age)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: __init__()',
          content: 'Quiz',
          quiz: {
            question: 'When does __init__() run?',
            options: [
              { text: 'Automatically, the moment a new instance of the class is created', isCorrect: true },
              { text: 'Only when you call it manually by name', isCorrect: false },
              { text: 'Only once, no matter how many instances you create', isCorrect: false },
              { text: 'Never — it is optional decoration', isCorrect: false },
            ],
            explanation: '__init__() is a special function Python calls automatically whenever a new instance is created, typically used to set up its starting properties.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Class Methods',
          content:
            "Remember, an object doesn't just HAVE properties — it can also DO things. A method is simply a function defined INSIDE a class, giving an instance an action it can perform, like a dog being able to bark.\n\nJust like __init__(), every method needs self as its first parameter, so Python knows WHICH instance is doing the action.\n\nExample:\nclass Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\n    def bark(self):\n        print(self.name, \"says: Woof!\")\n\nmy_dog = Dog(\"Rex\", \"Labrador\")\nmy_dog.bark()   # \"Rex says: Woof!\"\n\nyour_dog = Dog(\"Bella\", \"Poodle\")\nyour_dog.bark()  # \"Bella says: Woof!\" — notice self.name gives EACH dog its OWN name inside bark()\n\nMain point (repeat it): a method is a function inside a class, always starting with self as its first parameter, giving each instance actions it can perform using its own properties.",
        },
        {
          type: 'code',
          title: 'Try it: class methods',
          content:
            'class Dog:\n    def __init__(self, name, breed):\n        self.name = name\n        self.breed = breed\n\n    def bark(self):\n        print(self.name, "says: Woof!")\n\nmy_dog = Dog("Rex", "Labrador")\nmy_dog.bark()\n\nyour_dog = Dog("Bella", "Poodle")\nyour_dog.bark()',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Add a method',
          content: 'Exercise',
          exercise: {
            instructions:
              'Add a method called greet(self) to the Student class that prints "Hi, I am" followed by self.name. Create student1 = Student("Tunde", 19), then call student1.greet().',
            starterCode: 'class Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    # add your greet method here\n',
            language: 'python',
            expectedOutput: 'Hi, I am Tunde',
            solution:
              'class Student:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def greet(self):\n        print("Hi, I am", self.name)\n\nstudent1 = Student("Tunde", 19)\nstudent1.greet()',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Class Methods',
          content: 'Quiz',
          quiz: {
            question: 'Why does every method inside a class need self as its first parameter?',
            options: [
              { text: 'So Python knows exactly which instance is performing the action and can access its properties', isCorrect: true },
              { text: 'Because self makes the method run faster', isCorrect: false },
              { text: 'It is optional and rarely used', isCorrect: false },
              { text: 'self refers to the class name itself, not an instance', isCorrect: false },
            ],
            explanation: 'self lets a method know which specific instance called it, so it can access and use that instance\'s own properties, like self.name.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Module 11 Recap',
          content:
            "Let's repeat everything from this module one more time, so it really sticks:\n\n1. OOP organizes code around objects — real-world \"things\" with properties (data) and actions (things they can do), like a dog with a name and a bark.\n2. A class is the blueprint; an instance is one actual object built from that blueprint. You can create many instances from one class.\n3. __init__() is a special function that runs automatically when a new instance is created, usually used to set up its starting properties.\n4. self always refers to \"this particular instance\" — self.property = value saves a value onto it, and self.property reads it back later.\n5. A method is a function defined inside a class, always starting with self, giving each instance an action it can perform using its own properties.\n\nYou've just taken your first step into Object-Oriented Programming — a way of thinking about code that mirrors the real world, and one that powers most large, real-world applications you use every day!",
        },
      ],
      flashcards: [
        { question: 'What is Object-Oriented Programming (OOP)?', answer: 'A way of organizing code around objects, each with properties (data) and actions (things they can do), like real-world things.' },
        { question: 'What is a class?', answer: 'A blueprint that describes what properties and actions its instances will have.' },
        { question: 'What is an instance?', answer: 'One actual object created from a class blueprint. You can create many separate instances from one class.' },
        { question: 'What does __init__() do?', answer: 'A special function that runs automatically when a new instance is created, usually used to set up its starting properties.' },
        { question: 'What does self refer to?', answer: '"This particular instance" — the specific object a method or __init__() is currently working with.' },
        { question: 'What is a method?', answer: 'A function defined inside a class, always starting with self, that gives an instance an action it can perform.' },
      ],
      mcqs: [
        {
          question: 'In OOP, what does a class represent?',
          options: [
            { text: 'A blueprint describing what properties and actions its instances will have', isCorrect: true },
            { text: 'One specific, actual object', isCorrect: false },
            { text: 'A type of loop', isCorrect: false },
            { text: 'A built-in Python module', isCorrect: false },
          ],
          explanation: 'A class is the plan or template. Actual objects (instances) are created FROM the class, each following its blueprint.',
        },
        {
          question: 'Given class Dog: def __init__(self, name): self.name = name, what does Dog("Rex").name return?',
          options: [
            { text: '"Rex"', isCorrect: true },
            { text: '"Dog"', isCorrect: false },
            { text: 'self', isCorrect: false },
            { text: 'An error', isCorrect: false },
          ],
          explanation: '__init__() runs automatically when Dog("Rex") is created, storing "Rex" into self.name, which is then accessible as .name on that instance.',
        },
        {
          question: 'Why does my_dog.bark() correctly use my_dog\'s own name, even though other Dog instances exist?',
          options: [
            { text: 'Because self inside bark() refers specifically to my_dog when it is the one calling the method', isCorrect: true },
            { text: 'Because there can only be one Dog instance at a time', isCorrect: false },
            { text: 'Because bark() ignores self entirely', isCorrect: false },
            { text: 'Because Python guesses which dog you mean', isCorrect: false },
          ],
          explanation: 'When you call my_dog.bark(), Python automatically passes my_dog in as self, so self.name correctly refers to my_dog\'s own name.',
        },
        {
          question: 'What is the first parameter of every method inside a class, by convention?',
          options: [
            { text: 'self', isCorrect: true },
            { text: 'this', isCorrect: false },
            { text: 'instance', isCorrect: false },
            { text: 'class', isCorrect: false },
          ],
          explanation: 'Python methods conventionally take self as their first parameter, representing the specific instance calling the method.',
        },
        {
          question: 'How many separate instances can be created from a single class?',
          options: [
            { text: 'As many as you want — each one is independent', isCorrect: true },
            { text: 'Exactly one', isCorrect: false },
            { text: 'Exactly two', isCorrect: false },
            { text: 'None — classes cannot create instances', isCorrect: false },
          ],
          explanation: 'A class is a reusable blueprint, so you can create as many independent instances from it as you need, each with its own property values.',
        },
      ],
    },
    {
      title: 'Module 12: Hands-On Capstone Projects',
      description: 'Put everything together and build real projects, like a quiz app and a to-do list.',
      contents: [
        {
          type: 'text',
          title: 'Welcome to the Capstone Projects',
          content:
            "You've made it to the final module! Think of everything you've learned so far — print(), variables, if/else, loops, lists, dictionaries, functions, strings, error handling, modules, and even OOP — as individual ingredients you've been practicing one at a time. Now it's time to cook a full meal: combining everything into three real, complete programs.\n\nWe'll build these together, step by step, the same way we've built everything else. Repeat this with me one more time, because it's been true since Module 1: a computer only does exactly what you tell it — so we'll plan out each project clearly before writing any code.",
        },
        {
          type: 'text',
          title: 'Project 1: Interactive Trivia Quiz App',
          content:
            "This project uses: conditions (if/elif/else), lists and dictionaries, and functions — everything from Modules 4, 6, and 7.\n\nPlan it like a real quiz show host: store each question as a dictionary with a \"question\", the correct \"answer\", and store all the questions together in a list. Then loop through them, ask each one, check the answer, and keep score.\n\nStep by step:\n1. Store questions as a list of dictionaries: [{\"question\": \"...\", \"answer\": \"...\"}, ...]\n2. Write a function ask_question(q) that prints the question, gets the user's answer with input(), and returns True or False depending on whether it matches q[\"answer\"].\n3. Loop through all the questions with a for loop, calling ask_question() for each one, and keep a running score (a variable that increases by 1 for every correct answer).\n4. After the loop, print the final score using an f-string.",
        },
        {
          type: 'code',
          title: 'Trivia Quiz App (example solution)',
          content:
            'questions = [\n    {"question": "What keyword defines a function in Python? ", "answer": "def"},\n    {"question": "What symbol starts a comment in Python? ", "answer": "#"},\n    {"question": "2 + 2 = ? ", "answer": "4"},\n]\n\ndef ask_question(q):\n    user_answer = input(q["question"])\n    return user_answer.strip() == q["answer"]\n\nscore = 0\nfor q in questions:\n    if ask_question(q):\n        print("Correct!")\n        score += 1\n    else:\n        print(f"Wrong! The answer was {q[\'answer\']}")\n\nprint(f"You scored {score} out of {len(questions)}")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Extend the quiz',
          content: 'Exercise',
          exercise: {
            instructions:
              'Given the questions list below (with only one question), write ask_question(q) that asks the question with input() and returns True if the answer matches q["answer"], then print "Correct!" or "Wrong!" based on the result.',
            starterCode:
              'questions = [{"question": "What does print() do? ", "answer": "displays output"}]\n\ndef ask_question(q):\n    pass\n',
            language: 'python',
            expectedOutput: '',
            solution:
              'questions = [{"question": "What does print() do? ", "answer": "displays output"}]\n\ndef ask_question(q):\n    user_answer = input(q["question"])\n    return user_answer.strip() == q["answer"]\n\nif ask_question(questions[0]):\n    print("Correct!")\nelse:\n    print("Wrong!")',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Trivia Quiz App',
          content: 'Quiz',
          quiz: {
            question: 'Why is storing each question as a dictionary (with "question" and "answer" keys) useful here?',
            options: [
              { text: 'It keeps each question and its correct answer clearly labelled and grouped together', isCorrect: true },
              { text: 'Dictionaries are the only way to store text in Python', isCorrect: false },
              { text: 'It makes the program run faster', isCorrect: false },
              { text: 'It is required by the input() function', isCorrect: false },
            ],
            explanation: 'A dictionary lets us label each piece of data clearly ("question" vs "answer"), keeping related information grouped together, just like Module 6 taught.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Project 2: Command-Line To-Do List',
          content:
            "This project uses: loops, lists and dictionaries, functions, and try/except — from Modules 5, 6, 7, and 9.\n\nPlan it like a real to-do list app: keep a list of tasks, and let the user repeatedly choose to add a task, view all tasks, or quit — using a while loop that keeps running until they choose to quit.\n\nStep by step:\n1. Start with an empty list: tasks = []\n2. Use while True: to keep the program running, asking the user to choose an action each time (\"add\", \"view\", or \"quit\").\n3. If they choose \"add\", ask for a task with input() and .append() it to the list.\n4. If they choose \"view\", loop through tasks and print each one (use a for loop with enumerate-style numbering, or just a simple for loop).\n5. If they choose \"quit\", break out of the while loop.\n6. Wrap risky parts in try/except so the program doesn't crash on unexpected input.",
        },
        {
          type: 'code',
          title: 'Command-Line To-Do List (example solution)',
          content:
            'tasks = []\n\nwhile True:\n    action = input("Choose: add, view, or quit: ").strip().lower()\n\n    if action == "add":\n        task = input("Enter the task: ")\n        tasks.append(task)\n        print("Task added!")\n    elif action == "view":\n        if len(tasks) == 0:\n            print("No tasks yet.")\n        else:\n            for task in tasks:\n                print("-", task)\n    elif action == "quit":\n        print("Goodbye!")\n        break\n    else:\n        print("Unknown action, try again.")',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Add a task and view it',
          content: 'Exercise',
          exercise: {
            instructions:
              'Given tasks = [], append the string "Buy groceries" to tasks, then loop through tasks and print each item with a "-" in front, like "- Buy groceries".',
            starterCode: 'tasks = []\n',
            language: 'python',
            expectedOutput: '- Buy groceries',
            solution: 'tasks = []\ntasks.append("Buy groceries")\nfor task in tasks:\n    print("-", task)',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: To-Do List',
          content: 'Quiz',
          quiz: {
            question: 'Why does the To-Do List program use while True: with break, instead of a normal while condition?',
            options: [
              { text: 'Because we don\'t know how many actions the user will take, so we keep looping until they choose to quit', isCorrect: true },
              { text: 'Because while True: only runs once', isCorrect: false },
              { text: 'Because lists require while True: to work', isCorrect: false },
              { text: 'It is not actually necessary here', isCorrect: false },
            ],
            explanation: 'Just like the Guess the Number game in Module 5, we don\'t know in advance how many times the user will interact, so while True: with break lets the loop run until the user decides to stop.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Project 3: Password Generator',
          content:
            "This project uses: strings, the random module, functions, and loops — from Modules 8, 10, 5, and 7.\n\nPlan it like a security tool: build a \"pool\" of possible characters (letters, numbers, symbols), then randomly pick a set number of them to form a password.\n\nStep by step:\n1. Create a string containing all possible characters: letters + numbers + symbols.\n2. Write a function generate_password(length) that uses a for loop to pick length random characters from the pool (using random.choice()), and builds them into a password string.\n3. Call the function and print the result.",
        },
        {
          type: 'code',
          title: 'Password Generator (example solution)',
          content:
            'import random\n\ncharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"\n\ndef generate_password(length):\n    password = ""\n    for i in range(length):\n        password = password + random.choice(characters)\n    return password\n\nprint(generate_password(12))',
          language: 'python',
        } as ITopicContent,
        {
          type: 'exercise',
          title: 'Exercise: Build the Password Generator',
          content: 'Exercise',
          exercise: {
            instructions:
              'Complete generate_password(length): use a for loop that runs length times, each time picking one random character from characters with random.choice() and adding it to password. Return password. Print generate_password(8).',
            starterCode:
              'import random\n\ncharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"\n\ndef generate_password(length):\n    password = ""\n    # add your loop here\n    return password\n\n',
            language: 'python',
            expectedOutput: '',
            solution:
              'import random\n\ncharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"\n\ndef generate_password(length):\n    password = ""\n    for i in range(length):\n        password = password + random.choice(characters)\n    return password\n\nprint(generate_password(8))',
          },
        } as ITopicContent,
        {
          type: 'quiz',
          title: 'Quick Check: Password Generator',
          content: 'Quiz',
          quiz: {
            question: 'In the Password Generator, what does random.choice(characters) do inside the loop?',
            options: [
              { text: 'Picks one random character from the characters string each time the loop runs', isCorrect: true },
              { text: 'Picks the entire characters string at once', isCorrect: false },
              { text: 'Removes a character from characters permanently', isCorrect: false },
              { text: 'Sorts the characters string', isCorrect: false },
            ],
            explanation: 'random.choice() picks one random item — here, one character — from characters. Since it runs inside a loop, it picks a new random character each time, building up the password one character at a time.',
          },
        } as ITopicContent,
        {
          type: 'text',
          title: 'Congratulations — You Finished the Course!',
          content:
            "Let's take a moment to really appreciate this: you started at Module 1 not knowing what code even was, and you just finished building a trivia quiz app, a to-do list, and a password generator — real, working programs. That's genuinely something to be proud of.\n\nHere's a final reminder of the main points we repeated throughout this course, one last time:\n1. A computer only does exactly what you tell it — be clear and exact.\n2. Errors are not failures — they're Python telling you exactly what to fix.\n3. Indentation, variables, loops, functions, and data structures are the building blocks. Every complex program is just these basics, combined.",
        },
        {
          type: 'text',
          title: 'What to Do Next',
          content:
            "Finishing this course is a big milestone, but it's really just the beginning. Here's honest advice on what to do next:\n\n1. Build things YOU care about. Don't just watch or read — pick a small idea (a budget tracker, a simple game, a habit tracker) and build it, even badly. You learn far more from finishing one messy project than from passively reading ten tutorials.\n\n2. Get comfortable reading error messages. You'll hit new errors constantly — that's normal, even for experienced developers. Read them slowly, and search for the exact error message online when stuck; this is a real, everyday skill, not cheating.\n\n3. Learn to use an IDE properly (like VS Code) if you haven't already — things like autocomplete and built-in error highlighting will save you enormous time.\n\n4. Explore a specialization next: web development (Flask or Django), data analysis (pandas), automation (writing scripts to handle repetitive tasks), or game development (pygame) — pick whichever excites you most, since motivation matters more than \"the best\" choice.\n\n5. Read other people's code. Look at small open-source Python projects on GitHub. You'll pick up new patterns and habits just by seeing how others write and organize code.\n\n6. Keep practicing the fundamentals. Concepts like loops, functions, and OOP get easier and more natural the more you use them — revisit this course's projects and try modifying or extending them.\n\n7. Be patient with yourself. Every experienced programmer was once exactly where you are now, confused by their first SyntaxError. The main difference between beginners and experts isn't talent — it's the number of things they've built and broken along the way.\n\nMain point to carry forward: the best way to keep learning Python is to keep BUILDING with it. Pick a small project today, and get started.",
        },
      ],
      flashcards: [
        { question: 'What Python concepts does the Trivia Quiz App combine?', answer: 'Conditions (if/elif/else), lists and dictionaries, and functions.' },
        { question: 'What Python concepts does the To-Do List project combine?', answer: 'Loops (while True), lists and dictionaries, functions, and try/except.' },
        { question: 'What Python concepts does the Password Generator combine?', answer: 'Strings, the random module, functions, and loops.' },
        { question: 'What is the best way to keep improving at Python after finishing this course?', answer: 'Keep building real projects you care about — you learn far more from finishing projects than from passively reading tutorials.' },
        { question: 'What should you do when you hit an unfamiliar error message?', answer: 'Read it slowly and calmly, then search for the exact error message online if needed — this is a normal, everyday skill for programmers.' },
      ],
      mcqs: [
        {
          question: 'In the Trivia Quiz App, why do we store each question as a dictionary rather than just a plain string?',
          options: [
            { text: 'So we can clearly label and group the question text together with its correct answer', isCorrect: true },
            { text: 'Because functions cannot accept strings as arguments', isCorrect: false },
            { text: 'Because Python requires quiz data to be in dictionaries', isCorrect: false },
            { text: 'To make the questions print in a random order automatically', isCorrect: false },
          ],
          explanation: 'A dictionary with "question" and "answer" keys keeps related data clearly labelled and grouped together, exactly as taught in Module 6.',
        },
        {
          question: 'In the To-Do List project, what causes the while True: loop to finally stop?',
          options: [
            { text: 'The user choosing "quit", which triggers a break statement', isCorrect: true },
            { text: 'The list of tasks becoming empty', isCorrect: false },
            { text: 'The program running for 10 seconds', isCorrect: false },
            { text: 'It never stops on its own', isCorrect: false },
          ],
          explanation: 'while True: loops forever by default; break is what actually exits it, and here that happens specifically when the user chooses "quit".',
        },
        {
          question: 'In the Password Generator, why is random.choice() called inside a loop instead of just once?',
          options: [
            { text: 'So a new random character is picked and added for each position in the password', isCorrect: true },
            { text: 'Because random.choice() can only be called inside loops', isCorrect: false },
            { text: 'To make the password shorter', isCorrect: false },
            { text: 'It is not necessary — calling it once would work the same', isCorrect: false },
          ],
          explanation: 'Each loop iteration picks one new random character, and repeating this length times builds up a password of the desired length, one character at a time.',
        },
        {
          question: 'According to the course\'s closing advice, what is the best way to keep improving after finishing?',
          options: [
            { text: 'Build real projects you care about, even small or imperfect ones', isCorrect: true },
            { text: 'Memorize the entire Python documentation before writing any more code', isCorrect: false },
            { text: 'Avoid looking up errors online, to build self-reliance', isCorrect: false },
            { text: 'Wait until you feel fully confident before attempting your first project', isCorrect: false },
          ],
          explanation: 'The course advises building things you care about as the fastest way to keep learning — you gain more from finishing real projects than from passive study alone.',
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
