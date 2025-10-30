## Excel to Insights

Upload Excel files (.xls/.xlsx), map columns to X/Y, and generate interactive 2D/3D charts. Save and revisit your history, and optionally enable an Admin panel with usage insights.

### Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
- Supabase (Auth, Postgres, RLS)
- Tailwind CSS 4, Radix UI, Recharts

### Features
- Upload and parse Excel via `xlsx`
- Column mapping for X and Y, multiple chart types (line, bar, pie, 3D column)
- Persistent analysis history per user
- Admin page (optional) with usage RPC guarded by RLS

### Prerequisites
- Node.js 20+ recommended
- Supabase project (URL + anon key)

### Environment
Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database setup (Supabase SQL)
Run these scripts from `scripts/sql/` in the Supabase SQL editor, in order:
1. `010_create_analyses.sql`
2. `011_analyses_policies.sql`
3. `012_create_profiles.sql`
4. `013_admin_rpc.sql`

If you previously created a recursive profiles policy, drop it and re-run `012_create_profiles.sql`.

To promote a user to admin after they sign in once:

```
-- Edit the email first
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

### Install & Run
```
npm install
npm run dev
```

Open `http://localhost:3000`.

### Project Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server

### Deployment
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your host’s env.
- Run the SQL scripts on your Supabase database before first start.

### License
MIT


