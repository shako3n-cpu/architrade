import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The form controls used across the admin screens.
 *
 * Every one of them wires its own <label> to its own input through a generated
 * id. That is not decoration: without it, tapping the label does not focus the
 * field, and a screen reader announces the box with no idea what it is for.
 *
 * The visual language is the site's — hairline borders, no rounded corners, no
 * shadows, brass on focus — so the back office does not look like a different
 * product from the shop.
 */

/*
 * `text-base` (16px) on phones is not a style choice — iOS Safari zooms the
 * whole page in when a focused input's text is smaller than 16px, and the
 * visitor is then left scrolled sideways on a form they were halfway through.
 * Above `sm` there is no such behaviour, so the denser 14px comes back.
 *
 * `min-h-11` is 44px, the smallest comfortable touch target.
 */
const CONTROL =
  'w-full min-h-11 border border-hairline bg-background px-3.5 py-2.5 ' +
  'text-base text-ink sm:text-sm ' +
  'transition-colors duration-300 placeholder:text-muted/60 ' +
  'focus:border-brass focus:outline-none disabled:opacity-50'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required = false,
  type = 'text',
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  /**
   * What is wrong with the current value, or undefined when nothing is.
   *
   * Rendered in ink rather than a warning colour because this palette has no
   * red in it — the site is graphite, off-white and brass, and inventing a
   * twelfth colour for one message would be the loudest thing on the screen.
   * The darker border and the darker text are the signal; `aria-invalid` and
   * `role="alert"` are what carry it to a screen reader.
   */
  error?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'number'
  disabled?: boolean
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      <input
        id={id}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        // The error first: it is the more urgent of the two, and a field that
        // is wrong should not have its hint read out ahead of the reason.
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL, 'mt-2', error && 'border-ink')}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-ink">
          {error}
        </p>
      )}

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  hint?: string
  required?: boolean
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      <textarea
        id={id}
        rows={rows}
        value={value}
        required={required}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL, 'mt-2 resize-y leading-relaxed')}
      />

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  /** Shown as a disabled first entry when nothing is chosen yet. */
  placeholder?: string
  required?: boolean
}) {
  const id = useId()

  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      <select
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL, 'mt-2')}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--at-brass)]"
      />

      <div>
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>

        {hint && (
          <p id={hintId} className="mt-1 text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] tracking-[0.16em] text-muted uppercase"
    >
      {children}
      {/* Marked for sighted users and hidden from screen readers, which are
          told the same thing by the input's own `required` attribute. */}
      {required && (
        <span aria-hidden="true" className="ml-1 text-brass">
          *
        </span>
      )}
    </label>
  )
}
