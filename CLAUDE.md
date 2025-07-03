# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application for a music community (軽音楽部 - light music club) built with Next.js, TypeScript, and Prisma. The app manages members, events, bands, and integrates with Spotify for song features.

## Common Development Commands

### Development
```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm db:studio    # Open Prisma Studio for database inspection
```

### Build & Production
```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

### Database Management
```bash
pnpm db:push      # Push schema changes to database (development)
pnpm db:migrate   # Create migration files (production)
pnpm db:seed      # Seed database with initial data
pnpm db:clear     # Reset database (caution: deletes all data)
```

### Code Quality
```bash
pnpm lint         # Run ESLint
pnpm format       # Fix ESLint issues and format with Prettier
pnpm prettier     # Run Prettier only
```

### Testing Single Features
When testing specific features, navigate to:
- Events: `/events`
- Members: `/members`
- My Best Songs: `/my-best`
- Settings: `/settings`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs
- **Auth**: NextAuth.js with Discord OAuth
- **UI**: Mantine UI components
- **Storage**: Supabase for file storage
- **External APIs**: Spotify API for song search

### Code Organization

The codebase follows a layered architecture with feature-based organization:

```
src/
├── app/          # Next.js pages and API routes
├── features/     # Feature-specific components and logic
├── server/       # Backend logic (tRPC routers, domain, infrastructure)
├── ui/           # Shared UI components
└── utils/        # Utility functions
```

### Key Architectural Patterns

1. **tRPC API Layer** (`src/server/api/`)
   - Type-safe API endpoints
   - Input validation with Zod
   - Procedures organized by domain (auth, event, user, etc.)

2. **Domain Layer** (`src/server/domains/`)
   - Business logic and domain models
   - Repository interfaces
   - Domain services (EventService, UserService, etc.)

3. **Infrastructure Layer** (`src/server/infrastructures/`)
   - Prisma repositories
   - External service integrations (Spotify, Supabase)
   - Database access implementation

4. **Feature Modules** (`src/features/`)
   - Self-contained feature implementations
   - Components, hooks, and utilities specific to each feature
   - Examples: event management, user profiles, my-best-songs

### Important Implementation Details

1. **Authentication Flow**
   - Discord OAuth via NextAuth.js
   - Session stored in database
   - Protected routes use `getServerAuthSession()`

2. **Database Schema**
   - User system with Discord integration
   - Event management with attendees and bands
   - My Best Songs with Spotify integration
   - Complex relationships managed through Prisma

3. **File Upload**
   - Supabase storage for user avatars and event images
   - Upload handling in `src/features/account/image-uploader/`

4. **Drag & Drop**
   - Song ordering in My Best Songs feature
   - Uses `@dnd-kit` library

### Environment Variables

Key environment variables (see `.env.example`):
- Database: `DATABASE_URL`
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Discord OAuth credentials
- Storage: Supabase credentials
- External APIs: Spotify client credentials

### Development Workflow

1. Always run `pnpm dev` for local development
2. Use `pnpm db:studio` to inspect database during development
3. Run `pnpm lint` before committing
4. Use path alias `@/*` for imports from `src/`
5. Follow existing patterns when adding new features or API endpoints