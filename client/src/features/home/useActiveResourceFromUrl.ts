import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { ResourceTypeUrlNames } from './types'

export const useActiveResourceFromUrl = (area: 'spaces' | 'myhome') => {
  const history = useHistory()
  const [activeResource, setActiveResource] = useState<ResourceTypeUrlNames>()
  useEffect(() => {
    const [,,myHomeResource,spacesResource] = history.location.pathname.split('/')
    setActiveResource((area === 'spaces' ? spacesResource : myHomeResource) as any)
  }, [history.location])

  return [activeResource]
}
