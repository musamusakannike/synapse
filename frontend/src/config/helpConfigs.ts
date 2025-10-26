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
        title: "Document Upload & Chat",
        content: "Upload your study materials and chat with them using AI. The system analyzes your documents and lets you ask questions about their content. Supported formats include PDF, DOCX, TXT, and more.",
        position: "center",
      },
      {
        id: "sidebar",
        title: "Document Library",
        content: "Your uploaded documents appear in the sidebar (or menu on mobile). Click on any document to start chatting with it. You can also delete documents you no longer need.",
        position: "center",
      },
      {
        id: "upload-area",
        title: "Upload Documents",
        content: "Use the upload button at the bottom to select and upload files from your computer. After uploading, the document will be processed and ready for chat.",
        position: "center",
      },
      {
        id: "chat-interface",
        title: "Chat with Documents",
        content: "Once you select a document, you can ask questions about its content in the chat area. The AI will answer based on the document's information.",
        position: "center",
      },
      {
        id: "input",
        title: "Ask Questions",
        content: "Type your questions about the selected document in the text area at the bottom. The AI will provide answers based on the document's content.",
        targetSelector: "textarea[placeholder*='document']",
        position: "top",
        offset: { x: 0, y: -10 },
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
        position: "center",
      },
      {
        id: "message-area",
        title: "Conversation Area",
        content: "Your conversation with the AI appears here. Messages are clearly distinguished between your questions and AI responses. The chat interface is clean and easy to follow.",
        targetSelector: "[data-help='messages']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "input",
        title: "Ask Your Questions",
        content: "Type your questions in the text area at the bottom and press Send. You can ask about any topic, request explanations, or get help with your studies.",
        targetSelector: "textarea[placeholder*='Ask']",
        position: "top",
        offset: { x: 0, y: -10 },
      },
      {
        id: "quick-features",
        title: "Quick Access Features",
        content: "When starting a new conversation, you'll see quick access cards to upload documents, explain topics, research Wikipedia, take quizzes, or analyze websites.",
        position: "center",
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
        content: "Create comprehensive study materials on any topic using AI. Perfect for exploring new subjects or deepening your understanding. Topics are automatically generated with detailed explanations.",
        position: "center",
      },
      {
        id: "sidebar",
        title: "Your Topics Library",
        content: "All your generated topics appear in the sidebar (or menu on mobile). Click on any topic to view its AI-generated content. Use the search bar to quickly find specific topics.",
        position: "center",
      },
      {
        id: "create-form",
        title: "Create New Topics",
        content: "Use the form at the bottom to create new topics. Enter a title (required) and optionally add a description. The AI will generate comprehensive study materials automatically.",
        position: "center",
      },
      {
        id: "topic-actions",
        title: "Topic Management",
        content: "For each topic, you can edit the content, regenerate it with fresh AI insights, or delete it. There's also a text-to-speech button to listen to the content.",
        position: "center",
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
        content: "Take AI-generated quizzes based on your uploaded documents, topics, or websites. Perfect for self-assessment and exam preparation. Customize difficulty and question count.",
        position: "center",
      },
      {
        id: "create-button",
        title: "Create New Quiz",
        content: "Click the 'Create Quiz' button to open the quiz creation form. You can generate quizzes from various sources including topics, documents, and websites.",
        position: "center",
      },
      {
        id: "quiz-options",
        title: "Quiz Customization",
        content: "When creating a quiz, you can set the number of questions (1-50), difficulty level (easy, medium, hard, or mixed), and choose whether to include calculation-based questions.",
        position: "center",
      },
      {
        id: "quiz-list",
        title: "Your Quiz History",
        content: "View all your generated quizzes with their details. Click 'Open' to take a quiz. Your scores and attempts are tracked for each quiz.",
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
        content: "Create and study with AI-generated flashcards. Perfect for memorizing key concepts, terms, and definitions. Flashcards can be generated from topics, documents, or websites.",
        position: "center",
      },
      {
        id: "generate-button",
        title: "Generate Flashcards",
        content: "Click the 'Generate' button to create a new flashcard set. You can customize the number of cards, difficulty level, and choose to include definitions and examples.",
        position: "center",
      },
      {
        id: "flashcard-options",
        title: "Customization Options",
        content: "When generating flashcards, you can set the number of cards (1-50), difficulty level, source type (topic, document, website, or manual), and specify focus areas.",
        targetSelector: "[data-help='create-flashcards']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "study-sets",
        title: "Your Flashcard Sets",
        content: "All your flashcard sets are displayed here with statistics including card count, study sessions, and average scores. Click 'Study' to start reviewing a set.",
        position: "center",
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
        content: "Extract and analyze content from websites and online articles. Perfect for research and gathering information from web sources. The AI will scrape and summarize the content.",
        position: "center",
      },
      {
        id: "add-button",
        title: "Add Website",
        content: "Click the 'Add Website' button to open the URL input form. Enter any valid website URL (starting with https://) to analyze its content.",
        position: "center",
      },
      {
        id: "add-website",
        title: "Enter Website URL",
        content: "Enter the full URL of the website or article you want to analyze. The system will extract the main content and generate an AI summary.",
        targetSelector: "[data-help='add-website']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "website-list",
        title: "Analyzed Websites",
        content: "View all your analyzed websites with their titles, URLs, summaries, and processing status. You can open, rescrape, or delete any website. Click 'Read More' to see full summaries.",
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
        content: "Search Wikipedia articles and get AI-powered summaries and insights. Perfect for quick research and fact-checking. You can search in multiple languages.",
        position: "center",
      },
      {
        id: "search",
        title: "Search Wikipedia",
        content: "Enter any topic in the search box and select your preferred language. Click 'Search' to find relevant Wikipedia articles. Results appear in the left panel.",
        targetSelector: "[data-help='wikipedia-search']",
        position: "bottom",
        offset: { x: 0, y: 20 },
      },
      {
        id: "results",
        title: "Browse Results & Details",
        content: "Search results appear on the left. Click any article to view its full content on the right. You can see the article's image, description, and full text.",
        targetSelector: "[data-help='wikipedia-results']",
        position: "top",
        offset: { x: 0, y: -20 },
      },
      {
        id: "actions",
        title: "Import & Use Articles",
        content: "After viewing an article, you can import it to your websites, start a chat about it, or create a quiz from its content. These actions help you study the material effectively.",
        position: "center",
      },
    ],
  },
};
