# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Synapse AI is a full-stack mobile application with a React Native frontend (using Expo) and a Node.js backend. It provides AI chat functionality powered by Google's Gemini AI, with user authentication and chat history management.

## Architecture

### Monorepo Structure
```
synapse/
├── mobile/          # React Native Expo app
│   ├── app/         # Expo Router file-based routing
│   ├── components/  # Reusable UI components
│   ├── context/     # React Context providers
│   ├── lib/         # Utilities and API client
│   └── styles/      # Styling files
└── server/          # Node.js Express backend
    ├── config/      # Database and configuration
    ├── controllers/ # Business logic handlers
    ├── models/      # Mongoose schemas
    ├── routes/      # API route definitions
    └── middlewares/ # Express middleware
```

### Key Technologies
- **Mobile**: React Native, Expo Router, TypeScript, Expo modules
- **Server**: Express.js, MongoDB with Mongoose, JWT authentication
- **AI**: Google Gemini AI integration
- **Authentication**: Custom JWT-based authentication

### Data Flow
1. Mobile app authenticates users via `/api/auth` endpoints
2. Chat requests flow through `/api/chats` to manage conversations
3. AI interactions use `/api/gemini` for Gemini AI integration
4. All data persists in MongoDB with proper user associations

## Development Commands

### Mobile Development (from `mobile/` directory)
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Platform-specific development
npm run android    # Android emulator
npm run ios       # iOS simulator
npm run web       # Web development

# Code quality
npm run lint      # ESLint with Expo config

# Reset project structure
npm run reset-project
```

### Server Development (from `server/` directory)
```bash
# Install dependencies
npm install

# Development with auto-reload
npm run dev

# Production
npm start
```

### Full Stack Development
1. Start server: `cd server && npm run dev`
2. Start mobile app: `cd mobile && npm start`
3. The mobile app expects server at `http://localhost:5000`

## Authentication Architecture

The app uses a custom JWT-based authentication system:
- **JWT tokens** for both web and mobile authentication
- Tokens stored securely using expo-secure-store on mobile
- HTTP-only cookies as fallback for web clients
- User context managed via React Context (`AuthContext`)

Authentication flow:
1. User signs in through mobile app
2. Server validates credentials and generates JWT token
3. Mobile app stores token securely and includes in API requests via Authorization header
4. Server validates JWT tokens via custom middleware
5. User data is fetched and stored in React Context

## Database Schema

Core models:
- **User**: Basic user information (name, email, password)
- **Chats**: Chat session containers
- **Messages**: Individual chat messages linked to chats

All models use Mongoose with proper relationships and indexing.

## API Structure

### Authentication Endpoints (`/api/auth`)
- `POST /signup` - User registration
- `POST /signin` - User login
- `GET /me` - Get current user
- `POST /signout` - User logout

### Chat Endpoints (`/api/chats`)
- Chat CRUD operations
- Message management within chats
- User-specific chat history

### AI Endpoints (`/api/gemini`)
- Integration with Google Gemini AI
- Message processing and response generation

## Mobile App Architecture

### Routing (Expo Router)
- File-based routing in `app/` directory
- Protected routes with authentication checks
- Automatic navigation based on auth state

### Key Files
- `app/_layout.tsx`: Root layout with auth provider and navigation logic
- `app/index.tsx`: Main chat interface
- `app/auth.tsx`: Authentication screens
- `context/AuthContext.tsx`: Global authentication state
- `lib/api.ts`: API client with axios and JWT token management

### State Management
- React Context for authentication
- Custom hooks for chat and AI functionality
- Local state management with useState/useEffect

## Development Environment Setup

### Prerequisites
- Node.js (latest LTS)
- MongoDB instance (local or cloud)
- Expo CLI or Expo development build
- Android Studio/Xcode for mobile development

### Environment Variables
Create `.env` files:

**Server** (in `server/` directory):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

**Mobile** (if needed):
- Expo automatically loads environment variables
- API base URL is currently hardcoded to localhost:5000

### Mobile Platform Support
- **iOS**: Supports tablets, custom bundle identifier
- **Android**: Adaptive icon, edge-to-edge display
- **Web**: Static output for web deployment

## Key Development Patterns

### Error Handling
- Server uses try-catch with proper error responses
- Mobile app handles API errors with user-friendly messages
- Comprehensive error logging for debugging

### Security Features
- Custom JWT authentication with configurable expiration
- Secure token storage using expo-secure-store on mobile
- HTTP-only cookies for web clients
- Helmet for HTTP security headers
- CORS configuration for cross-origin requests
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation with express-validator
- Password hashing with bcryptjs

### Code Organization
- Clear separation of concerns (routes → controllers → models)
- TypeScript for mobile app with proper typing
- ES modules throughout the server codebase
- Consistent file naming conventions

## Testing and Quality

### Current Setup
- ESLint with Expo configuration for mobile
- No explicit test setup (consider adding Jest/React Native Testing Library)

### Recommended Testing Strategy
- Unit tests for API endpoints and business logic
- Component tests for React Native components
- Integration tests for authentication flow
- E2E tests for critical user journeys