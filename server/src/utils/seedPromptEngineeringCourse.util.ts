import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Course, { ICourse } from '../models/course.model';
import Chapter from '../models/chapter.model';
import Topic, { ITopicContent } from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import { connectDB } from '../config/db.config';

interface TopicSeed {
  title: string;
  description: string;
  contents: ITopicContent[];
  flashcards: { question: string; answer: string }[];
  mcqs: { question: string; options: { text: string; isCorrect: boolean }[]; explanation: string }[];
}

export const promptCourseChapters = [
  {
    title: 'Foundations of AI & Prompting',
    description: 'Understand how modern AI models think, process text with tokens, and master the core formula of great prompts.',
    order: 0,
  },
  {
    title: 'Essential Prompting Techniques',
    description: 'Learn proven techniques used by top practitioners: Zero-Shot, Few-Shot, and Chain-of-Thought reasoning.',
    order: 1,
  },
  {
    title: 'Output Formatting & Real-World Workflows',
    description: 'Direct AI outputs into tables, lists, and JSON data, and apply prompts to writing, coding, and research.',
    order: 2,
  },
  {
    title: 'Guardrails, Error Fixing & Capstone Project',
    description: 'Eliminate hallucinations, apply strict constraints, and build a complete production-ready AI prompt pipeline.',
    order: 3,
  },
];

export const promptCourseTopics: TopicSeed[] = [
  // Chapter 1: Foundations of AI & Prompting
  {
    title: 'Module 1: What is Prompt Engineering & How LLMs Work',
    description: 'Discover how AI models process words, predict text, and why clear instructions produce 10x better results.',
    contents: [
      {
        type: 'text',
        title: 'Welcome to Prompt Engineering',
        content:
          'Welcome to **Prompt Engineering Essentials**! Whether you use ChatGPT, Claude, DeepSeek, or Gemini, knowing how to communicate clearly with AI is one of the most valuable modern skills.\n\nA **prompt** is simply the text, question, or instruction you give to an AI model. **Prompt Engineering** is the practice of designing and refining these instructions so the AI gives you fast, accurate, and high-quality answers every single time.',
      },
      {
        type: 'text',
        title: 'How AI "Thinks": Next-Token Prediction',
        content:
          'Unlike humans, Large Language Models (LLMs) do not possess feelings, consciousness, or a permanent memory of past conversations. \n\nInstead, an LLM is a powerful **pattern recognition and prediction engine**. When you send a prompt, the model calculates mathematical probabilities to guess what word or phrase logically comes next based on patterns learned from billions of text documents.\n\n**Key Takeaway:** If your instructions are vague, the AI has to guess your intent. If your instructions are specific and structured, the AI follows the exact pattern you created.',
      },
      {
        type: 'text',
        title: 'What are Tokens?',
        content:
          'AI models do not read whole words or letters the way humans do. They break text into small chunks called **tokens**.\n\n- On average, 1 token ≈ 4 characters or 0.75 English words.\n- Common words (e.g., "apple", "learn") are usually single tokens.\n- Complex or rare words (e.g., "hyperparameter") might be broken into 3 or 4 tokens.\n\nEvery model has a maximum **Context Window** (e.g. 8k, 32k, or 128k tokens) representing the total amount of text it can process in a single conversation.',
      },
      {
        type: 'quiz',
        title: 'Quick Check: How LLMs Generate Text',
        content: 'Quiz',
        quiz: {
          question: 'How does an AI model primarily generate its responses?',
          options: [
            { text: 'By predicting the most probable next tokens based on patterns in its training data', isCorrect: true },
            { text: 'By browsing Google in real-time for every single word it outputs', isCorrect: false },
            { text: 'By retrieving pre-written human answers stored in a fixed database', isCorrect: false },
            { text: 'By thinking consciously about moral and philosophical truths', isCorrect: false },
          ],
          explanation: 'LLMs are probabilistic systems that generate text by predicting the next most likely tokens given the preceding context.',
        },
      },
      {
        type: 'text',
        title: 'Model Parameters: Temperature & Top-P',
        content:
          'When you interact with AI models through APIs or advanced settings, you will encounter **Temperature**:\n\n- **Low Temperature (0.0 – 0.3):** The model is focused, conservative, and deterministic. Ideal for math, coding, factual extraction, and data analysis.\n- **Medium Temperature (0.4 – 0.7):** A balanced mix of coherence and creativity. Perfect for general writing and tutoring.\n- **High Temperature (0.8 – 1.0+):** The model picks more diverse, surprising tokens. Ideal for creative storytelling and brainstorming.',
      },
    ],
    flashcards: [
      { question: 'What is Prompt Engineering?', answer: 'The practice of structuring and refining instructions given to an AI model to produce accurate, high-quality responses.' },
      { question: 'What is a Token in AI?', answer: 'A piece of text (a word or part of a word, roughly 4 characters) that LLMs use to read and generate language.' },
      { question: 'What does the Temperature setting control?', answer: 'The randomness or creativity of the model: lower values (0.0-0.3) are deterministic and factual, higher values (0.7-1.0) are creative.' },
      { question: 'What is an AI Context Window?', answer: 'The maximum total number of tokens (input prompt + output response) an AI model can hold in memory at one time.' },
    ],
    mcqs: [
      {
        question: 'Which temperature setting is best when asking an AI to extract dates and dollar amounts from an invoice?',
        options: [
          { text: 'Temperature 0.0 (strictly deterministic and factual)', isCorrect: true },
          { text: 'Temperature 1.5 (maximum randomness and creativity)', isCorrect: false },
          { text: 'Temperature 0.9 (poetic and varied output)', isCorrect: false },
          { text: 'Temperature does not affect data extraction', isCorrect: false },
        ],
        explanation: 'For data extraction, math, or coding where accuracy is paramount, low temperature (0.0 - 0.2) prevents random hallucinations.',
      },
      {
        question: 'Roughly how many English words does 100 tokens represent?',
        options: [
          { text: 'Around 75 words (1 token ≈ 0.75 words)', isCorrect: true },
          { text: 'Exactly 1,000 words', isCorrect: false },
          { text: 'Around 10 words', isCorrect: false },
          { text: 'Exactly 100 sentences', isCorrect: false },
        ],
        explanation: 'As a rule of thumb in English, 1 token is roughly 4 characters or about 0.75 words.',
      },
    ],
  },
  {
    title: 'Module 2: The Anatomy of a Perfect Prompt & Core Frameworks',
    description: 'Learn the 4 essential components of an effective prompt and apply the popular RTF formula.',
    contents: [
      {
        type: 'text',
        title: 'The 4 Core Pillars of a Great Prompt',
        content:
          'Whenever you write a prompt, make sure it includes these four elements:\n\n1. **Role:** Who should the AI pretend to be? *(e.g., "Act as a senior marketing specialist")*\n2. **Task:** What exact action must it perform? *(e.g., "Write 3 subject lines for a newsletter")*\n3. **Context:** What background information does it need? *(e.g., "The email announces a 30% discount on summer shoes")*\n4. **Constraints & Format:** What rules must it follow? *(e.g., "Keep each under 50 characters, no exclamation marks, format as a bulleted list")*',
      },
      {
        type: 'code',
        title: 'Before & After: Transforming a Weak Prompt',
        content:
          '# ❌ Vague Prompt:\n"Write an email about our product delay."\n\n# ✅ Engineered Prompt:\n"Act as a Customer Success Lead for a B2B SaaS startup. Write a diplomatic, 3-paragraph email to a client explaining a 1-week delay in releasing the new analytics dashboard due to extra security audits. Include 2 proactive steps we are taking, apologize sincerely, and maintain a calm, professional tone."',
        language: 'markdown',
      },
      {
        type: 'text',
        title: 'The RTF Framework (Role, Task, Format)',
        content:
          'When you need quick, high-quality results, use the **RTF formula**:\n\n- **R (Role):** "Act as a fitness coach."\n- **T (Task):** "Create a 3-day workout routine for a beginner with no gym equipment."\n- **F (Format):** "Present as a table with columns: Day, Exercise, Sets, Reps, and Rest Duration."',
      },
      {
        type: 'quiz',
        title: 'Quick Check: Prompt Components',
        content: 'Quiz',
        quiz: {
          question: 'In the prompt: "Act as a nutritionist and create a 7-day meal plan formatted in a table under 1,800 calories/day", what is "under 1,800 calories/day"?',
          options: [
            { text: 'A Constraint', isCorrect: true },
            { text: 'A Role', isCorrect: false },
            { text: 'The Output Format', isCorrect: false },
            { text: 'The Token Window', isCorrect: false },
          ],
          explanation: 'Constraints specify boundaries, limitations, or rules the AI must strictly respect.',
        },
      },
      {
        type: 'text',
        title: 'Using Delimiters to Separate Instructions from Content',
        content:
          'When asking an AI to analyze, summarize, or translate text, use **delimiters** like triple quotes (`"""`), XML tags (`<text>...</text>`), or markdown headers (`###`).\n\n**Why?** Delimiters clearly tell the AI where your instructions end and the raw data begins. This prevents the model from getting confused by instructions contained inside the text.',
      },
    ],
    flashcards: [
      { question: 'What are the 4 core pillars of an effective prompt?', answer: 'Role, Task, Context, and Constraints/Format.' },
      { question: 'What does the RTF framework stand for?', answer: 'Role, Task, Format.' },
      { question: 'Why should you use delimiters (like """ or <tags>) in prompts?', answer: 'To cleanly separate your prompt instructions from the input text being analyzed, preventing confusion or prompt injection.' },
      { question: 'What is a prompt constraint?', answer: 'A boundary or rule that limits the AI response (e.g. word count limit, banned words, specific tone).' },
    ],
    mcqs: [
      {
        question: 'Which of the following is the best way to ask an AI to summarize a customer review?',
        options: [
          { text: 'Summarize the text inside the triple quotes in 2 bullet points:\n"""The shipping was late by 3 days but the quality of the shoes was fantastic."""', isCorrect: true },
          { text: 'Summarize this review: The shipping was late by 3 days but the quality of the shoes was fantastic.', isCorrect: false },
          { text: 'Give summary now please.', isCorrect: false },
          { text: 'What is shipping?', isCorrect: false },
        ],
        explanation: 'Using delimiters like triple quotes clearly isolates the text to be summarized from the task instruction.',
      },
      {
        question: 'Why is defining a Role (e.g., "Act as a Senior Python Developer") beneficial in a prompt?',
        options: [
          { text: 'It primes the AI to choose vocabulary, depth, and best practices appropriate for that field', isCorrect: true },
          { text: 'It makes the AI run twice as fast', isCorrect: false },
          { text: 'It prevents the AI from using tokens', isCorrect: false },
          { text: 'It bypasses model safety filters', isCorrect: false },
        ],
        explanation: 'Role prompting helps steer the language model toward domain-specific knowledge and terminology.',
      },
    ],
  },

  // Chapter 2: Essential Prompting Techniques
  {
    title: 'Module 3: Zero-Shot, Few-Shot & In-Context Learning',
    description: 'Learn when to give direct instructions and when to provide examples to teach the AI new patterns.',
    contents: [
      {
        type: 'text',
        title: 'Zero-Shot vs. Few-Shot Prompting',
        content:
          'There are two fundamental ways to prompt an AI:\n\n1. **Zero-Shot Prompting:** You give the model a task directly without providing any examples. Modern LLMs are already trained on massive datasets and can perform many tasks zero-shot.\n2. **Few-Shot Prompting:** You provide 2 to 5 examples of input-output pairs before asking the model to perform the task on new data.',
      },
      {
        type: 'code',
        title: 'Example: Few-Shot Sentiment & Tagging Prompt',
        content:
          'Classify the customer feedback into Category and Sentiment.\n\nFeedback: "The checkout button is broken on mobile Safari."\nCategory: Bug Report\nSentiment: Negative\n\nFeedback: "I love the new dark mode theme! Great job team."\nCategory: User Feedback\nSentiment: Positive\n\nFeedback: "Can you please add PayPal as a payment option?"\nCategory: Feature Request\nSentiment: Neutral\n\nFeedback: "The delivery arrived 2 hours late and the box was torn."\nCategory: [AI will fill this]\nSentiment: [AI will fill this]',
        language: 'markdown',
      },
      {
        type: 'text',
        title: 'Why Few-Shot Prompting is Powerful',
        content:
          'Few-Shot prompting is also known as **In-Context Learning**:\n\n- **Consistent Formatting:** The AI matches the exact capitalization, punctuation, and structure of your examples.\n- **Custom Terminology:** You can teach the model custom classification codes (e.g., `TAG_A1`, `ERR_404_NET`) without fine-tuning.\n- **Reduced Ambiguity:** Examples eliminate guesswork by showing rather than just telling.',
      },
      {
        type: 'quiz',
        title: 'Quick Check: Prompt Types',
        content: 'Quiz',
        quiz: {
          question: 'If you provide 3 sample question-and-answer pairs before asking your question, what technique are you using?',
          options: [
            { text: 'Few-Shot Prompting', isCorrect: true },
            { text: 'Zero-Shot Prompting', isCorrect: false },
            { text: 'Negative Prompting', isCorrect: false },
            { text: 'Context Window Overflow', isCorrect: false },
          ],
          explanation: 'Providing sample input/output demonstrations is known as Few-Shot Prompting.',
        },
      },
    ],
    flashcards: [
      { question: 'What is Zero-Shot Prompting?', answer: 'Prompting the AI to perform a task directly without showing any sample input/output examples.' },
      { question: 'What is Few-Shot Prompting?', answer: 'Providing a few sample input-output demonstrations in your prompt so the AI learns the desired pattern and format.' },
      { question: 'What is In-Context Learning?', answer: 'The ability of an LLM to learn and adapt to new patterns and rules presented within the prompt itself without modifying the model.' },
      { question: 'How many examples are typically recommended for Few-Shot prompts?', answer: 'Usually 2 to 5 clear, diverse, and well-formatted examples are sufficient.' },
    ],
    mcqs: [
      {
        question: 'When should you choose Few-Shot prompting over Zero-Shot prompting?',
        options: [
          { text: 'When you need the model to follow a very specific, custom output format or unique classification rule', isCorrect: true },
          { text: 'When you want the AI to generate completely random text', isCorrect: false },
          { text: 'When you are trying to save token count on extremely short prompts', isCorrect: false },
          { text: 'When the AI model has no access to the internet', isCorrect: false },
        ],
        explanation: 'Few-Shot prompting is the gold standard for enforcing exact format compliance and custom classification.',
      },
      {
        question: 'What is a common mistake when creating Few-Shot examples?',
        options: [
          { text: 'Inconsistent formatting or incorrect labels in the demonstration examples', isCorrect: true },
          { text: 'Using clear English in the examples', isCorrect: false },
          { text: 'Providing more than one example', isCorrect: false },
          { text: 'Using delimiters around data', isCorrect: false },
        ],
        explanation: 'If your examples contain conflicting formats or wrong answers, the AI will mirror those exact errors.',
      },
    ],
  },
  {
    title: 'Module 4: Chain-of-Thought & Step-by-Step Reasoning',
    description: 'Unlock higher accuracy in logic, math, and problem-solving by asking the AI to reason step-by-step.',
    contents: [
      {
        type: 'text',
        title: 'Why AI Fails at Complex Logic',
        content:
          'When you ask an AI a multi-step logic or math question directly, it tries to predict the final answer immediately in the next few tokens. Because it cannot "pause" to calculate internally, it frequently makes silly arithmetic and deduction mistakes.',
      },
      {
        type: 'text',
        title: 'The Power of "Think Step-by-Step"',
        content:
          '**Chain-of-Thought (CoT)** prompting is a breakthrough technique where you instruct the AI to show its intermediate reasoning steps before arriving at the conclusion.\n\nBy generating the reasoning steps as tokens on the screen, those steps become part of the context for calculating the final answer. This dramatically boosts accuracy on logic puzzles, business math, and complex decisions.',
      },
      {
        type: 'code',
        title: 'Chain-of-Thought in Action',
        content:
          '# ❌ Direct Prompt (Prone to errors):\n"A store has 12 apples. They sell 4, receive a shipment of 3 crates with 10 apples each, and throw away 2 rotten apples. How many apples do they have? Answer with just the number."\n\n# ✅ Chain-of-Thought Prompt:\n"A store has 12 apples. They sell 4, receive a shipment of 3 crates with 10 apples each, and throw away 2 rotten apples. Let\'s think step by step, showing each calculation clearly before stating the final total."',
        language: 'markdown',
      },
      {
        type: 'quiz',
        title: 'Quick Check: Chain of Thought',
        content: 'Quiz',
        quiz: {
          question: 'Why does Chain-of-Thought prompting improve accuracy on reasoning tasks?',
          options: [
            { text: 'Writing out intermediate steps provides context tokens that guide the model to the correct final answer', isCorrect: true },
            { text: 'It connects the model directly to an external Python calculator', isCorrect: false },
            { text: 'It reduces the total number of tokens used', isCorrect: false },
            { text: 'It changes the model weights permanently', isCorrect: false },
          ],
          explanation: 'Each generated reasoning token becomes part of the prompt context, helping the model stay grounded in logic.',
        },
      },
    ],
    flashcards: [
      { question: 'What is Chain-of-Thought (CoT) prompting?', answer: 'A technique where the AI is prompted to break down a problem and explain its step-by-step reasoning before giving the final answer.' },
      { question: 'What simple phrase often triggers Chain-of-Thought reasoning?', answer: '"Let\'s think step by step" or "Explain your reasoning step by step before answering."' },
      { question: 'When is Chain-of-Thought prompting most effective?', answer: 'For math calculations, logic puzzles, multi-step planning, and complex decision-making.' },
      { question: 'What is Role Prompting?', answer: 'Instructing the AI to adopt a specific persona, profession, or viewpoint to tailor its vocabulary and perspective.' },
    ],
    mcqs: [
      {
        question: 'Which of the following problems benefits the most from Chain-of-Thought prompting?',
        options: [
          { text: 'Calculating the total cost of a multi-tier subscription with varying discounts and tax rates', isCorrect: true },
          { text: 'Translating the word "Hello" to French', isCorrect: false },
          { text: 'Listing the capital of Nigeria', isCorrect: false },
          { text: 'Generating a single random color name', isCorrect: false },
        ],
        explanation: 'Multi-step financial and logic calculations require intermediate reasoning steps to avoid calculation mistakes.',
      },
      {
        question: 'How can you prompt an AI to explain quantum computing to a 10-year-old?',
        options: [
          { text: 'Act as an enthusiastic science teacher. Explain quantum computing using simple real-world analogies suitable for a 10-year-old child.', isCorrect: true },
          { text: 'Explain quantum physics using advanced mathematical equations only.', isCorrect: false },
          { text: 'What is quantum?', isCorrect: false },
          { text: 'Give me code for quantum.', isCorrect: false },
        ],
        explanation: 'Specifying the persona (enthusiastic teacher) and target audience (10-year-old) adjusts vocabulary and complexity.',
      },
    ],
  },

  // Chapter 3: Output Formatting & Real-World Workflows
  {
    title: 'Module 5: Formatting Outputs: Tables, Lists & Structured Data',
    description: 'Instruct AI to return perfectly structured Markdown tables, bulleted summaries, and machine-readable JSON.',
    contents: [
      {
        type: 'text',
        title: 'Why Output Formatting is Crucial',
        content:
          'Getting great content from an AI is only half the battle. If the output is a messy block of text, you will spend unnecessary time reformatting it.\n\nWith clear prompt engineering, you can force the AI to return your data in structured tables, numbered steps, or strict JSON ready for copy-pasting or software integrations.',
      },
      {
        type: 'code',
        title: 'Generating Comparative Tables',
        content:
          'Compare the top 3 electric vehicle brands (Tesla, BYD, Rivian).\n\nOutput Format:\nProvide the comparison as a Markdown table with the following exact columns:\n| Brand | Country of Origin | Best-Selling Model | Key Strength | Starting Price Range (USD) |',
        language: 'markdown',
      },
      {
        type: 'text',
        title: 'Strict JSON Output for Developers & Apps',
        content:
          'When building apps or automating spreadsheets, you need **pure JSON** without conversational filler like *"Sure, here is your JSON:"*.\n\n**Best Practice Prompt:**\n"Extract the contact details from the email below. Return ONLY a valid JSON object matching this schema. Do not include any explanations, introductory text, or markdown code fences outside the JSON.\n\nSchema:\n{\n  \"fullName\": string,\n  \"email\": string,\n  \"phone\": string,\n  \"company\": string\n}"',
      },
      {
        type: 'quiz',
        title: 'Quick Check: Structured Formats',
        content: 'Quiz',
        quiz: {
          question: 'What instruction ensures an AI output contains only valid JSON with no conversational text?',
          options: [
            { text: '"Return ONLY a valid JSON object matching the provided schema. Do not include any greeting or conversational filler."', isCorrect: true },
            { text: '"Please give me some json thanks."', isCorrect: false },
            { text: '"Format as normal text with JSON somewhere in the middle."', isCorrect: false },
            { text: '"Write a story about JSON."', isCorrect: false },
          ],
          explanation: 'Explicitly commanding "Return ONLY valid JSON... no conversational filler" prevents unwanted intro/outro text.',
        },
      },
    ],
    flashcards: [
      { question: 'How do you ask an AI to generate a table?', answer: 'Specify "Output as a Markdown table with the following columns: [Col 1 | Col 2 | Col 3]".' },
      { question: 'Why is JSON format important in prompt engineering?', answer: 'JSON allows AI outputs to be parsed programmatically by software, databases, and APIs without manual cleanup.' },
      { question: 'What is Data Extraction in prompting?', answer: 'Pulling specific structured fields (names, dates, prices) out of messy, unstructured text like emails or receipts.' },
      { question: 'How do you prevent conversational fluff in AI outputs?', answer: 'Add the negative constraint: "Do not include any conversational filler, greetings, or explanations. Output only the requested result."' },
    ],
    mcqs: [
      {
        question: 'Which prompt snippet produces the cleanest markdown bullet list?',
        options: [
          { text: 'Provide 5 actionable tips formatted as a bulleted list. Each bullet must start with a bold action verb.', isCorrect: true },
          { text: 'Tell me tips in one big paragraph.', isCorrect: false },
          { text: 'List tips however you like.', isCorrect: false },
          { text: 'Write 500 words on tips.', isCorrect: false },
        ],
        explanation: 'Explicitly specifying the bulleted format and structure ("Each bullet must start with a bold action verb") yields consistent, readable results.',
      },
      {
        question: 'What should you supply in your prompt when asking for JSON output?',
        options: [
          { text: 'An explicit JSON schema or sample object showing the keys and data types', isCorrect: true },
          { text: 'A random set of sentences', isCorrect: false },
          { text: 'No formatting instructions', isCorrect: false },
          { text: 'A request to write a poem', isCorrect: false },
        ],
        explanation: 'Providing a concrete schema guarantees the AI uses the exact key names and data types your program expects.',
      },
    ],
  },
  {
    title: 'Module 6: Everyday Applications: Writing, Coding & Research',
    description: 'Apply prompt engineering to practical daily tasks: copyediting, debugging code, and synthesizing research.',
    contents: [
      {
        type: 'text',
        title: 'Prompting for Writing and Copyediting',
        content:
          'To use AI as an effective writing partner, avoid asking it to *"write an article from scratch"* (which often sounds generic and full of clichés like "In today\'s fast-paced world").\n\nInstead, ask the AI to act as a **ruthless copyeditor** on your own drafts, or provide an outline and specific tone guidelines.',
      },
      {
        type: 'code',
        title: 'The Ruthless Copyeditor Prompt',
        content:
          'Act as a Senior Editorial Copyeditor for a premier tech publication.\nReview the draft below and provide feedback in 3 sections:\n\n1. **Strengths:** 2 things that work well.\n2. **Line-by-Line Suggestions:** Point out passive voice, wordiness, and cliché phrases with recommended rewrites.\n3. **Polished Version:** A revised version that preserves the author\'s original voice while improving clarity and conciseness.\n\nDraft:\n"""[Paste your text here]"""',
        language: 'markdown',
      },
      {
        type: 'text',
        title: 'Prompting for Developers: Rubber-Duck Debugging',
        content:
          'When debugging code with AI:\n1. Provide the **programming language** and runtime environment.\n2. State what you **expected to happen** vs. what **actually happened**.\n3. Include the **exact error message** and stack trace.\n4. Ask the AI to identify the bug, explain *why* it occurred, and provide the fixed code.',
      },
      {
        type: 'code',
        title: 'Developer Debugging Prompt Template',
        content:
          'I am encountering a runtime error in my TypeScript React application.\n\nExpected Behavior: The user profile should render after fetching data.\nActual Behavior: The app crashes with "TypeError: Cannot read properties of undefined (reading \'name\')".\n\nCode snippet:\n```tsx\nconst Profile = ({ userId }: { userId: string }) => {\n  const { data: user } = useQuery([\'user\', userId], fetchUser);\n  return <div>{user.name}</div>;\n};\n```\n\nTask: Explain why this error occurs and provide the fixed component using optional chaining and loading states.',
        language: 'markdown',
      },
    ],
    flashcards: [
      { question: 'What is Rubber-Duck Debugging with AI?', answer: 'Explaining your code, expected behavior, and error messages to an AI to systematically find and fix bugs.' },
      { question: 'How can you avoid generic AI writing clichés?', answer: 'Provide your own draft for editing, specify tone guidelines, and set negative constraints like "Avoid buzzwords and clichés".' },
      { question: 'What 3 pieces of information should you provide when debugging code with AI?', answer: '1. The code snippet, 2. The exact error message, 3. The expected vs actual behavior.' },
      { question: 'What is prompt iteration?', answer: 'The process of testing a prompt, evaluating the response, and adjusting instructions to improve the result.' },
    ],
    mcqs: [
      {
        question: 'What is the most effective way to summarize a 20-page research paper with an AI?',
        options: [
          { text: 'Ask for an Executive Summary, Key Methodologies, Main Findings, and Limitations organized under clear headings', isCorrect: true },
          { text: 'Ask: "Tell me everything about this paper in one sentence"', isCorrect: false },
          { text: 'Copy-paste the title only', isCorrect: false },
          { text: 'Set temperature to maximum and ask for a poem', isCorrect: false },
        ],
        explanation: 'Structuring your summary request into specific sections ensures all critical facets of the research are covered.',
      },
      {
        question: 'When asking an AI to write code, what helps ensure the code is production-ready?',
        options: [
          { text: 'Requesting error handling, TypeScript types, edge case validation, and clean comments', isCorrect: true },
          { text: 'Asking the AI to make the code as short as possible without comments', isCorrect: false },
          { text: 'Omitting the programming language name', isCorrect: false },
          { text: 'Using zero constraints', isCorrect: false },
        ],
        explanation: 'Specifying engineering standards like type safety and error handling prevents buggy, bare-bones code.',
      },
    ],
  },

  // Chapter 4: Guardrails, Error Fixing & Capstone Project
  {
    title: 'Module 7: Preventing Hallucinations & Setting Guardrails',
    description: 'Protect against false AI claims, ground answers in reference data, and chain prompts into powerful workflows.',
    contents: [
      {
        type: 'text',
        title: 'Understanding AI Hallucinations',
        content:
          'An **AI Hallucination** occurs when a language model generates plausible-sounding facts, citations, or statistics that are completely invented.\n\n**Why does this happen?** Because models predict the next plausible word rather than querying a verified database of facts. When uncertain, an unconstrained model will "fill in the blanks" with believable fiction.',
      },
      {
        type: 'text',
        title: 'Grounding: The Anti-Hallucination Shield',
        content:
          '**Grounding** means forcing the AI to base its answers strictly on facts provided in the prompt context.\n\n**The Golden Anti-Hallucination Prompt Rule:**\n> *"Answer the question using ONLY the provided text below. If the answer cannot be found in the text, reply: \'The provided text does not contain this information.\' Do NOT speculate or use outside knowledge."*',
      },
      {
        type: 'text',
        title: 'Negative Prompting & Strict Constraints',
        content:
          'Negative prompting tells the model what **not** to do. To make negative constraints effective:\n- Be direct and unambiguous.\n- State the desired alternative rather than just the prohibition.\n- *Example:* Instead of just saying *"Don\'t make it long"*, say *"Keep your response under 100 words and limit the output to 3 bullet points."*',
      },
      {
        type: 'text',
        title: 'Prompt Chaining for Multi-Step Tasks',
        content:
          'For large, complex projects, do not try to accomplish everything in a single prompt. Use **Prompt Chaining**:\n\n- **Step 1:** Brainstorm 5 core ideas and select the best one.\n- **Step 2:** Create a detailed 4-part outline based on the chosen idea.\n- **Step 3:** Draft Section 1 adhering strictly to the outline.\n- **Step 4:** Review and refine Section 1 for tone and conciseness.',
      },
      {
        type: 'quiz',
        title: 'Quick Check: Preventing Hallucinations',
        content: 'Quiz',
        quiz: {
          question: 'What is the most effective prompt strategy to prevent an AI from inventing fake facts about a company policy document?',
          options: [
            { text: 'Instruct the AI to answer solely using the provided policy text and state "Not mentioned" if absent', isCorrect: true },
            { text: 'Ask the AI to be very confident in its answer', isCorrect: false },
            { text: 'Increase the model temperature to 1.5', isCorrect: false },
            { text: 'Ask the AI if it is a truthful human', isCorrect: false },
          ],
          explanation: 'Strict context grounding with a fallback directive ("If absent, state Not mentioned") is the proven way to eliminate hallucinations.',
        },
      },
    ],
    flashcards: [
      { question: 'What is an AI Hallucination?', answer: 'When an AI model generates factually incorrect or fabricated information with high confidence.' },
      { question: 'What does Grounding a prompt mean?', answer: 'Restricting the AI to answer exclusively using provided reference documents and facts.' },
      { question: 'What is Prompt Chaining?', answer: 'Breaking a complex multi-step task into a sequence of linked prompts where the output of one step feeds into the next.' },
      { question: 'What is a Fallback Instruction?', answer: 'A rule telling the AI what to do when information is missing (e.g., "Reply \'I do not know\' if the answer is not in the text").' },
    ],
    mcqs: [
      {
        question: 'Why should you break a 5,000-word report generation task into a Prompt Chain rather than a single prompt?',
        options: [
          { text: 'It gives you granular control at each stage (outline, draft, review) and prevents quality degradation', isCorrect: true },
          { text: 'Single prompts are illegal in modern AI systems', isCorrect: false },
          { text: 'Prompt chaining uses zero tokens', isCorrect: false },
          { text: 'Chaining makes the AI write slower on purpose', isCorrect: false },
        ],
        explanation: 'Chaining allows you to guide, edit, and steer the AI through each phase (Outline → Draft → Review), preventing drift and shallow answers.',
      },
      {
        question: 'Which prompt includes a proper fallback guardrail?',
        options: [
          { text: 'Based on the company FAQ below, answer the customer\'s question. If the FAQ does not contain the answer, reply "Please contact human support at help@company.com".', isCorrect: true },
          { text: 'Answer the question and guess if you are unsure.', isCorrect: false },
          { text: 'Make up a believable policy if not found.', isCorrect: false },
          { text: 'Always say yes to the customer.', isCorrect: false },
        ],
        explanation: 'Providing a clear fallback response prevents the AI from inventing fictional answers when information is missing.',
      },
    ],
  },
  {
    title: 'Module 8: Capstone Project & Prompt Engineering Mastery',
    description: 'Build a production-ready AI assistant system prompt and review the complete Prompt Engineer’s Checklist.',
    contents: [
      {
        type: 'text',
        title: 'Capstone Project: The Autonomous Support Assistant',
        content:
          'Now it is time to put everything together! In real-world software applications, developers write **System Prompts** that govern how an AI assistant behaves in every interaction with end users.\n\nLet\'s examine a complete production-grade system prompt incorporating Role, Grounding, Few-Shot examples, Constraints, and JSON Output.',
      },
      {
        type: 'code',
        title: 'Production System Prompt Blueprint',
        content:
          '# SYSTEM DIRECTIVE: SabiLearn Support Bot\n\n## 1. ROLE & PERSONA\nYou are SabiBot, the friendly, concise, and helpful AI assistant for SabiLearn (an online learning platform).\n\n## 2. KNOWLEDGE BASE (GROUNDING)\n- Free Tier: 10 AI generations per day.\n- Premium Tier: ₦1,500/month for unlimited courses and practice quizzes.\n- Supported Subjects: Programming, AI & ML, Thermodynamics, Business.\n\n## 3. RULES & CONSTRAINTS\n- Answer questions in 2-3 sentences max.\n- Always be polite, encouraging, and clear.\n- NEVER promise features outside the knowledge base.\n- If a user asks about payment issues, provide the link: /billing/support.\n\n## 4. OUTPUT FORMAT\nAlways respond in valid JSON format:\n{\n  "replyMessage": string,\n  "suggestedActionUrl": string | null,\n  "sentiment": "happy" | "neutral" | "escalate"\n}',
        language: 'markdown',
      },
      {
        type: 'text',
        title: 'The Prompt Engineer’s Checklist',
        content:
          'Before sending any important prompt, review this 5-point checklist:\n\n1. **Role Defined:** Did I specify who the AI should act as?\n2. **Specific Task:** Is the action clear and unambiguous?\n3. **Context Provided:** Did I include all necessary background info and data?\n4. **Format & Constraints Set:** Did I specify length, structure (tables, JSON, bullets), and tone?\n5. **Guardrails Added:** Did I tell the model what NOT to do and what to say if information is missing?',
      },
      {
        type: 'quiz',
        title: 'Final Mastery Check',
        content: 'Quiz',
        quiz: {
          question: 'What makes a prompt truly production-ready?',
          options: [
            { text: 'Combining a clear role, explicit context, structured output format, and robust guardrails/fallbacks', isCorrect: true },
            { text: 'Using the longest possible sentences with no punctuation', isCorrect: false },
            { text: 'Asking the AI to guess what the user wants', isCorrect: false },
            { text: 'Never specifying output formats', isCorrect: false },
          ],
          explanation: 'Production prompts are resilient, clearly bounded, formatted predictably, and safe against hallucinations.',
        },
      },
    ],
    flashcards: [
      { question: 'What is a System Prompt?', answer: 'A top-level instruction that sets the persistent role, guidelines, capabilities, and safety boundaries of an AI assistant.' },
      { question: 'What are the 5 points on the Prompt Engineer\'s Checklist?', answer: '1. Role, 2. Task, 3. Context, 4. Format & Constraints, 5. Guardrails & Fallback.' },
      { question: 'Why is prompt engineering an iterative process?', answer: 'Because evaluating outputs and refining constraints leads to optimal accuracy, formatting, and reliability.' },
      { question: 'What is the goal of Prompt Engineering mastery?', answer: 'To communicate with AI deterministically, reliably, and efficiently for any personal or professional task.' },
    ],
    mcqs: [
      {
        question: 'Which of the following describes a production-grade system prompt?',
        options: [
          { text: 'A comprehensive set of rules defining persona, grounding data, strict negative constraints, and output schemas', isCorrect: true },
          { text: 'A one-word command like "Help"', isCorrect: false },
          { text: 'An unverified list of rumors', isCorrect: false },
          { text: 'A random collection of unrelated links', isCorrect: false },
        ],
        explanation: 'A production system prompt acts as the foundational ruleset governing every response the AI generates for users.',
      },
      {
        question: 'Congratulations on completing the course! What is the single most important rule to remember when prompting AI?',
        options: [
          { text: 'Clear context, specific constraints, and unambiguous instructions yield accurate results', isCorrect: true },
          { text: 'AI always knows what you are thinking without explanation', isCorrect: false },
          { text: 'Prompts should always be kept as vague as possible', isCorrect: false },
          { text: 'AI models never make mistakes', isCorrect: false },
        ],
        explanation: 'AI models mirror the quality and clarity of your prompt: great inputs produce great outputs.',
      },
    ],
  },
];

export const run = async () => {
  try {
    await connectDB();

    console.log('Finding existing "Prompt Engineering" course...');
    // Look up by title or ID
    const existingCourse = await Course.findOne({
      $or: [
        { _id: '6a90b1db030f8605b539daa2' },
        { title: /prompt engineering/i },
      ],
    });

    if (!existingCourse) {
      console.error('Error: Could not find the existing Prompt Engineering course in database.');
      process.exit(1);
    }

    console.log(`Found course: "${existingCourse.title}" (ID: ${existingCourse._id})`);

    // Clean up existing chapters, topics, flashcards, mcqs for this course ID without deleting the Course document
    const existingTopics = await Topic.find({ course: existingCourse._id });
    const existingTopicIds = existingTopics.map((t) => t._id);

    console.log(`Cleaning up old data for course ${existingCourse._id}...`);
    await Promise.all([
      Flashcard.deleteMany({ topic: { $in: existingTopicIds } }),
      MCQ.deleteMany({ topic: { $in: existingTopicIds } }),
      Topic.deleteMany({ course: existingCourse._id }),
      Chapter.deleteMany({ course: existingCourse._id }),
    ]);

    // Update existing course details (do NOT create a new course)
    existingCourse.title = 'Prompt Engineering Essentials';
    existingCourse.description =
      'Learn how to talk to AI tools like ChatGPT, Claude, and DeepSeek to get fast, accurate, and helpful answers every single time. No coding or tech background needed!';
    existingCourse.longDescription =
      'Have you ever asked an AI a question and received a generic, confusing, or completely wrong answer?\n\nThe secret to getting great answers from AI is not magic—it is simply knowing how to write good instructions. This skill is called Prompt Engineering.\n\nIn this beginner-friendly course, you will learn step-by-step how to speak to AI clearly and effectively. We will take you from simple questions to writing powerful prompts that save you hours of work every day.\n\n### What you will learn:\n* **How AI Works:** Understand how AI thinks in simple, everyday language.\n* **The Core Formula:** Learn an easy 4-step formula to write clear prompts for any task.\n* **Better Answers:** Teach the AI to give you exact results using examples and clear roles.\n* **Format Your Results:** Get AI to reply with neat tables, bullet points, summaries, or ready-to-use lists.\n* **Fix Mistakes:** Stop the AI from guessing or making up false facts.\n* **Real-World Practice:** Use AI to write emails, brainstorm ideas, summarize long texts, write code, and study faster.\n\n### Who is this course for?\n* Complete beginners who want to use AI with confidence.\n* Students, writers, business owners, and professionals who want to work faster and save time.\n* Anyone curious about artificial intelligence—no math or programming required!';
    existingCourse.category = 'Artificial Intelligence';
    existingCourse.difficulty = 'beginner';
    existingCourse.whatYouWillLearn = [
      'Understand how AI language models think and process your instructions',
      'Master the 4-step prompt formula: Role, Task, Context, and Format (RTF)',
      'Use Few-Shot prompting and step-by-step reasoning (Chain of Thought) to get precise results',
      'Direct AI output into neat tables, bullet summaries, and clean JSON data structures',
      'Eliminate AI hallucinations, false facts, and unwanted conversational fluff',
      'Apply prompt engineering to write emails, debug code, and analyze long documents',
    ];
    existingCourse.prerequisites = [
      'No coding or AI background required',
      'Basic familiarity with using a web browser and typing questions',
    ];
    existingCourse.isPublished = true;
    existingCourse.isFree = true;
    existingCourse.price = 0;
    existingCourse.order = 1;

    await existingCourse.save();
    console.log('Updated course metadata successfully.');

    // Create 4 structured Chapters for the curriculum
    console.log('Creating 4 structured chapters...');
    const chapters = await Chapter.create(
      promptCourseChapters.map((ch) => ({
        course: existingCourse._id,
        title: ch.title,
        description: ch.description,
        order: ch.order,
      }))
    );

    console.log(`Created ${chapters.length} chapters.`);

    let totalTopics = 0;
    let totalFlashcards = 0;
    let totalMcqs = 0;

    // Create 8 topics (2 per chapter)
    for (let i = 0; i < promptCourseTopics.length; i++) {
      const topicSeed = promptCourseTopics[i];
      // 2 topics per chapter (0,1 -> Ch 0; 2,3 -> Ch 1; 4,5 -> Ch 2; 6,7 -> Ch 3)
      const chapterIndex = Math.floor(i / 2);
      const chapterId = chapters[chapterIndex]._id;

      const topic = await Topic.create({
        course: existingCourse._id,
        chapter: chapterId,
        title: topicSeed.title,
        description: topicSeed.description,
        contents: topicSeed.contents,
        order: i + 1,
        xp: 50,
        isPublished: true,
      });
      totalTopics++;

      if (topicSeed.flashcards.length > 0) {
        await Flashcard.insertMany(
          topicSeed.flashcards.map((f) => ({
            topic: topic._id,
            question: f.question,
            answer: f.answer,
          }))
        );
        totalFlashcards += topicSeed.flashcards.length;
      }

      if (topicSeed.mcqs.length > 0) {
        await MCQ.insertMany(
          topicSeed.mcqs.map((m) => ({
            topic: topic._id,
            question: m.question,
            options: m.options,
            explanation: m.explanation,
          }))
        );
        totalMcqs += topicSeed.mcqs.length;
      }
    }

    console.log('\n========================================');
    console.log('Prompt Engineering Course populated successfully!');
    console.log('========================================');
    console.log(`Course Title: ${existingCourse.title}`);
    console.log(`Course ID:    ${existingCourse._id} (Kept existing ID)`);
    console.log(`Chapters:     ${chapters.length}`);
    console.log(`Topics:       ${totalTopics}`);
    console.log(`Flashcards:   ${totalFlashcards}`);
    console.log(`MCQs:         ${totalMcqs}`);
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error updating Prompt Engineering course:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}
