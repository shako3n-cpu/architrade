// @ts-nocheck — this file runs on Deno inside Supabase, not in the Vite build.
// It sits outside `src`, so the app's tsc never looks at it; the pragma is for
// editors that do.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * ============================================================================
 * PURGE THE ARCHIVE
 * ----------------------------------------------------------------------------
 * POST /functions/v1/purge-products
 *   Authorization: Bearer <the calling admin's access token>
 *   { "retentionDays": 30 }        // optional, defaults to 30
 *
 * OPTIONAL. supabase-retention.sql already does this every night in the
 * database, and for most projects that is enough. This exists for one reason:
 * a SQL delete removes the photograph's row from storage.objects — which is
 * what makes it disappear, stop being served and stop being listed — but the
 * blob behind it belongs to Supabase's storage service rather than to the
 * database, and only the storage API is guaranteed to reclaim it.
 *
 * So: same work, same order, but the photographs go through storage.remove().
 *
 * WHAT MAKES IT SAFE
 *   The service_role key bypasses row level security on every table, so it
 *   never leaves this file. The caller's token is trusted only to say who they
 *   are; whether they are an administrator is read from the `admins` table.
 *   Beyond that, the only rows it can touch are ones whose own `deleted_at`
 *   says they are past the window — there is no way to name a victim.
 *
 * DEPLOY
 *   supabase functions deploy purge-products
 *
 *   Then either call it by hand, or point a scheduled job at it. If you use
 *   this instead of the nightly SQL job, unschedule that one:
 *
 *     select cron.unschedule('archtrade-purge-products');
 * ============================================================================
 */

const BUCKET = 'product-images'
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`
const DEFAULT_RETENTION_DAYS = 30

/** The object name inside our bucket, or '' for a photograph hosted elsewhere. */
function objectName(url: string): string {
  const [withoutQuery] = url.split('?')
  const at = withoutQuery.indexOf(PUBLIC_PREFIX)
  return at === -1 ? '' : withoutQuery.slice(at + PUBLIC_PREFIX.length)
}

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

  /* ---- 1. Who is asking, and are they allowed? ------------------------ */

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Not signed in' }, 401, origin)

  const { data: caller, error: callerError } = await service.auth.getUser(token)
  if (callerError || !caller.user) return json({ error: 'Not signed in' }, 401, origin)

  const { data: membership } = await service
    .from('admins')
    .select('role')
    .eq('user_id', caller.user.id)
    .maybeSingle()

  if (membership?.role !== 'admin') {
    return json({ error: 'Administrators only' }, 403, origin)
  }

  /* ---- 2. How far back? ----------------------------------------------- */

  let retentionDays = DEFAULT_RETENTION_DAYS
  try {
    const body = await request.json()
    if (typeof body?.retentionDays === 'number') retentionDays = body.retentionDays
  } catch {
    // No body at all is the ordinary case; the default stands.
  }

  if (!Number.isFinite(retentionDays) || retentionDays < 0) {
    return json({ error: 'retentionDays must be zero or more' }, 400, origin)
  }

  const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString()

  /* ---- 3. What is past the window? ------------------------------------ */

  const { data: doomed, error: doomedError } = await service
    .from('products')
    .select('id, images')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff)

  if (doomedError) return json({ error: doomedError.message }, 500, origin)
  if (!doomed?.length) return json({ purgedProducts: 0, purgedFiles: 0 }, 200, origin)

  const ids = doomed.map((product) => product.id)

  /* ---- 4. Which photographs go with them? ----------------------------- */
  // Only files in our own bucket, and only ones no surviving product shows.
  // Object names carry a random suffix so a shared file should be impossible,
  // but that is not a good enough reason to delete somebody else's photograph.

  const { data: survivors, error: survivorsError } = await service
    .from('products')
    .select('images')
    .not('id', 'in', `(${ids.join(',')})`)

  if (survivorsError) return json({ error: survivorsError.message }, 500, origin)

  const kept = new Set<string>()
  for (const product of survivors ?? []) {
    for (const url of product.images ?? []) {
      const name = objectName(url)
      if (name) kept.add(name)
    }
  }

  const files = new Set<string>()
  for (const product of doomed) {
    for (const url of product.images ?? []) {
      const name = objectName(url)
      if (name && !kept.has(name)) files.add(name)
    }
  }

  /* ---- 5. Photographs first, then the rows ---------------------------- */
  // This order matters. If the storage call fails the rows stay, and the next
  // run tries again; the other way round would leave files with nothing left
  // in the database pointing at them, and no way to know which they were.

  let purgedFiles = 0
  if (files.size > 0) {
    const { data: removed, error: removeError } = await service.storage
      .from(BUCKET)
      .remove([...files])

    if (removeError) return json({ error: removeError.message }, 500, origin)
    purgedFiles = removed?.length ?? 0
  }

  const { error: deleteError } = await service.from('products').delete().in('id', ids)
  if (deleteError) return json({ error: deleteError.message }, 500, origin)

  return json({ purgedProducts: ids.length, purgedFiles }, 200, origin)
})
