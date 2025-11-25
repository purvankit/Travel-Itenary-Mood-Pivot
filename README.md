
# Travel-Itinerary Mood Pivot

Travel-Itinerary Mood Pivot is a full‑stack web app that lets groups plan a trip together and continuously **pivot the itinerary based on everyone’s mood** in real time.

- **Frontend:** React + Vite + TypeScript + TailwindCSS  
- **Backend:** Node.js + Express + MongoDB (Mongoose)  
- **Key features:** Shared sessions, live itinerary, mood logging, automatic replanning suggestions, simple mood analytics (frequency chart + logs).

---

## Table of Contents

- [Features](#features)  
- [Architecture Overview](#architecture-overview)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Clone and install](#clone-and-install)  
  - [Backend configuration](#backend-configuration)  
  - [Frontend configuration](#frontend-configuration)  
- [Running the App](#running-the-app)  
  - [Run backend](#run-backend)  
  - [Run frontend](#run-frontend)  
- [Core Flows](#core-flows)  
  - [Create a session](#create-a-session)  
  - [Join and view itinerary](#join-and-view-itinerary)  
  - [Log moods](#log-moods)  
  - [Replanning](#replanning)  
  - [Mood charts](#mood-charts)  
- [API Reference (Brief)](#api-reference-brief)  
- [Project Structure](#project-structure)  
- [Development Notes](#development-notes)  
- [Troubleshooting](#troubleshooting)  
- [License](#license)

---

## Features

- **Session-based itineraries**
  - Create a shared session with a trip name, organizer, participants, and planned blocks.
  - Each session has its own itinerary and mood history.

- **Live itinerary view**
  - See the current plan broken down into time blocks/activities.
  - Updates when replanning proposals are applied.

- **Mood logging**
  - Participants can submit moods during the trip (e.g. `relaxed`, `energetic`, `tired`, `sick`, `romantic`, `cultural`, `adventurous`).
  - Moods are stored per participant and session with timestamps.

- **Replanning engine**
  - Backend tracks latest moods for each participant.
  - When too many people are `tired`/`sick`, it can propose alternative activities via `/api/replan/propose`.

- **Mood analytics**
  - Aggregate **Mood Frequency** bar chart showing how often each mood has been selected.
  - Recent mood **logs** table below the chart.

---

## Architecture Overview

High‑level:

- **Frontend (`/frontend`)**
  - React SPA (Vite) with React Router.
  - Pages such as `Home`, `CreateSession`, `Dashboard`, `MoodCharts`.
  - Uses REST calls to the backend via a dev‑time proxy.

- **Backend (`/backend`)**
  - Express server ([src/server.js](cci:7://file:///c:/Users/Purvankit/Documents/GitHub/Travel-Itenary-Mood-Pivot/backend/src/server.js:0:0-0:0)), using:
    - `mongoose` for MongoDB.
    - `cors` + `express.json` for CORS + JSON body parsing.
  - Routes:
    - `/api/sessions` — manage sessions.
    - `/api/itinerary` — retrieve itineraries.
    - `/api/mood` — log and inspect mood data.
    - `/api/replan` — propose itinerary changes.

- **Database**
  - MongoDB (local or cloud, e.g. Atlas).
  - Models include:
    - `MoodLog` — `{ sessionId, participantId, mood, timestamp }`
    - `Session` — session-level metadata and itinerary (not listed here in full).

---

## Tech Stack

- **Frontend**
  - React 19 (with `@vitejs/plugin-react`)
  - TypeScript
  - React Router DOM
  - React Query (`@tanstack/react-query`)
  - TailwindCSS
  - Framer Motion
  - Leaflet + React Leaflet
  - Lucide Icons, React Hot Toast

- **Backend**
  - Node.js
  - Express 5
  - Mongoose 9
  - CORS, dotenv, body‑parser
  - (Optional) Socket.io (scaffolded, not required to run)

---

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended, e.g. 18+)
- **npm** (comes with Node)
- **MongoDB** accessible via connection string (local or Atlas)

You will need a MongoDB URI, for example:

```text
mongodb://localhost:27017/mood-pivot
```

or an Atlas URI like:

```text
mongodb+srv://<user>:<password>@<cluster>/mood-pivot?retryWrites=true&w=majority
```

---

### Clone and install

```bash
git clone <YOUR_REPO_URL> Travel-Itinerary-Mood-Pivot
cd Travel-Itinerary-Mood-Pivot
```

Install dependencies for backend and frontend separately:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Backend configuration

Create a `.env` file in `backend/`:

```bash
cd backend
cp .env.example .env  # if present; otherwise create manually
```

In `.env`, set at least:

```env
MONGO_URI=mongodb://localhost:27017/mood-pivot
PORT=4000
```

- `MONGO_URI` — your MongoDB connection string.  
- `PORT` — backend HTTP port (the code defaults to 4000 if not set).

The backend entrypoint is [src/server.js](cci:7://file:///c:/Users/Purvankit/Documents/GitHub/Travel-Itenary-Mood-Pivot/backend/src/server.js:0:0-0:0), which:

- Connects to MongoDB with `mongoose.connect(process.env.MONGO_URI)`.
- Mounts routes at `/api/sessions`, `/api/mood`, `/api/itinerary`, `/api/replan`.
- Serves `/health` for a quick health check.

---

### Frontend configuration

Inside `frontend/`:

- [vite.config.ts](cci:7://file:///c:/Users/Purvankit/Documents/GitHub/Travel-Itenary-Mood-Pivot/frontend/vite.config.ts:0:0-0:0) is configured to proxy API calls to the backend during development:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },
},
```

So:

- `fetch('/api/...')` from the browser is forwarded to `http://localhost:4000/api/...`.

You can optionally add a `.env` or `.env.local` file if you later introduce custom Vite env vars (none are strictly required for the current setup).

---

## Running the App

### Run backend

From the repo root:

```bash
cd backend

# First time
npm install

# Development mode (with nodemon reloads)
npm run dev

# or production style
npm start
```

You should see logs like:

```text
MongoDB connected
Server running on 4000
```

Health check:

- Visit `http://localhost:4000/health` — you should get `{"ok":true,...}`.

### Run frontend

In another terminal:

```bash
cd frontend

# First time
npm install

# Dev server
npm run dev
```

Vite will start (by default) on something like `http://localhost:5173`.

Open that URL in your browser.

---

## Core Flows

### Create a session

1. Go to the **Create Session** page (`/create`).
2. Fill in:
   - Trip name
   - Organizer ID
   - Participants
   - Initial itinerary blocks (time, place, type, etc.).
3. Submit — backend creates a new session via `POST /api/sessions/create`.

### Join and view itinerary

- Use the **Dashboard** or **Session** page to:
  - Fetch session info via `GET /api/sessions/:id`.
  - Fetch itinerary via `GET /api/itinerary/:sessionId`.
- The frontend displays activities by time block.

### Log moods

Participants periodically log how they feel:

- Logs are sent to `POST /api/mood/update`:
  - Body: `{ sessionId, participantId, mood }`
- Backend stores a `MoodLog` document and returns derived mood state.

### Replanning

When too many participants are `tired` or `sick`, the frontend can call:

- `POST /api/replan/propose` with `{ sessionId, affectedBlockId }`.

The backend:

- Looks at session and mood data.
- Returns candidate alternative itinerary entries for affected segments.

Frontend shows proposals, and the user can accept a new plan.

### Mood charts

The **Mood Charts** page (`/mood-charts`):

- Fetches historical mood logs from `GET /api/mood/logs`.
- Computes:
  - Aggregate **count per mood** (e.g. how many times `tired` was selected).
- Renders:
  - A **Mood Frequency** bar chart (one bar per mood with its count).
  - A **Logs** section listing recent mood logs with timestamps and labels.

---

## API Reference (Brief)

From [backend/docs/API.md](cci:7://file:///c:/Users/Purvankit/Documents/GitHub/Travel-Itenary-Mood-Pivot/backend/docs/API.md:0:0-0:0) (simplified):

- `POST /api/sessions/create`  
  - Create a new session.  
  - Body: `{ tripName, organizerId, participants[], itinerary[] }`  
  - Returns: `{ ok: true, session }`

- `GET /api/sessions/:id`  
  - Get a single session object.

- `GET /api/itinerary/:sessionId`  
  - Returns itinerary for a session.

- `POST /api/mood/update`  
  - Logs a mood event.  
  - Body: `{ sessionId, participantId, mood }`  
  - Returns: `{ ok: true, log, moodState: { total, bad, ratio } }` or error.

- `GET /api/mood/logs`  
  - Returns mood logs sorted by timestamp.  
  - Response: `{ ok: true, logs: MoodLog[] }`.

- `POST /api/replan/propose`  
  - Body: `{ sessionId, affectedBlockId }`  
  - Returns candidate replacement itinerary entries.

---

## Troubleshooting

- **Frontend can’t reach API / JSON parse errors**
  - Ensure backend is running on the port configured in `.env` (default 4000).
  - Ensure Vite dev server is running (`npm run dev` in `frontend`).
  - Confirm [vite.config.ts](cci:7://file:///c:/Users/Purvankit/Documents/GitHub/Travel-Itenary-Mood-Pivot/frontend/vite.config.ts:0:0-0:0) has the `/api` proxy to `http://localhost:4000`.

- **MongoDB connection errors**
  - Check `MONGO_URI` in `backend/.env`.
  - Ensure MongoDB instance is running and network‑accessible.

- **Port conflicts**
  - If port 4000 or 5173 are in use:
    - Change `PORT` in `backend/.env` and match the `target` in [frontend/vite.config.ts](cci:7://file:///c:/Users/Purvankit/Documents/GitHub/Travel-Itenary-Mood-Pivot/frontend/vite.config.ts:0:0-0:0).
    - Or free up the ports.
---