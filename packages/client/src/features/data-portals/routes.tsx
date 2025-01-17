import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useToastWSHandler } from '../../hooks/useToastWSHandler'
import DataPortalsListPage from './list/DataPortalsListPage'
import EditDataPortalPage from './form/EditDataPortalPage'

const CreateDataPortalPage = React.lazy(
  () => import('./form/CreateDataPortalPage'),
)
const DataPortalDetailsPage = React.lazy(
  () => import('./details/DataPortalDetailsPage'),
)

const DataPortalRoutes = () => {
  usePageMeta({ title: 'Data Portals - precisionFDA' })
  useToastWSHandler()

  return (
    <Routes>
      <Route path="" element={<DataPortalsListPage />} />
      <Route path="create" element={<CreateDataPortalPage />} />
      <Route path=":portalId/*" element={<DataPortalDetailsPage />} />
      <Route path=":portalId/edit" element={<EditDataPortalPage />} />
    </Routes>
  )
}

export default DataPortalRoutes
