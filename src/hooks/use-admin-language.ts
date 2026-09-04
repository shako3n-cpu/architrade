import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANGUAGE, type Language } from '@/config/site'
import { getStoredLanguage, isLanguage, setStoredLanguage } from '@/i18n'

/**
 * The active language inside the back office, and how to change it.
 *
 * THE ADMIN AREA HAS NO LANGUAGE IN ITS ADDRESS, AND THAT IS THE PROBLEM
 *   Every public page is /ka/... or /en/..., and RootLayout reads that segment
 *   and tells i18next about it. The admin area deliberately has no such
 *   segment — it is a private tool, not two versions of a site — so nothing
 *   ever called `changeLanguage`, and i18next stayed on the value it was
 *   initialised with. That value is Georgian.
 *
 *   AdminLayout carried a comment claiming the office "still appears in
 *   whichever language the manager last chose on the site, because i18next
 *   holds that globally". True of a tab that visited the shop first. On
 *   admin-architrade.vercel.app there IS no shop to visit: RootLayout never
 *   renders, so the dashboard was Georgian and had no way to be anything else,
 *   despite a complete English translation sitting in en.json.
 *
 *   So the office reads the stored preference directly. `useLanguage` cannot
 *   do this job: switching there rewrites the first path segment, which for
 *   /admin/categories would produce /en/admin/categories — an address that
 *   does not exist.
 *
 * ONE PREFERENCE, NOT TWO
 *   The same localStorage key the public switcher writes. Choosing English in
 *   the office means "/" opens in English afterwards, which is the behaviour
 *   somebody who has just told the software which language they read expects.
 */
export function useAdminLanguage() {
  const { i18n } = useTranslation()

  const lang: Language = isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE

  /*
   * Apply the remembered choice once, on entering the office. Not on every
   * render and not keyed to `lang`: that would undo a switch the moment it
   * was made, since the switch changes i18next before it changes storage.
   */
  useEffect(() => {
    const stored = getStoredLanguage()
    if (i18n.language !== stored) void i18n.changeLanguage(stored)
  }, [i18n])

  const switchLanguage = useCallback(
    (next: Language) => {
      if (next === i18n.language) return
      setStoredLanguage(next)
      void i18n.changeLanguage(next)
    },
    [i18n],
  )

  return { lang, switchLanguage }
}
