import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ResourceTypeUrlNames } from './types'

export const useActiveResourceFromUrl = (area: 'spaces' | 'myhome') => {
  const location = useLocation()
  const [activeResource, setActiveResource] = useState<ResourceTypeUrlNames>()
  useEffect(() => {
    const [,,myHomeResource,spacesResource] = location.pathname.split('/')
    setActiveResource((area === 'spaces' ? spacesResource : myHomeResource) as any)
  }, [location])

  return [activeResource]
}
