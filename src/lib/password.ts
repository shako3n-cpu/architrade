/**
 * ============================================================================
 * WHAT COUNTS AS AN ACCEPTABLE STAFF PASSWORD
 * ----------------------------------------------------------------------------
 * Eight characters, at least one capital, one number and one symbol, and Latin
 * throughout — a Georgian password is refused, and the list says so. Four
 * screens set a password — an administrator creating an account, an
 * administrator resetting an operator's, anybody changing their own, and
 * anybody choosing one after a recovery link — and they each used to carry
 * their own copy of "at least 8". A rule kept in four places is a rule that
 * gets tightened in three.
 *
 * THE RULES ARE A LIST, NOT A CHAIN OF ifs
 *   Every screen shows all four at once, ticking them off as somebody types,
 *   so each rule needs to be inspectable on its own rather than hidden inside
 *   the first `return` that matches. That is why PASSWORD_RULES is data.
 *
 * THIS FILE DOES NOT ENFORCE ANYTHING
 *   It is here so a field can state the rules and refuse the button before a
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

/** The shortest password any of the four screens will offer to send. */
export const MIN_STAFF_PASSWORD_LENGTH = 8

/**
 * The alphabet a password may be drawn from: printable ASCII, no space.
 *
 * GEORGIAN IS NOT ALLOWED IN A PASSWORD, and that is the point of this rule.
 *
 *   - Mkhedruli has no capitals, so a Georgian password can never satisfy the
 *     capital rule. Without this line it would show three ticks, refuse to
 *     submit, and never say why.
 *   - The password is typed at a login screen where the keyboard layout is
 *     whatever the last person left it on, and there is no text to read back
 *     — the box shows dots. A password in a script that needs a layout switch
 *     is one somebody eventually cannot type at all.
 *   - It travels by phone call and by handwriting between the office and a new
 *     member of staff. Latin characters survive that; the ones that look alike
 *     across the two scripts do not.
 *
 * Space is excluded with it. A password read aloud or written down loses its
 * leading and trailing spaces silently, and nothing recovers them.
 */
const ALLOWED = /^[\x21-\x7e]+$/

/**
 * A symbol is any printable ASCII character that is not a letter or a digit.
 *
 * Deliberately permissive within that, and the message deliberately does not
 * name an example. Naming "# or !" turns a rule into a menu — the two named
 * characters become the two everybody picks, which is exactly the
 * concentration the rule exists to avoid.
 */
const SYMBOL = /[^A-Za-z0-9]/

/** At least one capital, and A-Z rather than `\p{Lu}`: see ALLOWED. */
const UPPERCASE = /[A-Z]/

/** At least one digit. `[0-9]`, for the same reason. */
const NUMBER = /[0-9]/

export type PasswordRuleId = 'length' | 'upper' | 'number' | 'symbol' | 'latin'

/**
 * The rules, in the order they are shown.
 *
 * Length first because it is the one somebody satisfies by carrying on typing,
 * so it is the one that ticks itself off while they read the rest.
 */
export const PASSWORD_RULES: {
  id: PasswordRuleId
  /** The locale key for the line as it appears in the list. */
  labelKey: string
  met: (password: string) => boolean
}[] = [
  {
    id: 'length',
    labelKey: 'admin.passwordRuleLength',
    met: (password) => password.length >= MIN_STAFF_PASSWORD_LENGTH,
  },
  { id: 'upper', labelKey: 'admin.passwordRuleUpper', met: (password) => UPPERCASE.test(password) },
  { id: 'number', labelKey: 'admin.passwordRuleNumber', met: (password) => NUMBER.test(password) },
  { id: 'symbol', labelKey: 'admin.passwordRuleSymbol', met: (password) => SYMBOL.test(password) },
  /*
   * Last, because it is the only line that takes something away rather than
   * asking for something. Somebody reading downwards meets the three things
   * to include before the one thing to avoid.
   */
  { id: 'latin', labelKey: 'admin.passwordRuleLatin', met: (password) => ALLOWED.test(password) },
]

/** Every rule with its current answer, for a checklist to render. */
export function passwordChecks(password: string): { id: PasswordRuleId; labelKey: string; met: boolean }[] {
  return PASSWORD_RULES.map(({ id, labelKey, met }) => ({ id, labelKey, met: met(password) }))
}

/** True when the password meets every rule. */
export function isAcceptablePassword(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.met(password))
}

/**
 * True when the two boxes disagree AND the repeat is far enough along to say
 * so — once it is at least as long as the password.
 *
 * Without that second condition every password in the world is announced as
 * not matching from the first keystroke of the repeat, and a warning that is
 * always on is a warning nobody reads.
 */
export function passwordsMismatch(value: string, confirm: string): boolean {
  return confirm.length > 0 && confirm.length >= value.length && confirm !== value
}

/** Both boxes agree and the password meets every rule. */
export function passwordReady(value: string, confirm: string): boolean {
  return isAcceptablePassword(value) && confirm === value
}
