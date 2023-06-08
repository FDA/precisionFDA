/*
 This hook gets the location hash from react-router-dom and
 finds an id with the same name then scrolling to it.
*/

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const useScrollToHash = () => {
  const location = useLocation()

  useEffect(() => {
    if (document && location?.hash) {
      const el = document.getElementById(location.hash.slice(1))
      el?.scrollIntoView()
    }
  }, [])
}
