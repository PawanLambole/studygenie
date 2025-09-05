

# studygenie

A small Vite + React + TypeScript app for study tools (flashcards, quizzes, AI tutor).

## Local setup

Prerequisites:
- Node.js (18+ recommended)
- Git

Install dependencies:

```powershell
npm install
```

Run dev server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

## Environment variables

This project uses a Gemini API key. Do NOT commit secrets to the repo. Create environment variables in Vercel or locally in a `.env.local` file (gitignored).

Example `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
```

In Vercel: go to Project Settings → Environment Variables and add `GEMINI_API_KEY` for the appropriate environments.

## Vercel deployment

1. Push your repo to GitHub (already done).
2. Import the project into Vercel (New Project → Import from GitHub).
3. Vercel should detect a Vite app. If it doesn't, set:
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Add `GEMINI_API_KEY` under Project Settings → Environment Variables.
5. Deploy.

## Notes
- `node_modules` and `.env.local` are gitignored. If you see permission errors on Vercel, ensure `node_modules` is not committed.
- If you want me to add a Vercel `vercel.json` or GitHub Actions workflow, tell me which you prefer.

---

Updated on 2025-09-05

