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

### Dead code: three seed modules nothing imports

Verified 2026-09-05, on `5cb51c1`. None of this is broken and none of it ships
— the bundler already tree-shakes all of it — so there is no urgency. It is
written down because it is invisible from the code: every one of these files
looks alive until you check who imports it, and nobody does.

**Three seed-data modules, 1,481 lines, imported by nothing.**

| file | lines |
| --- | --- |
| `src/data/products.ts` | 1,183 |
| `src/data/categories.ts` | 199 |
| `src/data/collections.ts` | 99 |

They were reachable until `f3c65ce` deleted `src/data/index.ts`, a barrel that
re-exported them and that nothing imported either. The barrel was the only
thing referencing them, so they were already unreachable — deleting it only
made that visible. The app reads products, categories and collections from
Supabase; these are leftovers from before the database existed, and the SQL
seed files at the repository root are what actually populates it.

`src/data/types.ts` is NOT part of this. It is imported by 29 files and must
stay. Three of its exports belong to the orphans, though, and would go with
them: `Collection`, `SeedCategory` and `SeedProduct`.

**Two fetchers in `src/lib/queries.ts`** — `fetchFeaturedProducts` and
`fetchProductsByCategorySlug` — are dead for a related reason. Their only
callers were five hooks in `use-catalog.ts` removed in `f3c65ce`, superseded
by `useCatalogue`, `useProductPage` and `useCategoryPage`.

**41 locale keys in each of `en.json` and `ka.json` have no reference in
`src/`.** That is up from 23 at the first audit, and the increase is a
consequence of the same commit: deleting `components/home/hero.tsx` and
`components/home/value-points.tsx` orphaned the `home.hero*`, `home.why*` and
`home.stat*` strings they rendered. `admin.categoryDeleteNote` is a different
kind of fossil — it says categories cannot be deleted from that screen, which
stopped being true in `833ec03`.

**Before deleting any of it, re-derive the numbers rather than trusting this
note.** They have moved twice already. The check that matters is whether
anything imports a file, not whether the file looks used:

```
grep -rE "from ['\"](@/data/products|@/data/categories|@/data/collections)['\"]" src/
```

Two traps to know about. A single-level import scan will report these three as
*referenced* while the barrel that referenced them is itself dead — deadness
is transitive and the first audit missed exactly this. And a plain search for a
locale key misses the ones built by template literal, such as
``t(`admin.slugTitle_${problem}`)``; strip the suffix and search the base
before concluding a key is unused.

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
