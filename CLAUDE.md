# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application with authentication, using TypeScript, Tailwind CSS v4, and Drizzle ORM with Neon PostgreSQL.

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
- **Tailwind CSS 4** (alpha)
- **better-auth 1.2.8** for authentication
- **Drizzle ORM** with Neon PostgreSQL
- **shadcn/ui** components (new-york style)
- **react-hook-form** + **zod** for forms

## Architecture

### Directory Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/ui/` - shadcn/ui components (45+ pre-built components)
- `/src/db/` - Database schema and client
- `/src/lib/` - Core utilities (auth configuration, utils)
- `/src/hooks/` - Custom React hooks
- `/drizzle/` - Database migrations output

### Key Files
- `/src/lib/auth.ts` - better-auth configuration
- `/src/lib/auth-client.ts` - Client-side auth utilities
- `/src/db/schema.ts` - Drizzle database schema
- `/src/db/index.ts` - Database client initialization

### Authentication Flow
- Email/password authentication enabled via better-auth
- Auth API routes at `/api/auth/[...all]`
- Pre-built sign-in (`/sign-in`) and sign-up (`/sign-up`) pages
- Session-based authentication with database storage

### Database Schema
- `user` - User accounts with email verification
- `session` - Active user sessions
- `account` - OAuth/social accounts (for future use)
- `verification` - Email verification tokens

## Environment Setup

Create `.env` file with:
```
DATABASE_URL=your_neon_database_url
```

## Development Guidelines

### TypeScript
- Path alias: `@/*` maps to `./src/*`
- Always use proper types, avoid `any`
- Strict mode is enabled

### Component Development
- Use existing shadcn/ui components from `/src/components/ui/`
- Components follow Radix UI patterns with composability
- Server Components by default, use `"use client"` only when needed

### Database Operations
- Use Drizzle ORM for all database queries
- Schema changes: modify `/src/db/schema.ts` then run `npm run db:push`
- Type-safe queries are automatically generated from schema

### Styling
- Use Tailwind CSS classes
- CSS variables for theming (configured in globals.css)
- Utility function `cn()` in `/src/lib/utils.ts` for conditional classes