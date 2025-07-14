import { ReactNode } from 'react'
import { Action } from './action-types'

/**
 * Extracts modal components from actions and returns them as a keyed object.
 * This utility function consolidates the common pattern of reducing actions to extract modals.
 * 
 * @param actions - Array of Action objects that may contain modal components
 * @returns Object with action names as keys and modal components as values
 */
export const extractModalsFromActions = (actions: Action[]): Record<string, ReactNode | null> => {
  return actions.reduce(
    (acc, action) => {
      if (action.modal && action.name) {
        acc[action.name] = action.modal
      }
      return acc
    },
    {} as Record<string, ReactNode | null>,
  )
}
