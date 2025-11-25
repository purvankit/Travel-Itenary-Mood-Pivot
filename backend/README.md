# Mood-Pivot Backend

Backend API for the Mood-Pivot Live Itinerary system.

## Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. Install deps:
   ```bash
   npm install
   # optional for sockets:
   npm i socket.io
npm run seed
npm run dev