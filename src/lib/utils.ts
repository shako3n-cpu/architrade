import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes safely.
 *
 * clsx handles conditionals ({ 'text-brass': isActive }) and tailwind-merge
 * resolves conflicts so a prop-supplied class always beats the default one
 * (e.g. cn('p-4', 'p-8') -> 'p-8' rather than both).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
