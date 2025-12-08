import React from 'react'
import { Link, Outlet } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  BannerPickedInfo,
  BannerPicker,
  BannerPickerItem,
  BannerRight,
  BannerTitle,
  ResourceBanner,
} from '../../../components/Banner'
import { MenuCounter } from '../../../components/MenuCounter'
import { BoltIcon } from '../../../components/icons/BoltIcon'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { DatabaseIcon } from '../../../components/icons/DatabaseIcon'
import { DiscussionIcon } from '../../../components/icons/DiscussionIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FileZipIcon } from '../../../components/icons/FileZipIcon'
import { FlapIcon } from '../../../components/icons/FlapIcon'
import { NetworkIcon } from '../../../components/icons/NetworkIcon'
import { SpaceReportIcon } from '../../../components/icons/SpaceReportIcon'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { useToastWSHandler } from '../../../hooks/useToastWSHandler'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { counterRequest } from '../counterRequest'
import { Expand, Fill, Main, MenuItem, MenuText, Row, StyledMenu } from '../home.styles'
import { HomeResourceType, HomeScope } from '../types'
import { useActiveResourceFromUrl } from '../useActiveResourceFromUrl'
import { toTitleCase } from '../utils'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { UserLayout } from '../../../layouts/UserLayout'
import { HomeScopeProvider, useHomeScope } from '../HomeScopeContext'

const HOME_SCOPE_TO_RESOURCES: Record<HomeScope, HomeResourceType[]> = {
  me: ['files', 'apps', 'databases', 'assets', 'workflows', 'executions', 'reports'],
  everybody: ['files', 'apps', 'assets', 'discussions', 'workflows', 'executions'],
  featured: ['files', 'apps', 'assets', 'workflows', 'executions'],
  spaces: ['files', 'apps', 'databases', 'assets', 'discussions', 'workflows', 'executions'],
}

const HomeShowContent = () => {
  usePageMeta({ title: 'My Home - precisionFDA' })
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage('expandedMyHomeSidebar', true)
  const { homeScope } = useHomeScope()
  const [activeResource] = useActiveResourceFromUrl('myhome')

  useToastWSHandler()

  // Fetch counters for current scope
  const { data: counterData } = useQuery({
    queryKey: ['counters', homeScope],
    queryFn: () => counterRequest(homeScope),
  })

  const routeScopeParam = `?scope=${homeScope || 'me'}`

  // Menu items configuration
  const menuItems: Record<HomeResourceType, React.ReactElement> = {
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
    discussions: (
      <MenuItem
        data-testid="home-discussions-link"
        to={`/home/discussions${routeScopeParam}`}
        activeClassName="active"
        title="Discussions"
        key="discussions"
      >
        <DiscussionIcon height={14} />
        <MenuText>Discussions</MenuText>
        {expandedSidebar && <MenuCounter count={counterData?.discussions} active={activeResource === 'discussions'} />}
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
        <NetworkIcon height={18} />
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
        <BoltIcon height={15} />
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

  // Scope descriptions
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
              as={Link}
              data-testid="me-button"
              to={{ pathname: `/home/${activeResource}`, search: '?scope=me' }}
              $isActive={homeScope === 'me' || homeScope === undefined}
            >
              Me
            </BannerPickerItem>
            <BannerPickerItem
              as={Link}
              data-testid="featured-button"
              to={{ pathname: `/home/${activeResource}`, search: '?scope=featured' }}
              $isActive={homeScope === 'featured'}
            >
              Featured
            </BannerPickerItem>
            <BannerPickerItem
              as={Link}
              data-testid="everyone-button"
              to={{ pathname: `/home/${activeResource}`, search: '?scope=everybody' }}
              $isActive={homeScope === 'everybody'}
            >
              Everyone
            </BannerPickerItem>
            <BannerPickerItem
              as={Link}
              data-testid="spaces-button"
              to={{ pathname: `/home/${activeResource}`, search: '?scope=spaces' }}
              $isActive={homeScope === 'spaces'}
            >
              Spaces
            </BannerPickerItem>
          </BannerPicker>
          <BannerPickedInfo>{homeScopeDescriptions[homeScope ?? 'me']}</BannerPickedInfo>
        </BannerRight>
      </ResourceBanner>
      <Row>
        <StyledMenu $expanded={expandedSidebar}>
          {HOME_SCOPE_TO_RESOURCES[homeScope ?? 'me'].map((t: HomeResourceType) => menuItems[t])}
          <Fill />
          <Expand data-testid="expand-sidebar" onClick={() => setExpandedSidebar(!expandedSidebar)}>
            <FlapIcon />
          </Expand>
        </StyledMenu>
        <Main>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Main>
      </Row>
    </UserLayout>
  )
}

export const HomeShowLayout = () => {
  return (
    <HomeScopeProvider>
      <HomeShowContent />
    </HomeScopeProvider>
  )
}

export default HomeShowLayout
