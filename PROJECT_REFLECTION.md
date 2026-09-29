# FitMate Project Reflection

## Project Name and Purpose

This project is called **FitMate**. It is a full-stack fitness and wellness platform. It combines fitness tracking, nutrition guidance, AI assistance, and project collaboration in one workspace.

The platform solves a common problem: users often keep workouts, meals, sleep, water intake, notes, and progress in different apps. FitMate brings these activities together so the user can plan, record, understand, and improve their daily wellness routine from one dashboard.

> Note: The required collaboration features are sometimes described as a CollabSphere platform. In this project, that collaboration platform is implemented as the **Collab Space** feature inside FitMate.

## What the Project Does

A user can:

- Create an account and securely log in.
- Complete a wellness profile and set personal goals.
- Track workouts, meals, hydration, sleep, and progress.
- Ask an AI coach for personalized general wellness guidance.
- Analyze food using a written description or an image when a vision-capable provider is configured.
- Generate workout and meal suggestions.
- Create collaborative projects.
- Write Markdown notes and improve them with AI.
- Upload and preview project files.
- Invite collaborators and share a project publicly.
- View contribution activity and basic analytics.
- Earn XP, streaks, badges, and achievements.
- Submit service requests and ask questions through Help Desk.

## Features Implemented

### 1. User Authentication: JWT and bcrypt

Users can register and log in through the authentication pages.

Flow:

1. The client sends name, email, and password to the Express API.
2. The server validates the input.
3. `bcryptjs` hashes the password before storage.
4. The server creates a JWT containing the user identity and role.
5. The client stores the token in `localStorage`.
6. Protected requests send `Authorization: Bearer <token>`.
7. The authentication middleware verifies the token before allowing access.

Relevant APIs:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/profile`

Why it is useful: user data remains private and every user can have a personalized wellness workspace.

### 2. Project Collaboration

The Collab Space allows users to create and manage fitness-related projects.

Users can:

- Create a project.
- Update the project name and description.
- Invite another registered user by email.
- Add notes and files.
- See project members and contribution information.
- Make a project public or private.

Relevant APIs:

- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `POST /api/projects/:id/members`

Why it is useful: a user can work with a trainer, friend, or team instead of keeping fitness planning alone.

### 3. Markdown Notes with AI

Collab Space includes a Markdown notes editor. Users can write workout plans, meal plans, recovery notes, or weekly goals in Markdown.

Users can:

- Add a note title.
- Write Markdown content.
- Save the note.
- Ask AI to improve the note.
- See saved notes and delete notes when needed.

Relevant APIs:

- `GET /api/projects/:id/notes`
- `POST /api/projects/:id/notes`
- `PATCH /api/projects/:id/notes/:noteId`
- `DELETE /api/projects/:id/notes/:noteId`
- `POST /api/ai/explain-note`

Why it is useful: users can turn rough ideas into clearer, more actionable plans without leaving the platform.

### 4. File Upload and Preview

Users can upload project files such as Markdown, JSON, JavaScript, JSX, TypeScript, CSS, and HTML files.

The upload flow is:

1. The client sends the file using `multipart/form-data`.
2. Multer reads the file on the server.
3. The server validates the file size.
4. Cloudinary stores the uploaded asset when Cloudinary variables are configured.
5. The server stores the file name, type, size, preview, secure URL, and public ID.
6. The UI displays the file and offers preview, download, explanation, and delete actions.

Relevant APIs:

- `POST /api/projects/:id/files`
- `GET /api/projects/:id/files`
- `DELETE /api/projects/:id/files/:fileId`

Why it is useful: project members can keep supporting documents and code snippets in the same workspace.

### 5. Contribution Analytics

The project tracks basic collaboration activity.

Tracked values include:

- Number of notes.
- Number of files.
- Number of project contributions.
- Number of project members.
- Contributions grouped by member.

Contribution events include note creation and file upload.

Relevant API:

- `GET /api/projects/:id/analytics`

Why it is useful: the user can quickly understand whether a project is active and how members are contributing.

### 6. Public Shareable Project Page

A project owner can enable public sharing. The server creates a share token for the project.

Flow:

1. The owner selects `Share publicly`.
2. The client creates a URL containing the project share token.
3. Another person can open that URL without logging in.
4. The server returns only public project information.
5. Sensitive fields such as author IDs and file content are not exposed on the public page.

Relevant APIs:

- `PATCH /api/projects/:id`
- `GET /api/public/projects/:id`

Why it is useful: a user can share a fitness plan, project summary, or collaboration result with someone outside the private workspace.

### 7. Gemini-Compatible AI API Endpoints

The original requirement mentions Gemini API endpoints. This project uses a provider abstraction, so the AI provider can be changed without changing the frontend feature flow.

In the current implementation, the primary provider is **Groq**, using its OpenAI-compatible chat completions API. Gemini support is also represented through a separate Gemini endpoint function when `GEMINI_API_KEY` is configured.

This is allowed because the important design is the server-side AI abstraction: the frontend calls FitMate APIs, and the server decides which provider and model to use.

AI endpoints include:

- `POST /api/ai/chat`
- `POST /api/ai/meal-suggestion`
- `POST /api/ai/food-analyze`
- `POST /api/ai/workout-generator`
- `POST /api/ai/meal-plan`
- `POST /api/ai/explain-note`
- `POST /api/ai/gemini`

AI features include:

- AI wellness coach.
- Meal suggestions.
- Food analysis.
- Workout generation.
- Meal planning.
- Markdown note improvement.
- Gemini-compatible request handling.

The AI responses are general wellness guidance. The application does not provide medical diagnosis, treatment, medication advice, or exact medical nutrition measurements.

## Frontend and Backend Flow

### Frontend

The frontend is built with React and Vite.

Main responsibilities:

- Render landing, authentication, onboarding, dashboard, and workspace pages.
- Manage page state and form state.
- Send requests through `client/src/services/api.js`.
- Store the JWT token in the browser.
- Display loading, success, and error states.
- Provide responsive layouts for desktop and mobile.

The main navigation is controlled in `client/src/App.jsx`. Components such as `CollabSpaceView`, `AIHubView`, `HelpDeskView`, and the consolidated wellness pages represent the user-facing features.

### Backend

The backend is built with Node.js and Express.

Main responsibilities:

- Validate requests.
- Authenticate users through JWT middleware.
- Enforce role access for admin routes.
- Run business logic.
- Call AI providers from the server, not directly from the browser.
- Store application data.
- Handle file uploads.
- Return JSON responses.
- Apply rate limiting and centralized error handling.

The backend starts from `server/server.js` and exposes routes under `/api`.

### Example Request Flow

For a Markdown note:

1. User writes a note in the React editor.
2. React calls `api.createProjectNote()`.
3. `api.js` adds the JWT authorization header.
4. Express receives `POST /api/projects/:id/notes`.
5. Auth middleware verifies the user.
6. The server checks project membership.
7. The note is added to the store.
8. MongoDB persistence is triggered.
9. The server returns the note as JSON.
10. React updates the saved-notes list.

## Database Usage

The project uses MongoDB through Mongoose.

The persistence layer stores the application store as a `FitmateState` document. This includes users, projects, notes, files, activity, workouts, meals, progress, hydration, sleep, services, and gamification data.

Current local configuration uses:

```env
MONGO_URL=mongodb://127.0.0.1:27017/fitmate
```

The server connects during startup. When MongoDB is available, it loads the saved store and persists changes. If MongoDB is unavailable, the project can use an in-memory development fallback.

Why MongoDB is useful:

- It preserves data between server restarts.
- It supports flexible wellness and collaboration records.
- It works well with the JavaScript object structure used by the app.

## AI Integration

AI calls are kept on the backend so provider keys are not exposed to the browser.

The AI service builds a request using:

- User profile information.
- Fitness goal.
- Diet preference.
- Exercise experience.
- Recent meals and workouts when relevant.
- The user question or request.

The backend then sends the request to the configured provider and returns a clean response to the frontend.

### Provider Configuration

Current configuration supports:

```env
GROQ_API_KEY=server-only-key
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=vision-model-when-accessible
```

Gemini-compatible support can use:

```env
GEMINI_API_KEY=server-only-key
GEMINI_MODEL=gemini-2.0-flash
```

The frontend does not need to know whether the response came from Groq, Gemini, or another compatible provider. It calls the FitMate API endpoint.

### AI Error Handling

The project includes fallback behavior for text-based food descriptions and clear error messages when a vision model is not available. Image-only calorie analysis requires an accessible vision-capable model. The application should never pretend that an image was accurately analyzed when the provider rejected the request.

## Technical Decisions

### Why React and Vite?

React provides reusable components and state-based UI updates. Vite provides a fast development server and simple production builds.

### Why Express?

Express is lightweight and makes it easy to organize authentication, wellness, AI, collaboration, and admin routes.

### Why JWT?

JWT allows the API to authenticate protected requests without storing a server-side session for every browser request.

### Why bcrypt?

Passwords must never be stored as plain text. bcrypt creates a one-way password hash that can be checked during login.

### Why keep AI calls on the server?

API keys are private credentials. Calling AI providers from the server prevents exposing those keys in browser JavaScript.

### Why use a provider abstraction?

The product requirements may mention Gemini, but providers can change. A provider abstraction lets the application use Groq, Gemini, OpenAI-compatible services, or a local fallback without rewriting every frontend feature.

## Challenges and Learnings

### Challenge 1: Connecting many features in one workspace

The app contains authentication, wellness tracking, collaboration, AI, uploads, and admin features. The main learning was to keep each feature in a focused component and expose communication through a shared API service.

### Challenge 2: Keeping private data protected

Project routes must check both authentication and project membership. Public project routes must return only safe public data.

Learning: authentication is not enough by itself. Authorization and response filtering are also required.

### Challenge 3: AI provider differences

Different providers support different model names and request options. A model name can be configured but still be unavailable for a particular API key.

Learning: AI integrations need provider checks, clear error handling, fallbacks, and safe JSON parsing.

### Challenge 4: Image analysis reliability

Text AI and vision AI are not identical. Image-only nutrition analysis requires a vision-capable model and valid image request format.

Learning: the UI should make descriptions optional, but the server must clearly communicate when image-only analysis needs a vision provider.

### Challenge 5: Responsive UI and readable contrast

Large dashboards can look crowded on smaller screens, and theme overrides can make text difficult to read.

Learning: page-specific CSS scopes, responsive grids, spacing, and contrast checks are important for a professional interface.

## In-Person Reflection Preparation

### Explain your project flow

FitMate starts with authentication. After login, the user completes onboarding and receives personalized targets. The dashboard combines current wellness records. The user can log activities, use AI tools, collaborate in projects, and review progress. Protected API routes validate the JWT before changing user data. MongoDB persists the store.

### Explain one feature/API

For project notes, the React editor sends a POST request to `/api/projects/:id/notes`. The API verifies the JWT and project membership, creates a note with an ID and timestamp, persists the store, and returns the note. The frontend then adds it to the saved-notes list.

### Explain your AI integration

The frontend sends a user request to a FitMate backend AI endpoint. The server adds profile and activity context, calls the configured provider, parses the response, adds safety boundaries and a disclaimer, then returns the result. API keys stay on the server. Groq is currently used as the primary OpenAI-compatible provider, while Gemini-compatible support is available through the provider abstraction.

### Walk through your code

A simple walkthrough order is:

1. `client/src/App.jsx` for navigation and top-level auth state.
2. `client/src/services/api.js` for frontend API methods.
3. `server/server.js` for Express startup and middleware.
4. `server/middleware/auth.js` for JWT verification.
5. `server/routes/auth.js` for registration and login.
6. `server/routes/api.js` for feature endpoints.
7. `server/services/aiService.js` for AI provider calls and fallbacks.
8. `server/persistence.js` for MongoDB persistence.
9. `client/src/components/CollabSpaceView.jsx` for the seven collaboration features.

### Explain a technical decision

I kept AI provider calls in a backend service instead of placing them in React. This protects API keys, centralizes provider changes, keeps prompts consistent, and lets the application add fallbacks and safety rules in one place.

### Explain how you would debug an issue

I would first reproduce the issue, inspect the browser request and server logs, check the HTTP status and response body, verify environment variables without exposing secrets, test the smallest affected API, and then run a focused build or smoke test after the fix.

### Explain how you would modify a feature

I would identify the owning component and API route, preserve the existing request/response contract when possible, make the smallest change, test the backend behavior, build the frontend, and verify the user workflow in the browser.

## How to Run the Project

From the repository root:

```bash
npm install
npm run install:all
npm run dev
```

URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`

The backend requires MongoDB for persistent local data. The current project is configured to use the local MongoDB database `fitmate`.

## Short Presentation Summary

FitMate is a full-stack fitness and wellness collaboration platform. It solves the problem of scattered wellness data by combining tracking, planning, AI assistance, and collaboration in one workspace. React and Vite power the frontend, while Express, JWT, bcrypt, MongoDB, Mongoose, Cloudinary, and server-side AI services power the backend. The seven required collaboration features are implemented through secure APIs for authentication, projects, Markdown notes, AI assistance, uploads, analytics, and public sharing. Groq is used as the current Gemini-compatible AI provider approach, with the provider abstraction allowing Gemini or another compatible provider to be configured later.
