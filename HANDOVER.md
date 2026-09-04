# Handover

Notes for whoever picks this up next. Not a spec and not a changelog — just the
things that are not visible from the code, and the reasoning behind decisions
that would otherwise look arbitrary.

## Pre-buyer verification

Status as of 2026-09-05: **nothing on the pre-buyer checklist is outstanding.**

Most of the pass was automated — build, lint, every public page in both
languages, the category tree, the one-level category picker and brand image
upload. Two items could not be, because both need a signed-in admin session
and the assistant running the rest of the pass cannot type a password. Those
two were checked **by hand by the site owner**, and both passed.

**Staff removal deletes the login, not just the row.** A staff member was
added, removed, and the same email then re-added successfully. The re-add is
what proves it: under the old flow the identity survived in `auth.users` and
the second attempt failed on "A user with this email address has already been
registered". The mechanism is `admins_user_id_fkey → auth.users` with
`ON DELETE CASCADE`, plus the `admins_keep_one_admin` BEFORE DELETE trigger —
both confirmed present in the live schema — behind the `admin-users` edge
function, deployed at v11.

**The slug and title validation refuses a title an address cannot be built
from.** A Georgian title typed into the English title field left Save
disabled. That is the exact input that put `item-mtn9topf` into production on
2026-09-04: a category whose `title_en` was Georgian, which slugified to
nothing, so the old code invented `item-<timestamp>` and carried on. It showed
Georgian text in the footer of every English page until it was deleted by
hand. The guard shipped in `671c12f`, the row is gone.

Re-testing either of these needs credentials from now on. `/demo/categories`
and `/demo/brands` used to mount the admin forms without a database or a
sign-in, and they were removed in `fc16862` once the testing they existed for
was finished.

## Known issues / lessons

### Dead code: removed, and what it taught

Cleared on 2026-09-05. Kept here because the *way* it hid is worth knowing,
not because anything is outstanding.

**What went.** Three seed-data modules that nothing imported —
`src/data/products.ts` (1,183 lines), `categories.ts` (199) and
`collections.ts` (99) — along with the shapes in `src/data/types.ts` that
existed only for them: `SeedProduct`, `SeedCategory`, `Collection`,
`Localized`, `Subcategory`, `Availability` and `Finish`. Also three query
functions whose callers had already gone (`fetchProductsByCategorySlug`,
`fetchFeaturedProducts`, `fetchCategoryBySlug`) and 46 locale keys from each
of `en.json` and `ka.json`, which emptied the `availability` namespace
entirely.

`src/data/types.ts` itself stays. It is imported by 29 files and holds the
database row shapes, which are now the only shapes there are.

**Deleting things exposes more dead things, one layer at a time.** This was
not one clean sweep. Removing the `src/data/index.ts` barrel revealed the
three seed modules; removing those revealed the seed-only types; removing two
query functions revealed a third, `fetchCategoryBySlug`, whose only caller had
been one of the two. Each round needed re-running the scan, and the locale
count moved from 23 to 41 to 45 to 46 as components came out. If you do this
again, expect to go round three or four times rather than once, and re-derive
the numbers each time instead of working from a list.

**Two traps, both of which caught me.**

A single-level import scan reports a file as *referenced* when its only
referrer is itself dead. That is why the first audit missed these three
modules entirely — they looked used, by a barrel that nothing used. Deadness
is transitive; the scan has to be too.

A plain text search for a locale key misses any key assembled at the call
site, such as ``t(`admin.slugTitle_${problem}`)`` or
``t(`b2b.services.${service.id}Name`)``. Strip the dynamic part and search the
base before concluding a key is unused. Fifteen call sites in this repository
build keys that way.

**What actually proved it was safe.** `tsc -b` catches a deleted export the
moment something still wants it, so the code side verifies itself. Locale keys
do not — i18next renders the key name as visible text instead of failing — so
that half was checked by loading every public route in both languages plus
product pages and the admin login, and scanning the rendered DOM for anything
key-shaped. Zero hits across 30 page loads. Do the same if you remove more:
a missing key is invisible to the compiler and obvious to a customer.

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
