# Algorithm Pattern Atlas — Assignment 2

The original Week 1 Next.js app, extended with a Supabase-backed algorithm pattern atlas.

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and legacy anon key from Supabase. Never use a service-role key.
3. Run `npm install` and `npm run dev`.
4. Open http://localhost:3000.

`.env.local` is ignored by Git. `.env.example` contains only variable names.

## How it works

`app/page.tsx` is an async Server Component. It reads the Supabase URL and anon key from environment variables, selects algorithm pattern rows, and renders a card for each row. `connection()` makes the query run at request time, so database edits appear on the next page load. Empty and failed queries have separate messages.

The SQL script creates twelve sample patterns and enables Row Level Security. Anonymous and authenticated visitors have SELECT access only; no public insert, update, or delete access is granted.

## Vercel deployment

Continue using the existing Vercel project connected to this repository. Add these environment variables to both Production and Preview before deploying:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Run `npm run build` and `npm run lint`, commit and push the changes, and verify the resulting Vercel deployment. Deployment Protection must be disabled for the assignment. Open the unique deployment URL in an incognito window and verify that the pattern cards appear. Submit the unique URL associated with the final commit, rather than the moving production or branch alias.
