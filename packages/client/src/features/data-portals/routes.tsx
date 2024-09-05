import React from 'react'
import { Route, Routes } from 'react-router-dom'
import NavigationBar, {
  NavigationBarBanner,
  NavigationBarPublicLandingTitle,
} from '../../components/NavigationBar/NavigationBar'
import { PageContainerMargin } from '../../components/Page/styles'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useToastWSHandler } from '../../hooks/useToastWSHandler'
import PublicLayout from '../../layouts/PublicLayout'
import { Tagline } from '../../pages/Tagline'
import { DataPortalsAuthPickerModal } from '../auth/DataPortalsAuthPickerModal'
import { useAuthUser } from '../auth/useAuthUser'
import { useModal } from '../modal/useModal'
import DataPortalsListPage from './list/DataPortalsListPage'
import EditDataPortalPage from './form/EditDataPortalPage'

const CreateDataPortalPage = React.lazy(
  () => import('./form/CreateDataPortalPage'),
)
const DataPortalDetailsPage = React.lazy(
  () => import('./details/DataPortalDetailsPage'),
)
const DataPortalContentEditPage = React.lazy(
  () => import('./form/DataPortalContentEditPage'),
)

const DataPortalRoutes = () => {
  usePageMeta({ title: 'DAaaS - precisionFDA' })
  const { loading, user } = useAuthUser(true)

  useToastWSHandler(user)

  const modal = useModal()

  if (!user && !loading ) {
    // if accessed as non-logged user, present modal with landing-page background
    return <PublicLayout mainScroll>
      <DataPortalsAuthPickerModal modal={modal}/>
      <NavigationBar user={null}>
        <PageContainerMargin>
          <NavigationBarBanner>
            <NavigationBarPublicLandingTitle>
              <Tagline/>
            </NavigationBarPublicLandingTitle>
          </NavigationBarBanner>
        </PageContainerMargin>
      </NavigationBar>
      <div style={{ height: '100%' }} />
    </PublicLayout>
  }

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
