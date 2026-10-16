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

## Production deployment

Build and start the single-origin application with:

```bash
npm run install:all
npm run build
NODE_ENV=production npm run start:prod
```

Set these environment variables in the hosting provider (do not commit `.env`):

- `NODE_ENV=production`
- `PORT` (usually provided by the host)
- `JWT_SECRET` (generate with `openssl rand -hex 32`; never reuse the example value)
- `MONGO_URL` (a production MongoDB connection string with network access configured)
- `CLIENT_URL` (optional; the exact HTTPS origin, with no trailing slash; Render's `RENDER_EXTERNAL_URL` is used when unset)
- `TRUST_PROXY=true` when the host terminates HTTPS through one trusted reverse proxy

The API serves the built client and `/api` from the same origin. Production startup
fails if required configuration, MongoDB, or the client build is missing. Demo
accounts and personal sample data are development-only. AI requires a provider key;
file uploads require Cloudinary. Password-reset email is not implemented and is
explicitly unavailable.

**Launch limitation:** the current persistence adapter stores the entire application
store in one MongoDB document and keeps a process-local in-memory copy. This is a
prototype persistence design, not suitable for multiple server instances or growing
production traffic. Before accepting real users or health data, migrate data to the
existing per-entity MongoDB models (or another transactional database), add durable
integration tests/backups, and complete a privacy/security review. The checks in
`npm test` are focused configuration and rate-limit tests, not a full end-to-end suite.

### Deploying on Render (manual separate services)

Deploy the backend and frontend as two separate Render services. Do not use the
Blueprint for this flow. Free services can spin down after inactivity.

Create a MongoDB Atlas cluster and database user first. In Atlas, allow Render
to connect through Network Access, then use a URI such as
`mongodb+srv://<database-user>:<url-encoded-password>@<cluster-host>/fitmate?retryWrites=true&w=majority`.
The database user's password is not the same as the Atlas account password.
Keep credentials out of Git.

For the backend Web Service, use:

| Render field | Value |
| --- | --- |
| Repository | `https://github.com/harmanjotsha/My_fitmate.git` |
| Branch | `main` |
| Root Directory | `server` |
| Runtime | `Node` |
| Build Command | `npm ci` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/api/health` |
| Plan | `Free` (or choose a paid plan to avoid free-instance spin-down) |

Set these environment variables in the service:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `true` |
| `SERVE_CLIENT` | `false` |
| `JWT_SECRET` | Generate a unique secret with `openssl rand -hex 32` (keep it private) |
| `MONGO_URL` | Your MongoDB Atlas connection string |
| `CLIENT_URL` | The exact frontend Static Site URL, for example `https://fitmate-frontend.onrender.com` |

`PORT` is supplied by Render and should not be set manually. `GROQ_API_KEY`
(optionally `GROQ_API_TWO`) enables AI features; the `CLOUDINARY_*` credentials
enable uploads. These are optional and can be added later in Render's
Environment settings. For a custom domain, update `CLIENT_URL` to that domain's
exact HTTPS origin if cross-origin browser access is needed.

For the frontend Static Site, use:

| Render field | Value |
| --- | --- |
| Repository | `https://github.com/harmanjotsha/My_fitmate.git` |
| Branch | `main` |
| Root Directory | `client` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Plan | `Free` |

Add this frontend build environment variable:

| Key | Value |
| --- | --- |
| `VITE_API_URL` | `https://fitmate-api.onrender.com/api` |

After both services are created, replace the example hostnames above with the
actual Render URLs if Render adds a suffix. `VITE_API_URL` is a build-time variable, so trigger a new frontend deploy after
changing it. `CLIENT_URL` must match the frontend URL exactly, without a
trailing slash. Add a Static Site rewrite from `/*` to `/index.html` so
client-side routes work on refresh. The backend root URL is not the frontend;
use `/api/health` to test the API.

## Build phases

The current prototype includes the responsive landing page, JWT/bcrypt auth, profile editing, workouts, meals, progress logging, AI coach, exercise library, challenges, file upload/preview, and a role-protected admin summary.

MongoDB persistence is optional in development. Add `MONGO_URL` to `server/.env` to enable it; `MONGODB_URI` is also supported for compatibility. Without either variable the app uses a development in-memory fallback. Production requires MongoDB. Add `GROQ_API_KEY` to `server/.env` to enable Groq-powered server-side AI responses. The default model is `openai/gpt-oss-120b`; override it with `GROQ_MODEL` when needed.

Project file uploads are stored in Cloudinary when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are configured in `server/.env`. The project store keeps the Cloudinary secure URL and public ID, and deleting a project file also removes its Cloudinary asset. Without Cloudinary configuration, upload requests return a clear configuration error instead of silently storing files locally.

Local development demo accounts (disabled in production):

- User: `jamie@example.com` / `secret123`
- Admin: `admin@fitmate.com` / `admin123`
