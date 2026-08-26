import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/hooks/use-auth'

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
 * public header and footer are not drawn around it either. It still appears in
 * whichever language the manager last chose on the site, because i18next holds
 * that globally.
 */
export function AdminLayout() {
  return (
    <AuthProvider>
      <div className="min-h-dvh bg-background">
        <Outlet />
      </div>
    </AuthProvider>
  )
}
