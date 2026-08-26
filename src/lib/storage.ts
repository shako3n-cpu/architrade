import { getSupabase } from './supabase'

/**
 * ============================================================================
 * PRODUCT PHOTOGRAPHS
 * ----------------------------------------------------------------------------
 * Files live in the `product-images` bucket, created by
 * supabase-admin-setup.sql. The bucket is public to READ — these photographs
 * appear on a public catalogue — but only members of the `admins` table may
 * upload or remove anything.
 *
 * What is stored on the product row is the full public URL, not the path
 * inside the bucket, because that is what an <img src> needs and what every
 * existing row already contains.
 * ============================================================================
 */

export const PRODUCT_IMAGE_BUCKET = 'product-images'

/** Formats a browser accepts as an <img> and Supabase will serve back. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * 5 MB. Large enough for a good catalogue photograph, small enough that a
 * 40-megapixel phone picture is rejected here rather than after a two-minute
 * upload on a slow connection.
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Human-readable size, for error messages. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Why a file cannot be uploaded, or null when it can.
 *
 * Checked in the browser before anything is sent, so someone who picks a PDF
 * finds out immediately instead of waiting for a rejection from the server.
 * The storage policies enforce the real rules regardless.
 */
export function describeRejection(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_IMAGE_BYTES) return 'size'
  return null
}

/**
 * A collision-proof object name that still says what it is.
 *
 * Two managers uploading `sofa.jpg` in the same minute must not overwrite each
 * other, so a random suffix is added. The original name is kept, flattened to
 * ASCII-safe characters — Supabase rejects a key containing spaces or, in
 * practice, Georgian characters, and photographs routinely arrive with both.
 */
function objectName(file: File): string {
  const dot = file.name.lastIndexOf('.')
  const stem = (dot === -1 ? file.name : file.name.slice(0, dot))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  const extension = dot === -1 ? 'jpg' : file.name.slice(dot + 1).toLowerCase()
  const unique = crypto.randomUUID().slice(0, 8)

  return `${stem || 'image'}-${unique}.${extension}`
}

/** Uploads one file and returns the public URL to store on the product row. */
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabase()
  const name = objectName(file)

  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(name, file, {
    contentType: file.type,
    // Never silently replace: the name carries a random suffix, so a clash
    // means something is wrong and should be seen rather than swallowed.
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(name)
  return data.publicUrl
}

/**
 * Removes a file, given the public URL stored on the product.
 *
 * Deliberately quiet on failure. This is only ever called while tidying up
 * after an image the manager removed from a product, and the product row has
 * already been saved without it by then. A photograph left behind in the
 * bucket costs a fraction of a penny; an error dialog after a successful save
 * would suggest the save failed, which would be worse.
 *
 * Returns whether it actually managed it, for anyone who wants to know.
 */
export async function deleteProductImage(publicUrl: string): Promise<boolean> {
  const marker = `/${PRODUCT_IMAGE_BUCKET}/`
  const at = publicUrl.indexOf(marker)

  // A URL from somewhere else entirely — the seed rows point at stock photo
  // sites — is not ours to delete.
  if (at === -1) return false

  const name = decodeURIComponent(publicUrl.slice(at + marker.length).split('?')[0])
  const { error } = await getSupabase().storage.from(PRODUCT_IMAGE_BUCKET).remove([name])

  return !error
}
