/// <reference types="vite/client" />

/**
 * Types for the project's own environment variables.
 *
 * Without this block `import.meta.env.VITE_SUPABASE_URL` is typed `any`, so a
 * misspelt name would go unnoticed until it failed in the browser. Add a line
 * here whenever you add a VITE_ variable to .env.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
