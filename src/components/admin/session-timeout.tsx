import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useIdleTimeout } from '@/hooks/use-idle-timeout'
import { setSignOutReason } from '@/lib/auth'
import { Button } from '@/components/ui/button'

/**
 * Signs a manager out after fifteen minutes of doing nothing, having warned
 * them for the last minute of it.
 *
 * The dashboard is usually open on a computer in a showroom or an office —
 * somewhere other people walk past. Fifteen minutes is the window in which a
 * screen left unlocked is somebody else's catalogue to edit.
 *
 * The warning is not a courtesy. Moving the mouse cancels the timeout, so the
 * minute's notice is the difference between "you have to sign in again" and
 * "you lost the form you were halfway through".
 */
const IDLE_MS = 15 * 60_000
const WARN_MS = 60_000

export function SessionTimeout() {
  const { status, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const expire = useCallback(async () => {
    // Written before signing out, so the login screen can explain itself the
    // instant the guard redirects to it.
    setSignOutReason('idle')
    await signOut()
    navigate('/admin/login', { replace: true })
  }, [signOut, navigate])

  const { warning, secondsLeft, stayActive } = useIdleTimeout({
    idleMs: IDLE_MS,
    warnMs: WARN_MS,
    onIdle: () => void expire(),
    // Only while somebody is actually signed in and working. There is nothing
    // to time out on the login screen.
    enabled: status === 'ready',
  })

  if (!warning) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm border border-hairline bg-surface p-5 sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0"
    >
      <p className="flex items-center gap-2.5 text-[10px] tracking-[0.18em] text-brass uppercase">
        <Clock aria-hidden="true" className="size-4 stroke-[1.25]" />
        {t('admin.idleTitle')}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-ink">
        {t('admin.idleBody', { count: secondsLeft })}
      </p>

      <Button variant="outline" size="sm" className="mt-5 w-full" onClick={stayActive}>
        {t('admin.idleStay')}
      </Button>
    </div>
  )
}
