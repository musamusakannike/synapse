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
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 5: Loops & Repetition (Automating Tasks)',
      description: 'Get Python to repeat actions for you instead of doing them by hand.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 6: Grouping Data (Collections)',
      description: 'Keep many pieces of information together in lists, dictionaries, and more.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 7: Functions (Reusable Code)',
      description: 'Build your own mini-tools that you can reuse anytime in your code.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 8: Mastering Text & Strings',
      description: 'Learn fun ways to work with and change text in your programs.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 9: Error Handling & Debugging',
      description: 'Learn what to do when your code breaks, so it doesn\'t crash on you.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 10: Using Built-in Modules',
      description: 'Use handy tools that already come built into Python, like random numbers and file reading.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 11: Intro to Object-Oriented Programming (OOP)',
      description: 'Learn a new way to organize code around real-world things, called objects.',
      contents: [],
      flashcards: [],
      mcqs: [],
    },
    {
      title: 'Module 12: Hands-On Capstone Projects',
      description: 'Put everything together and build real projects, like a quiz app and a to-do list.',
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
