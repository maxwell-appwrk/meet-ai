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

Each feature is organized as a self-contained module under `/src/modules/`:

```
/src/modules/[feature]/
├── schema.ts           # Zod validation schemas
├── types.ts            # TypeScript type definitions (uses tRPC inference)
├── params.ts           # URL search params handling (optional)
├── hooks/              # Custom React hooks (optional)
│   └── use-[feature]-filters.ts
├── server/             # Server-side logic
│   └── procedures.ts   # tRPC procedures
└── ui/                 # Client-side components
    ├── components/     # Reusable components specific to the module
    └── views/          # Page-level components
```

**Current Modules:**
- `agents/` - Agent management functionality
- `meetings/` - Meeting management and operations
- `auth/` - Authentication views
- `call/` - Video call functionality
- `dashboard/` - Dashboard layout components
- `home/` - Landing page and dashboard

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

### Creating a New Module

When creating a new module, follow this pattern:

1. Create the module directory structure:
```
/src/modules/[feature]/
├── schema.ts           # Zod validation schemas
├── types.ts            # TypeScript types using tRPC inference
├── params.ts           # URL search params (if needed)
├── hooks/              # Custom hooks (if needed)
├── server/
│   └── procedures.ts   # tRPC procedures
└── ui/
    ├── components/     # Module-specific components
    └── views/          # Page-level view components
```

2. Create tRPC procedures in `server/procedures.ts`:
```typescript
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const [feature]Router = createTRPCRouter({
    getMany: protectedProcedure.query(async ({ ctx }) => {
        // Implementation
    }),
})
```

3. Define types in `types.ts`:
```typescript
import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type [Feature]Data = RouterOutputs["[feature]"]["getMany"];
```

4. Register in `/src/trpc/routers/_app.ts`:
```typescript
import { [feature]Router } from '@/modules/[feature]/server/procedures';

export const appRouter = createTRPCRouter({
    // ... existing routers
    [feature]: [feature]Router
});
```

### Component Organization

**Shared Components** (`/src/components/`):
- UI primitives from shadcn/ui
- Generic application components (EmptyState, LoadingState, etc.)

**Module Components** (`/src/modules/[feature]/ui/components/`):
- Feature-specific components
- Should be self-contained within the module
- Can import shared components

**View Components** (`/src/modules/[feature]/ui/views/`):
- Page-level components that orchestrate module components
- Handle data fetching and state management
- Export loading and error states

## UI/Design System

### Color System
- Uses oklch color space for better color manipulation
- CSS variables defined in `/src/app/globals.css`
- Dark mode support via CSS variables
- Consistent color palette with semantic naming

### Component Styling
- Tailwind CSS 4 (alpha) with native CSS features
- Component variants using CVA (class-variance-authority)
- Consistent spacing scale and border radius
- Responsive design with mobile-first approach

### shadcn/ui Configuration
- Style: New York (more opinionated styling)
- Base color: Neutral
- CSS variables: Enabled
- Icons: Lucide React

### Common Patterns
- Loading states: Use `LoadingState` component
- Empty states: Use `EmptyState` component
- Error states: Use `ErrorState` component
- Forms: react-hook-form with zod validation
- Tables: DataTable with sorting, filtering, pagination

## Third-Party Integrations

### Stream Video/Chat
- Video calls with recording and transcription
- Post-meeting chat functionality
- Configuration in `/src/lib/stream-video.ts` and `/src/lib/stream-chat.ts`

### OpenAI
- Realtime API for AI agents in calls
- GPT-4 for meeting summaries
- Chat responses with meeting context

### Inngest
- Background job processing
- Meeting transcript processing
- Summary generation