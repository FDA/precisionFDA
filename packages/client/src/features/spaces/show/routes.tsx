import React from 'react'
import { type RouteObject, Navigate, useOutletContext, useParams } from 'react-router'
import { AppList } from '../../apps/AppList'
import { AppsShow } from '../../apps/AppsShow'
import { EditAppPage } from '../../apps/form/EditAppPage'
import { ForkAppPage } from '../../apps/form/ForkAppPage'
import { RunJobPage } from '../../apps/run/RunJobPage'
import { DatabaseList } from '../../databases/DatabaseList'
import { DatabaseShow } from '../../databases/DatabaseShow'
import { CreateDatabase } from '../../databases/create/CreateDatabase'
import { DiscussionList } from '../../discussions/DiscussionList'
import { DiscussionShow } from '../../discussions/DiscussionShow'
import { CreateDiscussionPage } from '../../discussions/form/CreateDiscussionPage'
import { ExecutionDetails } from '../../executions/details/ExecutionDetails'
import { FileList } from '../../files/FileList'
import { FileShow } from '../../files/show/FileShow'
import { TrackInHome } from '../../tracks/TrackInHome'
import { WorkflowList } from '../../workflows/WorkflowList'
import { WorkflowShow } from '../../workflows/WorkflowShow'
import { MembersList } from '../members/MembersList'
import { SpaceReportList } from '../../space-reports/SpaceReportList'
import type { SpaceOutletContext } from '../routes'
import { ExecutionList } from '../../executions/ExecutionList'
import { useAuthUser } from '../../auth/useAuthUser'

/**
 * Page components for routes that require props from space data.
 * These consume space data via useOutletContext (provided by SpaceShowRoot).
 * No queries are made - all data comes from Outlet context.
 */
const AppsListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const isContributorOrHigher = ['lead', 'admin', 'contributor'].includes(space.current_user_membership.role)
  return <AppList spaceId={space.id.toString()} isContributorOrHigher={isContributorOrHigher} />
}

const AppShowPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const { appUid } = useParams<{ appUid: string }>()
  return <AppsShow spaceId={space.id.toString()} appUid={appUid!} />
}

const FileShowPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const { fileId } = useParams<{ fileId: string }>()
  return <FileShow fileId={fileId!} space={space} />
}

const FilesListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <FileList space={space} showFolderActions />
}

const MembersListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <MembersList space={space} />
}

const SpaceReportListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const isContributorOrHigher = ['lead', 'admin', 'contributor'].includes(space.current_user_membership.role)
  return <SpaceReportList scope={`space-${space.id}`} isContributorOrHigher={isContributorOrHigher} />
}

const CreateDiscussionPagePage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return (
    <CreateDiscussionPage
      displayWarning={space.type === 'review' && Boolean(space.private_space_id)}
      scope={`space-${space.id}`}
    />
  )
}

const DatabaseListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <DatabaseList spaceId={space.id} />
}

const DatabaseShowPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const { uid } = useParams<{ uid: string }>()
  return <DatabaseShow databaseId={uid!} spaceId={space.id} />
}

const CreateDatabasePage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <CreateDatabase spaceId={space.id} />
}

const WorkflowListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const isContributorOrHigher = ['lead', 'admin', 'contributor'].includes(space.current_user_membership.role)
  return <WorkflowList spaceId={space.id.toString()} isContributorOrHigher={isContributorOrHigher} />
}

const WorkflowShowPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const { workflowUid } = useParams<{ workflowUid: string }>()
  return <WorkflowShow spaceId={space.id} workflowId={workflowUid!} />
}

const ExecutionListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <ExecutionList spaceId={space.id} />
}

const ExecutionDetailsPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const { executionUid } = useParams<{ executionUid: string }>()
  return <ExecutionDetails spaceId={space.id} executionUid={executionUid!} />
}

const DiscussionListPage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  const canCreateDiscussion = ['lead', 'admin', 'contributor'].includes(space.current_user_membership.role)
  return <DiscussionList spaceId={space.id} canCreateDiscussion={canCreateDiscussion} />
}

const DiscussionShowPage = () => {
  const user = useAuthUser()
  const { space } = useOutletContext<SpaceOutletContext>()
  const { discussionId } = useParams<{ discussionId: string }>()
  return <DiscussionShow space={space} discussionId={parseInt(discussionId!, 10)} user={user!} />
}

const EditAppPageWrapper = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <EditAppPage spaceId={space.id.toString()} />
}

const ForkAppPageWrapper = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <ForkAppPage spaceId={space.id} />
}

const TrackInHomePage = () => {
  const { space } = useOutletContext<SpaceOutletContext>()
  return <TrackInHome spaceId={space.id} />
}

export const spaceDetailRoutes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="files" replace />,
  },
  {
    path: 'files',
    Component: FilesListPage,
  },
  {
    path: 'files/:fileId',
    Component: FileShowPage,
  },
  {
    path: 'files/:identifier/track',
    Component: TrackInHomePage,
  },
  {
    path: 'databases',
    Component: DatabaseListPage,
  },
  {
    path: 'databases/create',
    Component: CreateDatabasePage,
  },
  {
    path: 'databases/:uid',
    Component: DatabaseShowPage,
  },
  {
    path: 'apps',
    Component: AppsListPage,
  },
  {
    path: 'apps/:appIdentifier/jobs/new',
    Component: RunJobPage,
  },
  {
    path: 'apps/:appUid/edit',
    Component: EditAppPageWrapper,
  },
  {
    path: 'apps/:appUid/fork',
    Component: ForkAppPageWrapper,
  },
  {
    path: 'apps/:appUid/*',
    Component: AppShowPage,
  },
  {
    path: 'apps/:identifier/track',
    Component: TrackInHomePage,
  },
  {
    path: 'workflows',
    Component: WorkflowListPage,
  },
  {
    path: 'workflows/:workflowUid/*',
    Component: WorkflowShowPage,
  },
  {
    path: 'executions',
    Component: ExecutionListPage,
  },
  {
    path: 'executions/:executionUid/*',
    Component: ExecutionDetailsPage,
  },
  {
    path: 'executions/:identifier/track',
    Component: TrackInHomePage,
  },
  {
    path: 'members',
    Component: MembersListPage,
  },
  {
    path: 'reports',
    Component: SpaceReportListPage,
  },
  {
    path: 'discussions',
    Component: DiscussionListPage,
  },
  {
    path: 'discussions/create',
    Component: CreateDiscussionPagePage,
  },
  {
    path: 'discussions/:discussionId/*',
    Component: DiscussionShowPage,
  },
]

export default spaceDetailRoutes


