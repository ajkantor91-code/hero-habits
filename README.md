# Hero Habits (PWA)

A Zelda-inspired, Habitica-style app for **private solo tasks** + **public leaderboard** (name + avatar + XP only).

## What you get
- Magic-link login (Supabase Auth)
- Private tasks (Row Level Security enforced)
- Completing tasks awards XP (positive-only)
- Levels (based on total XP)
- Customizable avatars (pre-made parts)
- Weekly + all-time leaderboard

## 1) Create the Supabase project
1. Create a Supabase project.
2. In **SQL Editor**, run the SQL from the chat message (tables + RLS + leaderboard views).
3. In **Authentication → Providers**, enable **Email**.
4. In **Authentication → URL Configuration**:
   - Add your future site URL to **Redirect URLs** (you can add later after deploying).

## 2) Configure environment variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3) Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## 4) Get a shareable link (deploy)
### Option A (recommended): Vercel
1. Create a free Vercel account.
2. Put this folder on GitHub (upload via the GitHub website is fine).
3. In Vercel: **Add New → Project → Import** that repo.
4. Add the same env vars in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

After deploy, copy your Vercel URL and add it to Supabase:
- Supabase → Authentication → URL Configuration → **Redirect URLs**

### Option B: Netlify
Similar flow: import from GitHub, set the same env vars.

## iPhone “install”
Open the link in Safari → Share → **Add to Home Screen**.

## Next upgrades (easy)
- Friends-only leaderboards using `friendships`
- Daily streak bonus (positive-only)
- Real avatar art (original SVG layers)
