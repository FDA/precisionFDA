import React, { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom'
import { GuestNotAllowed } from '../../../components/GuestNotAllowed'
import { BoltIcon } from '../../../components/icons/BoltIcon'
import { CogsIcon } from '../../../components/icons/Cogs'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FlapIcon } from '../../../components/icons/FlapIcon'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { Loader } from '../../../components/Loader'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { usePrevious } from '../../../hooks/usePrevious'
import { checkStatus } from '../../../utils/api'
import { useAuthUser } from '../../auth/useAuthUser'
import { AppList } from '../../home/apps/AppList'
import { AppsShow } from '../../home/apps/AppsShow'
import { ExecutionList } from '../../home/executions/ExecutionList'
import { JobShow } from '../../home/executions/JobShow'
import { FileList } from '../../home/files/FileList'
import { FileShow } from '../../home/files/show/FileShow'
import {
  Expand,
  Fill,
  Main,
  MenuItem,
  MenuText,
  Row,
  StyledMenu,
} from '../../home/home.styles'
import { WorkflowList } from '../../home/workflows/WorflowList'
import { WorkflowShow } from '../../home/workflows/WorkflowShow'
import { MembersList } from '../members/MembersList'
import { spaceRequest } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { useSpaceActions } from '../useSpaceActions'
import { Activation } from './SpaceActivation'
import { SpaceNotAllowed } from './SpaceNotAllowed'
import { SpaceTypeTabs } from './SpaceTypeTabs'
import {
  ActionButton,
  ButtonRow,
  SpaceHeader,
  SpaceHeaderDescrip, SpaceHeaderTitle, SpaceMainInfo,
  SpaceTypeHeader, TopSpaceHeader,
} from './styles'

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
  const json = await req.json()
  // TODO: remove this when the API is fixed and returns only string or number
  if (typeof json.jobs === 'number') json.jobs = json.jobs.toString() + 499
  return json
}

export const Spaces2 = ({
  space,
  isLoading,
}: {
  space: ISpace
  isLoading: boolean
}) => {
  const history = useHistory()
  const user = useAuthUser()
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage(
    'expandedSpacesSidebar',
    true,
  )
  const { path } = useRouteMatch()
  const spaceActions = useSpaceActions({ space })

  if (user.is_guest) {
    return <GuestNotAllowed />
  }

  if (space.state === 'unactivated') {
    return <Activation space={space} />
  }

  return (
    <>
      <SpaceHeader>
        <TopSpaceHeader>
          <SpaceMainInfo>
            <SpaceHeaderTitle>{space.name}</SpaceHeaderTitle>
            <SpaceHeaderDescrip>{space.description}</SpaceHeaderDescrip>
          </SpaceMainInfo>

          <ButtonRow>
            <Row>
              {!spaceActions['Edit Space']?.hide && (
                <ActionButton
                  data-testid="edit-space-button"
                  onClick={() => history.push(`/spaces/${space.id}/edit`)}
                >
                  Space Settings
                </ActionButton>
              )}
              {!spaceActions['Duplicate Space']?.hide && (
                <ActionButton
                  data-testid="duplicate-space-button"
                  onClick={() => history.push(`/spaces/${space.id}/duplicate`)}
                >
                  Duplicate Space
                </ActionButton>
              )}
            </Row>
          </ButtonRow>
        </TopSpaceHeader>
        <SpaceTypeHeader expandedSidebar={expandedSidebar}>
          <SpaceTypeTabs space={space} />
        </SpaceTypeHeader>
      </SpaceHeader>

      <Row>
        <StyledMenu expanded={expandedSidebar}>
          <MenuItem
            data-testid="files-link"
            to={`/spaces/${space.id}/files`}
            activeClassName="active"
          >
            <FileIcon height={14} />
            <MenuText>Files</MenuText>
          </MenuItem>
          <MenuItem
            data-testid="apps-link"
            to={`/spaces/${space.id}/apps`}
            activeClassName="active"
          >
            <CubeIcon height={14} />
            <MenuText>Apps</MenuText>
          </MenuItem>
          <MenuItem
            data-testid="workflows-link"
            to={`/spaces/${space.id}/workflows`}
            activeClassName="active"
          >
            <BoltIcon height={14} />
            <MenuText>Workflows</MenuText>
          </MenuItem>
          <MenuItem
            data-testid="executions-link"
            to={`/spaces/${space.id}/executions`}
            activeClassName="active"
          >
            <CogsIcon height={14} />
            <MenuText>Executions</MenuText>
          </MenuItem>
          <MenuItem
            data-testid="members-link"
            to={`/spaces/${space.id}/members`}
            activeClassName="active"
          >
            <UsersIcon height={14} />
            <MenuText>Members</MenuText>
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
          {isLoading ? (
            <Loader />
          ) : (
            <Switch>
              <Route exact path={`/spaces/${space.id}/files`}>
                <FileList
                  spaceId={space.id}
                  showFolderActions={!!space.links.add_data}
                />
              </Route>
              <Route exact path={`/spaces/${space.id}/files/:fileId`}>
                <FileShow />
              </Route>
              <Route exact path={`/spaces/${space.id}/apps`}>
                <AppList spaceId={space.id} />
              </Route>
              <Route exact path={`/spaces/${space.id}/apps/:appUid`}>
                <AppsShow />
              </Route>
              <Route exact path={`/spaces/${space.id}/workflows`}>
                <WorkflowList spaceId={space.id} />
              </Route>
              <Route exact path={`/spaces/${space.id}/workflows/:workflowUid`}>
                <WorkflowShow />
              </Route>
              <Route exact path={`/spaces/${space.id}/executions`}>
                <ExecutionList spaceId={space.id} />
              </Route>
              <Route
                exact
                path={`/spaces/${space.id}/executions/:executionUid`}
              >
                <JobShow />
              </Route>
              <Route exact path={`/spaces/${space.id}/members`}>
                <MembersList space={space} />
              </Route>
              <Route
                exact
                path={`${path}`}
                render={props => (
                  <Redirect to={`${props.match.params.spaceId}/files`} />
                )}
              />
            </Switch>
          )}
        </Main>
      </Row>
    </>
  )
}

export const SpaceShow = () => {
  const { spaceId } = useParams<{ spaceId: string }>()
  const [isNotAllowed, setIsNotAllowed] = useState<boolean>(false)
  const { data, isLoading } = useQuery<any>(
    ['space', spaceId],
    () => spaceId && spaceRequest({ id: spaceId }),
    {
      retry: (failureCount, error: any) => {
        if(error.response.status === 403) {
          setIsNotAllowed(true)
          return false
        }
        if(failureCount > 3) {
          return true
        }
        return false
      },
    },
  )

  const space = data?.space

  // Lazy load the space if it's not loaded yet
  const prevSpace = usePrevious(space)
  const s = useMemo(() => space || prevSpace, [space])

  if (isLoading) return <Loader />
  if (isNotAllowed) return <SpaceNotAllowed />

  return <Spaces2 space={s} isLoading={isLoading} />
}
