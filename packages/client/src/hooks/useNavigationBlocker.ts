import { useBlocker } from 'react-router'

/**
 * Blocks client-side navigation away from the current page when the form is
 * dirty (and not mid-submission). Use together with NavigationBlockerDialog to
 * show a confirmation dialog instead of the browser's native prompt.
 */
export function useNavigationBlocker(isDirty: boolean, isSubmitting = false) {
  return useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmitting && isDirty && currentLocation.pathname !== nextLocation.pathname,
  )
}
