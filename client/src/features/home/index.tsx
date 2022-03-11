import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { Button } from '../../components/Button';
import { ButtonGroup } from '../../components/Button/ButtonGroup';
import { GuestNotAllowed } from '../../components/GuestNotAllowed';
import { BoltIcon } from '../../components/icons/BoltIcon';
import { CogsIcon } from '../../components/icons/Cogs';
import { CubeIcon } from '../../components/icons/CubeIcon';
import { DatabaseIcon } from '../../components/icons/DatabaseIcon';
import { FileIcon } from '../../components/icons/FileIcon';
import { FileZipIcon } from '../../components/icons/FileZipIcon';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RootState } from '../../store';
import { checkStatus } from '../../utils/api';
import DefaultLayout from '../../views/layouts/DefaultLayout';
import { AppList } from './apps/AppList';
import { AppsShow } from './apps/AppsShow';
import { AssetList } from "./assets/AssetList";
import { AssetShow } from './assets/AssetShow';
import { CreateDatabase } from './databases/create/CreateDatabase';
import { DatabaseList } from './databases/DatabaseList';
import { DatabaseShow } from './databases/DatabaseShow';
import { ExecutionList } from './executions/ExecutionList';
import { JobShow } from './executions/JobShow';
import { FileList } from "./files/FileList";
import { FileShow } from "./files/show/FileShow";
import { Expand, Fill, Main, MenuItem, MenuText, Row, ScopePicker, StyledMenu } from './home.styles';
import { ResourceScope } from './types';
import { WorkflowList } from './workflows/WorflowList';
import { WorkflowShow } from './workflows/WorkflowShow';

interface CounterRequest {
  apps: string,
  assets: string,
  dbclusters: string,
  jobs: string,
  files: string,
  workflows: string,
}

export async function counterRequest(): Promise<CounterRequest> {
  const req = await fetch('/api/counters').then(checkStatus);
  let json = await req.json();
  // TODO: remove this when the API is fixed and returns only string or number
  if(typeof json.jobs === 'number') json.jobs = json.jobs.toString() + 499;
  return json
}

const MenuCounter = ({count}:{count?: string}) => {
  return null
  // if(!count) return null
  // return (<StyledMenuCounter isLong={count.length > 2}>{count}</StyledMenuCounter>)
}

export const Home2 = () => {
  const user = useSelector((state: RootState) => state.context.user);
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage<any>('expandedMyHomeSidebar', true);
  const { path, isExact, url, params } = useRouteMatch();
  const history = useHistory();
  const [scopeQuery, setScopeQuery] = useQueryParam('scope', StringParam);
  const [scope, setScope] = useState<string>(scopeQuery as ResourceScope || 'me' as ResourceScope)
  const {data} = useQuery(['counter', scope], counterRequest)
  const [activeResource, setActiveResource] = useState<string>()

  const handleScopeClick = async (newScope: ResourceScope) => {
    // Depending on if the user is on the list page or the show page, we need to redirect to the list page
    if(history.location.pathname === `/home/${activeResource}`) {
      setScopeQuery(newScope)
    } else {
      history.push(`/home/${activeResource}?scope=${newScope}`)
    }
  }

  useEffect(() => {
    const [,,resource] = history.location.pathname.split('/')
    setActiveResource(resource)
  }, [history.location])

  useEffect(() => {
    if(scopeQuery) {
      setScope(scopeQuery)
    }
  }, [scopeQuery])
  
  const routeScopeParam = '?' +
    new URLSearchParams({
      scope
    }).toString()

  if(user.is_guest) {
    return (
      <DefaultLayout>
        <GuestNotAllowed />
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <ScopePicker>
        <ButtonGroup>
          <Button
            data-testid="me-button"
            onClick={() => handleScopeClick('me')}
            active={scope === 'me'}
          >
            Me
          </Button>
          <Button
            data-testid="featured-button"
            onClick={() => handleScopeClick('featured')}
            active={scope === 'featured'}
          >
            Featured
          </Button>
          <Button
            data-testid="everyone-button"
            onClick={() => handleScopeClick('everybody')}
            active={scope === 'everybody'}
          >
            Everyone
          </Button>
          <Button
            data-testid="spaces-button"
            onClick={() => handleScopeClick('spaces')}
            active={scope === 'spaces'}
          >
            Spaces
          </Button>
        </ButtonGroup>
      </ScopePicker>
      <Row>
        <StyledMenu expanded={expandedSidebar}>
          <MenuItem
            data-testid="home-files-link"
            to={`/home/files${routeScopeParam}`}
            activeClassName="active"
          >
            <FileIcon height={14} />
            <MenuText>Files</MenuText>
            <MenuCounter count={data?.files} />
          </MenuItem>
          <MenuItem
            data-testid="home-apps-link"
            to={`/home/apps${routeScopeParam}`}
            activeClassName="active"
          >
            <CubeIcon height={14} />
            <MenuText>Apps</MenuText>
            <MenuCounter count={data?.apps} />
          </MenuItem>
          <MenuItem
            data-testid="home-databases-link"
            to={`/home/databases${routeScopeParam}`}
            activeClassName="active"
          >
            <DatabaseIcon height={14} />
            <MenuText>Databases</MenuText>
            <MenuCounter count={data?.dbclusters} />
          </MenuItem>
          <MenuItem
            data-testid="home-assets-link"
            to={`/home/assets${routeScopeParam}`}
            activeClassName="active"
          >
            <FileZipIcon height={14} />
            <MenuText>Assets</MenuText>
            <MenuCounter count={data?.assets} />
          </MenuItem>
          <MenuItem
            data-testid="home-workflows-link"
            to={`/home/workflows${routeScopeParam}`}
            activeClassName="active"
          >
            <BoltIcon height={14} />
            <MenuText>Workflows</MenuText>
            <MenuCounter count={data?.workflows} />
          </MenuItem>
          <MenuItem
            data-testid="home-executions-link"
            to={`/home/executions${routeScopeParam}`}
            activeClassName="active"
          >
            <CogsIcon height={14} />
            <MenuText>Executions</MenuText>
            <MenuCounter count={data?.jobs} />
          </MenuItem>
          <Fill />
          <Expand
            data-testid="expand-sidebar"
            onClick={() => setExpandedSidebar(!expandedSidebar)}
          >
            {expandedSidebar ? `<` : `>`}
          </Expand>
        </StyledMenu>
        <Main>
          <Switch>
            <Route exact path={`${path}/files`}>
              <FileList scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/apps`}>
              <AppList scope={scope as ResourceScope} />
            </Route>
            <Route path={`${path}/apps/:appUid`}>
              <AppsShow scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/databases`}>
              <DatabaseList scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/databases/create`}>
              <CreateDatabase scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/databases/:dxid`}>
              <DatabaseShow scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/assets`}>
              <AssetList scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/assets/:assetUid`}>
              <AssetShow scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/workflows`}>
              <WorkflowList scope={scope as ResourceScope} />
            </Route>
            <Route path={`${path}/workflows/:workflowUid`}>
              <WorkflowShow scope={scope as ResourceScope} />
            </Route>
            <Route path={`${path}/files/:fileId`}>
              <FileShow scope={scope as ResourceScope} />
            </Route>
            <Route exact path={`${path}/executions`}>
              <ExecutionList scope={scope as ResourceScope} />
            </Route>
            <Route path={`${path}/executions/:executionUid`}>
              <JobShow scope={scope as ResourceScope} />
            </Route>
            {/* TODO: remove this route when we have a better way to redirect user to executions page */}
            <Route path={`${path}/jobs/:executionUid`} render={(props) => <Redirect to={`${path}/executions/${props.match.params.executionUid}`} />} />
            <Route path={`${path}`}><Redirect to={`${path}/files`} /></Route>
          </Switch>
        </Main>
      </Row>
    </DefaultLayout>
  )
}
