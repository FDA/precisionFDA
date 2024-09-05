import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { ReactElement, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'
import {
  BannerPickedInfo,
  BannerPicker,
  BannerPickerItem,
  BannerRight,
  BannerTitle,
  ResourceBanner,
} from '../../components/Banner'
import { GuestNotAllowed } from '../../components/GuestNotAllowed'
import { MenuCounter } from '../../components/MenuCounter'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileZipIcon } from '../../components/icons/FileZipIcon'
import { FlapIcon } from '../../components/icons/FlapIcon'
import { SpaceReportIcon } from '../../components/icons/SpaceReportIcon'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useToastWSHandler } from '../../hooks/useToastWSHandler'
import { UserLayout } from '../../layouts/UserLayout'
import NavigateWithParams from '../../utils/NavigateWithParams'
import { AppList } from '../apps/AppList'
import { AppsShow } from '../apps/AppsShow'
import { CreateAppPage } from '../apps/form/CreateAppPage'
import { EditAppPage } from '../apps/form/EditAppPage'
import { ForkAppPage } from '../apps/form/ForkAppPage'
import { RunJobPage } from '../apps/run/RunJobPage'
import { AssetList } from '../assets/AssetList'
import { AssetShow } from '../assets/AssetShow'
import { useAuthUser } from '../auth/useAuthUser'
import { DatabaseList } from '../databases/DatabaseList'
import { DatabaseShow } from '../databases/DatabaseShow'
import { CreateDatabase } from '../databases/create/CreateDatabase'
import { ExecutionList } from '../executions/ExecutionList'
import { ExecutionDetails } from '../executions/details/ExecutionDetails'
import { FileList } from '../files/FileList'
import { FileShow } from '../files/show/FileShow'
import { SpaceReportList } from '../space-reports/SpaceReportList'
import { TrackInHome } from '../tracks/TrackInHome'
import { WorkflowList } from '../workflows/WorkflowList'
import { WorkflowShow } from '../workflows/WorkflowShow'
import { getHomeScopeFromServerScope } from './getHomeScopeFromServerScope'
import { Expand, Fill, Main, MenuItem, MenuText, Row, StyledMenu } from './home.styles'
import { HomeScope, ResourceTypeUrlNames, ServerScope } from './types'
import { useActiveResourceFromUrl } from './useActiveResourceFromUrl'
import { toTitleCase } from './utils'

interface CounterRequest {
  apps: string
  assets: string
  dbclusters: string
  jobs: string
  files: string
  workflows: string
  reports: string
}

export async function counterRequest(homeScope: HomeScope): Promise<CounterRequest> {
  let apiRoute = '/api/counters'
  if (homeScope !== 'me') {
    apiRoute = `${apiRoute}/${homeScope}`
  }
  return axios.get(apiRoute).then(d => d.data)
}

const Home2 = () => {
  usePageMeta({ title: 'My Home - precisionFDA' })
  const user = useAuthUser()
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage('expandedMyHomeSidebar', true)
  const navigate = useNavigate()
  const location = useLocation()
  const [homeScopeQuery = 'me', setHomeScopeQuery] = useQueryParam<string, HomeScope>('scope')
  const [persistedHomeScope, setPersistedHomeScope] = useState<HomeScope>(homeScopeQuery)
  const { data: counterData } = useQuery({
    queryKey: ['counters', persistedHomeScope],
    queryFn: () => counterRequest(persistedHomeScope),
  })
  const [activeResource] = useActiveResourceFromUrl('myhome')
  const [isPushed, setIsPushed] = useState<boolean>(false)

  useToastWSHandler(user)
  const handleScopeClick = async (newHomeScope: HomeScope) => {
    // Depending on if the user is on the list page or the show page, we need to redirect to the list page
    if (location.pathname === `/home/${activeResource}`) {
      setHomeScopeQuery(newHomeScope)
      setIsPushed(false)
    } else {
      navigate(`/home/${activeResource}?scope=${newHomeScope}`)
      setIsPushed(true)
    }
  }

  type HomeResourceType = Exclude<ResourceTypeUrlNames, 'jobs' | 'members' | 'discussions'>

  const homeScopeToResourceTypesMap: Record<HomeScope, HomeResourceType[]> = {
    me: ['files', 'apps', 'databases', 'assets', 'workflows', 'executions', 'reports'],
    everybody: ['files', 'apps', 'assets', 'workflows', 'executions'],
    featured: ['files', 'apps', 'assets', 'workflows', 'executions'],
    spaces: ['files', 'apps', 'assets', 'workflows', 'executions'],
  }

  useEffect(() => {
    if (location.pathname !== `/home/${activeResource}`) {
      setIsPushed(false)
      return
    }
    if (homeScopeQuery) {
      const allowedResources = homeScopeToResourceTypesMap[homeScopeQuery]
      const newResource = allowedResources.includes(activeResource as HomeResourceType) ? activeResource : allowedResources[0]

      if (activeResource !== newResource) {
        navigate(`/home/${newResource}?scope=${homeScopeQuery}`)
      }

      setPersistedHomeScope(homeScopeQuery)
    }
  }, [homeScopeQuery, activeResource, isPushed])

  const handleSetPersistedHomeScope = (rs: ServerScope, featured: boolean) => {
    const resourceScope = getHomeScopeFromServerScope(rs, featured)
    setPersistedHomeScope(resourceScope)
  }

  const routeScopeParam = `?${new URLSearchParams({
    scope: persistedHomeScope,
  }).toString()}`

  const menuItems: Record<HomeResourceType, ReactElement> = {
    files: (
      <MenuItem
        data-testid="home-files-link"
        to={`/home/files${routeScopeParam}`}
        activeClassName="active"
        title="Files"
        key="files"
      >
        <FileIcon height={14} />
        <MenuText>Files</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.files} active={activeResource === 'files'} />}
      </MenuItem>
    ),
    apps: (
      <MenuItem data-testid="home-apps-link" to={`/home/apps${routeScopeParam}`} activeClassName="active" title="Apps" key="apps">
        <CubeIcon height={14} />
        <MenuText>Apps</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.apps} active={activeResource === 'apps'} />}
      </MenuItem>
    ),
    databases: (
      <MenuItem
        data-testid="home-databases-link"
        to={`/home/databases${routeScopeParam}`}
        activeClassName="active"
        title="Databases"
        key="databases"
      >
        <DatabaseIcon height={14} />
        <MenuText>Databases</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.dbclusters} active={activeResource === 'databases'} />}
      </MenuItem>
    ),
    assets: (
      <MenuItem
        data-testid="home-assets-link"
        to={`/home/assets${routeScopeParam}`}
        activeClassName="active"
        title="Assets"
        key="assets"
      >
        <FileZipIcon height={14} />
        <MenuText>Assets</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.assets} active={activeResource === 'assets'} />}
      </MenuItem>
    ),
    workflows: (
      <MenuItem
        data-testid="home-workflows-link"
        to={`/home/workflows${routeScopeParam}`}
        activeClassName="active"
        title="Workflows"
        key="workflows"
      >
        <BoltIcon height={14} />
        <MenuText>Workflows</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.workflows} active={activeResource === 'workflows'} />}
      </MenuItem>
    ),
    executions: (
      <MenuItem
        data-testid="home-executions-link"
        to={`/home/executions${routeScopeParam}`}
        activeClassName="active"
        title="Executions"
        key="executions"
      >
        <CogsIcon height={14} />
        <MenuText>Executions</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.jobs} active={activeResource === 'executions'} />}
      </MenuItem>
    ),
    reports: (
      <MenuItem
        data-testid="home-reports-link"
        to={`/home/reports${routeScopeParam}`}
        activeClassName="active"
        title="Reports"
        key="reports"
      >
        <SpaceReportIcon height={14} />
        <MenuText>Reports</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.reports} active={activeResource === 'reports'} />}
      </MenuItem>
    ),
  }

  if (!user || user?.is_guest) {
    return (
      <UserLayout mainScroll>
        <GuestNotAllowed />
      </UserLayout>
    )
  }

  // TODO: If scopeDescriptions is reused in another component, extract this to a utility function
  const capitalizedResource = activeResource ? toTitleCase(activeResource) : 'Undefined'
  const homeScopeDescriptions: { [key: string]: string } = {
    me: `Your private ${activeResource}, visible to you only`,
    featured: `Featured ${activeResource}. This list is curated by the site admin`,
    everybody: `${capitalizedResource} that are shared publicly, by you or anyone on precisionFDA`,
    spaces: `${capitalizedResource} in Spaces that you have access to`,
  }

  return (
    <UserLayout innerScroll>
      <ResourceBanner data-testid="home-banner">
        <BannerTitle>My Home</BannerTitle>
        <BannerRight>
          <BannerPicker>
            <BannerPickerItem
              data-testid="me-button"
              onClick={() => handleScopeClick('me')}
              $isActive={persistedHomeScope === 'me'}
            >
              Me
            </BannerPickerItem>
            <BannerPickerItem
              data-testid="featured-button"
              onClick={() => handleScopeClick('featured')}
              $isActive={persistedHomeScope === 'featured'}
            >
              Featured
            </BannerPickerItem>
            <BannerPickerItem
              data-testid="everyone-button"
              onClick={() => handleScopeClick('everybody')}
              $isActive={persistedHomeScope === 'everybody'}
            >
              Everyone
            </BannerPickerItem>
            <BannerPickerItem
              data-testid="spaces-button"
              onClick={() => handleScopeClick('spaces')}
              $isActive={persistedHomeScope === 'spaces'}
            >
              Spaces
            </BannerPickerItem>
          </BannerPicker>
          <BannerPickedInfo>
            {homeScopeDescriptions[persistedHomeScope]}
          </BannerPickedInfo>
        </BannerRight>
      </ResourceBanner>
      <Row>
        <StyledMenu $expanded={expandedSidebar}>
          { homeScopeToResourceTypesMap[persistedHomeScope].map(t => menuItems[t]) }
          <Fill />
          <Expand
            data-testid="expand-sidebar"
            onClick={() => setExpandedSidebar(!expandedSidebar)}
          >
            <FlapIcon />
          </Expand>
        </StyledMenu>
        <Main>
          <Routes>
          <Route
                path="files"
                element={
                  <FileList
                    homeScope={persistedHomeScope}
                    showFolderActions={(persistedHomeScope === 'everybody' && user.admin) || persistedHomeScope === 'me'}
                  />
                }
              />
              <Route path="apps" element={<AppList homeScope={persistedHomeScope} />} />
              <Route path="apps/create" element={<CreateAppPage />} />
              <Route path="apps/:appUid/fork" element={<ForkAppPage />} />
              <Route path="apps/:appUid/edit" element={<EditAppPage />} />
              <Route path="apps/:appUid/jobs/new" element={<RunJobPage />} />
              <Route
                path="apps/:appUid/*"
                element={<AppsShow homeScope={persistedHomeScope} emitScope={handleSetPersistedHomeScope} />}
              />
              <Route path="/apps/:identifier/track" element={<TrackInHome />} />
              <Route path="databases" element={<DatabaseList homeScope={persistedHomeScope} />} />
              <Route path="databases/create" element={<CreateDatabase />} />
              <Route path="databases/:uid" element={<DatabaseShow homeScope={persistedHomeScope} emitScope={handleSetPersistedHomeScope} />}/>
              <Route path="databases/:identifier/track" element={<TrackInHome entityType="database" />} />
              <Route path="assets" element={<AssetList homeScope={persistedHomeScope} />} />
              <Route
                path="assets/:assetUid/*"
                element={<AssetShow homeScope={persistedHomeScope} emitScope={handleSetPersistedHomeScope} />}
              />
              <Route path="workflows" element={<WorkflowList homeScope={persistedHomeScope} />} />
              <Route
                path="workflows/:workflowUid/*"
                element={<WorkflowShow homeScope={persistedHomeScope} emitScope={handleSetPersistedHomeScope} />}
              />
              <Route
                path="files/:fileId"
                element={<FileShow homeScope={persistedHomeScope} emitScope={handleSetPersistedHomeScope} />}
              />
              <Route path="/files/:identifier/track" element={<TrackInHome />} />
              <Route path="executions" element={<ExecutionList homeScope={persistedHomeScope} />} />
              <Route
                path="executions/:executionUid/*"
                element={<ExecutionDetails homeScope={persistedHomeScope} emitScope={handleSetPersistedHomeScope} />}
              />
              <Route path="/executions/:identifier/track" element={<TrackInHome entityType="execution" />} />
              <Route path="reports" element={<SpaceReportList scope="private" />} />
              {/* TODO: remove this route when we have a better way to redirect user to executions page */}
              <Route path="jobs/:executionUid" element={<NavigateWithParams to="/home/executions/:executionUid" replace />} />
              <Route path="jobs" element={<Navigate to="/home/executions" replace />} />
              <Route path="*" element={<Navigate to="/home/files" replace />} />
          </Routes>
        </Main>
      </Row>
    </UserLayout>
  )
}

export default Home2
