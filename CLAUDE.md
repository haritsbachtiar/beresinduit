# BeresinDuit — Project Instructions

## Stack
- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Supabase (auth, database, storage)
- Deployment: Vercel (frontend) + Vercel Serverless Functions (API)
- Icons: Lucide React
- Font: Nunito (Google Fonts)

## Design Rules (NEVER violate these)
- Font: Nunito always, no exceptions
- Border radius: everything rounded, minimum 6px, never sharp corners
- Default theme: dark mode, light mode toggle available
- Accent color: #22c55e (green), gradient: linear-gradient(135deg, #22c55e, #16a34a)
- Dark BG: #0f0f0f base, #141414 surface, #1e1e1e card
- Light BG: #f5f7fa base, #ffffff card
- Currency: IDR format always (Rp 1.500.000) — no decimals
- Language: Bahasa Indonesia for ALL UI text

## Coding Rules
- Always use TypeScript
- Use Tailwind CSS for all styling — no inline styles, no CSS modules
- All Supabase queries must respect RLS (never use service role key on frontend)
- Components go in /src/components
- Pages go in /src/pages
- Supabase client initialized once in /src/lib/supabase.ts
- Environment variables: never hardcode, always use .env.local

## File Structure
beresinduit/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   │   └── supabase.ts
│   ├── hooks/
│   ├── types/
│   └── utils/
├── api/
│   └── scan-receipt.ts
├── supabase/
│   └── migrations/
├── public/
├── CLAUDE.md
├── .env.example
└── README.md

## Supabase Config

- Project URL: https://fzlgljzhkqkdwfqrrmxi.supabase.co
- Region: ap-southeast-1 (Singapore)
- MCP: dikonfigurasi di `/claude-projects/.mcp.json` (scoped, tidak global)
- Dashboard: https://supabase.com/dashboard/project/fzlgljzhkqkdwfqrrmxi

## When Adding Features
1. Always create the Supabase migration first
2. Then create TypeScript types
3. Then build the component
4. Always test mobile view (375px width)
