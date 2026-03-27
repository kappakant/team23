# PumpPal Frontend

## ⚠️ Read This Before You Start

This project uses **Vite + React + TypeScript**. Make sure you follow these steps exactly.

---

## Requirements

Make sure you have these installed before cloning:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Git](https://git-scm.com/)

Check your versions by running:
```bash
node --version
npm --version
```

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/kappakant/team23.git
cd team23
```

### 2. Install dependencies
```bash
npm install
```
> ⚠️ Never commit `node_modules` to GitHub. It is in `.gitignore` for a reason.

### 3. Run the app
```bash
npm run dev
```

The app will run at **http://localhost:5173**

---

## Folder Structure

```
src/
├── pages/          ← All page components (Home, Login, Profile, etc.)
├── services/       ← API calls (api.ts, firebase.ts)
├── components/     ← Reusable components (NavBar, etc.)
├── App.tsx         ← Routing
└── main.tsx        ← Entry point
```

---

## Git Workflow

### Before starting work every day:
```bash
git pull origin main
```

### After making changes:
```bash
git add .
git commit -m "Brief description of what you changed"
git push origin main
```

### ⚠️ Rules
- Always `git pull` before you start working
- Never commit `node_modules`
- Never commit `.env`
- Keep all page components in `src/pages/`
- Keep all API calls in `src/services/api.ts`

---

## Backend

The backend lives on the `backend` branch. Ask a teammate for:
- Railway database credentials
- Firebase config values

See the `backend` branch README for setup instructions.