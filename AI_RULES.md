# Project AI Rules & Tech Stack

## Tech Stack

- **Framework:** React 19 with TypeScript.
- **Build Tool:** Vite.
- **Styling:** Tailwind CSS is the exclusive styling engine. Use `clsx` for conditional class merging.
- **Routing:** `react-router-dom` (v7+). Use `HashRouter` for client-side routing.
- **Icons:** `lucide-react`. Do not import icons from other libraries.
- **QR Codes:** `qrcode.react`.
- **State Management & Persistence:** Custom LocalStorage implementation via `lib/storage.ts`. No external state management libraries (Redux, Zustand, Context) are currently used for the core data model.
- **Analytics:** Custom analytics implementation via `lib/analytics.ts`.

## Development Rules

### 1. File Structure & Organization
- **Pages/Routes:** All page-level components go in `src/routes/` (e.g., `src/routes/app/`, `src/routes/admin/`, `src/routes/public/`).
- **Components:** Reusable UI components go in `src/components/`. Keep components small and focused (< 100 lines when possible).
- **Types:** All TypeScript interfaces and types are defined in `src/types.ts`.
- **Utilities:** Helper functions and logic reside in `src/lib/`.

### 2. Styling Guidelines
- **Tailwind CSS:** Use Tailwind utility classes for all styling.
- **Responsive Design:** Always implement responsive designs using Tailwind's breakpoints (e.g., `md:`, `lg:`). Mobile-first approach is preferred.
- **Colors:** Use the zinc/slate scale for neutrals and specific colors (blue, purple, emerald) for branding as defined in existing components.
- **Animations:** Use `tailwindcss-animate` classes (e.g., `animate-in`, `fade-in`, `zoom-in`) for transitions.

### 3. Data & State Management
- **Persistence:** The app relies on `localStorage` as the "database".
- **Access:** Use `getStorage()` to read data and `updateStorage(prev => ...)` to write data.
- **Auth:** Use `getCurrentUser()`, `loginAs()`, and `logout()` from `lib/storage.ts`.
- **Do not** introduce complex state libraries unless explicitly requested.

### 4. Component Patterns
- **Functional Components:** Use React Functional Components (`React.FC`) with typed props.
- **Icons:** Import specific icons from `lucide-react`. Example: `import { User, Settings } from 'lucide-react';`.
- **Navigation:** Use `<Link>` for internal links and `<a>` for external links. Use `useNavigate` for programmatic navigation.

### 5. Best Practices
- **Strict Types:** Avoid `any`. Use interfaces defined in `types.ts`.
- **Error Handling:** Avoid empty try/catch blocks. Let errors bubble up unless handling them specifically for UI feedback.
- **Imports:** Use relative paths for local imports.