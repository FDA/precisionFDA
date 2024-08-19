import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GuestNotAllowed } from '../../../components/GuestNotAllowed'
import { Loader } from '../../../components/Loader'
import { MenuCounter } from '../../../components/MenuCounter'
import { BoltIcon } from '../../../components/icons/BoltIcon'
import { CogsIcon } from '../../../components/icons/Cogs'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { DiscussionIcon } from '../../../components/icons/DiscussionIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FlapIcon } from '../../../components/icons/FlapIcon'
import { SpaceReportIcon } from '../../../components/icons/SpaceReportIcon'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { usePrevious } from '../../../hooks/usePrevious'
import { useToastWSHandler } from '../../../hooks/useToastWSHandler'
import { UserLayout } from '../../../layouts/UserLayout'
import { AppList } from '../../apps/AppList'
import { AppsShow } from '../../apps/AppsShow'
import { EditAppPage } from '../../apps/form/EditAppPage'
import { ForkAppPage } from '../../apps/form/ForkAppPage'
import { RunJobPage } from '../../apps/run/RunJobPage'
import { useAuthUser } from '../../auth/useAuthUser'
import { DiscussionList } from '../../discussions/DiscussionList'
import { DiscussionShow } from '../../discussions/DiscussionShow'
import { CreateDiscussionPage } from '../../discussions/form/CreateDiscussionPage'
import { ExecutionList } from '../../executions/ExecutionList'
import { ExecutionDetails } from '../../executions/details/ExecutionDetails'
import { FileList } from '../../files/FileList'
import { FileShow } from '../../files/show/FileShow'
import { Expand, Fill, Main, MenuItem, MenuText, Row, StyledMenu } from '../../home/home.styles'
import { useActiveResourceFromUrl } from '../../home/useActiveResourceFromUrl'
import { SpaceReportList } from '../../space-reports/SpaceReportList'
import { TrackInHome } from '../../tracks/TrackInHome'
import { WorkflowList } from '../../workflows/WorkflowList'
import { WorkflowShow } from '../../workflows/WorkflowShow'
import { FdaRestrictedIcon } from '../FdaRestrictedIcon'
import { ProtectedIcon } from '../ProtectedIcon'
import { MembersList } from '../members/MembersList'
import { fixGuestPermissions, spaceRequest } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { useSpaceActions } from '../useSpaceActions'
import { Activation } from './SpaceActivation'
import { SpaceLocked } from './SpaceLocked'
import { SpaceNotAllowed } from './SpaceNotAllowed'
import { SpaceTypeTabs } from './SpaceTypeTabs'
import {
  ActionButton,
  ButtonRow,
  SpaceHeader,
  SpaceHeaderDescrip,
  SpaceHeaderTitle,
  SpaceMainInfo,
  SpaceTypeHeader,
  TopSpaceHeader,
} from './styles'

const Spaces2 = ({ space, isLoading }: { space: ISpace; isLoading: boolean }) => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage('expandedSpacesSidebar', true)
  useToastWSHandler(user)

  const spaceActions = useSpaceActions({ space })
  const [activeResource] = useActiveResourceFromUrl('spaces')

  const fixSpaceMutation = useMutation({
    mutationKey: ['fix-guest-permissions'],
    mutationFn: (payload: { id: string }) => fixGuestPermissions(payload),
    onSuccess: () => {
      toast.success('Permissions for guest side successfully updated')
    },
    onError: (e: any) => {
      toast.error(e.response.data.error.message)
    },
  })

  if (user?.is_guest) {
    return <GuestNotAllowed />
  }

  const showDiscussions = !((space.type === 'review' && space.restricted_discussions) || space.type == 'private_type')

  if (space.state === 'unactivated') {
    return <Activation space={space} />
  }

  return (
    <>
      <SpaceHeader>
        <TopSpaceHeader>
          <SpaceMainInfo>
            <SpaceHeaderTitle>{space.name}</SpaceHeaderTitle>
            <SpaceHeaderDescrip>
              {space.protected && <ProtectedIcon />}
              {space.restricted_reviewer && <FdaRestrictedIcon />}
              {space.description}
            </SpaceHeaderDescrip>
          </SpaceMainInfo>

          <ButtonRow>
            {!spaceActions['Edit Space']?.shouldHide && (
              <ActionButton data-testid="edit-space-button" onClick={() => navigate(`/spaces/${space.id}/edit`)}>
                Space Settings
              </ActionButton>
            )}
            {!spaceActions['Fix Permissions']?.shouldHide && (
              <ActionButton data-testid="fix-space-button" onClick={() => fixSpaceMutation.mutate({ id: space.id })}>
                Fix Guest Side Permissions
              </ActionButton>
            )}
          </ButtonRow>
        </TopSpaceHeader>
        <SpaceTypeHeader $expandedSidebar={expandedSidebar}>
          <SpaceTypeTabs space={space} />
        </SpaceTypeHeader>
      </SpaceHeader>

      <Row>
        <StyledMenu $expanded={expandedSidebar}>
          <MenuItem data-testid="files-link" to={`/spaces/${space.id}/files`} activeClassName="active">
            <FileIcon height={14} />
            <MenuText>Files</MenuText>
            {expandedSidebar && <MenuCounter count={space.counters.files.toString()} active={activeResource === 'files'} />}
          </MenuItem>
          <MenuItem data-testid="apps-link" to={`/spaces/${space.id}/apps`} activeClassName="active">
            <CubeIcon height={14} />
            <MenuText>Apps</MenuText>
            {expandedSidebar && <MenuCounter count={space.counters.apps.toString()} active={activeResource === 'apps'} />}
          </MenuItem>
          <MenuItem data-testid="workflows-link" to={`/spaces/${space.id}/workflows`} activeClassName="active">
            <BoltIcon height={14} />
            <MenuText>Workflows</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters.workflows.toString()} active={activeResource === 'workflows'} />
            )}
          </MenuItem>
          <MenuItem data-testid="executions-link" to={`/spaces/${space.id}/executions`} activeClassName="active">
            <CogsIcon height={14} />
            <MenuText>Executions</MenuText>
            {expandedSidebar && <MenuCounter count={space.counters.jobs.toString()} active={activeResource === 'executions'} />}
          </MenuItem>
          <MenuItem data-testid="members-link" to={`/spaces/${space.id}/members`} activeClassName="active">
            <UsersIcon height={14} />
            <MenuText>Members</MenuText>
            {expandedSidebar && <MenuCounter count={space.counters.members.toString()} active={activeResource === 'members'} />}
          </MenuItem>
          <MenuItem data-testid="space-reports-link" to={`/spaces/${space.id}/reports`} activeClassName="active">
            <SpaceReportIcon height={14} />
            <MenuText>Reports</MenuText>
            {expandedSidebar && <MenuCounter count={space.counters.reports.toString()} active={activeResource === 'reports'} />}
          </MenuItem>
          {showDiscussions && (
            <MenuItem data-testid="discussions-link" to={`/spaces/${space.id}/discussions`} activeClassName="active">
              <DiscussionIcon height={14} />
              <MenuText>Discussions</MenuText>
              {expandedSidebar && (
                <MenuCounter count={space.counters.discussions.toString()} active={activeResource === 'discussions'} />
              )}
            </MenuItem>
          )}
          <Fill />
          <Expand data-testid="expand-sidebar" onClick={() => setExpandedSidebar(!expandedSidebar)}>
            <FlapIcon />
          </Expand>
        </StyledMenu>
        <Main>
          {isLoading ? (
            <Loader />
          ) : (
            <Routes>
              <Route path="files" element={<FileList space={space} showFolderActions={!!space.links.add_data} />} />
              <Route path="files/:fileId" element={<FileShow space={space} />} />
              <Route path="files/:identifier/track" element={<TrackInHome spaceId={space.id} />} />
              <Route path="apps" element={<AppList spaceId={space.id} />} />
              <Route path="apps/:appUid/jobs/new" element={<RunJobPage spaceId={space.id} />} />
              <Route path="apps/:appUid/edit" element={<EditAppPage spaceId={space.id} />} />
              <Route path="apps/:appUid/fork" element={<ForkAppPage spaceId={space.id} />} />
              <Route path="apps/:appUid/*" element={<AppsShow spaceId={space.id} />} />
              <Route path="apps/:identifier/track" element={<TrackInHome spaceId={space.id} />} />
              <Route path="workflows" element={<WorkflowList spaceId={space.id} />} />
              <Route path="workflows/:workflowUid/*" element={<WorkflowShow spaceId={space.id} />} />
              <Route path="executions" element={<ExecutionList spaceId={space.id} />} />
              <Route path="executions/:executionUid/*" element={<ExecutionDetails spaceId={space.id} />} />
              <Route path="executions/:identifier/track" element={<TrackInHome entityType="execution" spaceId={space.id} />} />
              <Route path="members" element={<MembersList space={space} />} />
              <Route path="reports" element={<SpaceReportList scope={`space-${space.id}`} />} />
              <Route path="discussions" element={<DiscussionList space={space} scope={`space-${space.id}`} />} />
              <Route
                path="discussions/create"
                element={
                  <CreateDiscussionPage
                    displayWarning={space.type === 'review' && space.private_space_id}
                    scope={`space-${space.id}`}
                  />
                }
              />
              <Route path="discussions/:discussionId" element={<DiscussionShow space={space} />} />

              <Route path="/" element={<Navigate to="files" replace />} />
            </Routes>
          )}
        </Main>
      </Row>
    </>
  )
}

export const SpaceShow = () => {
  const { spaceId } = useParams<{ spaceId: string }>()
  const [isNotAllowed, setIsNotAllowed] = useState<boolean>(false)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const { data, isLoading } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => spaceId && spaceRequest({ id: spaceId }),
    retry: (failureCount, error: any) => {
      if (error.response.status === 403) {
        setIsNotAllowed(true)
        return false
      }
      if (error.response.status === 422) {
        setIsLocked(true)
        return false
      }
      return failureCount > 3
    },
  })

  const space = data?.space

  // Lazy load the space if it's not loaded yet
  const prevSpace = usePrevious(space)
  const s = useMemo(() => space || prevSpace, [space])

  if (isLoading) return <Loader />
  if (isNotAllowed) return <SpaceNotAllowed />
  if (isLocked || s?.state === 'locked') return <SpaceLocked space={s}/>

  return (
    <UserLayout innerScroll>
      <Spaces2 space={s} isLoading={isLoading} />
    </UserLayout>
  )
}

export default SpaceShow
