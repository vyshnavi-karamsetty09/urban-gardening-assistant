# Urban Gardening Assistant — Garden Guide

Urban Gardening Assistant (Garden Guide) is a React + Vite application for planning and maintaining small urban gardens. The current version combines the existing frontend experience with a Node.js/Express REST API and MongoDB persistence.

## Technology Stack

- **Frontend:** React, Vite, JavaScript, HTML, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT access tokens + bcrypt password hashing
- **Optional AI:** OpenAI-compatible chat-completions API through the backend

## Main Features

- Login and signup with backend authentication
- Persistent user profile and environment settings
- My Garden with add/remove/update persistence
- Smart plant recommendations using pincode-derived climate/sunlight plus space, soil, and watering preferences
- Plant Library
- Care Scheduler with persistent tasks
- Disease Detection with curated symptom rules and optional AI-assisted analysis
- AI Gardening Assistant with optional AI API integration and local fallback
- Settings, notifications/preferences, and data export
- Role-protected Admin Console for catalog management and report review
- Responsive sidebar/topbar/mobile navigation

## Architecture

```text
React + Vite
     |
     | REST / JSON
     v
Node.js + Express
     |
     v
MongoDB
```

The frontend API helper is `src/api.js`. Backend routes live under `server/routes/`, database models under `server/models/`, and curated plant/environment/disease datasets under `server/data/`.

## Authentication

Normal account creation and login are handled by the Express backend. Passwords are hashed with bcrypt and are never stored in plain text. User-specific endpoints require a valid bearer token.

A newly registered account starts with **0 plants, 0 care tasks, no demo notification inbox, and no configured environment**. Starter content is reserved for the explicit demo-account flow. Browser workspace caches are namespaced by account so logging out does not mix one user's garden with another user's data.

An optional **Use Demo Account** button is available for quick demonstrations. It is a local demo account flow, not Google OAuth.

## MongoDB Setup

You can use either a local MongoDB instance or a MongoDB Atlas database.

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your MongoDB connection string.
3. Set a long random `JWT_SECRET`.
4. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the admin seed.
5. Optionally configure `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` for open-ended AI features. For Gemini, set `GEMINI_API_KEY`; the server uses Google's OpenAI-compatible endpoint automatically unless you override the base URL/model.

## Installation

From the project root:

```bash
npm install
```

This will install both frontend and backend dependencies from `package.json`.

## Running the Project

Start the backend in one terminal:

```bash
npm run server
```

Or during development:

```bash
npm run server:dev
```

Start the React frontend in a second terminal:

```bash
npm run dev
```

The frontend defaults to `http://localhost:5173` and the backend defaults to `http://localhost:5000`.

You can override the frontend API base URL with:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

## Seed the Database

After configuring MongoDB:

```bash
npm run seed
```

The seed command loads the curated plant catalog and, when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, creates or updates an administrator account.

## API Overview

| Area | Endpoint examples | Purpose |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | Account creation and login |
| Profile | `GET /api/auth/me`, `PUT /api/auth/profile` | User profile |
| Environment | `GET/PUT /api/environment` | User environment settings |
| Garden | `GET/POST/PUT/DELETE /api/garden` | User garden plants |
| Tasks | `GET/POST/PUT/DELETE /api/tasks` | Care schedule |
| Plants | `GET /api/plants` | Plant catalog |
| Recommendations | `POST /api/recommendations/analyze-location`, `POST /api/recommendations` | Pincode profile + compatibility matching |
| Disease | `POST /api/disease/analyze`, `GET /api/disease/history` | Disease/symptom analysis |
| Assistant | `POST /api/assistant/chat` | Gardening assistant |
| Admin | `/api/admin/*` | Protected catalog/user/report management |
| Health | `GET /api/health` | Backend health check |

## Recommendation Logic

Personalized recommendations are available only after the user explicitly saves a complete environment profile. An incomplete or unconfigured profile returns no personalized matches rather than silently using invented defaults. The recommendation flow accepts a six-digit Indian pincode plus user-selected growing conditions. The backend maps the pincode to a curated regional profile or zone estimate, deriving baseline climate, sunlight, temperature, and humidity. It then combines those values with available space, soil/growing medium, and watering capacity to score plant compatibility.

The project uses a curated compatibility algorithm by default. It should not be described as a trained ML recommendation model unless one is added separately.

## Disease Detection

The disease module contains a curated disease/symptom knowledge base. When an AI provider is configured, the backend can send symptoms and an uploaded image data URL to an OpenAI-compatible vision-capable model for an AI-assisted assessment. When AI is unavailable, the application uses the local symptom classifier as a fallback.

The result is an assessment, not a guaranteed biological diagnosis.

## AI Gardening Assistant

When `AI_API_KEY` is configured, assistant requests are sent from React to the Express backend and then to the configured AI service. The API key is never exposed in frontend code. When the AI provider is unavailable, a local gardening response fallback keeps the application usable.

## Admin Console

Administrator routes are protected by authentication and role checks. The console can:

- review registered users
- review disease reports
- list plant catalog entries
- add plants
- edit plants
- delete plants

## Environment Variables

See `.env.example` for all variables. Never commit a real `.env` file or API keys.

## Quality Checks

Run:

```bash
npm run audit
npm run build
npm run lint
```

`npm run audit` checks the high-risk product rules in source code: new-account emptiness, user-scoped browser storage, environment/recommendation guards, truthful dashboard/disease copy, removal of starter-task reset controls, and production API defaults.

The backend source can also be syntax-checked with:

```bash
for f in server/**/*.js server/*.js; do node --check "$f"; done
```

## Limitations

- Pincode environment analysis uses a curated mapping/zone estimate rather than live weather telemetry.
- AI features require a compatible external AI provider and API key to use the AI path; local fallbacks remain available.
- Disease image analysis is optional and depends on the configured model/provider supporting image input.
- The app is deployment-ready in structure, but a production deployment requires setting secure environment variables and a reachable MongoDB instance.

## Future Scope

- Live weather integration
- Dedicated trained plant-disease model
- More detailed geospatial climate data
- Scheduled notification delivery
- Production OAuth providers
- Expanded admin analytics
