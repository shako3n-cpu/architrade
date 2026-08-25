import { createClient } from '@supabase/supabase-js'

/**
 * ============================================================================
 * SUPABASE CLIENT
 * ----------------------------------------------------------------------------
 * One shared connection to the database, created once and imported everywhere:
 *
 *   import { supabase } from '@/lib/supabase'
 *   const { data, error } = await supabase.from('products').select('*')
 *
 * Never call createClient() anywhere else — a second client means a second
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

/**
 * Fail loudly and early rather than letting every query fail with a confusing
 * network error much later on.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase is not configured. Copy .env.example to .env, fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
