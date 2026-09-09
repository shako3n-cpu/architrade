/**
 * ============================================================================
 * WHAT COUNTS AS AN ACCEPTABLE STAFF PASSWORD
 * ----------------------------------------------------------------------------
 * Eight characters, and at least one capital, one number and one symbol. Three
 * screens set a password — an administrator creating an account, an
 * administrator resetting an operator's, and anybody choosing their own after
 * a recovery link — and before this they each carried their own copy of "at
 * least 8". A rule kept in three places is a rule that will be tightened in
 * two.
 *
 * THIS FILE DOES NOT ENFORCE ANYTHING
 *   It is here so a field can state the rule and refuse the button before a
 *   request is sent, which is a kindness, not a control. Anybody can call the
 *   endpoint directly. `MIN_PASSWORD_LENGTH` and the character checks in
 *   supabase/functions/admin-users/index.ts are the copy that is enforced, and
 *   the two must be changed together — this file has no way to know if they
 *   drift apart.
 *
 *   Supabase Auth applies its own minimum on top, set in the dashboard under
 *   Authentication -> Policies. It is the floor; this is stricter than it.
 * ============================================================================
 */

/** The shortest password any of the three screens will offer to send. */
export const MIN_STAFF_PASSWORD_LENGTH = 8

/**
 * What is wrong with a password, or null when nothing is.
 *
 * Returns the FIRST unmet rule rather than a list. Somebody typing gets one
 * thing to fix at a time, and the message changes as they type — a field that
 * says three things at once about a half-typed password is noise.
 */
export type PasswordProblem = 'short' | 'noUpper' | 'noNumber' | 'noSymbol'

/**
 * A symbol is anything that is not a letter and not a digit.
 *
 * Deliberately permissive. The point of the rule is to push a password out of
 * the dictionary, and a fixed list of "allowed" punctuation only ever surprises
 * the person who picked something sensible off it. Unicode-aware, because the
 * office types in Georgian and `\W` in a non-unicode regex would call every
 * Georgian letter a symbol — which would let ქართული pass the rule while
 * containing no symbol at all.
 */
const SYMBOL = /[^\p{L}\p{N}]/u

/** At least one capital. `\p{Lu}` and not A-Z, for the same reason. */
const UPPERCASE = /\p{Lu}/u

/**
 * At least one digit.
 *
 * `\p{Nd}` rather than `[0-9]`: it accepts the Arabic-Indic and Devanagari
 * digits somebody may have on a keyboard, and — the reason it matters here —
 * it agrees with SYMBOL about what a digit is. With `[0-9]`, a password
 * containing ٤ would be told it has no number while that same character was
 * quietly satisfying the symbol rule, which is a contradiction the typist
 * cannot see.
 */
const NUMBER = /\p{Nd}/u

/*
 * The order is the order they are asked for: long enough, then a capital, then
 * a number, then a symbol. It decides which single message somebody sees while
 * typing, so it should read as a list being worked down rather than as
 * whichever check happened to be written first.
 */
export function passwordProblem(password: string): PasswordProblem | null {
  if (password.length < MIN_STAFF_PASSWORD_LENGTH) return 'short'
  if (!UPPERCASE.test(password)) return 'noUpper'
  if (!NUMBER.test(password)) return 'noNumber'
  if (!SYMBOL.test(password)) return 'noSymbol'
  return null
}

/** True when the password meets every rule. */
export function isAcceptablePassword(password: string): boolean {
  return passwordProblem(password) === null
}

/**
 * The locale key describing a problem, for a field to show under itself.
 *
 * Kept beside the rules so adding a rule cannot leave a caller with an
 * unhandled case — the union above makes that a type error rather than a blank
 * message.
 */
export function passwordProblemKey(problem: PasswordProblem): string {
  switch (problem) {
    case 'short':
      return 'admin.staffPasswordMin'
    case 'noUpper':
      return 'admin.staffPasswordUpper'
    case 'noNumber':
      return 'admin.staffPasswordNumber'
    case 'noSymbol':
      return 'admin.staffPasswordSymbol'
  }
}
