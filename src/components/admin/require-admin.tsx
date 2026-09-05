import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useAdminLanguage } from '@/hooks/use-admin-language'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { SITE_NAME } from '@/config/site'
import { publicSiteUrl } from '@/lib/host'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * The gate in front of every admin screen except the login form.
 *
 * Worth being honest about what this is: it decides what gets DRAWN, nothing
 * more. Anybody can edit JavaScript in their own browser and walk past it. The
 * thing that actually stops a stranger changing the catalogue is the row level
 * security policies in the database, which check the `admins` table on every
 * write. This exists so the right person sees the right screen, not to keep
 * the wrong person out of the data.
 */
export function RequireAdmin({
  children,
  adminOnly = false,
}: {
  children: ReactNode
  /** Refuse operators as well as strangers. Used by /admin/users. */
  adminOnly?: boolean
}) {
  const { status, isAdmin, revalidate } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  /*
   * Every admin route change re-checks the token with Supabase before the
   * screen is trusted. A session can die between one click and the next —
   * revoked in the dashboard, signed out in another tab, or simply run out —
   * and without this the dashboard would keep drawing rows from a cache while
   * every save came back refused. Cheap: supabase-js answers from memory
   * unless the token actually needs refreshing.
   */
  useEffect(() => {
    void revalidate()
  }, [location.pathname, revalidate])

  // Restoring the session is asynchronous. Redirecting during this moment
  // would throw a signed-in manager back to the login screen on every refresh.
  if (status === 'checking') {
    return (
      <div role="status" aria-live="polite" className="grid min-h-dvh place-items-center px-6">
        <p className="text-sm text-muted">{t('state.loading')}</p>
      </div>
    )
  }

  if (status === 'signedOut') {
    // Remember where they were headed so signing in can return them there.
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (status === 'notAdmin') return <NotAnAdmin />

  // An operator who typed /admin/users into the address bar. They are staff,
  // so they keep the navigation and can go somewhere useful — this is a wrong
  // turn, not a locked door.
  if (adminOnly && !isAdmin) {
    return (
      <AdminChrome>
        <div className="border border-hairline bg-surface p-10 text-center">
          <h1 className="font-heading text-2xl text-ink">{t('admin.adminsOnlyTitle')}</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            {t('admin.adminsOnlyBody')}
          </p>
        </div>
      </AdminChrome>
    )
  }

  return <AdminChrome>{children}</AdminChrome>
}

/**
 * Signed in with a real account that is not on the admins list.
 *
 * A separate screen from the login form on purpose: the password was correct,
 * so telling them to try signing in again would send them round in a circle.
 */
function NotAnAdmin() {
  const { email, signOut } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-md border border-hairline bg-surface p-10 text-center">
        <h1 className="font-heading text-2xl text-ink">{t('admin.notAdminTitle')}</h1>

        <p className="mt-4 text-sm leading-relaxed text-muted">{t('admin.notAdminBody')}</p>

        {email && <p className="mt-4 font-mono text-xs break-all text-muted/80">{email}</p>}

        <Button variant="outline" size="sm" className="mt-8" onClick={() => void signOut()}>
          {t('admin.signOut')}
        </Button>
      </div>
    </div>
  )
}

/** Header and navigation drawn around every signed-in admin screen. */
function AdminChrome({ children }: { children: ReactNode }) {
  const { email, role, isAdmin, signOut } = useAuth()

  return (
    <>
      <AdminHeader email={email} role={role} isAdmin={isAdmin} onSignOut={() => void signOut()} />

      <main className="mx-auto w-full max-w-[80rem] px-5 py-10 sm:px-8">{children}</main>
    </>
  )
}

/**
 * The header alone, taking the account as props rather than reading it.
 *
 * Split out of AdminChrome so it can be rendered without a session. The admin
 * screens cannot be opened on a machine with no Supabase project — there is
 * nothing to sign in to — and reasoning about a layout nobody can look at is
 * how the height bug described below survived review in the first place. Pass
 * a fake account and this draws on its own, anywhere.
 *
 * Deliberately not accompanied by a page that does so: fc16862 removed the
 * /demo routes because they were reachable on any host not on the public list,
 * and that reasoning has not changed. Mount it from a scratch route while you
 * are working, and do not commit the route.
 */
export function AdminHeader({
  email,
  role,
  isAdmin,
  onSignOut,
}: {
  email?: string | null
  role?: string | null
  isAdmin?: boolean
  onSignOut: () => void
}) {
  const { t } = useTranslation()
  const { lang, switchLanguage } = useAdminLanguage()

  return (
    <>
      {/*
       * ONE ROW, IN BOTH LANGUAGES, AND IT USES THE WHOLE WINDOW TO GET THERE.
       *
       * The header used to change HEIGHT with the language: at the 1216px this
       * bar was given, English measured 1188 and stayed on one line, Georgian
       * measured 1342 and wrapped, so switching language shifted the whole page
       * down. Georgian is simply wider — 499px of navigation against 388px —
       * and no breakpoint helped, because the bar was capped at `max-w-[80rem]`
       * and stopped growing at 1216 no matter how wide the screen got.
       *
       * So the cap is gone from the HEADER only. `main` keeps it: a column of
       * text and tables wants a measure, a row of controls does not, and on a
       * 1900px screen the old cap left ~300px of empty margin on either side
       * while the contents of the bar were wrapping for want of 20px.
       *
       * The wordmark no longer lines up with the page heading beneath it. That
       * is the visible cost and it was the deliberate trade.
       *
       * Letter-spacing is off the navigation and the two actions as well —
       * about 85px. `tracking-[0.12em]` is a Latin mannerism: Georgian is not
       * bicameral, `uppercase` does nothing to it, and spacing it out only
       * makes it harder to read.
       *
       * Two rows was tried first and rejected — it kept everything but made the
       * header 105px tall against the 63px it is now.
       */}
      <header className="border-b border-hairline bg-surface">
        <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-4 px-5 py-4 sm:px-8">
          <Link to="/admin" className="font-heading text-lg tracking-[0.2em] text-ink uppercase">
            {SITE_NAME}
          </Link>

          {/* The badge says which of the two dashboards this is. An operator
              seeing "Operator" here is the explanation for why the delete and
              user-management controls are not where a colleague said. */}
          <span className="text-[10px] tracking-[0.18em] text-brass uppercase">
            {role === 'operator' ? t('admin.roleOperator') : t('admin.badge')}
          </span>

          {/* `flex-wrap` and a tighter gap below `sm`. The header around
              this wraps, but the nav did not, so its links could not break:
              at 375px the four of them measured 559px inside a 335px column
              and the last one was clipped off the right edge of the screen.
              Three fitted, which is why adding Brands is what exposed it.

              NO LETTER-SPACING ON THE LABELS THEMSELVES
                `tracking-[0.12em]` is 1.4px between every character, which
                the Latin labels wear well and the Georgian ones do not —
                Georgian is not a bicameral script, `uppercase` does nothing
                to it, and spacing it out is a Latin mannerism applied to an
                alphabet that reads worse for it. It also cost about 60px
                across the four labels, which is most of what was keeping the
                Georgian header from fitting on one line. Removed for both, so
                the two languages are set the same way. */}
          <nav
            aria-label={t('admin.navLabel')}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-6"
          >
            <AdminLink to="/admin" end>
              {t('admin.navProducts')}
            </AdminLink>
            <AdminLink to="/admin/categories">{t('admin.navCategories')}</AdminLink>
            <AdminLink to="/admin/brands">{t('admin.navBrands')}</AdminLink>
            {isAdmin && <AdminLink to="/admin/users">{t('admin.navUsers')}</AdminLink>}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {/* Back, now that the bar is as wide as the window. It is the first
                thing to go when space runs short — it is the only item here
                that is not a control — so it appears at `2xl` and above.
                `xl` was tried and is too soon: at 1280 the Georgian row still
                wraps with 166px of address on it, and a header that changes
                height with the language is the bug this was fixing. Below
                1536 both languages are the same without it. */}
            {email && <span className="hidden text-xs text-muted 2xl:inline">{email}</span>}

            {/* The office has a full English translation and, until now, no
                way to ask for it: with no language in the address there was
                nothing for RootLayout to read, so the dashboard was Georgian
                for everyone. Same control as the shop's, driven by the stored
                preference instead of the URL. */}
            <LanguageSwitcher size="sm" lang={lang} onSwitch={switchLanguage} />

            {/*
             * OUT TO THE CATALOGUE, NOT TO THE DASHBOARD.
             *
             * A plain relative link to "/" works everywhere the office is
             * previewed — localhost, a Vercel preview — but not on the
             * production hostname it is actually used from:
             * admin-architrade.vercel.app routes every address it does not
             * recognise straight back to /admin, so "/" would return the
             * manager to the screen they just tried to leave. publicSiteUrl
             * derives the shop's own hostname from this one instead.
             *
             * A real anchor, not a router Link: the destination is very likely
             * a different origin, which react-router's client-side navigation
             * cannot cross anyway.
             */}
            <a
              href={publicSiteUrl(`/${lang}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted uppercase transition-colors duration-300 hover:text-brass"
            >
              <ExternalLink aria-hidden="true" className="size-4 stroke-[1.25]" />
              {t('admin.viewSite')}
            </a>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 text-xs text-muted uppercase transition-colors duration-300 hover:text-brass"
            >
              <LogOut aria-hidden="true" className="size-4 stroke-[1.25]" />
              {t('admin.signOut')}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

function AdminLink({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-xs border px-3 py-1.5 text-xs uppercase',
          'transition-colors duration-300',
          isActive
            ? 'border-brass/40 bg-brass/10 text-brass'
            : 'border-transparent text-muted hover:border-hairline hover:text-ink',
        )
      }
    >
      {children}
    </NavLink>
  )
}
