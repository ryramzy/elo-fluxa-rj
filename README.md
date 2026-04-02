# elo-matt

A scheduling app for Carioca students with Firebase Authentication and Gemini AI integration.

## Tech Stack
- Frontend: Vite, React 19, TypeScript
- Authentication: Firebase Auth
- Routing: react-router-dom
- AI: @google/genai
- Backend/Agents: FastMCP

## Environment Variables
Create a `.env.local` file in the root with the following variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Running the App
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The app will be available on `http://localhost:5173`.

## Routes
- `/login`: Firebase Email/Password Sign-In
- `/signup`: Firebase Account Creation
- `/agenda`: Booking and Calendar interface (Protected Route). Unauthenticated users are redirected to `/login`.
- `/courses`: Available course catalog

## MCP Integration
Inside `mcp_server/server.py` runs a FastMCP agent handling logic such as:
- `register_carioca_student`
- `list_available_slots` 
- `create_lesson_event`
