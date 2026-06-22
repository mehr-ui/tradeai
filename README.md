# The Trade — AI Assistant

AI chat assistant for interior design and construction businesses, powered by Claude.

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your API key**

   Open `.env.local` and paste your key:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   Get a key at [console.anthropic.com](https://console.anthropic.com).

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. In the Vercel project settings → **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key
4. Deploy. Done.

> The API key is server-only. It is never exposed to the browser.
