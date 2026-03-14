# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** — an AI-powered React component generator with a live preview IDE. Users describe UI components in chat; Claude generates React code using a virtual file system, which is rendered in real-time.

## Commands

```bash
# First-time setup
npm run setup          # installs deps, generates Prisma client, runs migrations

# Development
npm run dev            # Next.js dev server with Turbopack at http://localhost:3000

# Testing
npm run test           # Vitest (jsdom environment)

# Linting
npm run lint           # ESLint

# Database
npm run db:reset       # Reset SQLite database

# Production
npm run build && npm run start
```

## Architecture

### Core Concept: Virtual File System
Generated components live in an **in-memory** `VirtualFileSystem` (`src/lib/file-system.ts`), serialized as JSON and persisted to the `Project.data` column in SQLite. No actual files are written to disk. The root entry point for generated code is always `/App.jsx`.

### AI Integration
- **API route**: `src/app/api/chat/route.ts` — streams responses via Vercel AI SDK's `streamText()`
- **Model**: Claude Haiku 4.5 (`claude-haiku-4-5`), falls back to `MockLanguageModel` if `ANTHROPIC_API_KEY` is not set
- **Tools exposed to Claude**: `str_replace_editor` (view/create/edit files) and `file_manager` (directory ops)
- **System prompt**: `src/lib/prompts/generation.tsx` — instructs Claude to use Tailwind, `@/` imports, and keep `/App.jsx` as entry

### Data Flow
1. User sends message → `ChatContext` (`src/lib/contexts/chat-context.tsx`) calls `/api/chat`
2. API streams tool calls → Claude writes to the virtual FS via tools
3. `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) receives updated files
4. `PreviewFrame` transpiles JSX with Babel standalone and renders live preview
5. On stream completion, project state is saved to Prisma

### Authentication
JWT-based via `jose`, stored as httpOnly cookies (7-day expiry). Logic in `src/lib/auth.ts`. Server actions in `src/actions/index.ts` handle sign-up/sign-in/sign-out.

### Database
Prisma + SQLite (`prisma/dev.db`). Two models:
- `User` — email + bcrypt-hashed password
- `Project` — stores `messages` (JSON array) and `data` (serialized virtual FS) as plain strings

After schema changes: `npx prisma migrate dev` then `npx prisma generate`.

### Code Style
- Utilisez les commentaires avec parcimonie. Ne commentez que le code complexe.

### Path Alias
`@/*` maps to `src/*` (configured in `tsconfig.json` and used throughout).

### UI Structure
Main layout (`src/app/main-content.tsx`) uses resizable panels:
- **Left**: Chat interface (message list + input)
- **Center**: Monaco code editor + file tree
- **Right**: Live preview iframe
