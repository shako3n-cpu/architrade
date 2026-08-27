// @ts-nocheck — this file runs on Deno inside Supabase, not in the Vite build.
// It sits outside `src`, so the app's tsc never looks at it; the pragma is for
// editors that do.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * ============================================================================
 * CREATE A STAFF ACCOUNT
 * ----------------------------------------------------------------------------
 * POST /functions/v1/admin-users
 *   Authorization: Bearer <the calling admin's access token>
 *   { "email": "...", "password": "...", "role": "operator" | "admin" }
 *
 * WHY THIS EXISTS AT ALL
 *   Making a user in Supabase Auth requires the service_role key. That key
 *   bypasses row level security entirely — it can read and rewrite every table
 *   in the project — so it must never be in client JavaScript, where anybody
 *   can read it out of the bundle. It lives here instead, on a server, and the
 *   browser gets an endpoint rather than a key.
 *
 * WHAT MAKES IT SAFE
 *   The service_role client is used for exactly two things: identifying the
 *   caller from their own token, and doing the work once the caller has been
 *   proved to be an admin. The caller's token is never trusted for anything it
 *   asserts about itself — the role is read from the `admins` table, not from
 *   the JWT.
 *
 * DEPLOY
 *   supabase functions deploy admin-users
 *
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to deployed
 *   functions automatically, and neither belongs in the project's .env.
 *
 *   If you ever have to supply the key yourself, set it as SERVICE_ROLE_KEY —
 *   the SUPABASE_ prefix is reserved and secrets cannot be set under it:
 *
 *     supabase secrets set SERVICE_ROLE_KEY=<the key>
 * ============================================================================
 */

const ROLES = ['admin', 'operator']

/** The shortest password Supabase Auth accepts by default. */
const MIN_PASSWORD_LENGTH = 8

function cors(origin: string | null) {
  return {
    // Echoing the caller's origin rather than '*' keeps the response usable
    // from both the admin subdomain and localhost without opening it to every
    // site on the internet.
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)

  const service = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    // SERVICE_ROLE_KEY first, SUPABASE_SERVICE_ROLE_KEY as the fallback.
    // Supabase injects the SUPABASE_ prefixed one into deployed functions, but
    // the prefix is reserved and cannot be set by hand — so a project that
    // needs to supply the key itself has to use the unprefixed name. Reading
    // both means either arrangement works without editing this file.
    Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  /* ---- 1. Who is asking? --------------------------------------------- */

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Not signed in' }, 401, origin)

  const { data: caller, error: callerError } = await service.auth.getUser(token)
  if (callerError || !caller.user) return json({ error: 'Not signed in' }, 401, origin)

  /* ---- 2. Are they allowed? ------------------------------------------ */
  // Read from the table, never from the token. A JWT carries whatever it
  // carried when it was issued, which may be an hour out of date.

  const { data: membership } = await service
    .from('admins')
    .select('role')
    .eq('user_id', caller.user.id)
    .maybeSingle()

  if (membership?.role !== 'admin') {
    return json({ error: 'Administrators only' }, 403, origin)
  }

  /* ---- 3. Is the request sound? -------------------------------------- */

  let body: { email?: string; password?: string; role?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Expected a JSON body' }, 400, origin)
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  const role = body.role ?? 'operator'

  if (!email.includes('@')) return json({ error: 'A valid email is required' }, 400, origin)
  if (password.length < MIN_PASSWORD_LENGTH) {
    return json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, 400, origin)
  }
  if (!ROLES.includes(role)) return json({ error: 'Unknown role' }, 400, origin)

  /* ---- 4. Do it ------------------------------------------------------- */

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    // This project has no mail sender, so an unconfirmed account could never
    // be confirmed and its password would never work.
    email_confirm: true,
  })

  if (createError || !created.user) {
    return json({ error: createError?.message ?? 'Could not create the account' }, 400, origin)
  }

  const { data: staff, error: staffError } = await service
    .from('admins')
    .insert({ user_id: created.user.id, email, role })
    .select('user_id, email, role, created_at')
    .single()

  if (staffError) {
    // Undo the auth user rather than leaving an account nobody can see in the
    // dashboard and nobody can manage.
    await service.auth.admin.deleteUser(created.user.id)
    return json({ error: staffError.message }, 400, origin)
  }

  return json({ staff }, 201, origin)
})
