# FitMate Project Documentation

## 1. Project Overview

**FitMate** ek full-stack fitness aur wellness companion platform hai. Iska purpose user ko workouts, nutrition, hydration, sleep, progress, AI guidance, achievements aur collaboration tools ek hi workspace mein provide karna hai.

FitMate ka main idea hai:

> User ko small, realistic aur repeatable wellness actions ke through apni daily routine improve karne mein help karna.

Platform sirf workout tracker nahi hai. Yeh ek combined wellness workspace hai jahan user:

- Account create ya login kar sakta hai
- Apna wellness profile setup kar sakta hai
- Daily dashboard par apni health-related activity dekh sakta hai
- Workouts create aur complete kar sakta hai
- Meals manually ya AI ke through log kar sakta hai
- Hydration aur sleep track kar sakta hai
- Progress trends dekh sakta hai
- AI coach se practical suggestions le sakta hai
- Challenges aur achievements ke through motivated reh sakta hai
- Notes, files aur projects ke saath collaborate kar sakta hai
- Apne project ko public share kar sakta hai

---

## 2. Problem Statement

Fitness aur wellness information aam taur par alag-alag apps, notebooks aur services mein scattered hoti hai. Is wajah se user ko yeh problems face hoti hain:

1. Workout, meal, sleep aur water data alag jagah maintain karna padta hai.
2. Progress ko ek clear daily view mein dekhna mushkil hota hai.
3. Users ko apni lifestyle ke according practical guidance nahi milti.
4. Fitness journey maintain karne ke liye consistency aur motivation kam ho sakti hai.
5. Personal plans aur notes ko kisi collaborator ke saath share karna difficult hota hai.
6. Nutrition aur workout planning ke liye baar-baar alag tools use karne padte hain.

FitMate in problems ko ek connected dashboard aur modular wellness tools ke through solve karta hai.

---

## 3. Main Benefits

### 3.1 One central wellness workspace

Workout, food, water, sleep, progress aur goals ek hi platform mein available hain.

### 3.2 Personalized experience

User ke fitness goal, diet preference, activity level aur exercise experience ke basis par targets aur suggestions generate hote hain.

### 3.3 Consistency-focused design

Platform extreme results ke bajaye daily small actions, streaks, XP, challenges aur check-ins par focus karta hai.

### 3.4 AI-assisted planning

AI coach, meal suggestions, food analysis, workout generation aur meal planning user ko next step decide karne mein help karte hain.

### 3.5 Collaboration support

Users projects create karke notes, files, members aur analytics manage kar sakte hain.

### 3.6 Public sharing

Project ko public karke shareable link ke through doosre logon ko project notes aur summary dikhayi ja sakti hai.

### 3.7 Safe wellness guidance

AI responses general wellness information ke roop mein provide kiye jaate hain. Platform medical diagnosis, treatment ya medication advice ke liye designed nahi hai.

---

## 4. Technology Stack

### Frontend

- React 18
- Vite
- JavaScript / JSX
- Framer Motion for animations
- Lucide React for icons
- CSS-based responsive design

### Backend

- Node.js
- Express
- JWT authentication
- bcryptjs password hashing
- CORS
- Multer for file uploads
- dotenv for environment configuration
- node-cron for scheduled digest support

### Persistence

- MongoDB persistence optional hai.
- `MONGO_URL` ya `MONGODB_URI` configure hone par persistence layer MongoDB use karti hai.
- MongoDB configure na hone par development in-memory store use hota hai.

### AI Providers

- Groq/OpenAI-compatible AI provider support
- Gemini endpoint support
- Provider key available na ho to local fallback responses available hain, jisse product basic AI features ke bina bhi usable rehta hai.

---

## 5. Project Structure

```text
Fitmate/
├── package.json
├── README.md
├── PROJECT_DOCUMENTATION.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── AuthView.jsx
│       │   ├── FeatureView.jsx
│       │   ├── AIHubView.jsx
│       │   ├── CollabSpaceView.jsx
│       │   ├── ConsolidatedPages.jsx
│       │   ├── LandingView.jsx
│       │   ├── PlanningViews.jsx
│       │   ├── WellnessViews.jsx
│       │   └── AdminManagementView.jsx
│       └── services/
│           └── api.js
└── server/
    ├── package.json
    ├── server.js
    ├── store.js
    ├── persistence.js
    ├── middleware/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   ├── rateLimit.js
    │   └── roleCheck.js
    ├── routes/
    │   ├── api.js
    │   └── auth.js
    ├── services/
    │   ├── aiService.js
    │   ├── gamification.js
    │   └── weeklyDigest.js
    └── utils/
        └── targets.js
```

---

## 6. Application Workflow

### 6.1 Landing page workflow

1. User landing page open karta hai.
2. Landing page par product purpose, wellness approach, programs, testimonials aur benefits display hote hain.
3. User `Get started` ya `Build your rhythm` button select kar sakta hai.
4. User sign-up/login screen par move hota hai.
5. Landing page sections mein navigation aur CTA actions available hain.

### 6.2 Authentication workflow

1. User name, email aur password enter karta hai.
2. Server input validate karta hai.
3. Password bcrypt ke through hash hota hai.
4. User record create hota hai.
5. Server JWT token generate karta hai.
6. Client token ko `localStorage` mein `fitmate_token` ke naam se store karta hai.
7. Har protected API request mein token `Authorization: Bearer <token>` header ke through send hota hai.
8. Login ke baad user dashboard ya onboarding flow par jaata hai.

### 6.3 Onboarding workflow

New user ke liye onboarding steps hain:

1. Main fitness goal
2. Daily activity level
3. Diet preference
4. Exercise experience
5. Age, height aur weight

Onboarding complete hone par:

- User profile update hoti hai.
- Default personalized targets calculate hote hain.
- `onboardingComplete` true hota hai.
- User dashboard par redirect hota hai.

### 6.4 Dashboard workflow

Dashboard user ka central control center hai. Yeh following information combine karta hai:

- Calories consumed aur target
- Water glasses aur water goal
- Steps
- Active workout minutes
- Sleep hours
- Daily goal percentage
- Daily wellness check-in
- XP aur consistency streak
- Weekly activity chart
- Recommended workouts
- AI coach shortcut

Dashboard summary server-side data ko combine karke calculate karti hai. Isme current-day meals, workouts, progress, hydration, sleep aur user targets use hote hain.

### 6.5 Navigation workflow

- Sidebar se main sections open hote hain.
- Topbar mein current workspace section show hota hai.
- `Back` button previous internal section par le jaata hai.
- Dashboard se `Back` landing page par return karta hai aur auth token clear karta hai.
- Auth screen se `Back to landing` landing page par return karta hai.
- Onboarding flow mein `Back to sign up` user ko sign-up screen par return karta hai.

---

## 7. Core Features

## 7.1 User Authentication

### Included functionality

- User registration
- User login
- Logout
- JWT token generation
- JWT token verification
- bcrypt password hashing
- Protected routes
- Role-based admin access
- Account status support: active/suspended

### Main files

- `server/routes/auth.js`
- `server/middleware/auth.js`
- `server/middleware/roleCheck.js`
- `client/src/components/AuthView.jsx`
- `client/src/services/api.js`

### Security logic

- Password plain text mein store nahi hota.
- Public user responses se `passwordHash` remove kiya jaata hai.
- Protected routes JWT ke bina access nahi hote.
- Admin routes ke liye `ADMIN` role required hota hai.
- API par rate limiting enabled hai.

---

## 7.2 Project Collaboration

Collab Space users ko fitness-related workspace create aur manage karne deta hai.

### Main functionality

- Project list
- New project creation
- Project selection
- Project description
- Members list
- Collaborator invite by email
- Public/private project state
- Shareable public link
- Project notes
- Project files
- Project analytics

### Collaboration logic

1. User project create karta hai.
2. Creator automatically owner member ban jaata hai.
3. Existing FitMate user ko email ke through invite kiya ja sakta hai.
4. Project members project access determine karte hain.
5. Notes aur files project ID ke saath associate hote hain.
6. Project activity create hone par contribution analytics update hoti hai.

### Main files

- `client/src/components/CollabSpaceView.jsx`
- `server/routes/api.js`
- `server/store.js`

---

## 7.3 Markdown Notes with AI

Users project ke andar Markdown notes create kar sakte hain.

### Note functionality

- Note title
- Markdown content
- Save note
- Edit note
- Delete note
- Saved notes list
- AI improvement suggestion

### AI note workflow

1. User Markdown note likhta hai.
2. User `Improve with AI` select karta hai.
3. Client note content ko `/api/ai/explain-note` par send karta hai.
4. Server user context ke saath coach service call karta hai.
5. AI suggestion return hoti hai.
6. User suggestion ko review karke note save kar sakta hai.

---

## 7.4 File Upload and Preview

Collab projects aur file workspace mein files upload ki ja sakti hain.

### Supported behavior

- File picker upload
- Drag and drop upload
- Maximum file size: 5 MB
- Text, Markdown, JSON, JavaScript, JSX, TypeScript, CSS aur HTML preview
- File metadata display
- File delete
- Code/file explanation through AI

### File workflow

1. User file select ya drop karta hai.
2. Multer file ko memory mein receive karta hai.
3. File size limit validate hoti hai.
4. Text-like files ka preview UTF-8 content se create hota hai.
5. File project ke saath save hoti hai.
6. Upload activity contribution analytics mein add hoti hai.

---

## 7.5 Contribution Analytics

Project analytics basic collaboration activity ko measure karti hai.

### Tracked values

- Total contributions
- Total notes
- Total files
- Total members
- Contributions by member

### Contribution events

- Note created
- File uploaded
- Other project activity records

Analytics project ID ke basis par calculate hoti hai, isliye har project ka data separate rehta hai.

---

## 7.6 Public Shareable Project Page

Project owner project ko public bana sakta hai.

### Workflow

1. User project open karta hai.
2. `Share publicly` select karta hai.
3. Project `isPublic` true hota hai.
4. Server project ka share token maintain karta hai.
5. Shareable URL `/?shared=<share-token>` format mein use hota hai.
6. Public page project name, description, notes, members aur basic analytics display karti hai.
7. Private project public endpoint par accessible nahi hota.

### Privacy logic

- Public response mein sensitive file content remove kiya jaata hai.
- Password data kabhi public response mein return nahi hota.
- Project access membership aur public state se control hota hai.

---

## 7.7 AI and Gemini Endpoints

AI Hub ke andar multiple AI tools available hain.

### AI Coach

- User ke profile aur recent activity ko context ke roop mein use karta hai.
- Workout, meal, sleep aur consistency questions answer karta hai.
- General wellness disclaimer include karta hai.

### Food Analyzer

- Written meal description analyze karta hai.
- Approximate calories, protein, carbs aur fat provide karta hai.
- Image upload support karta hai.
- Image nutrition ko approximate batata hai.
- Provider unavailable hone par manual description/local food matching fallback use karta hai.

### Workout Generator

- Goal, experience, time aur equipment ke basis par workout suggestion deta hai.
- Warm-up, exercises, sets, reps, duration aur cool-down return karta hai.

### Meal Planner

- 1 se 7 days ke meal plans generate karta hai.
- Breakfast, lunch, snack aur dinner structure return karta hai.

### Meal Suggestion

- User goal, diet preference aur available foods ke basis par meal suggestions deta hai.

### Gemini endpoint

- Endpoint: `POST /api/ai/gemini`
- Gemini key available ho to Gemini provider call hota hai.
- Key available na ho to built-in coach fallback response use hota hai.
- Response general wellness information ke form mein hota hai.

### Provider configuration

- `GEMINI_API_KEY` Gemini endpoint ke liye
- `GEMINI_MODEL` optional model override
- `GROQ_API_KEY` Groq/OpenAI-compatible AI flows ke liye
- `GROQ_MODEL` optional model override
- `OPENAI_API_KEY` compatible fallback provider ke liye
- `OPENAI_MODEL` optional model override

---

## 8. Wellness Tracking Features

### Workouts

- Workout list
- New workout entry
- Exercise list
- Workout completion
- Duration tracking
- Completion se XP aur achievements update ho sakte hain

### Nutrition

- Manual meal entry
- Natural language meal logging
- Food analyzer
- Approximate calorie tracking
- Meal history

### Hydration

- Water amount logging
- Water goal
- Hydration update
- Goal complete hone par achievement/XP logic

### Sleep

- Bedtime
- Wake time
- Total hours
- Sleep quality
- Sleep notes

### Wellness check-in

User daily values submit kar sakta hai:

- Energy
- Mood
- Stress
- Sleep quality
- Activity level

Server values ko normalize karta hai aur supportive summary generate karta hai.

### Progress

- Weight
- Steps
- Water glasses
- Sleep hours
- Workout minutes
- 7, 30 aur 90 day summaries
- Weekly journey view
- Trend data

---

## 9. Gamification Logic

FitMate consistency ko encourage karne ke liye gamification use karta hai.

### Included elements

- XP
- Levels
- XP progress bar
- Daily streak
- Longest streak
- Badges
- Challenges
- Achievement collection

### XP events

- Workout complete
- Meal logged
- Daily check-in
- Water goal complete
- Challenge join ya progress

Duplicate achievements ko avoid karne ke liye server existing achievement title/user combination check karta hai.

---

## 10. Admin Features

Admin role ke liye protected management tools available hain.

### Admin capabilities

- Dashboard totals
- User list
- User active/suspended status
- AI usage analytics
- Exercise management
- Food management
- Workout plan management
- Challenge management
- Announcements
- Content management

Admin routes `requireAuth` aur `requireRole('ADMIN')` middleware se protected hain.

---

## 11. Data Flow

```text
User action
    ↓
React component
    ↓
client/src/services/api.js
    ↓
HTTP request with JWT
    ↓
Express route
    ↓
Auth / role / validation middleware
    ↓
Business logic and AI/persistence service
    ↓
Store or MongoDB
    ↓
JSON response
    ↓
React state update
    ↓
Updated visible UI
```

### Example: Meal logging flow

```text
User writes meal
    ↓
Food Analyzer component
    ↓
POST /api/ai/food-analyze
    ↓
AI provider or local food matching fallback
    ↓
Approximate nutrition response
    ↓
User reviews result
    ↓
Meal saved through /api/meals or /api/meals/log-text
    ↓
Dashboard calories and meal count update
```

### Example: Collaboration flow

```text
Create project
    ↓
Project record created
    ↓
Owner membership created
    ↓
User adds notes/files/members
    ↓
Project activity events created
    ↓
Analytics recalculated
    ↓
Project can be made public
    ↓
Public share page displays safe project data
```

---

## 12. API Groups

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`

### User and dashboard

- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `GET /api/dashboard/summary`

### Fitness and wellness

- `/api/workouts`
- `/api/meals`
- `/api/progress`
- `/api/hydration`
- `/api/sleep`
- `/api/wellness/check-ins`
- `/api/challenges`
- `/api/achievements`
- `/api/gamification`

### AI

- `POST /api/ai/chat`
- `POST /api/ai/gemini`
- `POST /api/ai/food-analyze`
- `POST /api/ai/meal-suggestion`
- `POST /api/ai/workout-generator`
- `POST /api/ai/meal-plan`
- `POST /api/ai/explain-note`

### Collaboration

- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/:id`
- `POST /api/projects/:id/members`
- `GET /api/projects/:id/notes`
- `POST /api/projects/:id/notes`
- `PATCH /api/projects/:id/notes/:noteId`
- `DELETE /api/projects/:id/notes/:noteId`
- `POST /api/projects/:id/files`
- `GET /api/projects/:id/files`
- `DELETE /api/projects/:id/files/:fileId`
- `GET /api/projects/:id/analytics`
- `GET /api/public/projects/:id`

### Health

- `GET /api/health`

---

## 13. Local Setup

### Install all dependencies

```bash
npm install
npm run install:all
```

### Start development mode

```bash
npm run dev
```

Expected URLs:

- Client: `http://localhost:5173`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

### Build frontend

```bash
npm run build --prefix client
```

### Optional environment variables

Create `server/.env` when external services are needed:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-value
MONGO_URL=your-mongodb-connection-string
GROQ_API_KEY=your-groq-key
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash
```

Never commit real API keys or production secrets.

---

## 14. Demo Accounts

### User account

```text
Email: jamie@example.com
Password: secret123
```

### Admin account

```text
Email: admin@fitmate.com
Password: admin123
```

These development demo accounts should be replaced or disabled in a production deployment.

---

## 15. Current Verification Status

The current project was checked with the following validations:

- Frontend responds successfully on the Vite URL.
- API health endpoint returns `status: ok`.
- Client production build completes successfully.
- Authentication flow has been exercised.
- Dashboard sections render with visible text.
- AI Coach interaction has been exercised.
- Food Analyzer input and result areas render visibly.
- Collab Space project, analytics and collaboration content render visibly.
- Achievements and Challenges content render visibly.
- Public project route is implemented.
- Back navigation works between authenticated sections and landing/auth flows.
- Responsive/mobile dashboard navigation was checked.

---

## 16. Important Product Boundaries

FitMate is a general wellness and fitness support application. It should not be presented as a medical diagnosis, treatment or emergency-care system.

AI-generated nutrition and workout information is approximate and should be reviewed by the user. The application includes wellness disclaimers in AI responses.

For production use, the following should be added or strengthened:

- Production-grade secret management
- Stronger validation and audit logging
- Persistent database backups
- Email verification
- Password reset delivery service
- Automated test suite
- File virus scanning
- Object storage for large files
- Cloudinary-backed project file storage is configured for uploaded project files. File metadata includes the secure URL and Cloudinary public ID; deleting a file also deletes its remote asset.
- Production monitoring and alerting
- Privacy policy and terms of service

---

## 17. Summary

FitMate ek complete full-stack wellness workspace hai jo authentication, personalized onboarding, daily health tracking, AI support, collaboration, file management, public sharing, analytics aur gamification ko ek single platform mein combine karta hai.

Iska central workflow simple hai:

```text
Create account
    → Personalize profile
    → Set daily targets
    → Track activities
    → Get AI guidance
    → See progress
    → Collaborate and share
    → Build consistency
```

Project ka main value yeh hai ki user ko fitness aur wellness ke multiple disconnected tasks ke liye alag tools ki zaroorat nahi padti. FitMate un workflows ko ek readable, interactive aur extensible application mein combine karta hai.
