import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/components/layout/root-layout'
import { Home } from '@/pages/home'
import { Catalog } from '@/pages/catalog'
import { Product } from '@/pages/product'
import { CategoryPage } from '@/pages/category'
import { Placeholder } from '@/pages/placeholder'
import { AdminLayout } from '@/components/admin/admin-layout'
import { RequireAdmin } from '@/components/admin/require-admin'
import { AdminLogin } from '@/pages/admin/login'
import { AdminDashboard } from '@/pages/admin/dashboard'
import { About } from '@/pages/about'
import { Services } from '@/pages/services'
import { Collections } from '@/pages/collections'
import { Contact } from '@/pages/contact'
import { Brands } from '@/pages/brands'
import { AdminCategories } from '@/pages/admin/categories'
import { AdminUsers } from '@/pages/admin/users'
import { IS_ADMIN_HOST, IS_PUBLIC_ONLY_HOST } from '@/lib/host'
import { getStoredLanguage } from '@/i18n'
import '@/i18n'

/**
 * ============================================================================
 * ROUTING
 * ----------------------------------------------------------------------------
 * Two front doors onto one bundle, chosen by hostname (see src/lib/host.ts):
 *
 *   admin-architrade.vercel.app   "/" lands on the dashboard; the catalogue
 *                                is not routed at all, so the public header,
 *                                footer and contact bar never render.
 *
 *   architrade.vercel.app         the catalogue; /admin is not routed, and a
 *                                visitor who types it is sent to the shop.
 *
 *   localhost, previews          both, unchanged, so this is still workable.
 *
 * Public pages all live under a language prefix: /ka/... , /en/... — "/" sends
 * the visitor to whichever language they last used (Georgian on a first
 * visit), and RootLayout handles an unknown code such as /de/about.
 *
 * The Placeholder pages below are temporary and get replaced page by page.
 * ============================================================================
 */

/** Sends the visitor to `path` under their remembered language. */
function LanguageRedirect({ path = '' }: { path?: string }) {
  return <Navigate to={`/${getStoredLanguage()}${path}`} replace />
}

/**
 * The back office. It carries no language prefix — it is a private tool, not
 * part of the public site — and on the shared hostnames it is declared BEFORE
 * /:lang so "admin" is never mistaken for a language code.
 */
const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="login" element={<AdminLogin />} />

    <Route
      index
      element={
        <RequireAdmin>
          <AdminDashboard />
        </RequireAdmin>
      }
    />

    <Route
      path="categories"
      element={
        <RequireAdmin>
          <AdminCategories />
        </RequireAdmin>
      }
    />

    {/* Administrators only — an operator who types this address is told so
        rather than being bounced somewhere without explanation. */}
    <Route
      path="users"
      element={
        <RequireAdmin adminOnly>
          <AdminUsers />
        </RequireAdmin>
      }
    />

    {/* A mistyped admin address goes to the dashboard, not to the public
        site's language redirect. */}
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Route>
)

const publicRoutes = (
  <Route path="/:lang" element={<RootLayout />}>
    <Route index element={<Home />} />

    {/* TEMPORARY: data review sheet, replaced by the real catalogue. */}
    <Route path="catalog" element={<Catalog />} />
    <Route path="catalog/:categorySlug" element={<CategoryPage />} />
    <Route path="collections" element={<Collections />} />
    <Route path="collections/:slug" element={<Placeholder title="Collection" />} />
    <Route path="product/:slug" element={<Product />} />
    <Route path="about" element={<About />} />
    <Route path="services" element={<Services />} />
    <Route path="brands" element={<Brands />} />
    <Route path="showroom" element={<Placeholder title="Showroom" />} />
    <Route path="contact" element={<Contact />} />
    <Route path="privacy" element={<Placeholder title="Privacy policy" />} />
    <Route path="terms" element={<Placeholder title="Terms and conditions" />} />

    <Route path="*" element={<Placeholder title="Page not found" />} />
  </Route>
)

/**
 * The admin hostname. Every address that is not an admin address — "/"
 * included — collapses onto /admin, so there is no way to reach the catalogue
 * or its navigation from here.
 */
function AdminSite() {
  return (
    <Routes>
      {adminRoutes}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

/** The catalogue hostname, and any hostname we do not recognise. */
function PublicSite() {
  return (
    <Routes>
      <Route path="/" element={<LanguageRedirect />} />

      {/*
       * On a known production catalogue domain the back office is simply not
       * there: /admin and everything under it lands on the catalogue instead.
       * On localhost and preview URLs it stays where it has always been.
       */}
      {IS_PUBLIC_ONLY_HOST ? (
        <Route path="/admin/*" element={<LanguageRedirect path="/catalog" />} />
      ) : (
        adminRoutes
      )}

      {publicRoutes}

      {/* Anything with no language prefix at all. */}
      <Route path="*" element={<LanguageRedirect />} />
    </Routes>
  )
}

export default function App() {
  return <BrowserRouter>{IS_ADMIN_HOST ? <AdminSite /> : <PublicSite />}</BrowserRouter>
}
