import { HelpConfig } from "@/contexts/HelpSystemContext";

export const helpConfigs: Record<string, HelpConfig> = {
  // Landing page help
  landing: {
    pageId: "landing",
    title: "Welcome to Synapse",
    steps: [
      {
        id: "welcome",
        title: "Welcome to Synapse!",
        content: "Synapse is your AI-powered learning companion. Let me show you around and explain how to get the most out of our platform.",
        position: "center",
      },
      {
        id: "hero",
        title: "Your Learning Journey Starts Here",
        content: "This is our main hero section where you can learn about Synapse's core features and get started with your account.",
        targetSelector: "section:first-of-type",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "features",
        title: "Powerful Features",
        content: "Explore our key features including document analysis, AI chat, quiz generation, and more. Each feature is designed to enhance your learning experience.",
        targetSelector: "[data-help='features']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
      {
        id: "pricing",
        title: "Choose Your Plan",
        content: "Select the plan that best fits your learning needs. We offer flexible options for students, professionals, and institutions.",
        targetSelector: "[data-help='pricing']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Dashboard overview help
  dashboard: {
    pageId: "dashboard",
    title: "Dashboard Overview",
    steps: [
      {
        id: "welcome",
        title: "Welcome to Your Dashboard",
        content: "This is your personal learning dashboard where you can access all your study materials and track your progress.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "stats",
        title: "Your Learning Stats",
        content: "These cards show your current progress including documents uploaded, chats created, topics studied, and quizzes taken.",
        targetSelector: ".grid:first-of-type",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "quick-actions",
        title: "Quick Actions",
        content: "Use these shortcuts to quickly access the most common features like uploading documents, starting chats, or creating topics.",
        targetSelector: "[data-help='quick-actions']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
      {
        id: "progress",
        title: "Learning Progress",
        content: "Track your learning journey with study streaks, time studied, and topics mastered. Stay motivated with these progress indicators!",
        targetSelector: "[data-help='progress']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Documents page help
  documents: {
    pageId: "documents",
    title: "Document Management",
    steps: [
      {
        id: "intro",
        title: "Document Upload & Analysis",
        content: "Upload your study materials and let our AI analyze and summarize them for you. Supported formats include PDF, DOCX, TXT, and more.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "upload",
        title: "Upload Your Documents",
        content: "Use this form to upload your documents. You can optionally provide a custom prompt to guide the AI's analysis and summary generation.",
        targetSelector: "form",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "file-input",
        title: "Select Your File",
        content: "Click here to select files from your computer. We support PDFs, Word documents, text files, presentations, and more.",
        targetSelector: "input[type='file']",
        position: "right",
        offset: { x: 20, y: 0 },
      },
      {
        id: "custom-prompt",
        title: "Custom Analysis Prompt",
        content: "Optionally provide specific instructions for how you want the document analyzed. For example: 'Focus on key concepts' or 'Extract important dates and events'.",
        targetSelector: "input[placeholder*='custom summary prompt']",
        position: "top",
        offset: { x: 0, y: -10 },
      },
      {
        id: "document-list",
        title: "Your Document Library",
        content: "All your uploaded documents appear here with their processing status, summaries, and management options. You can reprocess or delete documents as needed.",
        targetSelector: "[data-help='document-list']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Chat page help
  chat: {
    pageId: "chat",
    title: "AI Chat Assistant",
    steps: [
      {
        id: "intro",
        title: "Chat with AI",
        content: "Ask questions about your uploaded materials or get help with any topic. Our AI assistant is here to support your learning journey.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "new-chat",
        title: "Start New Conversations",
        content: "Click this button to create a new chat session. Each chat maintains its own conversation history and context.",
        targetSelector: "button:has(svg):first-of-type",
        position: "left",
        offset: { x: -20, y: 0 },
      },
      {
        id: "chat-list",
        title: "Your Chat History",
        content: "All your previous conversations are listed here. Click on any chat to continue the conversation or view the history.",
        targetSelector: "[data-help='chat-list']",
        position: "right",
        offset: { x: 20, y: 0 },
      },
      {
        id: "message-area",
        title: "Conversation Area",
        content: "Your conversation with the AI appears here. Messages are clearly distinguished between your questions and AI responses.",
        targetSelector: "[data-help='messages']",
        position: "left",
        offset: { x: -20, y: 0 },
      },
      {
        id: "input",
        title: "Ask Your Questions",
        content: "Type your questions here and press Send. You can ask about uploaded documents, request explanations, or get help with any topic.",
        targetSelector: "input[placeholder*='question']",
        position: "top",
        offset: { x: 0, y: -10 },
      },
    ],
  },

  // Topics page help
  topics: {
    pageId: "topics",
    title: "Topic Generation",
    steps: [
      {
        id: "intro",
        title: "Generate Study Topics",
        content: "Create comprehensive study materials on any topic using AI. Perfect for exploring new subjects or deepening your understanding.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "create-topic",
        title: "Create New Topic",
        content: "Enter any subject or topic you want to study. Our AI will generate detailed study materials, explanations, and key points.",
        targetSelector: "[data-help='create-topic']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "topic-list",
        title: "Your Study Topics",
        content: "Browse through all your generated topics. Each topic contains AI-generated content tailored to help you understand the subject better.",
        targetSelector: "[data-help='topic-list']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Quizzes page help
  quizzes: {
    pageId: "quizzes",
    title: "Quiz System",
    steps: [
      {
        id: "intro",
        title: "Test Your Knowledge",
        content: "Take AI-generated quizzes based on your uploaded documents or any topic. Perfect for self-assessment and exam preparation.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "create-quiz",
        title: "Generate New Quiz",
        content: "Create quizzes from your documents or on specific topics. Customize the difficulty level and number of questions.",
        targetSelector: "[data-help='create-quiz']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "quiz-list",
        title: "Your Quiz History",
        content: "View all your completed and available quizzes. Track your scores and identify areas that need more study.",
        targetSelector: "[data-help='quiz-list']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Flashcards page help
  flashcards: {
    pageId: "flashcards",
    title: "Flashcard System",
    steps: [
      {
        id: "intro",
        title: "Study with Flashcards",
        content: "Create and study with AI-generated flashcards. Perfect for memorizing key concepts, terms, and definitions.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "create-flashcards",
        title: "Generate Flashcards",
        content: "Create flashcard sets from your documents or on specific topics. Our AI will generate relevant questions and answers.",
        targetSelector: "[data-help='create-flashcards']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "study-mode",
        title: "Study Your Cards",
        content: "Use our interactive study mode to review your flashcards. Track your progress and focus on cards you find challenging.",
        targetSelector: "[data-help='study-mode']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Websites page help
  websites: {
    pageId: "websites",
    title: "Website Analysis",
    steps: [
      {
        id: "intro",
        title: "Analyze Web Content",
        content: "Extract and analyze content from websites and online articles. Perfect for research and gathering information from web sources.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "add-website",
        title: "Add Website URL",
        content: "Enter the URL of any website or article you want to analyze. Our AI will extract the main content and provide a summary.",
        targetSelector: "[data-help='add-website']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "website-list",
        title: "Analyzed Websites",
        content: "View all your analyzed websites with their summaries and key insights. Great for research and reference.",
        targetSelector: "[data-help='website-list']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },

  // Wikipedia page help
  wikipedia: {
    pageId: "wikipedia",
    title: "Wikipedia Integration",
    steps: [
      {
        id: "intro",
        title: "Wikipedia Search & Analysis",
        content: "Search Wikipedia articles and get AI-powered summaries and insights. Perfect for quick research and fact-checking.",
        targetSelector: "h1",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "search",
        title: "Search Wikipedia",
        content: "Enter any topic to search Wikipedia. Our system will find relevant articles and provide AI-generated summaries.",
        targetSelector: "[data-help='wikipedia-search']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "results",
        title: "Search Results",
        content: "Browse through Wikipedia articles with AI-generated summaries. Click on any article to get detailed insights.",
        targetSelector: "[data-help='wikipedia-results']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
    ],
  },
};
