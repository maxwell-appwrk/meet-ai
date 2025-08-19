# Meet AI - Architecture Documentation

## Project Overview

Meet AI is an intelligent meeting assistant application built with Next.js 15, featuring AI-powered insights, automated transcriptions, and real-time AI agents that participate in video calls. The application leverages modern web technologies and third-party services to create a seamless meeting experience.

## Technology Stack

### Core Technologies
- **Next.js 15.3.2** with App Router (React Server Components)
- **React 19.0.0** with Server Components and Suspense
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS 4** (alpha) with native CSS variables
- **PostgreSQL** (via Neon) as the primary database

### Key Libraries & Frameworks
- **better-auth 1.2.8** - Modern authentication solution
- **Drizzle ORM** - Type-safe database queries
- **tRPC v11** - End-to-end type-safe APIs
- **React Query** (TanStack Query) - Server state management
- **shadcn/ui** - Component library (45+ components, New York style)
- **react-hook-form + zod** - Form handling and validation

### Third-Party Integrations
- **Stream Video SDK** - Video calls, recording, and transcription
- **Stream Chat SDK** - Post-meeting messaging
- **OpenAI** - Realtime API for AI agents, GPT-4.1 for summaries
- **Inngest** - Background job processing
- **DiceBear** - Avatar generation

## Architecture Patterns

### 1. Module-Based Architecture

The application follows a feature-based module structure where each feature is self-contained:

```
/src/modules/
├── agents/          # Agent management
│   ├── schema.ts    # Zod validation schemas
│   ├── types.ts     # TypeScript type definitions
│   ├── params.ts    # URL parameter handling
│   ├── hooks/       # Custom React hooks
│   ├── server/      # tRPC procedures
│   └── ui/          # Components & views
├── meetings/        # Meeting management
├── auth/           # Authentication views
├── call/           # Video call functionality
├── dashboard/      # Dashboard layout
└── home/          # Landing page
```

**Benefits:**
- Feature isolation and encapsulation
- Clear separation of concerns
- Easy to scale and maintain
- Type safety throughout each module

### 2. Data Flow Architecture

The application implements a unidirectional data flow:

1. **Server → Client**: tRPC procedures fetch data from PostgreSQL
2. **Client State**: React Query manages server state caching
3. **UI Updates**: Components subscribe to data via hooks
4. **User Actions**: Forms validate with Zod, then trigger mutations
5. **Revalidation**: Automatic cache invalidation after mutations

### 3. Authentication & Authorization

Using better-auth with database-backed sessions:

```typescript
// Server-side protection
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/sign-in");

// tRPC protected procedures
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return next({ ctx: { ...ctx, auth: session } });
});
```

### 4. API Layer (tRPC)

Type-safe API layer with automatic client generation:

```typescript
// Server procedure
create: protectedProcedure
    .input(agentInsertSchema)
    .mutation(async ({ input, ctx }) => {
        const [agent] = await db.insert(agents).values({
            ...input,
            userId: ctx.auth.user.id,
        }).returning();
        return agent;
    })

// Client usage with full type inference
const { mutate } = trpc.agents.create.useMutation();
```

## Database Schema

### Core Tables

1. **Authentication Tables** (managed by better-auth):
   - `user` - User accounts with profile information
   - `session` - Active user sessions with tokens
   - `account` - OAuth provider connections
   - `verification` - Email verification tokens

2. **Application Tables**:
   - `agents` - AI agent configurations
   - `meetings` - Meeting records with status tracking

### Meeting Status Flow
```
upcoming → active → processing → completed
                 ↘ cancelled
```

## Key Features & Implementation

### 1. AI-Powered Meetings

**Live AI Agents:**
- Connect via Stream Video's OpenAI Realtime API integration
- Join video calls with custom instructions
- Real-time conversation with users
- Configurable voice and behavior

**Post-Meeting AI:**
- Automatic transcript processing
- GPT-4.1 generates structured summaries
- Context-aware chat responses

### 2. Meeting Lifecycle

1. **Creation**: User selects AI agent, creates meeting
2. **Live Session**: Video call with recording/transcription
3. **Processing**: Background job processes transcript
4. **Completion**: Summary generated, chat enabled
5. **Post-Meeting**: View recordings, transcripts, chat with AI

### 3. Real-Time Features

**Webhooks** handle Stream.io events:
- `call.session_started` - Activate meeting, connect AI
- `call.session_ended` - Mark for processing
- `call.transcription_ready` - Trigger summary generation
- `message.new` - AI responds in chat

### 4. Background Processing

Inngest handles async tasks:
```typescript
inngest.createFunction({
    id: "meetings-processing",
    trigger: inngest.createTrigger({ event: "meetings/processing" }),
    handler: async ({ event, step }) => {
        // Fetch transcript
        // Parse and enrich with speakers
        // Generate AI summary
        // Update meeting status
    }
})
```

## UI/UX Architecture

### Design System

**Color System:**
- oklch color space for better color manipulation
- CSS variables for theming
- Automatic dark mode support
- Consistent color palette across components

**Component Library:**
- shadcn/ui provides 45+ base components
- Compound component patterns
- Variant system with CVA
- Full accessibility support

**Responsive Design:**
- Mobile-first approach
- Adaptive components (Dialog → Drawer on mobile)
- Touch-optimized interactions
- Sidebar transforms on mobile

### Component Patterns

1. **State Components**: EmptyState, LoadingState, ErrorState
2. **Form Components**: Integrated with react-hook-form
3. **Data Display**: Tables with sorting, filtering, pagination
4. **Dialogs**: Responsive with mobile adaptations

## Performance Optimizations

1. **Server Components**: Default for static content
2. **Suspense Boundaries**: Granular loading states
3. **React Query**: Intelligent caching and prefetching
4. **Parallel Data Fetching**: Multiple queries in single request
5. **Image Optimization**: Next.js automatic optimization

## Security Considerations

1. **Authentication**: Secure sessions with httpOnly cookies
2. **Authorization**: Row-level security via user context
3. **Input Validation**: Zod schemas on all inputs
4. **Webhook Security**: Signature verification
5. **API Protection**: All sensitive endpoints require auth

## Development Workflow

### Local Development
```bash
npm run dev              # Start dev server
npm run db:push         # Update database schema
npm run db:studio       # Database GUI
npm run lint            # Run ESLint
```

### Environment Setup
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_STREAM_VIDEO_API_KEY` - Stream Video
- `STREAM_VIDEO_SECRET_KEY` - Stream Video secret
- `OPENAI_API_KEY` - OpenAI API access
- OAuth providers (optional)

### Code Organization
- **Colocation**: Related code stays together in modules
- **Type Safety**: End-to-end from database to UI
- **Server/Client Split**: Clear boundaries
- **Reusable Patterns**: Consistent across modules

## Deployment Considerations

1. **Database**: Neon PostgreSQL with connection pooling
2. **Edge Runtime**: Compatible with Vercel Edge
3. **Environment**: Separate keys for production
4. **Monitoring**: Built-in error boundaries
5. **Scaling**: Stateless architecture

## Future Extensibility

The architecture supports:
- Adding new AI providers
- Custom meeting types
- Additional integrations
- New module creation
- Enhanced analytics
- Multi-tenant support

This architecture provides a solid foundation for a production-ready AI meeting assistant with excellent developer experience, type safety, and user experience.
