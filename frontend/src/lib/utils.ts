import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names using clsx and resolves conflicting
 * Tailwind utility classes using tailwind-merge.
 *
 * Example:
 *   cn('px-4 py-2 bg-red-500', isPrimary && 'bg-blue-600', 'px-6')
 *   // Output: 'py-2 bg-blue-600 px-6'
 *   // (bg-red-500 is overridden by bg-blue-600, px-4 by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
