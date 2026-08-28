import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * ============================================================================
 * SUPABASE CLIENT
 * ----------------------------------------------------------------------------
 * One shared connection to the database, created once on first use:
 *
 *   import { getSupabase } from '@/lib/supabase'
 *   const { data, error } = await getSupabase().from('products').select('*')
 *
 * In practice you should not need this directly — every query the site makes
 * lives in src/lib/queries.ts, and pages read those through the hooks in
 * src/hooks/use-catalog.ts.
 *
 * Never call createClient() anywhere else. A second client means a second
 * connection and a second auth session.
 *
 * CONFIGURATION
 *   Both values come from a `.env` file in the project root, which is NOT in
 *   git. Copy `.env.example` to `.env` and paste the two values from your
 *   Supabase dashboard (Project settings -> API):
 *
 *     VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
 *     VITE_SUPABASE_ANON_KEY=eyJhbGci...
 *
 *   The file must be named exactly `.env` — not `.env.txt`. Windows adds the
 *   .txt silently when you save from Notepad, and Vite will not read it.
 *
 *   Vite only exposes variables beginning with VITE_ to the browser, and it
 *   reads .env at STARTUP — restart `npm run dev` after editing it.
 *
 * ON THE ANON KEY
 *   The anon key is meant to be public and ships inside the built JavaScript.
 *   What keeps the data safe is Row Level Security on the tables, not secrecy
 *   of this key. Turn RLS on for every table, with a read-only policy for the
 *   public catalogue. Never put the `service_role` key in this file — that one
 *   bypasses RLS and must stay on a server.
 * ============================================================================
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True when both environment variables are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Thrown when a query runs before the environment variables exist. Carries a
 * distinct name so the UI can tell "nobody filled in .env" apart from "the
 * network is down", and show the developer the more useful of the two.
 */
export class SupabaseConfigError extends Error {
  override name = 'SupabaseConfigError'

  constructor() {
    super(
      import.meta.env.PROD
        ? 'Supabase is not configured. This build was made without ' +
          'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. On Vercel they must ' +
          'be set for the environment being deployed — Preview and Production ' +
          'are separate lists — and the deployment rebuilt afterwards.'
        : 'Supabase is not configured. Copy .env.example to .env, fill in ' +
          'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.',
    )
  }
}

/**
 * Which explanation to show a human when the keys are missing.
 *
 * The advice is not the same in both places and the wrong one wastes real
 * time: on a laptop the fix is a .env file, on a deployed preview there is no
 * .env and no dev server to restart — the fix is in the host's environment
 * variables. Vite folds `import.meta.env.PROD` to a literal at build time, so
 * only one of these strings survives into the bundle.
 */
export const SUPABASE_CONFIG_BODY_KEY = import.meta.env.PROD
  ? 'state.notConfiguredDeployed'
  : 'state.notConfiguredBody'

let client: SupabaseClient | null = null

/**
 * The shared client, built on first use.
 *
 * Deliberately NOT created at module load: a missing .env would then throw
 * while the module graph was still evaluating, which React cannot catch, and
 * the whole site would render as a blank white page. Failing here instead
 * means the error arrives inside a query, where the page can show it.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) throw new SupabaseConfigError()
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        /*
         * Spelled out rather than left to the defaults, because the admin
         * dashboard depends on both and a silent change would look like
         * a random sign-out.
         *
         *   persistSession    the session is written to localStorage, so a
         *                     refresh or a new tab stays signed in. Route
         *                     changes never touch it — the client is a module
         *                     singleton and React Router does not reload the
         *                     page — so moving between /admin screens cannot
         *                     lose it either.
         *   autoRefreshToken  the access token lasts an hour; supabase-js
         *                     renews it in the background so a long editing
         *                     session does not expire mid-save.
         *
         * localStorage is per ORIGIN, so a session on the catalogue hostname
         * and a session on the admin hostname are separate: signing in on one
         * does not sign you in on the other. That is the correct behaviour
         * here, and it is why the back office lives on its own hostname.
         */
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}
