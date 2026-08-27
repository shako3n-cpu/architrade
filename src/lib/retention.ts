/**
 * ============================================================================
 * THE RETENTION WINDOW
 * ----------------------------------------------------------------------------
 * An archived piece is kept for thirty days and then deleted for real, with
 * its photographs. The database is what actually does it — a nightly job set
 * up by supabase-retention.sql — and this file exists only so the dashboard
 * can say how long a piece has left.
 *
 * THE NUMBER IS WRITTEN DOWN TWICE, here and in the SQL, and there is no way
 * around that: the browser cannot ask the database what its cron job passes.
 * If you change the window, change both. Everything the app does with the
 * number is cosmetic, so the SQL is the one that matters.
 * ============================================================================
 */

export const RETENTION_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Whole days left before an archived piece is purged, or null if it is not
 * archived — or if the database has no `deleted_at` column yet, which is the
 * same absence as far as this is concerned.
 *
 * Rounded UP, so a piece with a few hours left reads "1 day" rather than "0".
 * Never negative: a piece past its window is waiting for tonight's job, and
 * "-2 days" would be an accurate answer to a question nobody asked.
 */
export function daysUntilPurge(deletedAt: string | null | undefined): number | null {
  if (!deletedAt) return null

  const archivedAt = Date.parse(deletedAt)
  if (Number.isNaN(archivedAt)) return null

  const remaining = archivedAt + RETENTION_DAYS * DAY_MS - Date.now()
  return Math.max(0, Math.ceil(remaining / DAY_MS))
}
