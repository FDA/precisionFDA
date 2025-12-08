import React from 'react'
import { type RouteObject, Navigate, useParams } from 'react-router'
import { AppList } from '../../apps/AppList'
import { AppsShow } from '../../apps/AppsShow'
import { CreateAppPage } from '../../apps/form/CreateAppPage'
import { EditAppPage } from '../../apps/form/EditAppPage'
import { ForkAppPage } from '../../apps/form/ForkAppPage'
import { RunJobPage } from '../../apps/run/RunJobPage'
import { AssetList } from '../../assets/AssetList'
import { AssetShow } from '../../assets/AssetShow'
import { DatabaseList } from '../../databases/DatabaseList'
import { DatabaseShow } from '../../databases/DatabaseShow'
import { CreateDatabase } from '../../databases/create/CreateDatabase'
import { DiscussionList } from '../../discussions/DiscussionList'
import { DiscussionShow } from '../../discussions/DiscussionShow'
import { CreateDiscussionPage } from '../../discussions/form/CreateDiscussionPage'
import { ExecutionList } from '../../executions/ExecutionList'
import { ExecutionDetails } from '../../executions/details/ExecutionDetails'
import { FileList } from '../../files/FileList'
import { FileShow } from '../../files/show/FileShow'
import { SpaceReportList } from '../../space-reports/SpaceReportList'
import { TrackInHome } from '../../tracks/TrackInHome'
import { WorkflowList } from '../../workflows/WorkflowList'
import { WorkflowShow } from '../../workflows/WorkflowShow'
import NavigateWithParams from '../../../utils/NavigateWithParams'
import { useAuthUser } from '../../auth/useAuthUser'
import { useHomeScope } from '../HomeScopeContext'

const FilesListPage = () => {
  const { homeScope = 'me' } = useHomeScope()
  const user = useAuthUser()
  return (
    <FileList
      isAdmin={user?.isAdmin}
      homeScope={homeScope}
      showFolderActions={(homeScope === 'everybody' && user?.admin) || homeScope === 'me'}
    />
  )
}

const FileShowPage = () => {  
  const homeContext = useHomeScope()
  const { fileId } = useParams<{ fileId: string }>()
  return <FileShow homeContext={homeContext} fileId={fileId!} />
}

const AppsListPage = () => {
  const { homeScope } = useHomeScope()
  const user = useAuthUser()
  return <AppList homeScope={homeScope} isAdmin={user?.isAdmin} />
}

const AppShowPage = () => {
  const homeContext = useHomeScope()
  const { appUid } = useParams<{ appUid: string }>()
  return <AppsShow homeContext={homeContext} appUid={appUid!} />
}

const DatabaseListPage = () => {
  const { homeScope } = useHomeScope()
  return <DatabaseList homeScope={homeScope} />
}

const DatabaseShowPage = () => {
  const homeContext = useHomeScope()
  const { uid } = useParams<{ uid: string }>()
  return <DatabaseShow homeContext={homeContext} databaseId={uid!} />
}

const CreateDatabasePage = () => {
  const { homeScope } = useHomeScope()
  return <CreateDatabase homeScope={homeScope} />
}

const AssetsListPage = () => {
  const { homeScope } = useHomeScope()
  const user = useAuthUser()
  return <AssetList homeScope={homeScope} isAdmin={user?.isAdmin} />
}

const AssetShowPage = () => {
  const homeContext = useHomeScope()
  const { assetUid } = useParams<{ assetUid: string }>()
  return <AssetShow assetUid={assetUid!} homeContext={homeContext} />
}

const WorkflowListPage = () => {
  const { homeScope } = useHomeScope()
  return <WorkflowList homeScope={homeScope} />
}

const WorkflowShowPage = () => {
  const homeContext = useHomeScope()
  const { workflowUid } = useParams<{ workflowUid: string }>()
  return <WorkflowShow workflowId={workflowUid!} homeContext={homeContext} />
}

const ExecutionListPage = () => {
  const user = useAuthUser()
  const { homeScope } = useHomeScope()
  return <ExecutionList homeScope={homeScope} isAdmin={user?.isAdmin} />
}

const ExecutionDetailsPage = () => {
  const homeContext = useHomeScope()
  const { executionUid } = useParams<{ executionUid: string }>()
  return <ExecutionDetails homeContext={homeContext} executionUid={executionUid!} />
}

const SpaceReportListPage = () => {
  return <SpaceReportList scope="private" />
}

const DiscussionListPage = () => {
  const { homeScope } = useHomeScope()
  const canCreateDiscussion = homeScope === 'everybody'
  return <DiscussionList homeScope={homeScope} canCreateDiscussion={canCreateDiscussion} />
}

const CreateDiscussionPagePage = () => {
  return <CreateDiscussionPage displayWarning={false} scope="public" />
}

const DiscussionShowPage = () => {
  const user = useAuthUser()
  const homeContext = useHomeScope()
  const { discussionId } = useParams<{ discussionId: string }>()
  return <DiscussionShow user={user!} homeContext={homeContext} discussionId={parseInt(discussionId!, 10)} />
}

const TrackInHomePage = () => {
  return <TrackInHome />
}

const TrackDatabaseInHomePage = () => {
  return <TrackInHome entityType="database" />
}

const TrackExecutionInHomePage = () => {
  return <TrackInHome entityType="execution" />
}

export const homeDetailRoutes: RouteObject[] = [
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
    path: 'apps',
    Component: AppsListPage,
  },
  {
    path: 'apps/create',
    Component: CreateAppPage,
  },
  {
    path: 'apps/:appUid/fork',
    Component: ForkAppPage,
  },
  {
    path: 'apps/:appUid/edit',
    Component: EditAppPage,
  },
  {
    path: 'apps/:appIdentifier/jobs/new',
    Component: RunJobPage,
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
    path: 'databases/:identifier/track',
    Component: TrackDatabaseInHomePage,
  },
  {
    path: 'assets',
    Component: AssetsListPage,
  },
  {
    path: 'assets/:assetUid/*',
    Component: AssetShowPage,
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
    Component: TrackExecutionInHomePage,
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
    path: 'discussions/:discussionId',
    Component: DiscussionShowPage,
  },
  // Legacy route redirect
  {
    path: 'jobs/:executionUid',
    element: <NavigateWithParams to="/home/executions/:executionUid" replace />,
  },
  {
    path: 'jobs',
    element: <Navigate to="/home/executions" replace />,
  },
]

export default homeDetailRoutes
