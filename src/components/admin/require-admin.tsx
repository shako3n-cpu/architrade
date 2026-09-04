import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useAdminLanguage } from '@/hooks/use-admin-language'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { SITE_NAME } from '@/config/site'
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
  const { t } = useTranslation()
  const { lang, switchLanguage } = useAdminLanguage()

  return (
    <>
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex w-full max-w-[80rem] flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4 sm:px-8">
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
              Three fitted, which is why adding Brands is what exposed it. */}
          <nav aria-label={t('admin.navLabel')} className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-6">
            <AdminLink to="/admin" end>
              {t('admin.navProducts')}
            </AdminLink>
            <AdminLink to="/admin/categories">{t('admin.navCategories')}</AdminLink>
            <AdminLink to="/admin/brands">{t('admin.navBrands')}</AdminLink>
            {isAdmin && <AdminLink to="/admin/users">{t('admin.navUsers')}</AdminLink>}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {email && <span className="hidden text-xs text-muted sm:inline">{email}</span>}

            {/* The office has a full English translation and, until now, no
                way to ask for it: with no language in the address there was
                nothing for RootLayout to read, so the dashboard was Georgian
                for everyone. Same control as the shop's, driven by the stored
                preference instead of the URL. */}
            <LanguageSwitcher size="sm" lang={lang} onSwitch={switchLanguage} />

            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 text-xs tracking-[0.12em] text-muted uppercase transition-colors duration-300 hover:text-brass"
            >
              <LogOut aria-hidden="true" className="size-4 stroke-[1.25]" />
              {t('admin.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[80rem] px-5 py-10 sm:px-8">{children}</main>
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
          'rounded-xs border px-3 py-1.5 text-xs tracking-[0.12em] uppercase',
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
