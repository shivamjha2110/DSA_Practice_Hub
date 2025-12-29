# AlgoBloom (MERN) — JWT Auth + MongoDB (No Clerk)

This version removes **Clerk** and uses **JWT (Login/Signup/Logout)** with **MongoDB** (pure MERN).

## 1) Local setup (Windows/Mac/Linux)

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string (recommended)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env and set MONGO_URI + JWT_SECRET
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## 2) Excel se questions import (sheet cards + topic distribution)

1. Put your workbook anywhere.
   - This repo already includes a sample workbook at `workbook/Crack The Coding Interview.xlsx`.
2. In `backend/.env`, set:

```env
SEED_EXCEL_PATH=../workbook/Crack The Coding Interview.xlsx
```

3. Run:
```bash
cd backend
npm run seed
```

**Note:** If you want to clear old data and seed fresh:
```bash
CLEAR_DB=true npm run seed
```

The seeder automatically:
- Creates **Sheet Cards** (one card per Excel sheet)
- Creates **Topics** (from the sheet's Topic column, or the sheet name if Topic column is missing)
- Creates **Questions** (unique by link)
- Handles duplicates safely (same question in multiple sheets/topics)

## 3) Key features
- ✅ Topic-wise distribution (inside every sheet you can still filter/search)
- ✅ Solved toggle (updates counts everywhere)
- ✅ Revisit toggle + Revisit list
- ✅ Dashboard analytics (trend + difficulty + 90-day heatmap)
- ✅ Dark/Light mode (dropdowns visible in dark mode too)
- ✅ Optional LeetCode sync + profile avatar (if you enter your username)

## 4) Deploy on Vercel (Frontend + Backend in SAME project)

### Step A — Create a Vercel project
- Import this repository/folder in Vercel.
- Vercel will detect `vercel.json` and deploy:
  - Frontend: static build (Vite)
  - Backend: serverless function at `/api/*`

### Step B — Set environment variables in Vercel
Add these in **Vercel → Project → Settings → Environment Variables**:

**Backend (Production):**
- `MONGO_URI` = your MongoDB Atlas URI
- `JWT_SECRET` = long random string
- `CLIENT_URL` = your Vercel frontend domain (example: `https://your-app.vercel.app`)

**Frontend (Production):**
- (Optional) `VITE_API_URL` = leave EMPTY to use same-origin `/api`
  - If you deploy backend separately, then set `VITE_API_URL` to backend URL.

### Step C — Deploy
- Click **Deploy**

## 5) Common errors

### "GET /api/topics 401"
You are not logged in or token is missing. Login again.

### "MongoDB connected but seed not working"
Check `SEED_EXCEL_PATH` (path must be relative to **backend** folder).

---
Made for interview practice.
