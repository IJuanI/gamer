# GamER Hub — Complete Feature Guide & Testing Instructions

## Overview

GamER Hub is a community platform for Entre Ríos Gamers. It provides:
- **Authentication** (email/password + OAuth)
- **User profiles** with gaming accounts
- **Teams** for competitive gaming
- **Recruitment posts** for finding teammates
- **Platform linking** (FACEIT, Riot Games)
- **Role-based access control** (Admin, Editor, Member)

---

## Architecture Quick Reference

- **Frontend**: Next.js 16 on Cloudflare Workers → https://gameer.com.ar
- **API**: NestJS on Google Cloud Run → https://gamer-hub-api-495879844360.us-central1.run.app
- **Database**: SQLite (local dev) / Firestore (production)
- **Games Pre-seeded**: CS2, League of Legends, Valorant, Rocket League

---

## Pre-Requisites for Testing

### Option A: Test Production Site (Easiest — No setup)
Just visit **https://gameer.com.ar** and test. Uses live Cloud Run API and Firestore database.

**Pre-seeded demo accounts**:
| Role   | Email        | Password    |
|--------|--------------|-------------|
| Admin  | admin@local  | admin1234   |
| Editor | editor@local | editor1234  |
| Member | member@local | member1234  |

These accounts are seeded in both local dev and production Firestore.

### Option B: Test Locally (Full control)
```bash
cd hub

# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL in Docker
pnpm db:up

# 3. Run migrations
pnpm db:migrate

# 4. Seed demo accounts (optional, for quick testing)
pnpm db:seed

# 5. Run dev server (API + frontend simultaneously)
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/api

---

## Feature #1: Authentication

### 1.1 Email/Password Registration

**Steps:**
1. Go to https://gameer.com.ar/registro (or localhost:3000/registro if local)
2. Fill in:
   - **Email**: e.g., `testuser@example.com`
   - **Contraseña** (Password): minimum length (check for validation)
   - **Confirmar contraseña** (Confirm Password): must match
3. Click **Crear cuenta** (Create account)
4. Should redirect to `/login` with success message or immediately log in

**Expected behavior:**
- ✅ Form validation prevents submission with invalid email
- ✅ Passwords must match before submit is enabled
- ✅ Account created successfully, can log in with same credentials
- ✅ Password is hashed (never stored plaintext)

**Edge cases to test:**
- Try registering with an email that already exists → should show error
- Register with mismatched passwords → button should be disabled
- Register with weak/short password → check if there's validation

---

### 1.2 Email/Password Login

**Steps:**
1. Go to https://gameer.com.ar/login (or localhost:3000/login)
2. Enter email and password from an existing account
3. Click **Ingresar** (Login)
4. Should redirect to `/dashboard`

**Expected behavior:**
- ✅ Correct credentials log in successfully
- ✅ Session stored in httpOnly JWT cookie (secure)
- ✅ Incorrect credentials show error
- ✅ User info (displayName, role, email) displays on dashboard

**How to verify:**
- Open browser DevTools → Application tab → Cookies
- Should see a cookie like `auth-token` or similar
- Cookie should be marked as `HttpOnly` (secure against XSS)

---

### 1.3 OAuth Login (Discord & Google)

**Note**: OAuth only works if credentials are configured in environment variables on the API. On production (Cloud Run), these may not be set, so OAuth buttons may not function. Test locally if you have OAuth app credentials.

**For local testing with Discord:**
1. Create a Discord application at https://discord.com/developers/applications
2. Set OAuth2 Redirect URI to `http://localhost:4000/api/auth/discord/callback`
3. Add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` to `.env` in `hub/`
4. Restart `pnpm dev`
5. Go to http://localhost:3000/login
6. Click **Continuar con Discord**
7. Authorize the Discord app
8. Should redirect to dashboard with Discord account linked

**For Google OAuth:**
Similar process at https://console.cloud.google.com, set redirect to `http://localhost:4000/api/auth/google/callback`

**Expected behavior:**
- ✅ OAuth flow redirects to provider
- ✅ After authorization, redirects back to dashboard
- ✅ User account created automatically if it's the first time
- ✅ Subsequent logins with same OAuth provider recognize the account

**How to verify:**
- After OAuth login, check `/dashboard` → your displayName should match Discord/Google profile
- If you go to `/profile`, a linked `Account` should show the provider

---

### 1.4 Logout

**Steps:**
1. Go to dashboard (must be logged in)
2. Click **Salir** (Logout) button in top-right
3. Should redirect to homepage

**Expected behavior:**
- ✅ Session cookie cleared
- ✅ Accessing protected pages (e.g., `/dashboard`) redirects to `/login`
- ✅ Unauthenticated API calls return 401 errors

---

## Feature #2: User Dashboard & Role-Based Access

### 2.1 View Dashboard (Protected)

**Steps:**
1. Log in at `/login`
2. Should land on `/dashboard`

**What's on the dashboard:**
- User card with avatar (first letter of name in a box), displayName, role badge, email, join date
- Tiles showing accessible features (role-dependent)
- For **ADMIN** only: a list of all members in the system

**Expected behavior:**
- ✅ Dashboard only accessible when logged in (redirect to login if not)
- ✅ User info displays correctly
- ✅ Role badge shows:
  - **ADMIN** (purple) for admin role
  - **EDITOR** (green) for editor role  
  - **MEMBER** (grey) for member role

### 2.2 Admin Feature: View All Members (RBAC)

**Steps (must be logged in as ADMIN):**
1. Go to `/dashboard`
2. Scroll down to find member list table
3. Should see all users with their emails, roles, and join dates

**Expected behavior:**
- ✅ Only ADMIN role can see this list
- ✅ If logged in as EDITOR or MEMBER and you manually navigate to `/api/users`, should get 403 Forbidden error
- ✅ List includes the current user and all others

**How to verify (API level):**
```bash
# If local, with admin token:
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:4000/api/users

# Should return 200 with user list
# If not admin: should return 403
```

---

## Feature #3: Gaming Profiles

A user can link their in-game handles to supported games and optionally link them to external platforms (FACEIT, Riot) for verified ranks.

### 3.1 Add a Game Profile

**Steps:**
1. Log in and go to `/profile`
2. Click **Agregar juego** (Add game) button
3. Select a game from dropdown (CS2, League of Legends, Valorant, Rocket League)
4. Enter your **in-game handle** (username/IGN)
5. Click **Guardar** (Save)

**Expected behavior:**
- ✅ Game profile card appears in the grid
- ✅ Shows game name, your handle
- ✅ "Link to platform" button appears (if the game supports it)
- ✅ Can only add each game once per user

**Edge cases:**
- Try adding the same game twice → should show error or hide the option
- Delete a game, then add it again → should work fine

### 3.2 Link to External Platform (FACEIT/Riot)

**For CS2 or Valorant + FACEIT:**
1. On your game profile card, click **Link to FACEIT** button
2. May redirect to FACEIT authorization page (if configured)
3. After authorization, your FACEIT stats should be cached and displayed

**For League of Legends + Riot:**
1. On your game profile card, click **Link to Riot** button
2. Redirects to Riot authorization
3. Your rank/ELO should be fetched and displayed

**Expected behavior:**
- ✅ Platform linking shows external handle
- ✅ For games with rank data (CS2 = FACEIT ELO, LoL = Riot rank), stats display
- ✅ **Refresh** button refreshes cached stats from the platform
- ✅ Can unlink a platform with **Delete** button

**Note**: Platform linking requires OAuth credentials to be configured in the API. On production without credentials, these links may not work.

### 3.3 Delete a Game Profile

**Steps:**
1. On your game profile card, click **X** or delete icon
2. Confirm deletion
3. Card disappears from the list

**Expected behavior:**
- ✅ Game profile deleted
- ✅ Can re-add the same game again later
- ✅ Associated platform link (if any) also deleted

---

## Feature #4: Teams

Teams are groups of players organized around a specific game. Users can create teams, join them, and list them by game.

### 4.1 View Teams List

**Steps:**
1. Log in and go to `/teams`
2. See all teams or filter by game using the dropdown

**Expected behavior:**
- ✅ Teams displayed in a grid
- ✅ Each card shows: team name, tag (if set), game, member count
- ✅ Dropdown allows filtering by game (All, CS2, LoL, etc.)
- ✅ Can click a team to view details

### 4.2 Create a Team

**Steps:**
1. Go to `/teams`
2. Click **Crear equipo** (Create team)
3. Fill in form:
   - **Nombre** (Name): e.g., "Alpha Squad"
   - **Juego** (Game): select one (CS2, LoL, Valorant, Rocket League)
   - **Tag** (optional): short team abbreviation, e.g., "AS"
   - **Bio** (optional): team description
   - **Logo URL** (optional): link to team logo image
4. Click **Crear** (Create)
5. Should redirect to team details page, you are now captain

**Expected behavior:**
- ✅ Team created and appears in list
- ✅ Creator automatically becomes team CAPTAIN
- ✅ Can edit team details (if CAPTAIN)
- ✅ Unique constraint: can't create two teams with same name in same game

### 4.3 View Team Details

**Steps:**
1. Go to `/teams` and click a team card
2. Should show:
   - Team name, tag, logo, bio
   - Game name
   - List of members (with their roles: CAPTAIN, MEMBER)
   - Action buttons (depends on your role in team)

**Expected behavior:**
- ✅ All members listed with join dates
- ✅ CAPTAIN badge shows next to captain's name
- ✅ If you're not in the team: see **Join team** button
- ✅ If you're CAPTAIN: see **Edit**, **Add member**, **Remove member** buttons
- ✅ If you're a MEMBER: see **Leave team** button

### 4.4 Join a Team

**Steps (as a logged-in user not in the team):**
1. View a team you're not a member of
2. Click **Unirse al equipo** (Join team)
3. Should add you as a MEMBER

**Expected behavior:**
- ✅ You appear in team member list
- ✅ Button changes to **Salir del equipo** (Leave team)

### 4.5 Leave a Team

**Steps:**
1. Go to a team you're a member of
2. Click **Salir del equipo** (Leave team)
3. Confirm

**Expected behavior:**
- ✅ You're removed from member list
- ✅ If you were CAPTAIN and there are no other CAPTAINS, team might be orphaned (check API behavior)

### 4.6 Edit Team (Captain Only)

**Steps (must be CAPTAIN):**
1. Go to your team
2. Click **Editar** (Edit)
3. Update name, tag, bio, logo URL
4. Click **Guardar** (Save)

**Expected behavior:**
- ✅ Team details updated
- ✅ Changes visible immediately
- ✅ Non-captains cannot edit (no edit button)

### 4.7 Add/Remove Members (Captain Only)

**Steps (must be CAPTAIN):**
1. Go to your team
2. Click **Agregar miembro** (Add member)
3. Select a user from list
4. Should be added as MEMBER

To remove:
1. Click the **X** next to a member's name
2. Confirm
3. Member removed

**Expected behavior:**
- ✅ Member appears in list after adding
- ✅ Member removed from list after deletion
- ✅ Only users not already in the team appear in "add" dropdown

---

## Feature #5: Recruitment Posts

Players can post to find teammates, or teams can post to find players.

### 5.1 View Recruitment Feed

**Steps:**
1. Log in and go to `/recruitment`
2. Should see a list of recruitment posts

**Expected behavior:**
- ✅ Posts displayed by date (newest first)
- ✅ Each post shows:
  - Type (Looking for team / Looking for players)
  - Author name
  - Game name
  - Title
  - Body (truncated)
  - Status (Open / Closed)
  - Team name (if team is recruiting)
- ✅ Can click a post to view full details

### 5.2 Create a Recruitment Post

**Steps:**
1. Go to `/recruitment`
2. Click **Crear post** (Create post)
3. Fill form:
   - **Tipo** (Type): "Looking for team" or "Looking for players"
   - **Juego** (Game): select one
   - **Equipo** (Team) — *only if type is "Looking for players"*: select your team (if you're a captain)
   - **Título** (Title): e.g., "Buscamos mid para ranked"
   - **Descripción** (Body): detailed description
4. Click **Crear post** (Create post)

**Expected behavior:**
- ✅ Post appears in recruitment feed
- ✅ Your name shows as author
- ✅ Status defaults to "Open"
- ✅ Post is immediately visible to other users

### 5.3 View Post Details

**Steps:**
1. Click on a recruitment post
2. Should show full details:
   - Full title and body
   - Author info (name, email if it's you)
   - Game and team info
   - Open/Closed status
   - Action buttons (depends on if you're the author)

**Expected behavior:**
- ✅ Full body text visible
- ✅ Author's display name shown
- ✅ Game info clear
- ✅ If you created it: see Edit and Delete buttons
- ✅ If you didn't: see Contact info or no action buttons (UI dependent)

### 5.4 Edit a Post (Author Only)

**Steps (must be post author):**
1. View your post
2. Click **Editar** (Edit)
3. Update title, body, or status (Open/Closed)
4. Click **Guardar** (Save)

**Expected behavior:**
- ✅ Post updated immediately
- ✅ Non-authors cannot see edit button
- ✅ Status toggle: can mark as closed when recruitment is complete

### 5.5 Delete a Post (Author Only)

**Steps (must be post author):**
1. View your post
2. Click **Eliminar** (Delete)
3. Confirm

**Expected behavior:**
- ✅ Post removed from feed
- ✅ Deleted posts cannot be recovered (check if soft-delete or hard-delete)

---

## Feature #6: Health Check & API Status

### 6.1 API Health Endpoint

**Steps (for developers):**
```bash
# Local
curl http://localhost:4000/api/health

# Production
curl https://gamer-hub-api-495879844360.us-central1.run.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-09-26T03:15:00.000Z"
}
```

**Expected behavior:**
- ✅ Returns 200 OK
- ✅ Always accessible (no authentication required)
- ✅ Used by Cloud Run startup probes to verify the service is running

---

## Feature #7: Special/Debug Pages

### 7.1 Debug Page (`/debug`)

**Steps:**
1. Go to http://localhost:3000/debug (local only, may not exist in production)
2. Shows telemetry and debug info

**Expected behavior:**
- ✅ Displays client-side telemetry data
- ✅ Shows if API is configured correctly
- ✅ Useful for debugging connection issues

### 7.2 Telemetry Page (`/telemetry`)

**Steps:**
1. Go to `/telemetry`
2. Shows anonymized usage tracking (if enabled)

**Expected behavior:**
- ✅ Displays telemetry events (page views, errors, etc.)
- ✅ No personally identifiable info

### 7.3 Admin Flyers Page (`/admin/flyers`)

**Steps (ADMIN only):**
1. Go to `/admin/flyers`
2. Displays flyer/banner generation interface (related to the sibling `banners` project)

**Expected behavior:**
- ✅ Only accessible to ADMIN role
- ✅ Non-admins redirected to login or homepage

---

## Testing Checklist

Use this checklist to systematically test all features:

### Authentication
- [ ] Register new account via email
- [ ] Login with email/password
- [ ] Logout (verify cookie cleared)
- [ ] Try login with wrong password (error shown)
- [ ] Try login with non-existent email (error shown)
- [ ] OAuth login with Discord (if configured)
- [ ] OAuth login with Google (if configured)

### Dashboard & RBAC
- [ ] View dashboard when logged in
- [ ] Cannot access dashboard when logged out
- [ ] ADMIN can see member list
- [ ] EDITOR cannot see member list (403 error on API)
- [ ] MEMBER cannot see member list

### Gaming Profiles
- [ ] Add a game profile
- [ ] Cannot add same game twice
- [ ] Delete a game profile
- [ ] Link to FACEIT (if configured)
- [ ] Link to Riot (if configured)
- [ ] Refresh platform stats
- [ ] Unlink from platform

### Teams
- [ ] View teams list
- [ ] Filter teams by game
- [ ] Create a new team
- [ ] View team details
- [ ] Join a team
- [ ] Leave a team
- [ ] Edit team (as captain)
- [ ] Add member to team (as captain)
- [ ] Remove member from team (as captain)

### Recruitment Posts
- [ ] View recruitment feed
- [ ] Create "looking for team" post
- [ ] Create "looking for players" post (with team)
- [ ] View post details
- [ ] Edit post (as author)
- [ ] Close recruitment post
- [ ] Delete post (as author)

### API & Status
- [ ] Health check returns 200
- [ ] API is reachable from frontend
- [ ] CORS headers allow gameer.com.ar origin
- [ ] Protected endpoints require valid JWT

---

## Known Limitations & Notes

### Production (Live Site)
- OAuth (Discord, Google) may not be configured → buttons appear but don't function
- Database is Firestore (not PostgreSQL) → schema may differ slightly
- No pre-seeded demo accounts (use new signup)
- Seeded games (CS2, LoL, Valorant, Rocket League) may not exist in Firestore

### Local Development
- Platform linking (FACEIT, Riot) requires OAuth credentials configured
- Database is SQLite (different from production's Firestore)
- By default, run `pnpm db:seed` to populate demo accounts

### Features Not Yet Implemented
- User profile editing (display name, avatar change)
- Direct messaging between users
- Events/tournaments listing (planned)
- Leaderboards by game rank
- Admin dashboard for managing posts/teams

---

## Common Issues & Troubleshooting

### "Cannot find module '@nestjs/core'" error
- **Cause**: API image missing node_modules
- **Solution**: Rebuilt and deployed; should be resolved
- **Check**: Verify `https://gamer-hub-api-...run.app/api/health` returns 200

### CORS error when API is called from frontend
- **Cause**: API not configured with correct origin
- **Solution**: Check `WEB_ORIGIN` env var on API contains frontend URL
- **Check**: `curl -i -H "Origin: https://gameer.com.ar" https://gamer-hub-api.../api/me`

### "FIREBASE_PROJECT_ID is not set" on production
- **Cause**: Firestore not configured
- **Solution**: Already set in Cloud Run env vars
- **Check**: Logs show "FIREBASE_PROJECT_ID=unity-dummy"

### Seeded accounts not found in production
- **Cause**: Production uses Firestore; seeding was done locally with SQLite
- **Solution**: Create new accounts via signup instead
- **Check**: New account can login successfully

---

## API Endpoints Reference (for developers)

| Method | Endpoint                                  | Auth    | Purpose                              |
|--------|-------------------------------------------|---------|--------------------------------------|
| POST   | `/api/auth/register`                      | —       | Create new account                   |
| POST   | `/api/auth/login`                         | —       | Login with email/password            |
| POST   | `/api/auth/logout`                        | cookie  | Logout (clear session)               |
| GET    | `/api/auth/me`                            | cookie  | Get current user info                |
| GET    | `/api/auth/discord`                       | —       | Start Discord OAuth flow             |
| GET    | `/api/auth/discord/callback`              | —       | Discord OAuth callback               |
| GET    | `/api/auth/google`                        | —       | Start Google OAuth flow              |
| GET    | `/api/auth/google/callback`               | —       | Google OAuth callback                |
| GET    | `/api/users`                              | ADMIN   | List all users (RBAC protected)      |
| GET    | `/api/health`                             | —       | Health check                         |
| GET    | `/api/games`                              | —       | List all games                       |
| GET    | `/api/users/:userId/game-profiles`        | —       | Get user's game profiles (public)    |
| GET    | `/api/me/game-profiles`                   | cookie  | Get my game profiles                 |
| POST   | `/api/me/game-profiles`                   | cookie  | Add a game profile                   |
| PATCH  | `/api/me/game-profiles/:id`               | cookie  | Update game profile                  |
| DELETE | `/api/me/game-profiles/:id`               | cookie  | Delete game profile                  |
| GET    | `/api/teams`                              | cookie  | List teams (optionally by game)      |
| GET    | `/api/teams/:id`                          | cookie  | Get team details                     |
| POST   | `/api/teams`                              | cookie  | Create team                          |
| PATCH  | `/api/teams/:id`                          | cookie  | Edit team (captain only)             |
| POST   | `/api/teams/:id/members`                  | cookie  | Add member to team                   |
| DELETE | `/api/teams/:id/members/:userId`          | cookie  | Remove member from team              |
| GET    | `/api/recruitment-posts`                  | cookie  | List recruitment posts               |
| GET    | `/api/recruitment-posts/:id`              | cookie  | Get post details                     |
| POST   | `/api/recruitment-posts`                  | cookie  | Create recruitment post              |
| PATCH  | `/api/recruitment-posts/:id`              | cookie  | Edit post (author only)              |
| DELETE | `/api/recruitment-posts/:id`              | cookie  | Delete post (author only)            |
| POST   | `/api/platform-links/:id/refresh`         | cookie  | Refresh platform stats (FACEIT/Riot) |
| DELETE | `/api/platform-links/:id`                 | cookie  | Unlink platform                      |

---

## Next Steps

After testing all features:
1. **Report issues** in the GitHub repo
2. **Suggest features** via pull requests or issues
3. **For producers**: Update `/docs` if you change the feature set
4. **For devs**: Update API docs if you add endpoints

---

**Last updated:** 2026-09-26
**Frontend deployed:** https://gameer.com.ar
**API deployed:** https://gamer-hub-api-495879844360.us-central1.run.app
