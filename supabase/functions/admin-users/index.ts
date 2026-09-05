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
 *   Nothing here needs a secret set by hand.
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
    // PATCH belongs here, not only in the method check below. A method the
    // preflight does not name is refused by the BROWSER, before the request is
    // ever sent — so the function would read as correct and still fail, with a
    // CORS message that says nothing about a method being missing.
    'Access-Control-Allow-Methods': 'POST, PATCH, DELETE, OPTIONS',
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
  if (request.method !== 'POST' && request.method !== 'DELETE' && request.method !== 'PATCH') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  const service = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    // Injected by Supabase into every deployed function, and always the right
    // key for the project it is running in. Never set by hand: a key typed in
    // here can be stale, from another project, or the wrong kind of key
    // altogether, and the failure it produces is a misleading "Invalid API
    // key" raised from inside the function rather than at the caller.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

  /* ---- 3. Removing somebody takes a different path ------------------- */

  if (request.method === 'DELETE') {
    return await removeStaffMember(service, request, origin, caller.user.id)
  }

  if (request.method === 'PATCH') {
    return await resetOperatorPassword(service, request, origin)
  }

  /* ---- 4. Is the request sound? -------------------------------------- */

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

  /* ---- 5. Do it ------------------------------------------------------- */

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

/**
 * ============================================================================
 * REMOVE A STAFF MEMBER, IDENTITY AND ALL
 * ----------------------------------------------------------------------------
 * DELETE /functions/v1/admin-users
 *   Authorization: Bearer <the calling admin's access token>
 *   { "user_id": "..." }
 *
 * WHAT WAS WRONG BEFORE
 *   Removing somebody deleted their row from `admins` and stopped there,
 *   because deleting an auth identity needs the service_role key and no
 *   browser may hold one. So the login survived every removal — invisible in
 *   the dashboard, unable to do anything, and still holding its email address.
 *   Re-adding that same person then failed on "A user with this email address
 *   has already been registered", naming a conflict with an account the
 *   dashboard had already claimed to delete and could not show.
 *
 * ONE DELETE, NOT TWO
 *   `admins.user_id` is `references auth.users(id) ON DELETE CASCADE`, so
 *   removing the identity removes the staff row with it, in one statement the
 *   database makes atomic. Deleting both by hand would open the window this
 *   endpoint exists to close: a failure between the two leaves exactly the
 *   half-removed state that caused the bug.
 *
 * REPAIRING WHAT THE OLD FLOW LEFT
 *   An account deleted the old way — or by hand in the Supabase dashboard —
 *   can leave a staff row whose identity is already gone. Deleting the
 *   identity then reports "not found" and cascades nothing, so this falls back
 *   to clearing the staff row directly. Either way the caller gets a clean
 *   result rather than an error about a state they did not create.
 * ============================================================================
 */
async function removeStaffMember(
  service: ReturnType<typeof createClient>,
  request: Request,
  origin: string | null,
  callerId: string,
) {
  /*
   * The id may arrive in the body or in the query string.
   *
   * A DELETE with a body is legal and supabase-js sends one, but bodies on
   * DELETE are the sort of thing an intermediary drops, and the failure would
   * look like "no user_id" rather than like a stripped body. Reading both
   * costs three lines and removes a class of works-here-not-there.
   */
  let userId = ''
  try {
    const body = (await request.json()) as { user_id?: string }
    userId = body.user_id?.trim() ?? ''
  } catch {
    userId = ''
  }
  if (!userId) userId = new URL(request.url).searchParams.get('user_id')?.trim() ?? ''

  if (!userId) return json({ error: 'A user_id is required' }, 400, origin)

  /*
   * AN ADMIN MAY NOT REMOVE THEMSELVES.
   *
   * Not paternalism: this endpoint is the only way to grant staff access, and
   * it is administrators-only. The last admin deleting their own account locks
   * everybody out of the dashboard permanently, with no path back that does
   * not involve the Supabase console and the service_role key.
   */
  if (userId === callerId) {
    return json({ error: 'You cannot remove your own account' }, 400, origin)
  }

  /* Nor the last administrator, for the same reason by a different route. */
  const { data: target, error: targetError } = await service
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (targetError) {
    return json({ error: 'Could not look that account up', detail: targetError.message }, 500, origin)
  }

  if (target?.role === 'admin') {
    const { count, error: countError } = await service
      .from('admins')
      .select('user_id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (countError) {
      return json({ error: 'Could not count administrators', detail: countError.message }, 500, origin)
    }
    if ((count ?? 0) <= 1) {
      return json({ error: 'This is the last administrator' }, 400, origin)
    }
  }

  /* ---- Do it. The cascade takes the staff row with the identity. ------- */

  const { error: deleteError } = await service.auth.admin.deleteUser(userId)

  if (deleteError) {
    // The identity is already gone but a staff row is still pointing at it —
    // the residue of the old two-step removal. Clear the row so the dashboard
    // can finish what the previous flow started.
    const alreadyGone = /not.?found/i.test(deleteError.message)
    if (!alreadyGone) {
      return json({ error: deleteError.message }, 400, origin)
    }

    const { error: rowError } = await service.from('admins').delete().eq('user_id', userId)
    if (rowError) return json({ error: rowError.message }, 400, origin)

    return json({ removed: userId, identity: 'was already gone' }, 200, origin)
  }

  return json({ removed: userId, identity: 'deleted' }, 200, origin)
}


/**
 * ============================================================================
 * SET AN OPERATOR'S PASSWORD
 * ----------------------------------------------------------------------------
 * PATCH /functions/v1/admin-users
 *   Authorization: Bearer <the calling admin's access token>
 *   { "user_id": "...", "password": "..." }
 *
 * WHY THE ADMIN TYPES A PASSWORD INSTEAD OF SENDING A LINK
 *   The ordinary answer to "I have forgotten my password" is an emailed reset
 *   link, and it is the better one, because nobody but the account holder ever
 *   learns the secret. This project has no mail sender configured — the create
 *   path above sets `email_confirm: true` for exactly that reason — so a link
 *   would be generated and never delivered. Setting the password directly and
 *   handing it over is the only flow that works here. If SMTP is ever
 *   configured, replace this with `generateLink` and delete it.
 *
 * OPERATORS ONLY, AND THAT IS THE WHOLE SECURITY ARGUMENT
 *   Whoever can set an account's password can sign in as that account. An
 *   admin already outranks an operator in every way this dashboard offers, so
 *   being able to reset one grants no reach they did not have. Another ADMIN
 *   is a different matter: that is one peer silently taking over another's
 *   fully privileged account, and it is refused here. So is the caller's own
 *   account, which keeps this endpoint from being a way to change your own
 *   password without knowing the old one.
 *
 *   A locked-out administrator is recovered from the Supabase console. That is
 *   deliberately more friction than a click, and it is the right amount for
 *   an operation nobody should be doing weekly.
 *
 * THE ROLE IS READ FROM THE TABLE, NOT FROM THE REQUEST
 *   The caller sends a user_id and nothing else that matters. Whether that id
 *   belongs to an operator is looked up here, so a caller cannot claim a
 *   target is an operator in order to reset an admin.
 * ============================================================================
 */
async function resetOperatorPassword(
  service: ReturnType<typeof createClient>,
  request: Request,
  origin: string | null,
) {
  let body: { user_id?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Expected a JSON body' }, 400, origin)
  }

  const userId = body.user_id?.trim() ?? ''
  const password = body.password ?? ''

  if (!userId) return json({ error: 'A user_id is required' }, 400, origin)
  if (password.length < MIN_PASSWORD_LENGTH) {
    return json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, 400, origin)
  }

  const { data: target, error: targetError } = await service
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (targetError) {
    return json({ error: 'Could not look that account up', detail: targetError.message }, 500, origin)
  }

  // Not on the staff list at all. Refused rather than reported, because this
  // endpoint has no business touching an account the dashboard does not manage
  // — and answering differently for "no such user" would turn it into a way to
  // ask which ids exist.
  if (!target) return json({ error: 'That account is not on the staff list' }, 404, origin)

  if (target.role !== 'operator') {
    return json({ error: 'Only an operator password can be reset here' }, 403, origin)
  }

  const { error: updateError } = await service.auth.admin.updateUserById(userId, { password })

  if (updateError) return json({ error: updateError.message }, 400, origin)

  // The password is NOT echoed. The caller sent it and already has it; sending
  // it back only widens where it can be logged.
  return json({ reset: userId }, 200, origin)
}
