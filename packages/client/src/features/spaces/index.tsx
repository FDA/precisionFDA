import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import SpacesList from './SpacesList'
import { CreateSpace } from './form/CreateSpace'
import { SpaceSettings } from './form/SpaceSettings'
import { SpaceShow } from './show/SpaceShow'

const Spaces = () => {
  usePageMeta({ title: 'Spaces - precisionFDA' })

  return (
    <Routes>
      <Route path="/" element={<SpacesList />} />
      <Route path="/:spaceId/edit" element={<SpaceSettings />} />
      <Route path="/new" element={<CreateSpace />} />
      <Route path="/:spaceId/*" element={<SpaceShow />} />
    </Routes>
  )
}

export default Spaces
