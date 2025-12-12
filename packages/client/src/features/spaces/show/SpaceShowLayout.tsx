import React from 'react'
import { Outlet, useOutletContext } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { MenuCounter } from '../../../components/MenuCounter'
import { BoltIcon } from '../../../components/icons/BoltIcon'
import { CogsIcon } from '../../../components/icons/Cogs'
import { CubeIcon } from '../../../components/icons/CubeIcon'
import { DatabaseIcon } from '../../../components/icons/DatabaseIcon'
import { DiscussionIcon } from '../../../components/icons/DiscussionIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FlapIcon } from '../../../components/icons/FlapIcon'
import { NetworkIcon } from '../../../components/icons/NetworkIcon'
import { SpaceReportIcon } from '../../../components/icons/SpaceReportIcon'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { ErrorBoundary } from '../../../utils/ErrorBoundry'
import { Expand, Fill, Main, MenuItem, MenuText, Row, StyledMenu } from '../../home/home.styles'
import { ApiErrorResponse } from '../../home/types'
import { useActiveResourceFromUrl } from '../../home/useActiveResourceFromUrl'
import { fixGuestPermissions } from '../spaces.api'
import { useSpaceActions } from '../useSpaceActions'
import { SpaceTypeTabs } from './SpaceTypeTabs'
import {
  ActionButton,
  DescriptionText,
  IconBadge,
  IconBadgeContainer,
  SpaceHeader,
  SpaceHeaderDescrip,
  SpaceHeaderTitle,
  SpaceMainInfo,
  SpaceTopRight,
  TopSpaceHeader,
} from './styles'
import { FdaRestrictedIcon } from '../FdaRestrictedIcon'
import { ProtectedIcon } from '../ProtectedIcon'
import type { SpaceOutletContext } from '../routes'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

export const SpaceShowLayout = () => {
  const context = useOutletContext<SpaceOutletContext>()
  const { space } = context
  const [expandedSidebar, setExpandedSidebar] = useLocalStorage('expandedSpacesSidebar', true)

  const { actions } = useSpaceActions({ space })
  const [activeResource] = useActiveResourceFromUrl('spaces')

  const fixPermissionsAction = actions.find(action => action.name === 'Fix Permissions')
  const editSpaceAction = actions.find(action => action.name === 'Edit Space')

  const fixSpaceMutation = useMutation({
    mutationKey: ['fix-guest-permissions'],
    mutationFn: (payload: { id: string }) => fixGuestPermissions(payload),
    onSuccess: () => {
      toastSuccess('Permissions for guest side successfully updated')
    },
    onError: (e: { response?: { data?: ApiErrorResponse } }) => {
      toastError(e.response?.data?.error?.message)
    },
  })

  const showDiscussions = !((space.type === 'review' && space.restricted_discussions) || space.type === 'private_type')
  const showMembers = space.type !== 'private_type'
  const isSharedReviewSpace = space.type === 'review' && !!space.private_space_id
  const isPrivateReviewSpace = space.type === 'review' && !!space.shared_space_id

  return (
    <>
      <SpaceHeader data-isshared={isSharedReviewSpace} data-isprivate={isPrivateReviewSpace}>
        <TopSpaceHeader>
          <SpaceMainInfo>
            <SpaceHeaderTitle data-testid="space-name">{space.name}</SpaceHeaderTitle>
            <SpaceHeaderDescrip data-testid="space-description">
              <IconBadgeContainer>
                {space.protected && (
                  <IconBadge data-variant="protected">
                    <ProtectedIcon showToolTip={true} />
                    <span>Protected</span>
                  </IconBadge>
                )}
                {space.restricted_reviewer && (
                  <IconBadge data-variant="restricted">
                    <FdaRestrictedIcon showToolTip={true} />
                    <span>FDA Restricted</span>
                  </IconBadge>
                )}
              </IconBadgeContainer>
              <DescriptionText>{space.description}</DescriptionText>
            </SpaceHeaderDescrip>
          </SpaceMainInfo>
          <SpaceTopRight>
            {!fixPermissionsAction?.shouldHide && (
              <div>
                <ActionButton data-testid="fix-space-button" onClick={() => fixSpaceMutation.mutate({ id: space.id.toString() })}>
                  Fix Guest Side Permissions
                </ActionButton>
              </div>
            )}
            <SpaceTypeTabs space={space} activeResource={activeResource} />
          </SpaceTopRight>
        </TopSpaceHeader>
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
          <MenuItem
            data-testid="home-databases-link"
            to={`/spaces/${space.id}/databases`}
            activeClassName="active"
            title="Databases"
            key="databases"
          >
            <DatabaseIcon height={14} />
            <MenuText>Databases</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters?.dbclusters.toString()} active={activeResource === 'databases'} />
            )}
          </MenuItem>
          <MenuItem data-testid="workflows-link" to={`/spaces/${space.id}/workflows`} activeClassName="active">
            <NetworkIcon height={18} />
            <MenuText>Workflows</MenuText>
            {expandedSidebar && (
              <MenuCounter count={space.counters.workflows.toString()} active={activeResource === 'workflows'} />
            )}
          </MenuItem>
          <MenuItem data-testid="executions-link" to={`/spaces/${space.id}/executions`} activeClassName="active">
            <BoltIcon height={15} />
            <MenuText>Executions</MenuText>
            {expandedSidebar && <MenuCounter count={space.counters.jobs.toString()} active={activeResource === 'executions'} />}
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
          {showMembers && (
            <MenuItem data-testid="members-link" to={`/spaces/${space.id}/members`} activeClassName="active">
              <UsersIcon height={14} />
              <MenuText>Members</MenuText>
              {expandedSidebar && <MenuCounter count={space.counters.members.toString()} active={activeResource === 'members'} />}
            </MenuItem>
          )}
          <Fill />
          {!editSpaceAction?.shouldHide && (
            <MenuItem data-testid="edit-space-link" to={`/spaces/${space.id}/edit`} activeClassName="active">
              <CogsIcon height={14} />
              <MenuText>Space Settings</MenuText>
            </MenuItem>
          )}
          <Expand data-testid="expand-sidebar" onClick={() => setExpandedSidebar(!expandedSidebar)}>
            <FlapIcon />
          </Expand>
        </StyledMenu>
        <Main>
          <ErrorBoundary>
            <Outlet context={context} />
          </ErrorBoundary>
        </Main>
      </Row>
    </>
  )
}

export default SpaceShowLayout
