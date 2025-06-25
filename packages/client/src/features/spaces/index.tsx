import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import SpacesList from './SpacesList'
import { CreateSpace } from './form/CreateSpace'
import { SpaceSettings } from './form/SpaceSettings'
import { SpaceShow } from './show/SpaceShow'
import { CreateSpaceGroup } from '../space-groups/form/CreateSpaceGroup'
import { EditSpaceGroup } from '../space-groups/form/EditSpaceGroup'

const Spaces = () => {
  usePageMeta({ title: 'Spaces - precisionFDA' })

  return (
    <Routes>
      <Route path="/" element={<SpacesList />} />
      <Route path="/:spaceId/edit" element={<SpaceSettings />} />
      <Route path="/new" element={<CreateSpace />} />
      <Route path="/new-space-group" element={<CreateSpaceGroup />} />
      <Route path="/edit-space-group/:spaceGroupId" element={<EditSpaceGroup />} />
      <Route path="/:spaceId/*" element={<SpaceShow />} />
    </Routes>
  )
}

export default Spaces
