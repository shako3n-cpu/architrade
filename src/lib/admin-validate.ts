/**
 * ============================================================================
 * WHAT THE FORMS REFUSE TO SEND
 * ----------------------------------------------------------------------------
 * The slug is the address of a page, and it is derived from the English title
 * rather than typed. That works right up until the English title is not
 * English: `slugify` strips everything outside [a-z0-9], so a Georgian title
 * reduces to nothing and the address has to be invented.
 *
 * It happened. A category reached production as `item-mtn9topf` with
 * `title_en` set to "სახუეავ" — a misspelling of its own Georgian title —
 * and showed Georgian text in the footer of every English page until it was
 * deleted by hand.
 *
 * The rules below are what would have stopped it, checked in the browser
 * before anything is sent. They are not a security boundary: the database is
 * protected by row level security, and anyone can post whatever they like to
 * PostgREST. They exist so that the office cannot create a broken address by
 * accident, which is the only way it has ever happened.
 * ============================================================================
 */

/** Scripts that produce no slug at all. Georgian first, since that is the one. */
const NON_LATIN = /[Ⴀ-ჿЀ-ӿ԰-֏֐-׿؀-ۿ]/

/** What a hand-typed slug is allowed to look like: `herman-miller`, `bo-concept-2`. */
const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * A URL-safe slug, or null when the source yields nothing usable.
 *
 * Returning null rather than inventing `item-<timestamp>` is the point. A
 * stamped slug is not a fallback, it is a silent failure that reaches the
 * address bar: it tells the reader nothing, it cannot be guessed, and it
 * looks like a bug to anyone who sees it in a URL. The callers now have to
 * decide what to do about an unusable title, and every one of them refuses.
 */
export function slugify(source: string): string | null {
  const slug = source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '')

  return slug || null
}

/** Why an English title is not acceptable, or null when it is. */
export type TitleProblem =
  /** Written in a script the address cannot carry — Georgian, Cyrillic, Arabic… */
  | 'notLatin'
  /** Latin, but nothing survives slugification: "—", "!!!", "…". */
  | 'noSlug'

/**
 * Checks the field the slug is built from.
 *
 * An empty value is NOT a problem here. The input carries `required`, so the
 * browser stops that one first and with a better message than this could give.
 */
export function checkEnglishTitle(value: string): TitleProblem | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (NON_LATIN.test(trimmed)) return 'notLatin'
  if (!slugify(trimmed)) return 'noSlug'
  return null
}

/** Why a hand-typed slug is not acceptable, or null when it is. */
export type SlugProblem = 'shape'

/**
 * Checks a slug somebody typed themselves.
 *
 * Only the brand form still offers the field, and only when creating. Empty is
 * fine — it means "derive one from the name", which is the usual path.
 */
export function checkSlug(value: string): SlugProblem | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return SLUG_SHAPE.test(trimmed) ? null : 'shape'
}
