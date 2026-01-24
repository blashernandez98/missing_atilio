# Claude Project Context

## Project Overview
**Missing Atilio** - A football trivia game web app for Club Nacional de Football (Uruguay).

## Documentation
Detailed documentation is available in the `/docs` directory:
- `ARCHITECTURE.md` - System architecture, tech stack, directory structure
- `DATA-SCHEMAS.md` - Data structures and JSON schemas
- `GAME-LOGIC.md` - Game mechanics and rules
- `COMPONENTS.md` - React component reference
- `API.md` - API endpoint documentation
- `DEVELOPMENT.md` - Development setup and workflows

## Tech Stack Quick Reference
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Neon PostgreSQL (serverless)
- **Auth**: JWT with HTTP-only cookies (jose library), bcryptjs for passwords
- **Hosting**: Netlify
- **Images**: AWS S3 CDN

## Key Directories
- `/app` - Next.js App Router pages and components
- `/lib` - Utilities, types, database functions
- `/migrations` - SQL migration files
- `/docs` - Project documentation

## Game Modes
1. **Missing 11** (`/missing11`) - Wordle-style guess the player lineup
2. **Versus** (`/versus`) - Compare player stats (who has more?)
3. **Guess the Player** (`/adivina-jugador`) - Daily player guessing game

## Database Schema (Current)

### Core Tables
- `cronograma` - Match scheduling for Missing 11
- `player_schedule` - Daily player scheduling for Guess the Player
- `leaderboard` - High scores (linked to users via user_id)

### User System Tables
- `users` - User accounts (username, password_hash)
- `user_game_completions` - Completed games for users (and guests with NULL user_id)
- `user_streaks` - DEPRECATED: Streaks now calculated client-side from completions

### Stats Tables (Legacy)
- `daily_game_stats` - DEPRECATED: Stats can be aggregated from user_game_completions

## User Authentication System
- Simple username/password (no email, no recovery)
- Username: 3-15 characters
- Password: 6-15 characters
- JWT tokens stored in HTTP-only cookies (7-day expiry)
- Guest mode supported (completions tracked with session_id, NULL user_id)
- Streaks calculated client-side from completions list

## Key Patterns

### LocalStorage Keys
- `missing11_{DD-MM-YYYY}` - Missing 11 game state per date
- `guessPlayer_solved_{DD-MM-YYYY}` - Guess the Player completion
- `versus_gameState` - Versus game state (current/best streak)
- `atilio_synced_{userId}` - Flag indicating user's localStorage has been synced

### Migration Flow
When a user registers, their localStorage game data is migrated to the database:
1. Collect completed games from `missing11_*` and `guessPlayer_solved_*` keys
2. POST to `/api/auth/migrate`
3. Clear localStorage game data after successful migration
4. Mark user as synced with `atilio_synced_{userId}`

### Streak Calculation
Streaks are calculated client-side from the completions list:
- Consecutive calendar days with at least one win
- Separate streaks for Missing 11 (`wordle`) and Guess the Player (`guess_player_scheduled`)
- No streaks for Versus mode (infinite play, score-based)

## Environment Variables
- `DATABASE_URL` / `NETLIFY_DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `NEXT_PUBLIC_ENABLE_ADMIN` - Enable admin panel (false in production)

## Recent Changes Log

### January 2026 - User Authentication System
- Added user accounts with simple username/password auth
- Game completions tracked in `user_game_completions` table
- Streaks calculated client-side from completions
- LocalStorage data migrated on first registration
- Highscores auto-linked to user accounts
- Guest mode continues to work with localStorage

### Database Simplification (Migration 006)
- Made `user_id` nullable in `user_game_completions` for guest tracking
- Added `session_id` column for guest identification
- Deprecated `user_streaks` table (client-side calculation)
- Deprecated `daily_game_stats` table (can aggregate from completions)

## Common Tasks

### Adding a new game mode
1. Create page in `/app/{game-name}/page.tsx`
2. Create components in `/app/components/{game-name}/`
3. Add localStorage keys for state persistence
4. Add completion recording for logged-in users
5. Update types in `/lib/types.ts`

### Running database migrations
1. Add SQL file to `/migrations/`
2. Run against Neon database via console or psql
3. Update this documentation with schema changes

### Testing locally
```bash
npm run dev
# Ensure .env.local has DATABASE_URL and JWT_SECRET
```
