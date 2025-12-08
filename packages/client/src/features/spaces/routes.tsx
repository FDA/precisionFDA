import React from 'react'
import { type RouteObject } from 'react-router'
import { Outlet } from 'react-router'
import { UserLayout } from '../../layouts/UserLayout'
import { HomeLoader } from '../home/show.styles'

import SpacesList from './SpacesList'
import { CreateSpace } from './form/CreateSpace'
import { SpaceSettings } from './form/SpaceSettings'
import { SpaceShowLayout } from './show/SpaceShowLayout'
import { spaceDetailRoutes } from './show/routes'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useSpaceDataHook } from './show/useSpaceData.hook'
import { Activation } from './show/SpaceActivation'
import { SpaceLocked } from './show/SpaceLocked'
import { SpaceNotAllowed } from './show/SpaceNotAllowed'
import { ISpace } from './spaces.types'

export interface SpaceOutletContext {
  space: ISpace
  isLoading: boolean
}

const SpaceShowRoot = () => {
  usePageMeta({ title: 'Spaces - precisionFDA' })
  const { space, isLoading, isNotAllowed, isLocked } = useSpaceDataHook()

  if (isLoading) return <HomeLoader />
  if (isNotAllowed) return <SpaceNotAllowed />
  if (isLocked || space?.state === 'locked') return <SpaceLocked space={space} />
  if (!space) return <SpaceNotAllowed />

  // Handle unactivated spaces
  if (space.state === 'unactivated') {
    return <Activation space={space} />
  }

  return (
    <UserLayout innerScroll>
      <Outlet context={{ space, isLoading }} />
    </UserLayout>
  )
}

export const spacesRoutes: RouteObject[] = [
  {
    index: true,
    Component: SpacesList,
  },
  {
    path: 'new',
    Component: CreateSpace,
  },
  {
    path: ':spaceId/edit',
    Component: SpaceSettings,
  },
  {
    path: ':spaceId',
    Component: SpaceShowRoot,
    children: [
      {
        element: <SpaceShowLayout />,
        children: spaceDetailRoutes,
      },
    ],
  },
]

export default spacesRoutes
