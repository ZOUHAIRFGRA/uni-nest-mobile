# Copilot Instructions for Match & Settle Mobile App

## Project Overview
- **Purpose:** AI-powered student housing and roommate matching platform with real-time chat, booking, and payment features.
- **Architecture:** Modular React Native (Expo) frontend, Node.js/Express backend (see `UniNest-server`), real-time via Pusher, AI matching logic in both frontend and backend.

## Key Directories & Structure
- `app/` — Feature modules (auth, booking, chat, dashboard, matching, etc.)
- `components/` — Reusable UI, schema forms, constants
- `assets/` — Images and icons
- `docs/` — API, routes, and workflow documentation
- `store/` — State management (Redux Toolkit pattern)
- `utils/`, `hooks/` — Shared logic

## UI/UX & Styling
- Use **NativeWind** for styling; prefer `className` prop, fallback to `style` if not supported.
- Reference `tailwind.config.js` and `@theme.ts` for colors, spacing, and typography.
- Match the style and structure of existing screens (see `components/ui/`, `app/` subfolders).
- Use **React Native Reanimated** for all animations and transitions (e.g., FadeInUp, spring physics).
- Do not use `text-base`; use `text-md` for text sizing.

## Navigation & State
- Navigation: Bottom tab (Home, Search, Matches, Bookings, Profile) + stack navigators per feature.
- State: Use Redux Toolkit slices and RTK Query for API calls. Use hooks like `useAuth()`, `useProperties()`, etc.

## API & Data Flow
- API endpoints and models are documented in `docs/` and `README-SERVER.md`.
- Use async thunks for side effects (see `SETUP_INSTRUCTIONS.md` for available thunks).
- Real-time events via Pusher (see `config/pusher.js` in server).

## Project Conventions
- Always create a `.backup` copy before modifying any file (e.g., `FormScreen.tsx.backup`).
- Only edit what is requested; do not add extra features or refactors.
- When using or updating icons, update the icon name in `metro.config.js`.
- Ensure all libraries and features work on both iOS and Android.
- Add a comment for each function describing its purpose.

## Developer Workflows
- **Setup:** See `SETUP_INSTRUCTIONS.md` for environment and build steps.
- **Testing:** Follow patterns in `tests/` (if present) or as described in `docs/`.
- **Debugging:** Use Redux DevTools, React Native Debugger, and log API calls.

## Integration Points
- Backend: See `UniNest-server/README-SERVER.md` for API, models, and real-time setup.
- AI Matching: Logic in both frontend (`utils/aiMatching.js`) and backend (`services/matchingService.js`).
- Payments: Integrated via backend endpoints and UI flows in `app/payment/`.

## Examples
- For a new screen, match the style of `app/property/` and use NativeWind classes.
- For a new API call, follow the RTK Query pattern in `store/` and document in `docs/`.

---

**If any section is unclear or missing, please request clarification or point to the relevant file for further details.**
