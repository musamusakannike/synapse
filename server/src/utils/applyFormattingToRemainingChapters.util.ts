import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import mongoose from 'mongoose';
import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import Topic, { ITopicContent } from '../models/topic.model';
import { connectDB } from '../config/db.config';

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

export const formattedChapters3to7: ChapterData[] = [
  // ==========================================
  // CHAPTER 3: Essential Prompting Techniques & Patterns (Order: 2)
  // ==========================================
  {
    title: 'Essential Prompting Techniques & Patterns',
    description: 'Upgrade from basic commands to example-based learning, step-by-step reasoning, and expert roles.',
    order: 2,
    topics: [
      {
        title: 'Zero-Shot vs. Few-Shot Prompting',
        description: 'Learn when to give direct instructions and when to show examples so the AI copies your exact pattern.',
        order: 0,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Zero-Shot Prompting?\n\n"Zero-Shot" sounds like a complicated term, but it just means asking the AI to do a task without showing it any sample examples.',
              },
              {
                type: 'text',
                content:
                  'For instance, if you type: "Translate \'Good morning\' to Spanish," that is zero-shot. Modern AI is already very smart and can perform thousands of everyday tasks with zero examples.\nRemember: Zero-Shot means giving the AI a task directly without showing any sample demonstrations.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What does "Zero-Shot Prompting" mean?',
              options: [
                {
                  text: 'Asking the AI to do a task with zero sample examples provided',
                  isCorrect: true,
                },
                {
                  text: 'Taking zero seconds to write a prompt',
                  isCorrect: false,
                },
                {
                  text: 'Having zero words in your prompt',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Zero-Shot means asking the AI to do a task directly without showing any sample demonstrations.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Few-Shot Prompting?\n\n"Few-Shot" means giving the AI 2 to 4 sample demonstrations (inputs and answers) before asking it to solve a new problem.',
              },
              {
                type: 'text',
                content:
                  'Think of it like showing a student two completed homework examples in a notebook before asking them to solve question three. The AI looks at your samples and copies your exact pattern and formatting.\nRemember: Few-Shot prompting means providing 2 to 4 examples so the AI copies your pattern.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'If you show the AI two sample customer reviews with their tags before asking it to tag a third review, what technique is that?',
              options: [
                {
                  text: 'Few-Shot Prompting',
                  isCorrect: true,
                },
                {
                  text: 'Zero-Shot Prompting',
                  isCorrect: false,
                },
                {
                  text: 'Negative Prompting',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Providing sample input/output examples is Few-Shot prompting.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'In-Context Learning & Custom Labels\n\nWhen you provide examples inside your prompt, the AI learns the pattern instantly without needing any special programming. This is called **In-Context Learning**.',
              },
              {
                type: 'text',
                content:
                  'Few-Shot prompting is the best way to teach the AI custom category names (like `#BUG_URGENT` or `STATUS_VIP`) or unique formatting that it has never seen before.\nRemember: Few-Shot examples teach the AI your custom labels, style, and formatting rules instantly.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why is Few-Shot prompting better than Zero-Shot when you need a custom format?',
              options: [
                {
                  text: 'Because the AI sees your exact examples and copies your style without guessing',
                  isCorrect: true,
                },
                {
                  text: 'Because Zero-Shot does not work on mobile phones',
                  isCorrect: false,
                },
                {
                  text: 'Because Few-Shot uses zero internet data',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Examples eliminate guesswork by showing the AI the exact pattern to follow.',
            },
          },
        ],
      },
      {
        title: 'Chain-of-Thought & Step-by-Step Reasoning',
        description: 'Help the AI solve tricky math, logic, and planning problems by thinking out loud.',
        order: 1,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Why AI Fails at Complex Logic\n\nWhen you ask an AI a tricky math or logic question, it tries to guess the final answer immediately on the very next word.',
              },
              {
                type: 'text',
                content:
                  'Because it rushes to give the answer without calculating on scratch paper first, it often makes silly mistakes on multi-step math and word puzzles.\nRemember: AI often makes mistakes when it rushes straight to the final answer.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why does an AI sometimes get math word problems wrong when asked for just the number?',
              options: [
                {
                  text: 'It rushes to predict the answer without working through the calculation steps first',
                  isCorrect: true,
                },
                {
                  text: 'AI models do not know how to add numbers',
                  isCorrect: false,
                },
                {
                  text: 'Computers cannot calculate numbers',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Without intermediate steps, the model has to guess the final number in one leap.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The Power of "Think Step-by-Step"\n\n**Chain-of-Thought (CoT)** is a technique where you tell the AI: "Let\'s think step by step and show each calculation clearly before stating the final answer."',
              },
              {
                type: 'text',
                content:
                  'When the AI writes out step 1 and step 2 on the screen, those words become part of its memory. It uses those written steps to calculate step 3 correctly!\nRemember: Asking the AI to "think step by step" lets it write down its reasoning, leading to accurate answers.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What simple phrase helps the AI solve difficult logic and math problems?',
              options: [
                {
                  text: '"Let\'s think step by step"',
                  isCorrect: true,
                },
                {
                  text: '"Answer in one millisecond"',
                  isCorrect: false,
                },
                {
                  text: '"Do not write any words"',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: "Let\'s think step by step" triggers Chain-of-Thought reasoning.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'When to Use Chain-of-Thought\n\nUse Chain-of-Thought whenever you are working on:\n\n- Multi-step math calculations and budgets\n\n- Logic puzzles and riddles\n\n- Complex planning and troubleshooting',
              },
              {
                type: 'text',
                content:
                  'For simple questions like "What is the capital of Nigeria?", you do not need Chain-of-Thought. Save it for problems that require thinking things through.\nRemember: Use Chain-of-Thought for math, logic, planning, and multi-step problem solving.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Which of these tasks benefits the most from Chain-of-Thought prompting?',
              options: [
                {
                  text: 'Calculating the total trip cost for 4 friends with split hotel rooms and discounts',
                  isCorrect: true,
                },
                {
                  text: 'Asking what day comes after Tuesday',
                  isCorrect: false,
                },
                {
                  text: 'Translating the word "Hello" to French',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Multi-step financial and logic calculations require intermediate reasoning steps.',
            },
          },
        ],
      },
      {
        title: 'Role-Prompting & Persona Engineering',
        description: 'Give the AI an identity, profession, and target audience to instantly get expert answers.',
        order: 2,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Role-Prompting?\n\nThink of the AI as a skilled actor who can wear any costume. If you tell it "You are a friendly 5th-grade science teacher," it will use simple words, warm encouragement, and fun analogies.',
              },
              {
                type: 'text',
                content:
                  'If you tell it "You are a Chief Technology Officer," it will use deep technical terms and strategic business thinking.\nRemember: Role-prompting assigns a profession or persona to the AI to control its tone and depth.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What happens when you tell an AI: "Act as an experienced fitness coach"?',
              options: [
                {
                  text: 'It chooses vocabulary, advice, and tone appropriate for a fitness coach',
                  isCorrect: true,
                },
                {
                  text: 'It physically exercises inside the computer',
                  isCorrect: false,
                },
                {
                  text: 'It deletes all non-fitness files on your phone',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Role prompting steers the language model toward domain-specific knowledge and tone.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Specifying Your Target Audience\n\nAlong with giving the AI a role, always tell it who the audience is.',
              },
              {
                type: 'text',
                content:
                  'For example:\n\n- "Explain gravity to a 6-year-old child."\n\n- "Explain gravity to a high school physics student."\n\nThe topic is the same, but the explanation changes completely to fit the listener!\nRemember: Telling the AI who the explanation is for ensures it uses the right level of simplicity.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How do you prompt an AI to explain a medical topic in very simple terms?',
              options: [
                {
                  text: 'Instruct it: "Explain this to an absolute beginner using simple analogies and no medical jargon"',
                  isCorrect: true,
                },
                {
                  text: 'Tell it to use only complex Latin words',
                  isCorrect: false,
                },
                {
                  text: 'Type the question in all capital letters',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Specifying the target audience adjusts the complexity and vocabulary of the answer.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Combining Role, Audience, and Tone\n\nYou can also specify the personality and mood: "Act as an encouraging mentor," "Be direct and concise," or "Adopt a lighthearted, humorous tone."',
              },
              {
                type: 'text',
                content:
                  'Giving the AI both a role and a clear attitude creates answers that feel natural, personal, and pleasant to read.\nRemember: Combine role, audience level, and tone to get the exact style of answer you want.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Which prompt best combines role and audience?',
              options: [
                {
                  text: '"Act as a financial advisor. Explain inflation to a college student who has never studied economics."',
                  isCorrect: true,
                },
                {
                  text: '"What is inflation?"',
                  isCorrect: false,
                },
                {
                  text: '"Money fast"',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Combining role and audience produces tailored results.',
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 4: Output Formatting & Working with Structured Data (Order: 3)
  // ==========================================
  {
    title: 'Output Formatting & Working with Structured Data',
    description: 'Force the AI to produce clean tables, bullet points, and neat data structures ready for work.',
    order: 3,
    topics: [
      {
        title: 'Structuring Outputs: Tables, Markdown, and Bullet Lists',
        description: 'Get clean, organized information with zero messy paragraphs to clean up.',
        order: 0,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Why Output Formatting Matters\n\nGetting a good answer from an AI is only half the battle. If the answer is one giant wall of text, you will waste 10 minutes reorganizing it by hand.',
              },
              {
                type: 'text',
                content:
                  'By telling the AI how to format its reply, you get clean, readable answers that you can instantly paste into emails, slides, or documents.\nRemember: Specifying the output format saves you time and makes answers easy to read.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why should you specify how the AI formats its response?',
              options: [
                {
                  text: 'To get clean, organized results that you can use immediately without manual editing',
                  isCorrect: true,
                },
                {
                  text: 'Because the AI refuses to answer without a format rule',
                  isCorrect: false,
                },
                {
                  text: 'To speed up your home internet connection',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Clear formatting saves you time and makes answers readable.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Creating Markdown Tables\n\nWhen you want to compare different items, ask for a **Markdown table**.',
              },
              {
                type: 'text',
                content:
                  'Always tell the AI the exact column headers you want!\n\nExample: "Compare iPhone 16 and Samsung Galaxy S25. Format as a table with columns: Phone Model | Screen Size | Battery Life | Starting Price."\nRemember: When asking for a table, list the exact column headers you want the AI to include.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the best way to get a clean side-by-side comparison of 3 products?',
              options: [
                {
                  text: 'Ask for a Markdown table and specify the exact column names',
                  isCorrect: true,
                },
                {
                  text: 'Ask for a 1,000-word paragraph with no spaces',
                  isCorrect: false,
                },
                {
                  text: 'Let the AI guess how you want it organized',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Specifying column headers guarantees a neat, structured comparison table.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Bullet Points and Action Checklists\n\nBullet lists are great for summaries, step-by-step guides, and action plans.',
              },
              {
                type: 'text',
                content:
                  'You can set rules like: "Give 5 bullet points. Start each bullet with a bold action verb (e.g., Download, Install, Review)." This makes the output look clean and professional.\nRemember: Use bullet lists with bold start words to make guides and summaries super clear.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How do you make a bullet list easy to scan quickly?',
              options: [
                {
                  text: 'Instruct the AI to start each bullet point with a bold action verb',
                  isCorrect: true,
                },
                {
                  text: 'Ask for 50 sentences in each bullet point',
                  isCorrect: false,
                },
                {
                  text: 'Remove all punctuation and capital letters',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Starting with bold action words makes lists easy to read and act upon.',
            },
          },
        ],
      },
      {
        title: 'Generating Strict JSON, YAML, and CSV',
        description: 'Produce machine-readable data for spreadsheets and apps without unwanted chatter.',
        order: 1,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is JSON in Plain English?\n\nJSON (JavaScript Object Notation) sounds technical, but think of it as a set of labeled storage boxes.',
              },
              {
                type: 'text',
                content:
                  'Each box has a **label (key)** and an **item inside (value)**. For example: `{"name": "Ada", "city": "Lagos"}`. Computers and spreadsheets love JSON because it is super organized.\nRemember: JSON is just labeled boxes of information that computer programs can easily read.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is JSON used for in everyday software?',
              options: [
                {
                  text: 'Organizing data with labels and values so apps and databases can read it easily',
                  isCorrect: true,
                },
                {
                  text: 'Editing video files',
                  isCorrect: false,
                },
                {
                  text: 'Browsing social media feeds',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: JSON organizes data with keys and values for computers to read.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Stopping Conversational Fluff\n\nWhen you ask an AI for JSON, it often wants to be polite and says: "Sure! Here is the JSON data you requested:".',
              },
              {
                type: 'text',
                content:
                  'If you are building an app or copying data, that greeting breaks things! To stop this, add a strict rule: "Return ONLY valid JSON. Do not include any greeting, explanation, or conversational text."\nRemember: Add "Return ONLY valid JSON with no introductory text" to get pure data.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How do you prevent the AI from saying "Sure, here is your JSON:" before the data?',
              options: [
                {
                  text: 'Instruct it: "Return ONLY valid JSON. Do not include any greeting or conversational filler"',
                  isCorrect: true,
                },
                {
                  text: 'Hope the AI forgets to say hello',
                  isCorrect: false,
                },
                {
                  text: 'Type the word JSON ten times in a row',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Explicit negative constraints prevent unwanted conversational intro text.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Giving the AI a Sample Template (Schema)\n\nTo get the exact labels you need, show the AI a sample template in your prompt.',
              },
              {
                type: 'text',
                content:
                  'For example:\n\n```json\n{\n  "fullName": "string",\n  "email": "string",\n  "phoneNumber": "string"\n}\n```\n\nThe AI will fill in the values while keeping your exact label names intact.\nRemember: Providing a sample JSON template guarantees the AI uses your exact labels and format.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why is providing a sample JSON structure in your prompt helpful?',
              options: [
                {
                  text: 'It guarantees the AI uses the exact key names and data types your project expects',
                  isCorrect: true,
                },
                {
                  text: 'It makes the computer file size smaller',
                  isCorrect: false,
                },
                {
                  text: 'It translates the text into French',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: A sample template guarantees exact label names and structure.',
            },
          },
        ],
      },
      {
        title: 'Extraction & Data Transformation',
        description: 'Extract names, dates, prices, and phone numbers from messy emails and receipts.',
        order: 2,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Data Extraction?\n\nIn everyday work, you receive messy text: long emails, customer complaints, photos of receipts, or support tickets.',
              },
              {
                type: 'text',
                content:
                  '**Data extraction** is using AI to pull out only the specific facts you care about (like customer name, date, invoice total, and complaint reason).\nRemember: Data extraction means pulling specific facts out of messy, unstructured text.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is an example of data extraction?',
              options: [
                {
                  text: 'Pulling the customer name, date, and invoice total from a long email receipt',
                  isCorrect: true,
                },
                {
                  text: 'Writing a fictional story about astronauts on Mars',
                  isCorrect: false,
                },
                {
                  text: 'Generating a random phone number',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Data extraction pulls specific structured facts from unstructured text.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'How to Write an Extraction Prompt\n\nTo write a rock-solid extraction prompt:\n\n1. Fence off your messy text with delimiters (`"""`).\n\n2. List the exact fields you want extracted.\n\n3. Tell the AI what to write if a field is missing (e.g., write "N/A").',
              },
              {
                type: 'text',
                content:
                  'Example: "From the email inside the triple quotes, extract: 1. Sender Name, 2. Issue Summary, 3. Order ID (or \'None\' if not mentioned)."\nRemember: List the exact fields to extract and tell the AI what to put if a field is missing.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What should you tell the AI to do if an extracted field is missing from the text?',
              options: [
                {
                  text: 'Provide a fallback rule like "If not mentioned, write N/A"',
                  isCorrect: true,
                },
                {
                  text: 'Tell the AI to make up a believable number',
                  isCorrect: false,
                },
                {
                  text: 'Tell the AI to stop responding',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: A fallback rule stops the AI from guessing or making up missing data.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Transforming Formats (e.g., Email to Spreadsheet)\n\nYou can also ask the AI to transform messy text directly into a spreadsheet format (CSV) or table.',
              },
              {
                type: 'text',
                content:
                  'This turns 30 minutes of manual copy-pasting from emails into a 5-second task.\nRemember: You can extract messy text and transform it directly into tables or spreadsheets in one go.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why is AI data extraction valuable for everyday office work?',
              options: [
                {
                  text: 'It automates tedious copy-pasting and organizes messy data in seconds',
                  isCorrect: true,
                },
                {
                  text: 'It replaces the need for a computer monitor',
                  isCorrect: false,
                },
                {
                  text: 'It speeds up your internet download rate',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Extracting data with AI saves hours of manual data entry.',
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 5: Real-World Prompting Workflows & Applications (Order: 4)
  // ==========================================
  {
    title: 'Real-World Prompting Workflows & Applications',
    description: 'Apply prompt engineering to write better emails, debug code, and analyze long documents.',
    order: 4,
    topics: [
      {
        title: 'Prompting for Writing, Editing, and Tone Adjustment',
        description: 'Use AI as a sharp copyeditor instead of generating boring, cliché-filled text.',
        order: 0,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The Problem with "Write an Article from Scratch"\n\nIf you ask an AI "Write a blog post about productivity," it often produces boring text filled with overused phrases like "In today\'s fast-paced world," "Delve into," or "A testament to...".',
              },
              {
                type: 'text',
                content:
                  'Generic prompts produce generic answers. The best way to use AI for writing is as a **co-writer and editor** for your own ideas.\nRemember: Avoid asking AI to write generic articles from scratch; use it to shape and refine your own ideas.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why does asking an AI to "write an article from scratch" often sound robotic?',
              options: [
                {
                  text: 'Without your personal outline and tone rules, it defaults to generic AI clichés',
                  isCorrect: true,
                },
                {
                  text: 'AI models do not know what words mean',
                  isCorrect: false,
                },
                {
                  text: 'Computers cannot write in full sentences',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Supplying your own draft and specific tone rules prevents generic AI writing.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The "Ruthless Copyeditor" Technique\n\nInstead of letting the AI write everything, write your own rough draft first. Then paste it in and ask the AI to act as a copyeditor.',
              },
              {
                type: 'text',
                content:
                  'Tell it: "Review my draft. Point out any confusing sentences, passive voice, and wordy phrases. Then give me a polished version that preserves my original voice."\nRemember: Using AI as an editor improves your writing while keeping your authentic human voice.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the "Ruthless Copyeditor" prompt technique?',
              options: [
                {
                  text: 'Giving the AI your rough draft and asking it for constructive edits and a polished rewrite',
                  isCorrect: true,
                },
                {
                  text: 'Asking the AI to insult your writing style',
                  isCorrect: false,
                },
                {
                  text: 'Deleting your draft without saving it',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Using AI as a copyeditor polishes your draft without losing your personal voice.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Setting Negative Tone Constraints\n\nYou can ban robotic words by adding strict negative rules.',
              },
              {
                type: 'text',
                content:
                  'Example: "Write a casual announcement for our team lunch. Do NOT use buzzwords, corporate jargon, or cliché phrases like \'fast-paced world\'. Keep it warm, friendly, and under 70 words."\nRemember: Banning buzzwords and clichés makes AI writing sound fresh, human, and engaging.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How do you keep AI writing from sounding like corporate buzzwords?',
              options: [
                {
                  text: 'Add a negative constraint banning buzzwords, clichés, and overused phrases',
                  isCorrect: true,
                },
                {
                  text: 'Type in uppercase letters',
                  isCorrect: false,
                },
                {
                  text: 'Turn the temperature setting up to maximum',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Explicit negative constraints stop overused corporate clichés.',
            },
          },
        ],
      },
      {
        title: 'Prompting for Developers & Code Assistance',
        description: 'Debug errors, explain tricky code, and generate tests with precision.',
        order: 1,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Rubber-Duck Debugging?\n\nProgrammers have an old trick: when stuck on a bug, they explain the problem out loud to a little rubber duck on their desk. Often, just explaining the steps reveals the fix!',
              },
              {
                type: 'text',
                content:
                  'AI is the ultimate rubber duck because it can actually talk back, spot typos, and suggest clean solutions.\nRemember: Rubber-duck debugging with AI means explaining your code and bug to find the fix together.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is "Rubber-Duck Debugging" with AI?',
              options: [
                {
                  text: 'Explaining your code, expected behavior, and error message to the AI to find and fix bugs',
                  isCorrect: true,
                },
                {
                  text: 'Buying a yellow plastic toy online',
                  isCorrect: false,
                },
                {
                  text: 'Typing code while listening to music',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Explaining your code and errors to AI helps pinpoint and solve bugs quickly.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The 4 Things Every Coding Prompt Needs\n\nWhenever you ask AI for code help, always include these 4 things:\n\n1. **Language & Tools:** (e.g., Python 3.11, React TypeScript)\n\n2. **Expected Behavior:** (What you want to happen)',
              },
              {
                type: 'text',
                content:
                  'And don\'t forget:\n\n3. **Actual Behavior & Error Message:** (The exact error message or wrong output)\n\n4. **Your Code Snippet:** (Paste your code inside code fences)\nRemember: Always provide the language, your code, the exact error, and the expected result.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Which information is most important when asking an AI to fix a coding bug?',
              options: [
                {
                  text: 'The exact error message and the code snippet where it occurred',
                  isCorrect: true,
                },
                {
                  text: 'The brand of your keyboard',
                  isCorrect: false,
                },
                {
                  text: 'The time of day you started coding',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Exact error messages and code snippets give the AI the clues it needs to fix bugs.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Asking for Explanations and Tests\n\nNever copy code that you do not understand. Always ask: "Explain how this fix works line by line in simple terms."',
              },
              {
                type: 'text',
                content:
                  'You can also ask the AI: "Write 3 unit tests that check edge cases for this function." This makes sure your code is safe and reliable.\nRemember: Always ask the AI to explain unfamiliar code and write tests to check edge cases.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why should you ask the AI to write unit tests for your code?',
              options: [
                {
                  text: 'To verify that the code handles edge cases and works properly under different conditions',
                  isCorrect: true,
                },
                {
                  text: 'To make the file size larger on your disk',
                  isCorrect: false,
                },
                {
                  text: 'Because unit tests are required to run an AI',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Unit tests ensure your code works correctly and handles unexpected inputs.',
            },
          },
        ],
      },
      {
        title: 'Research, Synthesis, and Long-Document Analysis',
        description: 'Digest long reports, articles, and meeting notes without missing key details.',
        order: 2,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Tackling Long Documents with AI\n\nReading a 30-page PDF or a 5,000-word report takes hours. AI can summarize it in seconds, but asking for a generic summary often leaves out important points.',
              },
              {
                type: 'text',
                content:
                  'To get a truly useful summary, ask for structured sections: **Key Takeaway**, **Main Arguments**, **Data & Numbers**, and **Potential Drawbacks**.\nRemember: Asking for specific summary sections ensures no critical facts are missed.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the best way to summarize a long research report with an AI?',
              options: [
                {
                  text: 'Ask for structured sections like Key Takeaways, Main Findings, and Limitations',
                  isCorrect: true,
                },
                {
                  text: 'Ask for the whole report in one single word',
                  isCorrect: false,
                },
                {
                  text: 'Paste only the title of the document',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Specific headings ensure every vital part of the document is captured.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Asking for Direct Quotes and Citations\n\nHow do you know the AI isn\'t making things up when summarizing a document?',
              },
              {
                type: 'text',
                content:
                  'Instruct it: "For every key point, include a short direct quote from the provided text to support your statement." This forces the AI to stay 100% faithful to the text.\nRemember: Asking for direct quotes keeps summaries accurate and grounded in the source text.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How can you verify that a summary point came directly from your document?',
              options: [
                {
                  text: 'Instruct the AI to include direct short quotes from the document for each point',
                  isCorrect: true,
                },
                {
                  text: 'Assume the AI never makes a mistake',
                  isCorrect: false,
                },
                {
                  text: 'Ask the AI if it is telling the truth',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Direct quotes verify that facts come straight from the source document.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Extracting Action Items from Meeting Notes\n\nWhen you paste a messy transcript of a team meeting, you can turn it into an instant action plan.',
              },
              {
                type: 'text',
                content:
                  'Prompt Example: "From the meeting notes below, create a table with 3 columns: Task Description | Person Responsible | Due Date."\nRemember: You can convert messy meeting notes into structured action items and task tables instantly.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How can AI help after a long team meeting?',
              options: [
                {
                  text: 'Extracting action items, assigned people, and deadlines into a neat table',
                  isCorrect: true,
                },
                {
                  text: 'Playing background music during the call',
                  isCorrect: false,
                },
                {
                  text: 'Sending random messages to everyone in the company',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: AI can turn messy conversation notes into a neat checklist with assigned owners.',
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 6: Troubleshooting, Guardrails, and Avoiding Pitfalls (Order: 5)
  // ==========================================
  {
    title: 'Troubleshooting, Guardrails, and Avoiding Pitfalls',
    description: 'Stop false AI facts, apply strict negative rules, and build multi-step prompt chains.',
    order: 5,
    topics: [
      {
        title: 'Preventing Hallucinations & Factual Drift',
        description: 'Understand why AI makes things up and use grounding to keep answers 100% accurate.',
        order: 0,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is an AI Hallucination?\n\nAn **AI Hallucination** happens when the model generates false information, fake book titles, or made-up statistics while sounding completely confident and convincing.',
              },
              {
                type: 'text',
                content:
                  'Why does this happen? Remember: AI is a prediction machine based on language patterns, not a live human brain. When it does not know an answer, it guesses what sounds plausible.\nRemember: An AI hallucination is when the model generates fabricated facts with high confidence.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is an AI "hallucination"?',
              options: [
                {
                  text: 'When an AI generates believable but completely fabricated or incorrect information',
                  isCorrect: true,
                },
                {
                  text: 'When the computer turns off unexpectedly',
                  isCorrect: false,
                },
                {
                  text: 'When the AI displays nature images on screen',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: An AI hallucination is when the model generates fabricated facts with high confidence.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Grounding: The Anti-Hallucination Shield\n\n**Grounding** means anchoring the AI strictly to a specific source text that you provide in the prompt.',
              },
              {
                type: 'text',
                content:
                  'The Golden Grounding Rule:\n\n> "Answer the question using ONLY the provided text below. Do NOT use outside knowledge. If the text does not contain the answer, reply: \'This information is not in the document.\'"\nRemember: Grounding restricts the AI to answer exclusively using your provided source text.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the best prompt instruction to stop an AI from making up facts about your company handbook?',
              options: [
                {
                  text: '"Answer using ONLY the provided handbook text. If not found, reply \'Not in document\'"',
                  isCorrect: true,
                },
                {
                  text: '"Please be very confident and smart in your answer"',
                  isCorrect: false,
                },
                {
                  text: '"Use all information on the internet to guess"',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Grounding restricts the AI strictly to the text you provide.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The Power of the Fallback Rule\n\nIf you do not give the AI permission to say "I don\'t know", it will feel pressured to invent an answer.',
              },
              {
                type: 'text',
                content:
                  'A **fallback rule** explicitly tells the AI what to say when information is missing. This one simple sentence eliminates over 90% of hallucinations.\nRemember: Always give the AI a fallback phrase like "Reply \'I do not know\' if the answer is missing."',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why is giving a fallback rule (like "say \'I don\'t know\' if absent") so effective?',
              options: [
                {
                  text: 'It gives the AI permission to admit missing information instead of guessing',
                  isCorrect: true,
                },
                {
                  text: 'It shuts down the AI model completely',
                  isCorrect: false,
                },
                {
                  text: 'It makes the computer type faster',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Fallback rules prevent the AI from fabricating answers when data is missing.',
            },
          },
        ],
      },
      {
        title: 'Negative Prompting & Strict Constraints',
        description: 'Tell the AI what NOT to do without causing confusion or accidental rule-breaking.',
        order: 1,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Negative Prompting?\n\nNegative prompting means giving explicit rules about what the AI should **avoid** or **exclude** from its answer.',
              },
              {
                type: 'text',
                content:
                  'Examples of negative rules: "Do not use emojis," "Do not exceed 100 words," "Do not mention competitor brand names."\nRemember: Negative prompting specifies what the AI must NOT do or include in its answer.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is a negative prompt constraint?',
              options: [
                {
                  text: 'An instruction specifying what the AI should avoid or exclude',
                  isCorrect: true,
                },
                {
                  text: 'A rude message sent to an AI',
                  isCorrect: false,
                },
                {
                  text: 'A prompt that gives a 1-star review',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Negative constraints set boundaries on what the AI must exclude.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The "Pink Elephant" Problem\n\nIf someone says, "Do not think of a pink elephant!", what is the first thing that pops into your head? A pink elephant!',
              },
              {
                type: 'text',
                content:
                  'AI works the same way because every word you type becomes a token in its context. If you say "Don\'t write about pricing", the word "pricing" is now in its memory.\nRemember: Merely mentioning forbidden words can sometimes draw the AI\'s attention to them.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why can negative instructions like "Don\'t mention apples" sometimes cause issues?',
              options: [
                {
                  text: 'Because the word "apples" is now in the prompt context, which might draw the AI\'s focus',
                  isCorrect: true,
                },
                {
                  text: 'Because AI models do not understand the English language',
                  isCorrect: false,
                },
                {
                  text: 'Because apples are forbidden in AI training data',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Words in the prompt become tokens that guide attention.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'How to Write Effective Constraints (The Positive Alternative)\n\nWhenever possible, state the **positive alternative** alongside the negative rule.',
              },
              {
                type: 'text',
                content:
                  'Instead of just saying "Don\'t write a long answer", say "Keep your response under 3 sentences and focus solely on the solution." Clear boundaries prevent mistakes.\nRemember: Pair negative rules with clear positive guidelines for the cleanest results.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Which prompt constraint is the most effective and clear?',
              options: [
                {
                  text: '"Keep your response strictly under 50 words and format as 2 bullet points"',
                  isCorrect: true,
                },
                {
                  text: '"Don\'t make it bad"',
                  isCorrect: false,
                },
                {
                  text: '"Write normally without being too long maybe"',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Clear numerical limits and exact formats work best.',
            },
          },
        ],
      },
      {
        title: 'Prompt Chaining & Multi-Step Workflows',
        description: 'Break big, complicated projects into small, connected steps for maximum quality.',
        order: 2,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The Single-Prompt Trap\n\nWhen people have a big project (like writing a 10-page report or creating a business proposal), they often try to ask for everything in one massive prompt.',
              },
              {
                type: 'text',
                content:
                  'The AI gets overwhelmed, skips important details, and produces a shallow, rushed result.\nRemember: Trying to do a complex project in one single prompt leads to shallow and incomplete answers.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What usually happens when you ask an AI to write an entire 10-page business proposal in a single prompt?',
              options: [
                {
                  text: 'The output is rushed, skips details, and lacks depth',
                  isCorrect: true,
                },
                {
                  text: 'The computer screen turns off',
                  isCorrect: false,
                },
                {
                  text: 'The AI writes a Nobel prize winning book',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Large single prompts lead to shallow, rushed answers.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is Prompt Chaining?\n\n**Prompt Chaining** is the process of breaking a big task into a sequence of smaller steps, where the output of Step 1 becomes the input for Step 2.',
              },
              {
                type: 'text',
                content:
                  'Think of an assembly line in a factory. One worker builds the frame, the next worker adds the wheels, and the third worker paints it. Each step is focused and high quality.\nRemember: Prompt Chaining means connecting a series of smaller prompts step by step.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is Prompt Chaining?',
              options: [
                {
                  text: 'Breaking a big task into smaller steps where each prompt builds on the previous answer',
                  isCorrect: true,
                },
                {
                  text: 'Locking your computer with a password',
                  isCorrect: false,
                },
                {
                  text: 'Typing prompts while holding a metal chain',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Prompt Chaining breaks complex work into focused, linked steps.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'A Real 3-Step Chaining Example\n\nHere is how to create a high-quality blog post using a prompt chain:\n\n- **Step 1:** "Give me 5 catchy angles for an article on solar energy." (Pick the best angle)\n\n- **Step 2:** "Create a detailed 4-part outline for Angle #3." (Review and tweak outline)',
              },
              {
                type: 'text',
                content:
                  'Then continue:\n\n- **Step 3:** "Draft Section 1 using the outline, maintaining an engaging tone."\n\nBy reviewing at each step, the final article is 10x better!\nRemember: Chaining gives you control to review, edit, and steer the AI at every stage.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why does prompt chaining produce much higher quality results for big tasks?',
              options: [
                {
                  text: 'Because you can inspect, guide, and refine each stage before moving to the next',
                  isCorrect: true,
                },
                {
                  text: 'Because it uses zero tokens',
                  isCorrect: false,
                },
                {
                  text: 'Because AI only works when chained',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Guiding each step individually ensures depth and accuracy.',
            },
          },
        ],
      },
    ],
  },

  // ==========================================
  // CHAPTER 7: Capstone & Best Practices Mastery (Order: 6)
  // ==========================================
  {
    title: 'Capstone & Best Practices Mastery',
    description: 'Put everything together into a production-grade system prompt and master the prompt checklist.',
    order: 6,
    topics: [
      {
        title: 'Building a Production System Prompt',
        description: 'Look behind the scenes of real AI assistants and build a complete system prompt.',
        order: 0,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'What is a Production System Prompt?\n\nIn real software applications, developers write a master instruction called a **System Prompt** that governs how the AI behaves with thousands of users.',
              },
              {
                type: 'text',
                content:
                  'It defines who the assistant is, what knowledge it has access to, what rules it must never break, and how it must format its replies.\nRemember: A System Prompt is the master rulebook that governs an AI assistant.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the purpose of a System Prompt in a software application?',
              options: [
                {
                  text: 'To set persistent rules, persona, knowledge boundaries, and output formats for the AI assistant',
                  isCorrect: true,
                },
                {
                  text: 'To turn the computer screen off when idle',
                  isCorrect: false,
                },
                {
                  text: 'To delete user messages permanently',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: A System Prompt is the master rulebook that governs an AI assistant.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The 5 Sections of a Production System Prompt\n\nA production system prompt brings together all the skills you have learned:\n\n1. **Role & Tone:** "You are SabiBot, a friendly support assistant."\n\n2. **Knowledge Base (Grounding):** Provide verified facts and FAQs.\n\n3. **Rules & Constraints:** "Keep answers under 3 sentences. Never promise refunds directly."',
              },
              {
                type: 'text',
                content:
                  'And the remaining two sections:\n\n4. **Fallback & Escalation:** "If a user asks about billing errors, direct them to /support/billing."\n\n5. **Output Format:** "Return answers in clean JSON format."\nRemember: A complete system prompt combines role, grounding data, strict rules, fallback plans, and output formats.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'Why must a customer support system prompt include escalation and fallback rules?',
              options: [
                {
                  text: 'So the AI knows what to say and where to send users when it cannot resolve an issue safely',
                  isCorrect: true,
                },
                {
                  text: 'To make the chatbot take a lunch break',
                  isCorrect: false,
                },
                {
                  text: 'Because support bots are not allowed to talk to humans',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Escalation and fallback rules handle edge cases and safety gracefully.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Testing and Refining Your System Prompt\n\nPrompt engineering is an **iterative process**. You write your prompt, test it with edge cases (like tricky user questions), and refine the instructions.',
              },
              {
                type: 'text',
                content:
                  'If the AI makes a mistake during testing, do not worry! Just add a new constraint or example to prevent that mistake in the future.\nRemember: Always test your prompts with tricky questions and refine your rules.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What should you do if an AI assistant gives an unwanted answer during testing?',
              options: [
                {
                  text: 'Refine the prompt by adding a clear constraint or a few-shot example that prevents that mistake',
                  isCorrect: true,
                },
                {
                  text: 'Give up on using AI completely',
                  isCorrect: false,
                },
                {
                  text: 'Restart your home Wi-Fi router',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Prompt engineering is iterative: test, evaluate, and refine.',
            },
          },
        ],
      },
      {
        title: 'The Master Prompt Engineer\'s Checklist',
        description: 'Your 5-point golden checklist and final principles for lifelong AI mastery.',
        order: 1,
        contents: [
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The 5-Point Prompt Checklist\n\nBefore you send any important prompt to an AI, quickly run through this 5-point checklist:\n\n1. **Role:** Did I specify who the AI is?\n\n2. **Task:** Is the action crystal clear?\n\n3. **Context:** Did I include necessary background facts?',
              },
              {
                type: 'text',
                content:
                  'And the last two points:\n\n4. **Format & Rules:** Did I ask for a table, JSON, or bullet points with limits?\n\n5. **Guardrail & Fallback:** Did I tell the AI what to do if information is missing?\nRemember: Role, Task, Context, Format, and Guardrail make up the 5-point prompt checklist.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the 5-point checklist for writing great prompts?',
              options: [
                {
                  text: 'Role, Task, Context, Format, and Guardrails',
                  isCorrect: true,
                },
                {
                  text: 'Read, Write, Delete, Refresh, Exit',
                  isCorrect: false,
                },
                {
                  text: 'Copy, Paste, Undo, Redo, Save',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Role, Task, Context, Format, and Guardrails make up the 5-point checklist.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'The Golden Rule of AI Communication\n\nAI models are like high-definition mirrors: they reflect the clarity of your instructions.',
              },
              {
                type: 'text',
                content:
                  'If you put in vague, hurried thoughts, you get vague, mediocre results. If you put in clear, structured instructions, you get brilliant, time-saving answers.\nRemember: Clear inputs produce great outputs. You are now in complete control of AI.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'What is the single most important rule to remember when prompting any AI?',
              options: [
                {
                  text: 'Clear context, specific constraints, and unambiguous instructions produce great answers',
                  isCorrect: true,
                },
                {
                  text: 'AI models automatically read your thoughts without instructions',
                  isCorrect: false,
                },
                {
                  text: 'Prompts must always be as short as one word',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Clear inputs produce great outputs.',
            },
          },
          {
            type: 'group',
            content: 'Group Section',
            blocks: [
              {
                type: 'text',
                content:
                  'Congratulations on Completing the Course!\n\nYou have mastered the foundations of AI, core frameworks (RTF), Few-Shot examples, Chain-of-Thought reasoning, structured data formatting, anti-hallucination guardrails, and prompt chaining.',
              },
              {
                type: 'text',
                content:
                  'You now hold one of the most powerful modern productivity skills. Keep practicing, keep experimenting, and use AI to build amazing things!\nRemember: Prompt engineering is a superpower that helps you think clearly, work faster, and create more.',
              },
            ],
          },
          {
            type: 'quiz',
            content: 'Quiz',
            quiz: {
              question: 'How will you continue growing your prompt engineering skills?',
              options: [
                {
                  text: 'By applying frameworks, testing new ideas, and experimenting with real everyday tasks',
                  isCorrect: true,
                },
                {
                  text: 'By never using AI tools again',
                  isCorrect: false,
                },
                {
                  text: 'By forgetting everything learned in this course',
                  isCorrect: false,
                },
              ],
              explanation: 'Remember: Practical experimentation and daily application build true mastery.',
            },
          },
        ],
      },
    ],
  },
];

export const applyFormatting = async () => {
  try {
    await connectDB();

    console.log('Connecting to MongoDB to update Chapters 3 through 7...');
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

    console.log(`Course found: "${course.title}" (${course._id})`);

    let updatedTopicsCount = 0;

    for (const chData of formattedChapters3to7) {
      // Find the chapter by order and course
      const chapter = await Chapter.findOne({
        course: course._id,
        order: chData.order,
      });

      if (!chapter) {
        console.log(`Chapter ${chData.order} not found, creating it...`);
        const newChapter = await Chapter.create({
          course: course._id,
          title: chData.title,
          description: chData.description,
          order: chData.order,
        });

        for (const tData of chData.topics) {
          await Topic.create({
            course: course._id,
            chapter: newChapter._id,
            title: tData.title,
            description: tData.description,
            order: tData.order,
            contents: tData.contents,
            xp: 50,
            isPublished: true,
          });
          updatedTopicsCount++;
        }
      } else {
        console.log(`Updating Chapter ${chData.order}: "${chapter.title}"...`);
        // Update topics in this chapter
        for (const tData of chData.topics) {
          const topic = await Topic.findOne({
            chapter: chapter._id,
            order: tData.order,
          });

          if (topic) {
            topic.title = tData.title;
            topic.description = tData.description;
            topic.contents = tData.contents;
            await topic.save();
            console.log(`  ✓ Updated Topic ${tData.order}: "${topic.title}"`);
            updatedTopicsCount++;
          } else {
            await Topic.create({
              course: course._id,
              chapter: chapter._id,
              title: tData.title,
              description: tData.description,
              order: tData.order,
              contents: tData.contents,
              xp: 50,
              isPublished: true,
            });
            console.log(`  + Created Topic ${tData.order}: "${tData.title}"`);
            updatedTopicsCount++;
          }
        }
      }
    }

    console.log('\n========================================');
    console.log('Successfully updated Chapters 3 through 7 with matching formatting patterns!');
    console.log(`Total Topics Updated: ${updatedTopicsCount}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error applying formatting to Chapters 3-7:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  applyFormatting();
}
