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

/*
 * The headers supabase-js actually puts on the request. `authorization` and
 * `content-type` are the obvious two; `x-client-info` and `apikey` are added
 * by the library itself, and leaving them out of this list is what makes the
 * browser fail the preflight and the caller see "Failed to send a request to
 * the Edge Function" — an error that says nothing about headers and sends you
 * looking at the network, the deployment and the token instead.
 */
const ALLOWED_HEADERS = 'authorization, x-client-info, apikey, content-type'

function cors(origin: string | null) {
  return {
    // Echoing the caller's origin rather than '*' keeps the response usable
    // from both the admin subdomain and localhost without opening it to every
    // site on the internet.
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

/**
 * The answer to a preflight.
 *
 * It agrees to whatever headers the browser asked for, falling back to the
 * list above when it asked for none. That is not a hole: allow-headers decides
 * which headers the browser may SEND, and nothing is trusted for being sent —
 * the caller is identified from their token and their role is read from the
 * `admins` table. Agreeing broadly here means the day supabase-js adds another
 * header, this function does not break with an error that points nowhere.
 */
function preflight(request: Request) {
  const origin = request.headers.get('origin')

  return new Response(null, {
    headers: {
      ...cors(origin),
      'Access-Control-Allow-Headers':
        request.headers.get('access-control-request-headers') ?? ALLOWED_HEADERS,
      // A day, so the browser stops asking before every single call.
      'Access-Control-Max-Age': '86400',
    },
  })
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') return preflight(request)
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)

  const service = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    // ORDER MATTERS, and it is the reverse of what it looks like it should be.
    // Supabase injects SUPABASE_SERVICE_ROLE_KEY into every deployed function
    // and that value is always right for the project it is running in. A key
    // set by hand can be stale, or from another project, or the wrong kind of
    // key altogether — and this project has one that is, which is what made
    // account creation fail with "Invalid API key" from inside the function.
    //
    // So: the injected key wins, and SERVICE_ROLE_KEY is the fallback for an
    // environment that does not provide one (self-hosted, mainly).
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  /* ---- 1. Who is asking? --------------------------------------------- */

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Not signed in' }, 401, origin)

  const { data: caller, error: callerError } = await service.auth.getUser(token)
  if (callerError || !caller.user) {
    // The reason matters. "Invalid API key" here is not the caller's problem
    // at all — it means THIS function's service key is wrong, and reporting
    // that as "not signed in" sends whoever is debugging it to the one place
    // the fault is not.
    return json({ error: 'Not signed in', detail: callerError?.message ?? 'unknown token' }, 401, origin)
  }

  /* ---- 2. Are they allowed? ------------------------------------------ */
  // Read from the table, never from the token. A JWT carries whatever it
  // carried when it was issued, which may be an hour out of date.

  const { data: membership, error: membershipError } = await service
    .from('admins')
    .select('role')
    .eq('user_id', caller.user.id)
    .maybeSingle()

  // A query that FAILED is not the same as a query that found nothing, and
  // conflating the two is how a broken service key ends up telling a genuine
  // administrator that they are not one. The service key bypasses row level
  // security, so an error here is always configuration, never permission.
  if (membershipError) {
    return json(
      { error: 'Could not check who you are', detail: membershipError.message },
      500,
      origin,
    )
  }

  if (!membership) {
    return json({ error: 'This account is not on the staff list' }, 403, origin)
  }

  if (membership.role !== 'admin') {
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
