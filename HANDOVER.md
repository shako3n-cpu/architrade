# Handover

Notes for whoever picks this up next. Not a spec and not a changelog — just the
things that are not visible from the code, and the reasoning behind decisions
that would otherwise look arbitrary.

## Known issues / lessons

### Admin 2FA: the previous attempt did not work, and why

An earlier branch (`Preview`, since deleted) added a six-digit email code to
the admin login. It was **not merged**, and it should not be revived as it
stood. The commit was `45ba2958b0275bbee28a36398b2225e898b0cd74`, by Tinmisho,
2026-08-27.

Two things were wrong with it.

**The session already existed before the code was asked for.** The flow called
`signInWithPassword` first, which makes Supabase issue a complete, valid
session, and only then sent the code. The thing standing between the password
and the dashboard was a `localStorage` key —
`archtrade-admin-mfa-verified:<userId>` — that the app set on itself and then
trusted. Anyone holding the password could set that key in devtools, or ignore
the browser entirely and use the issued access token straight against
PostgREST. The commit message argued that row level security was the real
protection, which is true in general but not for this: RLS authorises from the
JWT, and the JWT had already been minted at the password step. So the code
prompt was a speed bump in the interface, not a second factor.

A smaller version of the same problem: the stored value was a timestamp that
nothing ever read back. `hasMfaVerified` only checked that the key existed, so
one successful code entry exempted that browser permanently.

**It needed an email sender this project does not have.** It relied on
Supabase's built-in OTP mail. The `admin-users` edge function says the opposite
in its own comment, which is why it force-confirms new accounts:

> This project has no mail sender, so an unconfirmed account could never be
> confirmed and its password would never work.

If that is still true, merging the branch would have locked every administrator
out of `/admin` with no way back in except the Supabase console.

**If 2FA is picked up again**, two things have to be settled first:

1. **Confirm a working mail sender.** Check whether custom SMTP is configured
   in the Supabase dashboard, and send a real test. Supabase's default sender
   is rate-limited to a handful of messages an hour and, on newer projects,
   only delivers to addresses on the project's own team — neither is usable
   for staff logins.
2. **Do not issue the session until the code is verified.** A client-side flag
   cannot gate something the server has already granted. This means either
   Supabase's own MFA (`auth.mfa.*`, which enrols a factor and withholds the
   `aal2` session until the challenge passes) or an edge function that holds
   the credentials and only returns a session once the code checks out. Either
   way the check belongs on the server.

The deleted branch's tip is tagged locally as `archive/preview-2fa` on the
machine that removed it. That tag was never pushed, so on any other clone the
commit is recoverable only from GitHub's own retention window. Nothing else in
the branch was lost: its other commit, the admin nav chip, was already on
`main` as `f1784f8` — the same patch, byte for byte.
