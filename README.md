# Aariv Workspace Setup & Build Guide

This repo is a monorepo with an Expo (React Native) frontend and a Node.js + Express backend (TypeScript) under `backend/`. Follow these steps to build and run both.

## Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npx expo` is sufficient)
- Optional: Android Studio or Xcode for emulators
- Backend env vars: `OPENAI_API_KEY`, `COMPOSIO_API_KEY` (and optional Supabase keys)

## 1) Install Dependencies

Run at the repo root for the frontend:

```bash
npm install
```

Then install backend deps:

```bash
cd backend
npm install
```

## 2) Configure Backend Environment

Create `backend/.env` (copy from `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Fill in required values:
- `OPENAI_API_KEY` — required
- `COMPOSIO_API_KEY` — required
- `PORT` — defaults to `3000`
- Optional Supabase: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

The backend loads env from `backend/.env` (see `backend/src/config/env.ts`).

## 3) Start the Backend (Dev)

```bash
cd backend
npm run dev
```

This runs `nodemon src/index.ts` and serves the API on the configured `PORT` (default `3000`). Health check: `GET http://localhost:3000/api/health`.

For a production build:

```bash
cd backend
npm run build
npm start
```

This compiles to `dist/` via `tsc` and runs `node dist/index.js`.

## 4) Configure Frontend API URL

Set `EXPO_PUBLIC_API_URL` for the frontend (preferred). Example:

```bash
export EXPO_PUBLIC_API_URL="http://<your-ip>:3000/api"
```

If unset, the app falls back to `10.0.2.2` (Android emulator) or `localhost` for web/metro. Ensure devices on the network can reach your machine.

## 5) Start the Frontend

From the repo root:

```bash
npx expo start
```

You can then open:
- Android emulator
- iOS simulator
- Expo Go (on device)

This app uses Expo Router with entry `expo-router/entry` and routes under `app/`.

## Notes & Tips
- Deep link scheme is `aariv` (see `app.json`) and is used by backend OAuth callback.
- If Supabase isn’t configured, backend degrades gracefully and logs warnings.
- Tool outputs in backend controllers are truncated per project guidelines to avoid exceeding context limits.

---

# Original Expo README

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


## 🚀 Production Features

- ✅ Rate limiting (100 req/15min)
- ✅ Subscription middleware (Free/Pro/Enterprise)
- ✅ Structured logging
- ✅ Error boundary
- ✅ Analytics ready (PostHog/Segment/Mixpanel)
- ✅ Environment validation
- ✅ Docker support with health checks
- ✅ Token auto-refresh
- ✅ Background sync
- ✅ Push notifications

## 📚 Additional Documentation

- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Analytics, middleware usage
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Docker, AWS, GCP deployment
- [COMPLETED_IMPLEMENTATION.md](COMPLETED_IMPLEMENTATION.md) - Feature inventory

