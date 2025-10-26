# Synapse

Synapse is an AI-powered learning assistant designed to help students and professionals enhance their learning experience. It leverages the power of Google's Gemini API to provide a suite of tools that make learning more interactive, efficient, and engaging.

## Problem

In today's fast-paced world, students and professionals are constantly looking for ways to learn more effectively. Traditional learning methods can be time-consuming and may not cater to individual learning styles. Synapse addresses this by providing a personalized learning experience that adapts to the user's needs.

## Solution

Synapse provides a unified chat interface where users can interact with various AI-powered tools. Users can upload documents, ask questions, generate quizzes and flashcards, and get explanations on various topics. This interactive approach to learning helps users to grasp concepts faster and retain information for longer.

## Devfest Ilorin: Build with AI Hackathon 2025

This project is a submission for the Devfest Ilorin: Build with AI Hackathon 2025.

* **Challenge Category:** Generative AI for Creativity & Productivity
* **Theme Alignment:** Synapse aligns with the theme of "Building Safe, Secure, and Scalable Solutions with AI and Cloud" by leveraging Google's Gemini API to create a robust and scalable learning assistant. It enhances productivity by providing a suite of AI-powered tools that streamline the learning process.

## Features

* **Interactive Chat Interface:** A unified chat interface to interact with all the AI-powered tools.
* **Document Upload and Analysis:** Upload documents (PDF, DOCX) and get summaries, ask questions, and extract key information.
* **Quiz Generation:** Generate quizzes from documents or topics to test your knowledge.
* **Flashcard Generation:** Create flashcards for quick revision.
* **Topic Explanations:** Get detailed explanations on a wide range of topics.
* **Web Content Analysis:** Analyze web articles and get summaries or key takeaways.
* **Wikipedia Research:** Research topics on Wikipedia directly from the chat interface.
* **Text-to-Speech:** Listen to the AI's responses.

## Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI:** Google Gemini API
* **Authentication:** Firebase Authentication
* **Deployment:** Vercel (Frontend), Google Cloud Run (Backend)

## Setup and Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later)
* npm
* Git

### Installation

1. **Clone the repo**

    ```sh
    git clone https://github.com/musamusakannike/synapse.git
    ```

2. **Setup Backend**

    ```sh
    cd server
    npm install
    cp .env.example .env
    ```

    * Open the `.env` file and add your credentials.

    ```sh
    npm run dev
    ```

3. **Setup Frontend**

    ```sh
    cd ../frontend
    npm install
    ```

    * Create a `.env.local` file in the `frontend` directory and add the following:

    ```.env
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

    ```sh
    npm run dev
    ```

## Configuration

The backend requires a `.env` file with the following variables:

```.env
ALLOWED_FILE_TYPES=pdf,docx,doc
FROM_NAME=Synapse AI
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
GMAIL_EMAIL=your-gmail-email
GMAIL_PASSWORD=your-gmail-password
JWT_EXPIRE=7d
JWT_SECRET=your-jwt-secret
MAX_FILE_SIZE=20MB
MONGODB_URI=your-mongodb-uri
NODE_ENV=development
PORT=5000
```

* `GEMINI_API_KEY`: Your Google Gemini API key.
* `MONGODB_URI`: Your MongoDB connection string.
* `JWT_SECRET`: A secret key for signing JWTs.
* `GMAIL_EMAIL` and `GMAIL_PASSWORD`: Your Gmail credentials for sending emails.
* `FRONTEND_URL`: The URL of the frontend application.

The frontend requires a `.env.local` file with the following variable:

```.env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Live Demo

[Link to the live demo](https://synapsebot.vercel.app/)

## Video Demo

[Link to the video demo](https://youtube.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

 [Musa Musa Kannike](https://github.com/musamusakannike)
