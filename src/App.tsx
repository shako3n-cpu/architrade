import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/components/layout/root-layout'
import { Home } from '@/pages/home'
import { CatalogPreview } from '@/pages/catalog-preview'
import { Product } from '@/pages/product'
import { CategoryPage } from '@/pages/category'
import { Placeholder } from '@/pages/placeholder'
import { AdminLayout } from '@/components/admin/admin-layout'
import { RequireAdmin } from '@/components/admin/require-admin'
import { AdminLogin } from '@/pages/admin/login'
import { AdminDashboard } from '@/pages/admin/dashboard'
import { AdminCategories } from '@/pages/admin/categories'
import { getStoredLanguage } from '@/i18n'
import '@/i18n'

/**
 * ============================================================================
 * ROUTING
 * ----------------------------------------------------------------------------
 * Every page lives under a language prefix: /ka/... , /en/...
 * "/" sends the visitor to whichever language they last used (Georgian on a
 * first visit). RootLayout handles an unknown code such as /de/about.
 *
 * The Placeholder pages below are temporary and get replaced page by page.
 * ============================================================================
 */

/** Reads the remembered language and redirects "/" to it. */
function RootRedirect() {
  return <Navigate to={`/${getStoredLanguage()}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/*
         * The back office. Declared BEFORE /:lang so "admin" is never mistaken
         * for a language code, and it carries no language prefix of its own —
         * it is a private tool, not part of the public site.
         */}
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

          {/* A mistyped admin address goes to the dashboard, not to the
              public site's language redirect. */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="/:lang" element={<RootLayout />}>
          <Route index element={<Home />} />

          {/* TEMPORARY: data review sheet, replaced by the real catalogue. */}
          <Route path="catalog" element={<CatalogPreview />} />
          <Route path="catalog/:categorySlug" element={<CategoryPage />} />
          <Route path="collections" element={<Placeholder title="Collections" />} />
          <Route path="collections/:slug" element={<Placeholder title="Collection" />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="about" element={<Placeholder title="About" />} />
          <Route path="services" element={<Placeholder title="Services" />} />
          <Route path="showroom" element={<Placeholder title="Showroom" />} />
          <Route path="contact" element={<Placeholder title="Contact" />} />
          <Route path="privacy" element={<Placeholder title="Privacy policy" />} />
          <Route path="terms" element={<Placeholder title="Terms and conditions" />} />

          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Route>

        {/* Anything with no language prefix at all. */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
