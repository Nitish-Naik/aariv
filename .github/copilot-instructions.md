# Aariv Project Instructions

You are an expert AI software engineer assisting with "Aariv", a specialized mobile app integrating Expo (React Native) with an AI-powered Node.js backend using Composio.

## 🏗 Project Architecture

### **Core Structure**
- **Monorepo-style:** 
  - Root: Expo (React Native) frontend.
  - `backend/`: Node.js + Express server.
- **Frontend Entry:** `app/_layout.tsx` using **Expo Router**.
- **Backend Entry:** `backend/src/index.ts`.

### **Tech Stack**
- **Frontend:** React Native, Expo SDK 50+, TypeScript, Expo Router, React Native Reanimated.
- **Backend:** Node.js, Express, TypeScript, **Composio Core** (for AI tools), OpenAI SDK.
- **Database:** Supabase (Optional/Placeholder in current state).
- **Styling:** Custom theme system via `context/ThemeContext.tsx` and `theme/`.

---

## 🚀 Key Patterns & Conventions

### **1. AI & Tool Integration (Critical)**
The backend relies heavily on `composio-core` and OpenAI function calling.
- **Execution Loop:** Controller functions implement a specific multi-turn loop (max 5 turns) to handle AI tool calls.
- **Tool Output:** Tool outputs >15k-20k characters **must be truncated** to prevent context window explosion.
- **Context:** Always fetch user `connections` via `toolset.client.getEntity(userId)` before initializing tools to filter relevant apps.

### **2. Frontend Navigation**
- **Router:** Use **Expo Router** file-based routing (`app/` directory).
- **Layouts:** `_layout.tsx` handles `Stack` and `Tabs` configuration.
- **Modals:** Configure modals in `app/_layout.tsx` using `presentation: 'modal'`.

### **3. Data Fetching & Networking**
- **API Client:** Use `services/api.ts` for all backend calls.
- **Local Development:** The API URL is configured to `LOCAL_IP` (e.g., `10.112.x.x`). **Warn user** if they are testing on a real device to check this IP.
- **Mocks:** The project currently uses heavy mocking (e.g., `services/auth.ts`, `mockData.ts`). When implementing real features, check if a real backend endpoint exists first.

### **4. Styling**
- **Theme:** Access colors via `useTheme()` hook from `context/ThemeContext`.
- **Imports:** Import primitive styles from `@theme/index` or local `theme/` directory.
- **System:** Use the defined `spacing`, `borderRadius`, and `typography` objects for consistency.

---

## 🛠 Developer Workflows

### **Running the Project**
1. **Frontend:** `npx expo start` (Runs headers & routing from `app/`).
2. **Backend:** `cd backend && npm run dev` (Runs headers on port 3000).

### **Debugging Tips**
- **Backend Logs:** Check terminal for tool execution logs.
- **Supabase:** If Supabase is missing, the backend degrades gracefully (warns in console).
- **Deep Links:** Auth callbacks use scheme `mymobileapp://`. Ensure `app.json` scheme matches.

## 🚨 Common Pitfalls to Avoid
- **Navigation:** Do not use `React Navigation` props directly unless inside a legacy component; strictly prefer `expo-router` hooks (`useRouter`, `Link`).
- **Backend Env:** Backend requires `.env` in the **root** or `backend/` root. Ensure `COMPOSIO_API_KEY` and `OPENAI_API_KEY` are set.
- **Type Safety:** The backend `actionData` comes from AI and is loosely typed. Add runtime checks/zod validation before processing critical actions.
