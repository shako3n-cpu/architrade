-- ============================================================================
-- REVOKING SOMEBODY ELSE'S SESSIONS
-- ----------------------------------------------------------------------------
-- Run once, in the Supabase SQL editor.
--
-- WHY THIS IS SQL AND NOT AN API CALL
--   Changing a password with the admin API does not end the sessions that were
--   opened with the old one. A colleague already signed in stays signed in,
--   which makes "reset their password" a much weaker sentence than anybody
--   reading it in the dashboard would assume.
--
--   There is no admin endpoint for this. `auth.admin.signOut(jwt)` needs the
--   TARGET'S access token, which the administrator resetting the password does
--   not have and must not have. GoTrue's own /logout ends the caller's session
--   and nobody else's. What is left is the sessions table, which is real and
--   is what those endpoints would be writing to anyway.
--
-- SECURITY DEFINER, AND WHY THAT IS SAFE HERE
--   This runs as its owner so it can reach the `auth` schema, which is not
--   exposed through PostgREST and is not reachable by a browser at any level
--   of privilege. Two things keep that from being a hole:
--
--     - EXECUTE is revoked from public, anon and authenticated, and granted
--       only to service_role. A signed-in operator calling this by hand gets a
--       permission error, not a logged-out colleague.
--     - `search_path = ''` is set on the function, so every name inside it is
--       schema-qualified and resolved at definition time. Without it, a caller
--       who controls their own search_path could put a table called
--       `sessions` in front of `auth.sessions` and have this delete from that
--       instead — the standard way a SECURITY DEFINER function is turned
--       against its owner.
--
--   It takes a user id and does exactly one thing with it. There is no branch
--   and nothing is returned but a count, so there is no way to ask it a
--   question about a user it was not already given.
-- ============================================================================

create or replace function public.revoke_user_sessions(target uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  -- The sessions themselves. auth.refresh_tokens references these with
  -- ON DELETE CASCADE, so the tokens go with them in the same statement.
  delete from auth.sessions where user_id = target;
  get diagnostics removed = row_count;

  -- Belt and braces for older rows: before sessions existed, refresh tokens
  -- hung off the user directly, and a project that has been upgraded can still
  -- hold some. `user_id` is text on this table, not uuid.
  delete from auth.refresh_tokens where user_id = target::text;

  return removed;
end;
$$;

comment on function public.revoke_user_sessions(uuid) is
  'Ends every session for one user. service_role only; called by the admin-users edge function after a password reset.';

-- The default on a new function is EXECUTE to public. Left alone, any signed-in
-- visitor could end anybody's session.
revoke all on function public.revoke_user_sessions(uuid) from public;
revoke all on function public.revoke_user_sessions(uuid) from anon;
revoke all on function public.revoke_user_sessions(uuid) from authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- CHECKING IT
-- ----------------------------------------------------------------------------
-- Who may run it — service_role and nothing else:
--
--   select grantee, privilege_type
--   from information_schema.routine_privileges
--   where routine_name = 'revoke_user_sessions';
--
-- How many sessions somebody has open right now:
--
--   select count(*) from auth.sessions where user_id = '<uuid>';
-- ============================================================================
