# SocialSync Frontend

Next.js (React + TypeScript) frontend for SocialSync.

## Tech Stack
- Next.js 14, React 18, TypeScript
- UI: Material-UI (MUI v5)
- State: React Query + Context API
- Forms: Formik + Yup validation
- Tooling: ESLint, Prettier, Husky + lint-staged

## Scripts
- `npm run dev` – start dev server at http://localhost:3000
- `npm run build` – build production bundle
- `npm run start` – start production server
- `npm run lint` – run ESLint

## Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` – Base URL for backend API

## Structure
```
src/
  pages/        # Next.js pages (temporary until app router migration)
  components/   # Reusable UI components
  hooks/        # Custom React hooks
  services/     # API services (axios)
  styles/       # Global and module CSS
  types/        # TypeScript types/interfaces
```

## Notes & Decisions
- Using MUI for professional, accessible UI; simple animations via CSS for polish
- Strict mode enabled; TypeScript strict for type safety
- Env-driven configuration for portability across environments

## Getting Started
```
cd Frontend
npm install
npm run dev
```

