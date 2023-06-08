import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
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
import { MenuCounter } from '../../../components/MenuCounter'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { usePrevious } from '../../../hooks/usePrevious'
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
import { useActiveResourceFromUrl } from '../../home/useActiveResourceFromUrl'
import { WorkflowList } from '../../home/workflows/WorkflowList'
import { WorkflowShow } from '../../home/workflows/WorkflowShow'
import { MembersList } from '../members/MembersList'
import { spaceRequest, fixGuestPermissions } from '../spaces.api'
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
import { ProtectedIcon } from '../ProtectedIcon'


const Spaces2 = ({
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
  const [activeResource] = useActiveResourceFromUrl('spaces')

  const fixSpaceMutation = useMutation({
    mutationKey: ['fix-guest-permissions'],
    mutationFn: (payload: {
      id: string
    }) => fixGuestPermissions(payload),
    onSuccess: () => {
      toast.success('Permissions for guest side successfully updated.')
    },
    onError: (e:any) => {
        toast.error(e.response.data.error.message)
    },
  })

  if (user?.is_guest) {
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
            <SpaceHeaderDescrip>{space.protected && <ProtectedIcon />}{space.description}</SpaceHeaderDescrip>
          </SpaceMainInfo>

          <ButtonRow>
            <Row>
              {!spaceActions['Edit Space']?.shouldHide && (
                <ActionButton
                  data-testid="edit-space-button"
                  onClick={() => history.push(`/spaces/${space.id}/edit`)}
                >
                  Space Settings
                </ActionButton>
              )}
              {!spaceActions['Duplicate Space']?.shouldHide && (
                <ActionButton
                  data-testid="duplicate-space-button"
                  onClick={() => history.push(`/spaces/${space.id}/duplicate`)}
                >
                  Duplicate Space
                </ActionButton>
              )}
              {!spaceActions['Fix Permissions']?.shouldHide && (
                <ActionButton
                  data-testid="fix-space-button"
                  onClick={() => fixSpaceMutation.mutate({ id: space.id })}
                >
                  Fix Guest Side Permissions
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
            {expandedSidebar && (
              <MenuCounter count={space.counters.files.toString()} active={activeResource === 'files'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="apps-link"
            to={`/spaces/${space.id}/apps`}
            activeClassName="active"
          >
            <CubeIcon height={14} />
            <MenuText>Apps</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters.apps.toString()} active={activeResource === 'apps'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="workflows-link"
            to={`/spaces/${space.id}/workflows`}
            activeClassName="active"
          >
            <BoltIcon height={14} />
            <MenuText>Workflows</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters.workflows.toString()} active={activeResource === 'workflows'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="executions-link"
            to={`/spaces/${space.id}/executions`}
            activeClassName="active"
          >
            <CogsIcon height={14} />
            <MenuText>Executions</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters.jobs.toString()} active={activeResource === 'executions'} />
            )}
          </MenuItem>
          <MenuItem
            data-testid="members-link"
            to={`/spaces/${space.id}/members`}
            activeClassName="active"
          >
            <UsersIcon height={14} />
            <MenuText>Members</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters.members.toString()} active={activeResource === 'members'} />
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
          {isLoading ? (
            <Loader />
          ) : (
            <Switch>
              <Route exact path={`/spaces/${space.id}/files`}>
                <FileList
                  space={space}
                  showFolderActions={!!space.links.add_data}
                />
              </Route>
              <Route exact path={`/spaces/${space.id}/files/:fileId`}>
                <FileShow space={space} />
              </Route>
              <Route exact path={`/spaces/${space.id}/apps`}>
                <AppList spaceId={space.id} />
              </Route>
              <Route path={`/spaces/${space.id}/apps/:appUid`}>
                <AppsShow spaceId={space.id} />
              </Route>
              <Route exact path={`/spaces/${space.id}/workflows`}>
                <WorkflowList spaceId={space.id} />
              </Route>
              <Route path={`/spaces/${space.id}/workflows/:workflowUid`}>
                <WorkflowShow spaceId={space.id} />
              </Route>
              <Route exact path={`/spaces/${space.id}/executions`}>
                <ExecutionList spaceId={space.id} />
              </Route>
              <Route
                exact
                path={`/spaces/${space.id}/executions/:executionUid`}
              >
                <JobShow spaceId={space.id} />
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

export default SpaceShow
