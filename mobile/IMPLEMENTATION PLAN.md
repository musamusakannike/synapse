# Sabi Learn — Mobile App Implementation Plan

Initial prompt: "Using the recommended react native agent skills in the mobile folder ([skills-lock.json](file;file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/skills-lock.json) ) a very good modern and clean UI+UX, a good file+folder structure, create the mobile app for "Sabi Learn". and some more features to be added to the server (A lot has already been done on the server before. The server is the api routes in the frontend which is hosted on sabilearn.online).  In case a new package will be needed for a particular feature, you can install it. In case images are needed, you can add placeholder images for now (e.g "https://placehold.co/600x400"). Make sure the UIUX is exactly similar to that of the frontend. Also use the same font as the frontend. I prefer lucide react icons to expo vector icons
Use SafeAreaView from react native safe area context only and use KeyboardAvoidingView/KeyboardStickyView as expected on each OS.
When designing, make sure to use distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices. Make the style minimal but with animations and haptics. Use a color variable system to make colors easy to edit. Use animations for effects and micro-interactions. NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.  Make sure the app has a beautifully styled and animated toast component that can handle different types of toast events (error, success, info ...) and make sure all toast messages are easily comprehensible by users.
The authentication on the app should support google oauth (using the @react-native-firebase/app, @react-native-firebase/auth and firebase packages as needed) and apple auth (using the recommended packages). The login page also has the normal login options and the google or apple signin options fully implemented. Also add a forgot & reset password functionality from the login page, the user is navigated to the forgot password page and its handled as expected by the server and resend for mails. 
Make sure to also setup push notifications."

Build a production-grade React Native (Expo SDK 56) mobile app that mirrors the existing web frontend at `sabilearn.online`. The app connects to the same Next.js API routes hosted on the frontend server.

## User Review Required

> [!IMPORTANT]
> **Font choice**: The web uses **Outfit** (headings) and **Plus Jakarta Sans** (body). I'll load these via `expo-font` and use them throughout the app for visual parity. Please confirm this is correct.

> [!IMPORTANT]
> **Apple Sign-In**: The `expo-apple-authentication` package is already installed. Apple auth requires an Apple Developer account with Sign In with Apple configured. I'll implement the UI and client-side logic — you'll need to ensure the backend `/api/auth/apple` route (new) verifies Apple identity tokens.

> [!WARNING]
> **Push Notifications**: `expo-notifications` is installed. For push tokens to work in production, you need to configure:
> - **Android**: Firebase Cloud Messaging (FCM) — the `@react-native-firebase/app` plugin is already present
> - **iOS**: APNs key uploaded to your Expo project via `eas credentials`
> I'll implement the registration + token storage logic. You'll need a server endpoint to store device tokens and send pushes.

## Open Questions

> [!IMPORTANT]
> **Forgot Password**: There's no existing `forgot-password` or `reset-password` API route on the server. I'll create:
> 1. `POST /api/auth/forgot-password` — generates a 6-digit OTP, stores it in the DB, and emails it via Resend
> 2. `POST /api/auth/reset-password` — verifies OTP + sets new password
> 3. `POST /api/auth/resend-otp` — resends the OTP
> Is this OTP-based approach acceptable? Or do you prefer a magic-link approach?

> [!IMPORTANT]
> **Apple Auth Backend**: There's no `/api/auth/apple` route. I'll create one that verifies Apple identity tokens and follows the same user creation/login pattern as the Google route. Confirm this is desired.

---

## Proposed Changes

### Phase 1: Project Foundation & Design System

Complete restructuring of the `src/` directory to support the full app. Delete existing boilerplate files.

---

#### [DELETE] [index.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/index.tsx)
#### [DELETE] [explore.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/explore.tsx)
#### [DELETE] [_layout.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/_layout.tsx)

Remove all existing boilerplate screens and layout.

#### [DELETE] Existing component boilerplate
Delete `animated-icon.*`, `app-tabs.*`, `external-link.tsx`, `hint-row.tsx`, `themed-text.tsx`, `themed-view.tsx`, `web-badge.tsx`, and `ui/` directory.

---

#### [NEW] [theme.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/constants/theme.ts)
Rewrite the color system to mirror the web's CSS custom properties with a structured token system:
- `colors.dark` and `colors.light` matching `globals.css` values exactly (bg-primary `#0C0C0E`, accent `#E8A838`, etc.)
- `typography` object for Outfit (display) and Plus Jakarta Sans (body) font families
- `spacing`, `radius`, `shadows` tokens
- Export `useThemeColors()` hook for easy access

#### [NEW] [fonts.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/constants/fonts.ts)
Font asset mapping for `expo-font` to load Outfit and Plus Jakarta Sans font files.

---

#### [NEW] [_layout.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/_layout.tsx)
Root layout with:
- `expo-font` loading for Outfit + Plus Jakarta Sans
- `expo-splash-screen` keep visible until fonts loaded
- `SafeAreaProvider` from `react-native-safe-area-context`
- `QueryClientProvider` (TanStack React Query)
- `AuthProvider` context
- `GestureHandlerRootView`
- `KeyboardProvider` from `react-native-keyboard-controller`
- Toast provider
- Push notification registration on mount
- Theme provider (auto-detect system preference, store choice)

---

### Phase 2: Core Services & Utilities

#### [NEW] [api.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/lib/api.ts)
Axios instance configured with:
- Base URL: `https://sabilearn.online`
- Request/response interceptors for auth token injection (stored in `expo-secure-store`)
- `axios-retry` for resilience
- Token refresh logic

#### [NEW] [auth-context.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/lib/auth-context.tsx)
Auth context provider mirroring the web's `auth-context.tsx`:
- `login(email, password)` → `POST /api/auth/login`
- `register(name, email, password)` → `POST /api/auth/register`
- `loginWithGoogle()` → Firebase Google Sign-In + `POST /api/auth/google`
- `loginWithApple()` → Apple Auth + `POST /api/auth/apple` (new route)
- `forgotPassword(email)` → `POST /api/auth/forgot-password` (new route)
- `resetPassword(email, otp, newPassword)` → `POST /api/auth/reset-password` (new route)
- `resendOtp(email)` → `POST /api/auth/resend-otp` (new route)
- `logout()` → clear local token
- `refreshUser()` → `GET /api/auth/me`
- Store JWT in `expo-secure-store` instead of cookies
- Modified API calls send `Authorization: Bearer <token>` header

#### [NEW] [firebase.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/lib/firebase.ts)
Firebase configuration for mobile using `@react-native-firebase/app` and `@react-native-firebase/auth`:
- Google Sign-In via `@react-native-google-signin/google-signin`
- Returns Firebase ID token to send to the server

#### [NEW] [notifications.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/lib/notifications.ts)
Push notification setup using `expo-notifications`:
- Register for push permissions on app start
- Get Expo push token
- Send token to server for storage: `POST /api/auth/me` with `pushToken` field
- Handle incoming notification routing

#### [NEW] [haptics.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/lib/haptics.ts)
Haptic feedback utility using Expo's haptics for button presses, success, error, and selection changes.

---

### Phase 3: Shared UI Components

#### [NEW] [Toast.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/Toast.tsx)
Custom animated toast system with:
- Slide-in from top with spring animation (Reanimated)
- Auto-dismiss with configurable duration
- Types: `success` (green), `error` (red/danger), `info` (accent), `warning` (yellow)
- Icon per type using `lucide-react-native`
- Haptic feedback on show
- Queue system for multiple toasts
- Context-based `useToast()` hook

#### [NEW] [Button.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/Button.tsx)
Pressable button with:
- Scale animation on press (Reanimated)
- Haptic feedback
- Variants: `primary` (accent fill), `secondary` (outlined), `ghost`, `danger`
- Loading spinner state
- Full-width option

#### [NEW] [Input.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/Input.tsx)
TextInput wrapper with:
- Label, error, and helper text
- Animated border color on focus
- Password visibility toggle
- Icon support (left/right)
- Styled to match web input design

#### [NEW] [Card.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/Card.tsx)
Reusable card with bg-secondary background, border, and border-radius matching web.

#### [NEW] [EmptyState.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/EmptyState.tsx)
Centered illustration/icon + message + optional CTA button.

#### [NEW] [LoadingSkeleton.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/LoadingSkeleton.tsx)
Animated shimmer loading placeholders using Reanimated.

#### [NEW] [Header.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/Header.tsx)
Screen header component with back button, title, and optional right action.

#### [NEW] [Avatar.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/Avatar.tsx)
User avatar with initial letter fallback, matching the web sidebar pattern.

#### [NEW] [BottomSheet.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/components/BottomSheet.tsx)
Wrapper around `@gorhom/bottom-sheet` styled to match the app theme.

---

### Phase 4: Authentication Screens

#### [NEW] [src/app/(auth)/_layout.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(auth)/_layout.tsx)
Auth stack layout — plain Stack navigator with no header (full-screen auth forms).

#### [NEW] [src/app/(auth)/login.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(auth)/login.tsx)
Login screen matching web's `LoginForm.tsx`:
- Logo + "Welcome back" heading
- Email + password inputs
- "Sign in" primary button
- Divider with "or"
- "Continue with Google" button (with Google SVG icon)
- "Continue with Apple" button (iOS only, Apple logo)
- "Forgot password?" link → navigates to forgot-password screen
- "Don't have an account? Sign up" link
- `KeyboardAvoidingView` wrapping the form
- All errors shown via toast

#### [NEW] [src/app/(auth)/register.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(auth)/register.tsx)
Register screen matching web's `RegisterForm.tsx`:
- Same layout pattern as login
- Name, email, password fields
- Google + Apple sign-in options
- "Already have an account? Sign in" link

#### [NEW] [src/app/(auth)/forgot-password.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(auth)/forgot-password.tsx)
Forgot password flow:
- Step 1: Enter email → calls `POST /api/auth/forgot-password`
- Step 2: Enter 6-digit OTP code (auto-focus, paste-from-clipboard) + new password
- "Resend code" button with cooldown timer
- Calls `POST /api/auth/reset-password` to finalize
- Success → navigate to login with toast "Password reset successful"

---

### Phase 5: Main App Screens (Tab Navigation)

#### [NEW] [src/app/(tabs)/_layout.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(tabs)/_layout.tsx)
Bottom tab navigator with 4-5 tabs matching the web sidebar's primary nav:
- **Home** (chat/overview — the main dashboard page)
- **Courses** (course listing)
- **Quizzes** (quiz listing)
- **More** (history, documents, videos, settings, billing)
Tab bar styled to match the warm dark theme with accent color for active tab.
Custom animated tab bar with Reanimated transitions.

---

#### [NEW] [src/app/(tabs)/index.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(tabs)/index.tsx)
Home/Chat screen — exact port of the web dashboard `page.tsx`:
- Chat interface with user/assistant/system messages
- "+" button opening a bottom sheet (instead of dropdown) with:
  - Create Course
  - Create Quiz
  - Generate Video
  - Attach Document
- Active mode indicator chip
- Text input bar at bottom with send button
- Quick suggestion chips when empty
- Auto-scroll on new messages
- Markdown rendering for AI responses
- `KeyboardStickyView` for the input bar

#### [NEW] [src/app/(tabs)/courses.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(tabs)/courses.tsx)
Courses list screen:
- `FlashList` of user's courses
- Each card shows title, topic, date created
- Pull-to-refresh
- Empty state when no courses
- Navigate to course detail on tap

#### [NEW] [src/app/(tabs)/quizzes.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(tabs)/quizzes.tsx)
Quizzes list screen:
- `FlashList` of user's quizzes
- Score badge if completed
- Pull-to-refresh
- Navigate to quiz detail/take on tap

#### [NEW] [src/app/(tabs)/more.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/(tabs)/more.tsx)
More screen — a clean settings-style list:
- Ask AI
- History
- Documents
- Videos
- Billing
- Settings
- Theme toggle (dark/light)
- Sign out
- User info card at top (avatar, name, plan)

---

### Phase 6: Detail & Feature Screens

#### [NEW] [src/app/course/[id].tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/course/[id].tsx)
Course detail screen:
- Course title and metadata header
- Scrollable chapter/lesson list
- Lesson content rendered as rich markdown
- Share button
- Add to library toggle

#### [NEW] [src/app/quiz/[id].tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/quiz/[id].tsx)
Quiz taking screen:
- Question card with animated progress bar
- Multiple choice options with selection animation
- Swipe/button navigation between questions
- Results summary at end with score
- Option to retake

#### [NEW] [src/app/ask.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/ask.tsx)
Ask AI screen (standalone, accessible from "More"):
- Simple question input + answer display
- Markdown rendering for AI responses

#### [NEW] [src/app/history.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/history.tsx)
History screen:
- Chronological list of past interactions (questions, courses, quizzes)
- Tap to navigate to the respective detail page

#### [NEW] [src/app/documents.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/documents.tsx)
Documents screen:
- List of uploaded documents
- Upload button using `expo-document-picker`
- Delete document with confirmation
- Document insights modal

#### [NEW] [src/app/videos.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/videos.tsx)
Videos screen:
- List of generated videos
- Video playback using `expo-video` or `react-native-youtube-iframe`
- Share button

#### [NEW] [src/app/settings.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/settings.tsx)
Settings screen matching web's settings page:
- Display name
- Learning style selector (card grid)
- Education level picker
- Learning goals textarea
- Save button with success feedback

#### [NEW] [src/app/billing.tsx](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/src/app/billing.tsx)
Billing screen:
- Current plan display
- Subscription status
- Upgrade button (opens Paystack in web browser)

---

### Phase 7: Server-Side API Routes (New)

These routes need to be added to the frontend's Next.js API to support mobile auth flows.

---

#### [NEW] [forgot-password/route.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/frontend/src/app/api/auth/forgot-password/route.ts)
`POST /api/auth/forgot-password`
- Accepts `{ email }`
- Looks up user in DB
- Generates 6-digit OTP, stores in `password_resets` collection with TTL
- Sends OTP via Resend email using the existing `sendEmail` utility
- Returns `{ success: true }`

#### [NEW] [reset-password/route.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/frontend/src/app/api/auth/reset-password/route.ts)
`POST /api/auth/reset-password`
- Accepts `{ email, otp, newPassword }`
- Validates OTP against `password_resets` collection
- Hashes new password, updates user
- Deletes OTP record
- Returns `{ success: true }`

#### [NEW] [resend-otp/route.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/frontend/src/app/api/auth/resend-otp/route.ts)
`POST /api/auth/resend-otp`
- Accepts `{ email }`
- Generates new OTP, replaces existing one
- Resends via email
- Returns `{ success: true }`

#### [NEW] [apple/route.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/frontend/src/app/api/auth/apple/route.ts)
`POST /api/auth/apple`
- Accepts `{ identityToken, fullName, email }`
- Verifies Apple identity token (via Apple's public keys JWKS)
- Creates or finds user (same pattern as Google route)
- Returns JWT in response body (mobile uses header-based auth, not cookies)
- Sends welcome email for new users

#### [MODIFY] [me/route.ts](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/frontend/src/app/api/auth/me/route.ts)
Update the `GET /api/auth/me` route to also check for `Authorization: Bearer <token>` header as fallback when no cookie is present. This allows the mobile app to use the same endpoint.
Update the `POST /api/auth/me` (logout) to also accept Bearer token.

#### [MODIFY] All API routes
Add a middleware helper to extract the JWT from either the cookie OR the `Authorization` header. This ensures all existing routes work seamlessly with the mobile app without duplicating logic.

---

### Phase 8: App Configuration Updates

#### [MODIFY] [app.json](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/app.json)
Add:
- `expo-notifications` plugin configuration
- `expo-apple-authentication` plugin (already present, verify)
- `expo-font` asset bundling
- Deep linking scheme `sabilearn://`
- Notification icon for Android

#### [MODIFY] [package.json](file:///Users/MACBOOK/Documents/FULLSTACK/synapse/mobile/package.json)
Ensure all needed packages are installed. May need:
- `expo-haptics` for haptic feedback
- Font assets (Google Fonts downloaded as `.ttf`)

---

## File/Folder Structure (Final)

```
mobile/src/
├── app/
│   ├── _layout.tsx              # Root layout (providers, fonts, splash)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Register screen
│   │   └── forgot-password.tsx  # Forgot + reset password
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Home/Chat (main dashboard)
│   │   ├── courses.tsx          # Courses list
│   │   ├── quizzes.tsx          # Quizzes list
│   │   └── more.tsx             # More menu
│   ├── course/
│   │   └── [id].tsx             # Course detail
│   ├── quiz/
│   │   └── [id].tsx             # Quiz detail/take
│   ├── ask.tsx                  # Ask AI standalone
│   ├── history.tsx              # History
│   ├── documents.tsx            # Documents
│   ├── videos.tsx               # Videos
│   ├── settings.tsx             # Settings
│   └── billing.tsx              # Billing
├── components/
│   ├── Toast.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSkeleton.tsx
│   ├── Header.tsx
│   ├── Avatar.tsx
│   ├── BottomSheet.tsx
│   └── TabBar.tsx
├── constants/
│   ├── theme.ts                 # Color system, typography, spacing
│   └── fonts.ts                 # Font asset paths
├── hooks/
│   ├── useTheme.ts              # Theme state management
│   └── useColorScheme.ts        # System color scheme detection
└── lib/
    ├── api.ts                   # Axios instance
    ├── auth-context.tsx         # Auth provider
    ├── firebase.ts              # Firebase mobile config
    ├── notifications.ts         # Push notification setup
    └── haptics.ts               # Haptic feedback utility
```

---

## Verification Plan

### Automated Tests
- TypeScript compilation: `npx tsc --noEmit` in the mobile directory
- Lint check: `npx expo lint`

### Manual Verification
- Run `npx expo start` and test on iOS Simulator / Android Emulator
- Verify all auth flows (login, register, Google, Apple, forgot password)
- Verify tab navigation and all screens render
- Verify API calls work against `sabilearn.online`
- Test toast notifications for all states
- Test keyboard avoidance on all form screens
- Test dark/light theme switching
- Verify push notification permission prompt
