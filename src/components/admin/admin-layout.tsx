import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/hooks/use-auth'
import { SessionTimeout } from '@/components/admin/session-timeout'
import { useAdminLanguage } from '@/hooks/use-admin-language'

/**
 * The parent route for everything under /admin, including the login screen.
 *
 * Its only job is to put the session provider above all of them, so signing in
 * on the login screen is immediately known to the guard that decides whether
 * to show the dashboard.
 *
 * The admin area sits OUTSIDE the /:lang routes on purpose. It is a private
 * back office, not part of the public site: there is no reason for it to have
 * a Georgian address and an English address, and keeping it out means the
 * public header and footer are not drawn around it either.
 *
 * Which leaves the language to be settled some other way, since there is no
 * path segment to read it from. `useAdminLanguage` applies the remembered
 * choice here, above the login screen as well as the dashboard — the sign-in
 * form is the first thing anybody sees and it was Georgian regardless of who
 * was looking at it.
 */
export function AdminLayout() {
  useAdminLanguage()

  return (
    <AuthProvider>
      <div className="min-h-dvh bg-background">
        <Outlet />
      </div>

      {/* Inside the provider, outside the routed screens: the idle clock must
          survive moving between the dashboard and the categories page, and
          restarting it on every navigation would mean it never ran out. */}
      <SessionTimeout />
    </AuthProvider>
  )
}
