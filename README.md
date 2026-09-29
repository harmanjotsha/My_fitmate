# FitMate

FitMate is a full-stack fitness and wellness companion with a React/Vite client and Express/MongoDB server.

## Structure

- `client/` - React + Vite dashboard UI
- `server/` - Express API foundation and route modules

## Run locally

```bash
npm install
npm run install:all
npm start
```

The client runs on `http://localhost:5173` and the API runs on `http://localhost:4000`.

Run `npm start` from the repository root to start both the backend and frontend.
The server start guard reuses an already healthy FitMate API instead of creating
an `EADDRINUSE` crash when port `4000` is already in use.

## Build phases

The current prototype includes the responsive landing page, JWT/bcrypt auth, profile editing, workouts, meals, progress logging, AI coach, exercise library, challenges, file upload/preview, and a role-protected admin summary.

MongoDB persistence is optional. Add `MONGO_URL` to `server/.env` to enable it; `MONGODB_URI` is also supported for compatibility. Without either variable the app uses a development in-memory fallback. Add `GROQ_API_KEY` to `server/.env` to enable Groq-powered server-side AI responses. The default model is `openai/gpt-oss-120b`; override it with `GROQ_MODEL` when needed.

Project file uploads are stored in Cloudinary when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are configured in `server/.env`. The project store keeps the Cloudinary secure URL and public ID, and deleting a project file also removes its Cloudinary asset. Without Cloudinary configuration, upload requests return a clear configuration error instead of silently storing files locally.

Demo accounts:

- User: `jamie@example.com` / `secret123`
- Admin: `admin@fitmate.com` / `admin123`
