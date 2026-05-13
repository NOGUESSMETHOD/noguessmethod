# Netlify setup notes

Use this deploy setup:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Set these in Netlify → Site configuration → Environment variables:

- `VITE_SUPABASE_URL` = `https://lbchkywhvpcutwjksdno.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your public anon key
- `SUPABASE_URL` = `https://lbchkywhvpcutwjksdno.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = service role key from Supabase, never commit this publicly
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`

After changing variables, use **Clear cache and deploy site**.
