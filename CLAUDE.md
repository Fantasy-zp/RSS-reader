# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based RSS reader using Miniflux as the backend and Vue 3 + TypeScript as the frontend.

**Architecture:**
- **Backend**: Miniflux (Go RSS aggregator) + PostgreSQL database (installed via Homebrew)
- **Frontend**: Vue 3 with Composition API, TypeScript, Vite, Element Plus UI, Pinia state management
- **Development**: Local Miniflux + PostgreSQL, Vite dev server with proxy for frontend
- **Production**: Nginx serves static files and proxies API requests to Miniflux
- **Docker**: Optional `docker-compose.yml` for containerized deployment

## Development Commands

### Backend Services (Local Installation)

```bash
# Start Miniflux + PostgreSQL (local)
brew services start postgresql@15
brew services start miniflux

# Stop services
brew services stop postgresql@15
brew services stop miniflux

# Restart services
brew services restart postgresql@15
brew services restart miniflux

# View logs
tail -f /usr/local/var/postgresql@15/postgresql.log
tail -f /opt/homebrew/var/miniflux/miniflux.log

# Connect to PostgreSQL for manual queries
psql -U miniflux -d miniflux

# Or using Docker (if preferred)
docker-compose up -d
docker-compose down
docker-compose logs -f miniflux
docker exec -it rss-postgres psql -U miniflux -d miniflux
```

**Important**: The conda environment to use is `web`.

### Frontend Development

```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
```

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Architecture Notes

### Authentication (CRITICAL)

**Miniflux does NOT have a `/v1/login` endpoint.** It uses HTTP Basic Authentication only.

- Login flow: Encode `username:password` to base64 → store in `sessionStorage` as `rss_auth`
- API client adds `Authorization: Basic <base64>` header to all requests via interceptor
- Validation: Call `/api/v1/me` to verify credentials after setting auth
- When changing auth code, always verify reactive state updates (use refs, not computed on sessionStorage)

**Key files:**
- `frontend/src/api/client.ts` - Axios instance with Basic Auth interceptor
- `frontend/src/stores/auth.ts` - Auth store with sessionStorage + ref-based reactive state
- `frontend/src/api/auth.ts` - Only has `getCurrentUser()`, no login endpoint

### API Proxy Configuration

**Development (Vite)**: `/api` → Miniflux `/v1` (via `vite.config.ts` proxy rewrite)
- Frontend requests `/api/me` → Vite proxies to `http://localhost:8080/v1/me`

**Production (Nginx)**: `/api/` → Miniflux `/api/` (via `nginx/nginx.conf`)
- Nginx proxy_pass handles the routing, includes CORS headers

**Environment variable**: `VITE_API_BASE_URL=/api` (set in `.env.development` and `.env.production`)
- Change this requires dev server restart to take effect

### TypeScript Configuration

- Path aliases: `@/*` maps to `./src/*` (configured in `tsconfig.app.json`)
- Strict mode enabled
- Use `import { type TypeName }` for type-only imports with `verbatimModuleSyntax`

### State Management (Pinia)

Stores use Composition API pattern (`defineStore(id, setupFn)`):
- `useAuthStore` - User authentication state, `isAuthenticated` uses ref for reactivity
- `useFeedStore` - RSS feed and category management
- `useArticleStore` - Article list and reading status

### Component Structure

- `views/` - Page-level components (Dashboard, Login, Search, Settings)
- `components/` - Reusable components (CategoryTree, FeedList, ArticleCard, ReaderPanel)

### Chinese Search Support

Miniflux search requires PostgreSQL extensions for Chinese text:
```sql
# Local PostgreSQL
psql -U miniflux -d miniflux

# Or with Docker
docker exec -it rss-postgres psql -U miniflux -d miniflux

CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Default Credentials

- Username: `admin`
- Password: `admin123`
- Miniflux API: http://localhost:8080/v1

### Local Service Configuration

Miniflux configuration file: `/opt/homebrew/etc/miniflux.conf`
- `DATABASE_URL=postgres://miniflux:secret@localhost/miniflux?sslmode=disable`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=admin123`
- `BASE_URL=http://localhost:8080`

PostgreSQL data: `/opt/homebrew/var/postgresql@15/`
PostgreSQL binaries: `/opt/homebrew/opt/postgresql@15/bin/psql`

## Common Pitfalls

1. **Changing `VITE_API_BASE_URL`**: Requires restarting dev server - Vite only reads env vars on startup
2. **Reactive auth state**: Don't use `computed(() => sessionStorage.getItem(...))` - sessionStorage isn't reactive. Use refs.
3. **Path imports**: Use `@/` prefix for imports within src/ directory
4. **Type imports**: Must use `import { type Foo }` syntax due to `verbatimModuleSyntax`
5. **Service not starting**: Check if ports are already in use (`lsof -i :8080` for Miniflux, `lsof -i :5432` for PostgreSQL)
6. **Miniflux config changes**: After editing `/opt/homebrew/etc/miniflux.conf`, restart with `brew services restart miniflux`

## API Documentation

Miniflux API: http://localhost:8080/swagger.json

Key endpoints (via `/api` proxy):
- `GET /api/me` - Get current user (validates credentials)
- `GET /api/feeds` - List feeds
- `POST /api/feeds` - Create feed
- `GET /api/entries` - List articles
- `PUT /api/entries/{id}` - Update article status

---

conda env name: web

---

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
