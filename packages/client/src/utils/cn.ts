import { type ClassValue, clsx } from 'clsx'

/**
 * Utility function to merge class names
 * Combines clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
