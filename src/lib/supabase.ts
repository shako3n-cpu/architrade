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
      'Supabase is not configured. Copy .env.example to .env, fill in ' +
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.',
    )
  }
}

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
  if (!client) client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}
