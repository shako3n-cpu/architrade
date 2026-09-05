import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, UserMinus } from 'lucide-react'
import type { StaffMember, StaffRole } from '@/data/types'
import { useAuth } from '@/hooks/use-auth'
import { useAsync } from '@/hooks/use-async'
import {
  fetchStaff,
  FunctionMissingError,
  MIN_STAFF_PASSWORD_LENGTH,
  removeStaff,
  resetOperatorPassword,
  updateStaffRole,
} from '@/lib/admin-queries'
import { QueryState } from '@/components/ui/query-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StaffForm } from '@/components/admin/staff-form'
import { ResetPasswordDialog } from '@/components/admin/reset-password-dialog'
import { cn } from '@/lib/utils'

/**
 * /admin/users — who can sign in, and what they may do.
 *
 * Reachable only by administrators; the route is wrapped in
 * <RequireAdmin adminOnly>. That wrapper decides what is drawn, and the row
 * level security policies in supabase-rbac.sql decide what is allowed — an
 * operator who types this address by hand gets the refusal screen, and an
 * operator who skips the screen entirely gets nothing back from the database.
 */
export function AdminUsers() {
  const { t } = useTranslation()
  const staff = useAsync(useCallback((signal: AbortSignal) => fetchStaff(signal), []), [])

  return (
    <>
      <div>
        <h1 className="font-heading text-3xl text-ink">{t('admin.staffTitle')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t('admin.staffSubtitle')}
        </p>
      </div>

      <StaffForm onCreated={staff.retry} />

      <QueryState result={staff}>{(rows) => <StaffTable rows={rows} onChanged={staff.retry} />}</QueryState>
    </>
  )
}

function StaffTable({ rows, onChanged }: { rows: StaffMember[]; onChanged: () => void }) {
  const { t } = useTranslation()
  const { email: myEmail } = useAuth()

  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<StaffMember | null>(null)
  const [pendingReset, setPendingReset] = useState<StaffMember | null>(null)
  /* Only who it was for, never the password itself — the administrator typed
     it and already has it, so keeping a copy here would buy nothing and mean a
     secret sat in application state for the rest of the session. */
  const [resetDone, setResetDone] = useState<string | null>(null)

  /**
   * Both actions fail the same way and are reported the same way. The message
   * that matters most is the database refusing to remove the last
   * administrator — a rule the browser deliberately does not duplicate, so
   * there is one copy of it and it cannot drift. The `admins_keep_one_admin`
   * trigger still fires when removal arrives by cascade from auth.users, so
   * routing removal through the edge function did not step around it.
   */
  const run = async (userId: string, action: () => Promise<void>) => {
    setError(null)
    setBusyId(userId)

    try {
      await action()
      onChanged()
    } catch (cause) {
      setError(
        // Removal goes through the edge function now, so it can fail the same
        // way creation can: the function is simply not deployed. That needs
        // its own sentence — "Edge Function returned a non-2xx status" sends
        // whoever reads it looking at permissions instead of at a deploy.
        cause instanceof FunctionMissingError
          ? t('admin.staffFunctionMissing')
          : t('admin.errorUnknown', {
              message: cause instanceof Error ? cause.message : String(cause),
            }),
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      {error && (
        <p role="alert" className="mt-6 border border-hairline bg-surface p-4 text-sm text-ink">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto border border-hairline">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-surface">
              <Th>{t('admin.email')}</Th>
              <Th className="w-48">{t('admin.staffRole')}</Th>
              <Th className="w-24 text-right">{t('admin.colActions')}</Th>
            </tr>
          </thead>

          <tbody>
            {rows.map((member) => {
              // Changing your own role, or removing yourself, locks you out of
              // this screen mid-action. The database would allow it as long as
              // another admin remained; the interface does not offer it.
              const isMe = member.email !== null && member.email === myEmail

              return (
                <tr
                  key={member.user_id}
                  className={cn(
                    'border-b border-hairline last:border-b-0',
                    busyId === member.user_id && 'opacity-50',
                  )}
                >
                  <td className="p-3 text-sm text-ink">
                    {member.email ?? member.user_id}
                    {isMe && (
                      <span className="ml-2 text-[9px] tracking-[0.14em] text-brass uppercase">
                        {t('admin.staffYou')}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <select
                      value={member.role}
                      disabled={isMe || busyId === member.user_id}
                      onChange={(event) =>
                        void run(member.user_id, () =>
                          updateStaffRole(member.user_id, event.target.value as StaffRole),
                        )
                      }
                      aria-label={t('admin.staffRole')}
                      className="min-h-11 w-full border border-hairline bg-background px-3 py-2 text-base text-ink transition-colors duration-300 focus:border-brass focus:outline-none disabled:opacity-50 sm:min-h-9 sm:text-sm"
                    >
                      <option value="operator">{t('admin.roleOperator')}</option>
                      <option value="admin">{t('admin.roleAdmin')}</option>
                    </select>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end">
                      {/* OPERATORS ONLY, and the button is absent rather than
                          disabled for anybody else. A greyed-out control is a
                          promise that the right circumstances would enable it,
                          and no circumstances enable this one: the edge
                          function refuses any target that is not an operator,
                          because setting a password is being able to sign in
                          as that person and an admin resetting an admin is one
                          peer quietly taking over another's account. */}
                      {member.role === 'operator' && (
                        <button
                          type="button"
                          disabled={busyId === member.user_id}
                          onClick={() => setPendingReset(member)}
                          title={t('admin.staffResetPassword')}
                          aria-label={t('admin.staffResetPassword')}
                          className="inline-flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-brass disabled:opacity-30 sm:size-9"
                        >
                          <KeyRound aria-hidden="true" className="size-4 stroke-[1.25]" />
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isMe || busyId === member.user_id}
                        onClick={() => setPendingRemove(member)}
                        title={t('admin.staffRemove')}
                        aria-label={t('admin.staffRemove')}
                        className="inline-flex size-11 items-center justify-center text-muted transition-colors duration-300 hover:text-brass disabled:opacity-30 sm:size-9"
                      >
                        <UserMinus aria-hidden="true" className="size-4 stroke-[1.25]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ResetPasswordDialog
        open={pendingReset !== null}
        onOpenChange={(next) => {
          if (!next) setPendingReset(null)
        }}
        name={pendingReset?.email ?? ''}
        busy={pendingReset !== null && busyId === pendingReset.user_id}
        minLength={MIN_STAFF_PASSWORD_LENGTH}
        onSubmit={(password) => {
          if (!pendingReset) return
          const member = pendingReset
          setPendingReset(null)
          setResetDone(null)

          void run(member.user_id, async () => {
            await resetOperatorPassword(member.user_id, password)
            setResetDone(member.email ?? member.user_id)
          })
        }}
      />

      {/* Says it worked and stops there. The password is not repeated back:
          the administrator chose it a moment ago and is about to read it out,
          so printing it again only puts it on a screen somebody else can be
          standing behind. */}
      {resetDone && (
        <p className="mt-6 border border-brass/40 bg-brass/5 p-4 text-sm text-ink">
          {t('admin.staffResetDoneBody', { name: resetDone })}
        </p>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(next) => {
          if (!next) setPendingRemove(null)
        }}
        title={t('admin.staffRemove')}
        description={
          pendingRemove ? t('admin.staffConfirmRemove', { name: pendingRemove.email ?? '' }) : ''
        }
        confirmLabel={t('admin.staffRemove')}
        busy={pendingRemove !== null && busyId === pendingRemove.user_id}
        onConfirm={() => {
          if (!pendingRemove) return
          const member = pendingRemove
          setPendingRemove(null)
          void run(member.user_id, () => removeStaff(member.user_id))
        }}
      />
    </>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn('p-3 text-[10px] tracking-[0.16em] text-muted uppercase', className)}
    >
      {children}
    </th>
  )
}
