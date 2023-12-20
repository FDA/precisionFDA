import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { UserLayout } from '../../layouts/UserLayout'
import { CreateSpace } from './form/CreateSpace'
import { DuplicateSpace } from './form/DuplicateSpace'
import { SpaceSettings } from './form/SpaceSettings'
import { SpaceShow } from './show/SpaceShow'
import SpacesList from './SpacesList'


const Spaces = () => {
  usePageMeta({ title: 'Spaces - precisionFDA' })

  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<SpacesList />} />
        <Route path={`/:spaceId/edit`} element={<SpaceSettings />} />
        <Route path={`/:spaceId/duplicate`} element={<DuplicateSpace />} />
        <Route path={`/new`} element={<CreateSpace />} />
        <Route path={`/:spaceId/*`} element={<SpaceShow />} />
      </Routes>
    </UserLayout>
  )
}

export default Spaces
