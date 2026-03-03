import React from 'react'
import { Outlet, type RouteObject } from 'react-router'
import { HomeLoader } from '@/features/home/show.styles'
import { useSpaceCountersDataHook } from '@/features/spaces/show/useSpaceCountersData.hook'
import { useSpaceDataHook } from '@/features/spaces/show/useSpaceData.hook'
import { Counters, ISpace } from '@/features/spaces/spaces.types'
import { usePageMeta } from '@/hooks/usePageMeta'
import { UserLayout } from '@/layouts/UserLayout'
import { MembersListPage } from '../resource-pages'
import { commonResourceRoutes } from '../shared'

const SpacesList = React.lazy(() => import('../../features/spaces/SpacesList'))
const CreateSpace = React.lazy(() =>
  import('../../features/spaces/form/CreateSpace').then(m => ({ default: m.CreateSpace })),
)
const SpaceSettings = React.lazy(() =>
  import('../../features/spaces/form/SpaceSettings').then(m => ({ default: m.SpaceSettings })),
)
const SpaceShowLayout = React.lazy(() =>
  import('../../features/spaces/show/SpaceShowLayout').then(m => ({ default: m.SpaceShowLayout })),
)
const Activation = React.lazy(() =>
  import('../../features/spaces/show/SpaceActivation').then(m => ({ default: m.Activation })),
)
const SpaceLocked = React.lazy(() =>
  import('../../features/spaces/show/SpaceLocked').then(m => ({ default: m.SpaceLocked })),
)
const SpaceNotAllowed = React.lazy(() =>
  import('../../features/spaces/show/SpaceNotAllowed').then(m => ({ default: m.SpaceNotAllowed })),
)

export interface SpaceOutletContext {
  space: ISpace
  counters: Counters | undefined
  isLoading: boolean
}

const SpaceShowRoot = () => {
  usePageMeta({ title: 'Spaces - precisionFDA' })
  const { space, isLoading, isNotAllowed, isLocked } = useSpaceDataHook()
  const { counters } = useSpaceCountersDataHook()

  if (isLoading) return <HomeLoader />
  if (isNotAllowed) return <SpaceNotAllowed />
  if (isLocked || space?.state === 'locked') return <SpaceLocked space={space} />
  if (!space) return <SpaceNotAllowed />

  // Handle inactivated spaces
  if (space.state === 'unactivated') {
    return <Activation space={space} />
  }

  return (
    <UserLayout innerScroll>
      <Outlet context={{ space, counters, isLoading }} />
    </UserLayout>
  )
}

export const spaceResourceRoutes: RouteObject[] = [
  ...commonResourceRoutes,
  {
    path: 'members',
    Component: MembersListPage,
  },
  {
    path: 'edit',
    Component: SpaceSettings,
  },
]

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
    path: ':spaceId',
    Component: SpaceShowRoot,
    children: [
      {
        element: <SpaceShowLayout />,
        children: spaceResourceRoutes,
      },
    ],
  },
]

export default spacesRoutes
