import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANGUAGE, LANGUAGE_TAGS } from '@/config/site'
import { isLanguage, setStoredLanguage } from '@/i18n'
import { Header } from './header'
import { Footer } from './footer'
import { FloatingContact } from '@/components/contact/floating-contact'

/**
 * The shell every page renders inside.
 *
 * Owns four cross-cutting concerns so no individual page has to:
 *   1. rejects an unknown language in the URL (/de/... -> /ka/...)
 *   2. keeps i18next and the <html lang> attribute in step with the URL
 *   3. remembers the language for the visitor's next visit
 *   4. scrolls to the top on navigation
 */
export function RootLayout() {
  const { lang } = useParams<{ lang: string }>()
  const location = useLocation()
  const { i18n } = useTranslation()

  const valid = isLanguage(lang)

  useEffect(() => {
    if (!valid) return

    // Keep translations, the document language and the stored preference
    // aligned with whatever the URL says.
    if (i18n.language !== lang) i18n.changeLanguage(lang)
    document.documentElement.lang = LANGUAGE_TAGS[lang]
    setStoredLanguage(lang)
  }, [lang, valid, i18n])

  useEffect(() => {
    // A new page should start at the top. Skipped when the URL carries a hash,
    // so in-page anchors still work.
    if (!location.hash) window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  // An unknown language code is not a 404 — send the visitor to the Georgian
  // version of the same page instead.
  if (!valid) {
    const rest = location.pathname.split('/').filter(Boolean).slice(1).join('/')
    return <Navigate to={`/${DEFAULT_LANGUAGE}${rest ? `/${rest}` : ''}`} replace />
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      {/* The header is fixed, so every page — the home page included — has to
          clear its height. Nothing slides underneath it any more. */}
      <main id="main" className="flex-1 pt-[var(--at-header-height)]">
        <Outlet />
      </main>

      <Footer />

      {/* Outside <main> on purpose: it is a persistent site utility, not part
          of the page's content, and it must not land inside the skip link's
          target region. */}
      <FloatingContact />
    </div>
  )
}
