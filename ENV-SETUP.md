# Environment variables (Alpaca & local dev)

The **live site** gets Alpaca keys from your host’s environment (e.g. Vercel). Your **local** dev server does not — it only reads from files in this project. So you need to add the same keys locally.

---

## 1. Get the keys from your host (if the live site already works)

You already set these where the app is deployed. Copy them from there:

- **Vercel:** Project → **Settings** → **Environment Variables**. Copy `ALPACA_API_KEY` and `ALPACA_SECRET_KEY`.
- **Netlify / other:** Use that host’s “Environment variables” or “Env” section and copy the same two names/values.

If you don’t have the keys anymore, create new ones in Alpaca (see step 2) and update both your host and your local `.env.local`.

---

## 2. Create Alpaca keys (if you don’t have them)

1. Go to [Alpaca](https://alpaca.markets) and sign in.
2. Open **Paper Trading** (not Live).
3. Go to **API Keys** (or **Your API Keys**).
4. Create a new key pair. You’ll see:
   - **Key ID** → use as `ALPACA_API_KEY`
   - **Secret** → use as `ALPACA_SECRET_KEY`  
   Copy the secret once; it may not be shown again.

---

## 3. Add keys locally

1. In this project root (same folder as `package.json`), create a file named **`.env.local`** (with the leading dot).
2. Add these lines (paste your real values, no quotes needed):

   ```env
   ALPACA_API_KEY=your_key_id_here
   ALPACA_SECRET_KEY=your_secret_here
   ```

3. Save the file.  
   `.env.local` is gitignored, so it won’t be committed.

---

## 4. Restart the dev server

Env vars are loaded when the server starts. So:

1. Stop the current dev server (Ctrl+C in the terminal).
2. Start it again:

   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 and refresh. The portfolio stats should load from Alpaca.

---

## Variable names this project uses

| Variable                 | Used for              |
|--------------------------|------------------------|
| `ALPACA_API_KEY`         | Alpaca API key ID      |
| `ALPACA_SECRET_KEY`      | Alpaca secret key      |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Contact form (optional) |

See `.env.example` for a template.
