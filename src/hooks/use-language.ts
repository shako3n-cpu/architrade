import { useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANGUAGE, type Language } from '@/config/site'
import { isLanguage, setStoredLanguage } from '@/i18n'

/**
 * Everything a component needs to be language-aware.
 *
 *   const { lang, localePath, switchLanguage } = useLanguage()
 *   <Link to={localePath('/catalog')}>…</Link>   ->  /ka/catalog
 */
export function useLanguage() {
  const { lang: rawLang } = useParams<{ lang: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // The URL param is untrusted, so narrow it before use.
  const lang: Language = isLanguage(rawLang) ? rawLang : DEFAULT_LANGUAGE

  /** Prefix an app path with the active language. localePath('/about') -> '/ka/about' */
  const localePath = useCallback(
    (to: string) => {
      const clean = to.startsWith('/') ? to : `/${to}`
      // '/' would produce '/ka/' — trim it back to '/ka'.
      return clean === '/' ? `/${lang}` : `/${lang}${clean}`
    },
    [lang],
  )

  /**
   * Swap the language while keeping the visitor exactly where they are.
   * Replaces only the FIRST path segment, so /en/product/aria-table
   * becomes /ka/product/aria-table with query string and hash intact.
   */
  const switchLanguage = useCallback(
    (next: Language) => {
      if (next === lang) return

      const segments = location.pathname.split('/').filter(Boolean)
      if (isLanguage(segments[0])) {
        segments[0] = next
      } else {
        segments.unshift(next)
      }

      setStoredLanguage(next)
      navigate(`/${segments.join('/')}${location.search}${location.hash}`)
    },
    [lang, location, navigate],
  )

  /** Build the same page's address in a given language — used for hreflang tags. */
  const pathInLanguage = useCallback(
    (target: Language) => {
      const segments = location.pathname.split('/').filter(Boolean)
      if (isLanguage(segments[0])) segments[0] = target
      else segments.unshift(target)
      return `/${segments.join('/')}`
    },
    [location.pathname],
  )

  return { lang, localePath, switchLanguage, pathInLanguage, t }
}
