import React from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import {
  Link,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom'
import { Button, ButtonSolidBlue } from '../../components/Button'
import { ButtonGroup } from '../../components/Button/ButtonGroup'
import { GuestNotAllowed } from '../../components/GuestNotAllowed'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { CogsIcon } from '../../components/icons/Cogs'
import { CubeIcon } from '../../components/icons/CubeIcon'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileZipIcon } from '../../components/icons/FileZipIcon'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { RootState } from '../../store'
import { checkStatus } from '../../utils/api'
import DefaultLayout from '../../views/layouts/DefaultLayout'
import { AppList } from '../home/apps/AppList'
import { AssetList } from '../home/assets/AssetList'
import { ExecutionList } from '../home/executions/ExecutionList'
import { FileList } from '../home/files/FileList'
import {
  Expand,
  Fill,
  Main,
  MenuItem,
  MenuText,
  Row,
  ScopePicker,
  StyledMenu,
} from '../home/home.styles'
import { WorkflowList } from '../home/workflows/WorflowList'
import { ButtonRow } from '../modal/styles'
import { spaceRequest } from './spaces.api'
import { ISpace } from './spaces.types'

interface CounterRequest {
  apps: string
  assets: string
  dbclusters: string
  jobs: string
  files: string
  workflows: string
}

export async function counterRequest(): Promise<CounterRequest> {
  const req = await fetch('/api/counters').then(checkStatus)
  let json = await req.json()
  // TODO: remove this when the API is fixed and returns only string or number
  if (typeof json.jobs === 'number') json.jobs = json.jobs.toString() + 499
  return json
}

const MenuCounter = ({ count }: { count?: string }) => {
  return null
  // if(!count) return null
  // return (<StyledMenuCounter isLong={count.length > 2}>{count}</StyledMenuCounter>)
}

export const Space = () => {
  const { spaceId } = useParams<{ spaceId: string }>()
  const location = useLocation<{ space_id?: string }>()
  const { data, status, refetch } = useQuery<any>(['space', spaceId], () => {
    return spaceId && spaceRequest({ id: spaceId })
  })

  const space = data?.space

  if (!space || status === 'loading') return <div>Loading...</div>

  return <Spaces2 space={space} />
}

export const Spaces2 = ({ space }: { space: ISpace }) => {
  const history = useHistory()
  const user = useSelector((state: RootState) => state.context.user)
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage<any>(
    'expandedSpacesSidebar',
    true,
  )
  let { path } = useRouteMatch()
  const { data } = useQuery(['counter'], counterRequest)

  if (user.is_guest) {
    return (
      <DefaultLayout>
        <GuestNotAllowed />
      </DefaultLayout>
    )
  }

  if (!space) return <div>Loading///</div>

  console.log(path);
  

  return (
    <DefaultLayout>
      <ScopePicker>
        <ButtonRow>
          <div>
            <ButtonGroup>
              {space.private_space_id ? <ButtonSolidBlue as={Link} to={`/spaces/${space.private_space_id ?? space.id}`}>Private Area</ButtonSolidBlue> : <Button as={Link} to={`/spaces/${space.private_space_id ?? space.id}`}>Private Area</Button>}
              {space.shared_space_id ? <ButtonSolidBlue as={Link} to={`/spaces/${space.shared_space_id ?? space.id}`}>Shared Area</ButtonSolidBlue> : <Button as={Link} to={`/spaces/${space.private_space_id ?? space.id}`}>Private Area</Button>}
            </ButtonGroup>
          </div>
          <div>
            <Button
              data-testid="back-button"
              onClick={() => history.push('/spaces')}
              >
              Back
            </Button>
            <Button
              data-testid="edit-space-button"
              onClick={() => history.push(`/spaces/${space.id}/edit`)}
            >
              Edit Space
            </Button>
          </div>
        </ButtonRow>
      </ScopePicker>
      <Row>
        <StyledMenu expanded={expandedSidebar}>
          <MenuItem
            data-testid="home-files-link"
            to={`/spaces/${space.id}/files`}
            activeClassName="active"
          >
            <FileIcon height={14} />
            <MenuText>Files</MenuText>
            <MenuCounter count={data?.files} />
          </MenuItem>
          <MenuItem
            data-testid="home-apps-link"
            to={`/spaces/${space.id}/apps`}
            activeClassName="active"
          >
            <CubeIcon height={14} />
            <MenuText>Apps</MenuText>
            <MenuCounter count={data?.apps} />
          </MenuItem>
          <MenuItem
            data-testid="home-assets-link"
            to={`/spaces/${space.id}/assets`}
            activeClassName="active"
          >
            <FileZipIcon height={14} />
            <MenuText>Assets</MenuText>
            <MenuCounter count={data?.assets} />
          </MenuItem>
          <MenuItem
            data-testid="home-workflows-link"
            to={`/spaces/${space.id}/workflows`}
            activeClassName="active"
          >
            <BoltIcon height={14} />
            <MenuText>Workflows</MenuText>
            <MenuCounter count={data?.workflows} />
          </MenuItem>
          <MenuItem
            data-testid="home-executions-link"
            to={`/spaces/${space.id}/executions`}
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
            <Route exact path={`/spaces/${space.id}/files`}>
              <FileList spaceId={space.id} />
            </Route>
            <Route exact path={`/spaces/${space.id}/apps`}>
              <AppList spaceId={space.id} />
            </Route>
            <Route exact path={`/spaces/${space.id}/assets`}>
              <AssetList spaceId={space.id} />
            </Route>
            <Route exact path={`/spaces/${space.id}/workflows`}>
              <WorkflowList spaceId={space.id} />
            </Route>
            <Route exact path={`/spaces/${space.id}/executions`}>
              <ExecutionList spaceId={space.id} />
            </Route>
          </Switch>
        </Main>
      </Row>
    </DefaultLayout>
  )
}
