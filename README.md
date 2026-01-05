## Overview
Attentumn Study Focus is a two-part app for planning focus sessions, tracking metrics, and reviewing reports. The backend is an Express + Prisma API (SQLite by default) and the frontend is a Vite + React UI.

## Prerequisites
- Node.js 18+ and npm

## Backend (API)
1) `cd backend`
2) Copy `.env` if missing (default `DATABASE_URL="file:./dev.db"` for SQLite).
3) Install deps: `npm install`
4) Create/update the database: `npm run prisma:migrate`
5) Start the dev server on http://localhost:4000: `npm run dev`
   - Prod build: `npm run build && npm start`

## Frontend (Web)
1) `cd frontend`
2) (Optional) Create `.env.local` with `VITE_API_BASE_URL=http://localhost:4000` (defaults to localhost:4000)
3) Install deps: `npm install`
4) Start Vite on http://localhost:8080: `npm run dev`
   - Build: `npm run build`

## Notes
- Run backend and frontend in separate terminals.
- Adjust `VITE_API_BASE_URL` if your API runs on a different host/port.

## License
MIT License

Copyright (c) 2024 Attentum Study Focus contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
