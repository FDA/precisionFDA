import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'
import { BannerPickedInfo, BannerPicker, BannerPickerItem, BannerRight, BannerTitle, ResourceBanner } from '../../components/Banner'
import { GuestNotAllowed } from '../../components/GuestNotAllowed'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileZipIcon } from '../../components/icons/FileZipIcon'
import { FlapIcon } from '../../components/icons/FlapIcon'
import { MenuCounter } from '../../components/MenuCounter'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { checkStatus } from '../../utils/api'
import { AppList } from './apps/AppList'
import { AppsShow } from './apps/AppsShow'
import { AssetList } from './assets/AssetList'
import { AssetShow } from './assets/AssetShow'
import { CreateDatabase } from './databases/create/CreateDatabase'
import { DatabaseList } from './databases/DatabaseList'
import { DatabaseShow } from './databases/DatabaseShow'
import { ExecutionList } from './executions/ExecutionList'
import { ExecutionDetails } from './executions/details/ExecutionDetails'
import { FileList } from './files/FileList'
import { FileShow } from './files/show/FileShow'
import { Expand, Fill, Main, MenuItem, MenuText, Row, StyledMenu } from './home.styles'
import { ResourceScope } from './types'
import { useActiveResourceFromUrl } from './useActiveResourceFromUrl'
import { toTitleCase } from './utils'
import { WorkflowList } from './workflows/WorkflowList'
import { WorkflowShow } from './workflows/WorkflowShow'
import { useAuthUser } from '../auth/useAuthUser'
import { UserLayout } from '../../layouts/UserLayout'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useToastWSHandler } from '../../hooks/useToastWSHandler'


interface CounterRequest {
  apps: string,
  assets: string,
  dbclusters: string,
  jobs: string,
  files: string,
  workflows: string,
}

export async function counterRequest(scope: ResourceScope): Promise<CounterRequest> {
  let apiRoute = '/api/counters'
  if (scope !== 'me') {
    apiRoute = `${apiRoute}/${scope}`
  }
  const req = await fetch(apiRoute).then(checkStatus)
  const json = await req.json()
  return json
}

const Home2 = () => {
  usePageMeta({ title: 'My Home - precisionFDA' })
  const user = useAuthUser()
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage('expandedMyHomeSidebar', true)
  const { path } = useRouteMatch()
  const history = useHistory()
  const [scopeQuery = 'me', setScopeQuery] = useQueryParam<string, ResourceScope>('scope')
  const [persistedScope, setPersistedScope] = useState<ResourceScope>(scopeQuery)
  const { data: counterData } = useQuery(['counters', persistedScope], () => counterRequest(persistedScope))
  const [activeResource] = useActiveResourceFromUrl('myhome')
  const [isPushed, setIsPushed] = useState<boolean>(false)

  useToastWSHandler(user)
  const handleScopeClick = async (newScope: ResourceScope) => {
    // Depending on if the user is on the list page or the show page, we need to redirect to the list page
    if(history.location.pathname === `/home/${activeResource}`) {
      setScopeQuery(newScope)
      setIsPushed(false)
    } else {
      history.push(`/home/${activeResource}?scope=${newScope}`)
      setIsPushed(true)
    }
  }

  useEffect(() => {
    if(history.location.pathname !== `/home/${activeResource}`) {
      setIsPushed(false)
      return
    }
    if(scopeQuery) {
      setPersistedScope(scopeQuery)
    }
  }, [scopeQuery, isPushed])

  const routeScopeParam = `?${ 
    new URLSearchParams({
      scope: persistedScope,
    }).toString()}`

  if(!user || user?.is_guest) {
    return (
      <UserLayout>
        <GuestNotAllowed />
      </UserLayout>
    )
  }

  // TODO: If scopeDescriptions is reused in another component, extract this to a utility function
  const capitalizedResource = (activeResource ? toTitleCase(activeResource) : 'Undefined')
  const scopeDescriptions: { [key: string]: string; } = {
    me: `Your private ${activeResource}, visible to you only`,
    featured: `Featured ${activeResource}. This list is curated by the site admin`,
    everybody: `${capitalizedResource} that are shared publicly, by you or anyone on precisionFDA`,
    spaces: `${capitalizedResource} in Spaces that you have access to`,
  }
  const scopeDescription = scopeDescriptions[persistedScope]

  return (
    <UserLayout>
      <ResourceBanner data-testid="home-banner">
        <BannerTitle>My Home</BannerTitle>
        <BannerRight>
          <BannerPicker>
            <BannerPickerItem
              data-testid="me-button"
              onClick={() => handleScopeClick('me')}
              isActive={persistedScope === 'me'}
            >
              Me
            </BannerPickerItem>
            <BannerPickerItem
              data-testid="featured-button"
              onClick={() => handleScopeClick('featured')}
              isActive={persistedScope === 'featured'}
            >
              Featured
            </BannerPickerItem>
            <BannerPickerItem
              data-testid="everyone-button"
              onClick={() => handleScopeClick('everybody')}
              isActive={persistedScope === 'everybody'}
            >
              Everyone
            </BannerPickerItem>
            <BannerPickerItem
              data-testid="spaces-button"
              onClick={() => handleScopeClick('spaces')}
              isActive={persistedScope === 'spaces'}
            >
              Spaces
            </BannerPickerItem>
          </BannerPicker>
          <BannerPickedInfo>
            {scopeDescription}
          </BannerPickedInfo>
        </BannerRight>
      </ResourceBanner>
      <Row>
        <StyledMenu expanded={expandedSidebar}>
          <MenuItem
            data-testid="home-files-link"
            to={`/home/files${routeScopeParam}`}
            activeClassName="active"
            title="Files"
          >
            <FileIcon height={14} />
            <MenuText>Files</MenuText>
            {expandedSidebar && (
              <MenuCounter count={counterData?.files} active={activeResource === 'files'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="home-apps-link"
            to={`/home/apps${routeScopeParam}`}
            activeClassName="active"
            title="Apps"
          >
            <CubeIcon height={14} />
            <MenuText>Apps</MenuText>
            {expandedSidebar && (
              <MenuCounter count={counterData?.apps} active={activeResource === 'apps'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="home-databases-link"
            to={`/home/databases${routeScopeParam}`}
            activeClassName="active"
            title="Databases"
          >
            <DatabaseIcon height={14} />
            <MenuText>Databases</MenuText>
            {expandedSidebar && (
              <MenuCounter count={counterData?.dbclusters} active={activeResource === 'databases'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="home-assets-link"
            to={`/home/assets${routeScopeParam}`}
            activeClassName="active"
            title="Assets"
          >
            <FileZipIcon height={14} />
            <MenuText>Assets</MenuText>
            {expandedSidebar && (
              <MenuCounter count={counterData?.assets} active={activeResource === 'assets'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="home-workflows-link"
            to={`/home/workflows${routeScopeParam}`}
            activeClassName="active"
            title="Workflows"
          >
            <BoltIcon height={14} />
            <MenuText>Workflows</MenuText>
            {expandedSidebar && (
              <MenuCounter count={counterData?.workflows} active={activeResource === 'workflows'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="home-executions-link"
            to={`/home/executions${routeScopeParam}`}
            activeClassName="active"
            title="Executions"
          >
            <CogsIcon height={14} />
            <MenuText>Executions</MenuText>
            {expandedSidebar && (
              <MenuCounter count={counterData?.jobs} active={activeResource === 'executions'} />
            )}
          </MenuItem>
          <Fill />
          <Expand
            data-testid="expand-sidebar"
            onClick={() => setExpandedSidebar(!expandedSidebar)}
          >
            <FlapIcon />
          </Expand>
        </StyledMenu>
        <Main>
          <Switch>
            <Route exact path={`${path}/files`}>
              <FileList scope={scopeQuery} showFolderActions={(persistedScope === 'everybody' && user.admin) || persistedScope === 'me'} />
            </Route>
            <Route exact path={`${path}/apps`}>
              <AppList scope={scopeQuery} />
            </Route>
            <Route path={`${path}/apps/:appUid`}>
              <AppsShow emitScope={setPersistedScope} />
            </Route>
            <Route exact path={`${path}/databases`}>
              <DatabaseList scope={scopeQuery} />
            </Route>
            <Route exact path={`${path}/databases/create`}>
              <CreateDatabase scope={scopeQuery} />
            </Route>
            <Route exact path={`${path}/databases/:dxid`}>
              <DatabaseShow emitScope={setPersistedScope} />
            </Route>
            <Route exact path={`${path}/assets`}>
              <AssetList scope={scopeQuery} />
            </Route>
            <Route exact path={`${path}/assets/:assetUid`}>
              <AssetShow emitScope={setPersistedScope} />
            </Route>
            <Route exact path={`${path}/workflows`}>
              <WorkflowList scope={scopeQuery} />
            </Route>
            <Route path={`${path}/workflows/:workflowUid`}>
              <WorkflowShow emitScope={setPersistedScope} />
            </Route>
            <Route path={`${path}/files/:fileId`}>
              <FileShow emitScope={setPersistedScope} />
            </Route>
            <Route exact path={`${path}/executions`}>
              <ExecutionList scope={scopeQuery} />
            </Route>
            <Route path={`${path}/executions/:executionUid`}>
              <ExecutionDetails emitScope={setPersistedScope} />
            </Route>
            {/* TODO: remove this route when we have a better way to redirect user to executions page */}
            <Route path={`${path}/jobs/:executionUid`} render={(props) => <Redirect to={`${path}/executions/${props.match.params.executionUid}`} />} />
            <Route path={`${path}`}><Redirect to={`${path}/files`} /></Route>
          </Switch>
        </Main>
      </Row>
    </UserLayout>
  )
}

export default Home2
