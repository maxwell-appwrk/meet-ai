# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meet AI - An intelligent meeting assistant application built with Next.js 15, featuring AI-powered insights, automated transcriptions, and meeting management.

## Essential Commands

```bash
# Development
npm run dev              # Start development server on http://localhost:3000

# Build & Production
npm run build           # Build for production
npm run start           # Start production server

# Linting
npm run lint            # Run ESLint

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio for database management
```

## Tech Stack

- **Next.js 15.3.2** with App Router
- **React 19.0.0**
- **TypeScript 5** with strict mode
- **Tailwind CSS 4** (alpha) with CSS variables
- **better-auth 1.2.8** for authentication
- **Drizzle ORM** with Neon PostgreSQL
- **tRPC** with React Query for type-safe APIs
- **shadcn/ui** components (new-york style, 45+ components)
- **react-hook-form** + **zod** for forms

## Architecture

### Module-Based Structure
```
/src/modules/
├── agents/          # Agent management
│   ├── schema.ts    # Zod validation
│   ├── types.ts     # TypeScript types
│   ├── server/      # tRPC procedures
│   └── ui/          # Components & views
├── auth/            # Authentication
├── dashboard/       # Dashboard layout
└── home/           # Landing page
```

### Key Files
- `/src/lib/auth.ts` - better-auth server configuration
- `/src/lib/auth-client.ts` - Client-side auth utilities
- `/src/db/schema.ts` - Drizzle database schema
- `/src/trpc/routers/_app.ts` - tRPC router definition
- `/src/app/api/auth/[...all]/route.ts` - Auth API route
- `/src/app/api/trpc/[trpc]/route.ts` - tRPC API route

### Authentication Flow
- Email/password and social OAuth (Google, GitHub)
- Database-backed sessions in PostgreSQL
- Protected routes using `protectedProcedure` in tRPC
- Client auth via `authClient` from better-auth/react
- Server validation with `auth.api.getSession()`

### Database Schema
- `user` - User accounts with email verification
- `session` - Active user sessions
- `account` - OAuth/social accounts
- `verification` - Email verification tokens
- `agents` - User-created agents (uses nanoid for IDs)

## Environment Setup

Create `.env` file with:
```env
DATABASE_URL=your_neon_database_url

# Optional for social auth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Development Guidelines

### TypeScript
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Use proper types, avoid `any`

### Component Development
- Server Components by default
- Use `"use client"` only when needed
- Feature modules in `/src/modules/`
- Shared UI in `/src/components/ui/`

### API Development
- Use tRPC procedures for type-safe APIs
- Protected routes: extend `protectedProcedure`
- Public routes: extend `publicProcedure`
- Validation: Use zod schemas

### Database Operations
- Use Drizzle ORM for queries
- Schema changes: modify `/src/db/schema.ts` then run `npm run db:push`
- Type-safe queries automatically generated

### Styling
- Tailwind CSS classes
- CSS variables for theming
- Utility: `cn()` in `/src/lib/utils.ts`
- Dark mode support via CSS variables

### Form Handling
- react-hook-form with zodResolver
- Validation schemas in module's `schema.ts`
- Use shadcn/ui form components

## Project Patterns

### Error Handling
- `ErrorState` component for UI errors
- `LoadingState` for loading states
- react-error-boundary for error boundaries

### Data Fetching
- tRPC with React Query
- Server-side: `trpc.serverClient`
- Client-side: `trpc.useQuery/useMutation`

### Authentication Check
```typescript
// Server-side
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/sign-in");

// Client-side
const { data, isPending } = authClient.useSession();
```

### Module Creation Pattern
1. Create folder in `/src/modules/[feature]/`
2. Add `schema.ts` for validation
3. Add `types.ts` for TypeScript types
4. Add `server/procedures.ts` for tRPC
5. Add `ui/components/` and `ui/views/`
6. Register procedures in `/src/trpc/routers/_app.ts`