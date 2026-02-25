import React from 'react'
import { Navigate, useLocation, useOutletContext, useParams, useSearchParams } from 'react-router'
import { Markdown } from '../components/Markdown'
import { AppShowOutletContext } from '../features/apps/AppsShow'
import { StyledMarkdownAppShow } from '../features/apps/form/styles'
import { useAuthUser } from '../features/auth/useAuthUser'
import { HomeScopeContextValue, useHomeScope } from '../features/home/HomeScopeContext'
import { ISpace } from '../features/spaces/spaces.types'
import { SpaceOutletContext } from './spaces'

const MembersList = React.lazy(() => import('../features/spaces/members/MembersList').then(m => ({ default: m.MembersList })))
const AppList = React.lazy(() => import('../features/apps/AppList').then(m => ({ default: m.AppList })))
const AppsShow = React.lazy(() => import('../features/apps/AppsShow').then(m => ({ default: m.AppsShow })))
const SpecTab = React.lazy(() => import('../features/apps/SpecTab').then(m => ({ default: m.SpecTab })))
const AppExecutionsList = React.lazy(() =>
  import('../features/apps/AppExecutionsList').then(m => ({ default: m.AppExecutionsList })),
)
const EditAppPage = React.lazy(() => import('../features/apps/form/EditAppPage').then(m => ({ default: m.EditAppPage })))
const ForkAppPage = React.lazy(() => import('../features/apps/form/ForkAppPage').then(m => ({ default: m.ForkAppPage })))
const RunJobPage = React.lazy(() => import('../features/apps/run/RunJobPage').then(m => ({ default: m.RunJobPage })))
const DatabaseList = React.lazy(() => import('../features/databases/DatabaseList').then(m => ({ default: m.DatabaseList })))
const DatabaseShow = React.lazy(() => import('../features/databases/DatabaseShow').then(m => ({ default: m.DatabaseShow })))
const CreateDatabase = React.lazy(() =>
  import('../features/databases/create/CreateDatabase').then(m => ({ default: m.CreateDatabase })),
)
const AssetList = React.lazy(() => import('../features/assets/AssetList').then(m => ({ default: m.AssetList })))
const AssetShow = React.lazy(() => import('../features/assets/AssetShow').then(m => ({ default: m.AssetShow })))
const WorkflowList = React.lazy(() => import('../features/workflows/WorkflowList').then(m => ({ default: m.WorkflowList })))
const WorkflowShow = React.lazy(() => import('../features/workflows/WorkflowShow').then(m => ({ default: m.WorkflowShow })))
const ExecutionList = React.lazy(() => import('../features/executions/ExecutionList').then(m => ({ default: m.ExecutionList })))
const ExecutionDetails = React.lazy(() =>
  import('../features/executions/details/ExecutionDetails').then(m => ({ default: m.ExecutionDetails })),
)
const DiscussionList = React.lazy(() =>
  import('../features/discussions/DiscussionList').then(m => ({ default: m.DiscussionList })),
)
const DiscussionShow = React.lazy(() =>
  import('../features/discussions/DiscussionShow').then(m => ({ default: m.DiscussionShow })),
)
const CreateDiscussionPage = React.lazy(() =>
  import('../features/discussions/form/CreateDiscussionPage').then(m => ({ default: m.CreateDiscussionPage })),
)
const SpaceReportList = React.lazy(() =>
  import('../features/space-reports/SpaceReportList').then(m => ({ default: m.SpaceReportList })),
)
const TrackInHome = React.lazy(() => import('../features/tracks/TrackInHome').then(m => ({ default: m.TrackInHome })))
const FileList = React.lazy(() => import('../features/files/FileList').then(m => ({ default: m.FileList })))
const FileShow = React.lazy(() => import('../features/files/show/FileShow').then(m => ({ default: m.FileShow })))

/**
 * Result of useUnifiedRouteContext when in home context.
 * Returns the full HomeScopeContextValue for type safety.
 */
interface HomeContextResult {
  isHome: true
  homeContext: HomeScopeContextValue
  space?: undefined
  isLoading?: undefined
}

/**
 * Result of useUnifiedRouteContext when in space context.
 */
interface SpaceContextResult {
  isHome: false
  homeContext?: undefined
  space: ISpace
  isLoading: boolean
}

type UnifiedContextResult = HomeContextResult | SpaceContextResult

export function useUnifiedRouteContext(): UnifiedContextResult {
  const homeContext = useHomeScope()
  const spaceContext = useOutletContext<SpaceOutletContext | undefined>()

  // If we have a space in the outlet context, we're in a space route
  if (spaceContext?.space) {
    return {
      isHome: false,
      space: spaceContext.space,
      isLoading: spaceContext.isLoading,
    }
  }

  // Otherwise we're in home context
  return {
    isHome: true,
    homeContext,
  }
}

export const FilesListPage = () => {
  const context = useUnifiedRouteContext()
  const user = useAuthUser()
  const [searchParams] = useSearchParams()

  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  const showFolderActions = context.homeContext?.homeScope !== 'featured'
  return <FileList homeScope={context.homeContext?.homeScope} space={context.space} isAdmin={user?.isAdmin} showFolderActions={showFolderActions} />
}

export const FileShowPage = () => {
  const context = useUnifiedRouteContext()
  const { fileId } = useParams<{ fileId: string }>()

  return <FileShow homeContext={context.homeContext} fileId={fileId!} space={context.space} />
}

export const AppsListPage = () => {
  const context = useUnifiedRouteContext()
  const user = useAuthUser()
  const [searchParams] = useSearchParams()

  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  const isContributorOrHigher = context.space
    ? ['lead', 'admin', 'contributor'].includes(context.space.current_user_membership.role)
    : undefined
  return (
    <AppList
      homeScope={context.homeContext?.homeScope}
      spaceId={context.space?.id.toString()}
      isAdmin={user?.isAdmin}
      isContributorOrHigher={isContributorOrHigher}
    />
  )
}

export const AppShowPage = () => {
  const context = useUnifiedRouteContext()
  const { appUid } = useParams<{ appUid: string }>()

  return <AppsShow homeContext={context.homeContext} spaceId={context.space?.id.toString()} appUid={appUid!} />
}

export const AppSpecPage = () => {
  const { spaceId, spec } = useOutletContext<AppShowOutletContext>()
  return <SpecTab spaceId={spaceId} spec={spec} />
}

export const AppSpecRedirect = () => {
  const location = useLocation()
  return <Navigate to={location.pathname.replace(/\/spec$/, '')} replace />
}

export const AppReadmePage = () => {
  const { readme } = useOutletContext<AppShowOutletContext>()
  return (
    <StyledMarkdownAppShow>
      <Markdown data={readme} />
    </StyledMarkdownAppShow>
  )
}

export const AppJobsPage = () => {
  const { appUid } = useOutletContext<AppShowOutletContext>()
  return <AppExecutionsList appUid={appUid} />
}

export const EditAppPageWrapper = () => {
  const context = useUnifiedRouteContext()

  return <EditAppPage homeContext={context.homeContext} spaceId={context.space?.id.toString()} />
}

export const ForkAppPageWrapper = () => {
  const context = useUnifiedRouteContext()

  return <ForkAppPage spaceId={context.space?.id} />
}

export const RunJobPageWrapper = () => {
  const context = useUnifiedRouteContext()

  return <RunJobPage homeContext={context.homeContext} />
}

export const DatabaseListPage = () => {
  const context = useUnifiedRouteContext()
  const [searchParams] = useSearchParams()

  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  return <DatabaseList homeScope={context.homeContext?.homeScope} spaceId={context.space?.id} />
}

export const DatabaseShowPage = () => {
  const context = useUnifiedRouteContext()
  const { uid } = useParams<{ uid: string }>()

  return <DatabaseShow homeContext={context.homeContext} databaseId={uid!} spaceId={context.space?.id} />
}

export const CreateDatabasePage = () => {
  const context = useUnifiedRouteContext()

  return <CreateDatabase homeScope={context.homeContext?.homeScope} spaceId={context.space?.id} />
}

export const AssetsListPage = () => {
  const user = useAuthUser()
  const context = useUnifiedRouteContext()
  const [searchParams] = useSearchParams()

  if (!context.isHome) {
    // Assets not available in spaces
    return <Navigate to=".." replace />
  }

  if (!searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }
  return <AssetList homeScope={context?.homeContext?.homeScope} isAdmin={user?.isAdmin} />
}

export const AssetShowPage = () => {
  const context = useUnifiedRouteContext()
  const { assetUid } = useParams<{ assetUid: string }>()

  if (!context.isHome) {
    return <Navigate to=".." replace />
  }

  return <AssetShow assetUid={assetUid!} homeContext={context?.homeContext} />
}

export const WorkflowListPage = () => {
  const context = useUnifiedRouteContext()
  const [searchParams] = useSearchParams()

  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  const isContributorOrHigher = context.space
    ? ['lead', 'admin', 'contributor'].includes(context.space.current_user_membership.role)
    : undefined
  return (
    <WorkflowList
      homeScope={context.homeContext?.homeScope}
      spaceId={context.space?.id.toString()}
      isContributorOrHigher={isContributorOrHigher}
    />
  )
}

export const WorkflowShowPage = () => {
  const context = useUnifiedRouteContext()
  const { workflowUid } = useParams<{ workflowUid: string }>()

  return <WorkflowShow workflowId={workflowUid!} homeContext={context.homeContext} spaceId={context.space?.id} />
}

export const ExecutionListPage = () => {
  const context = useUnifiedRouteContext()
  const user = useAuthUser()
  const [searchParams] = useSearchParams()

  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  return <ExecutionList homeScope={context.homeContext?.homeScope} spaceId={context.space?.id} isAdmin={user?.isAdmin} />
}

export const ExecutionDetailsPage = () => {
  const context = useUnifiedRouteContext()
  const { executionUid } = useParams<{ executionUid: string }>()

  return <ExecutionDetails homeContext={context.homeContext} spaceId={context.space?.id} executionUid={executionUid!} />
}

export const DiscussionListPage = () => {
  const context = useUnifiedRouteContext()

  const canCreateDiscussion = context.isHome
    ? context?.homeContext?.homeScope === 'everybody'
    : ['lead', 'admin', 'contributor'].includes(context.space!.current_user_membership.role)
  return (
    <DiscussionList
      homeScope={context.homeContext?.homeScope}
      spaceId={context.space?.id}
      canCreateDiscussion={canCreateDiscussion}
    />
  )
}

export const DiscussionShowPage = () => {
  const context = useUnifiedRouteContext()
  const user = useAuthUser()
  const { discussionId, answerId, commentId } = useParams<{ discussionId: string; answerId?: string; commentId?: string }>()

  return (
    <DiscussionShow
      user={user!}
      homeContext={context.homeContext}
      space={context.space}
      discussionId={parseInt(discussionId!, 10)}
      answerId={parseInt(answerId || '', 10) || undefined}
      commentId={parseInt(commentId || '', 10) || undefined}
    />
  )
}

export const CreateDiscussionPageWrapper = () => {
  const context = useUnifiedRouteContext()

  const displayWarning = context.space ? context.space.type === 'review' && Boolean(context.space.private_space_id) : false
  const scope = context.space ? (`space-${context.space.id}` as const) : 'public'

  return <CreateDiscussionPage displayWarning={displayWarning} scope={scope} />
}

export const SpaceReportListPage = () => {
  const context = useUnifiedRouteContext()
  const [searchParams] = useSearchParams()

  if (context.isHome && !searchParams.has('scope')) {
    return <Navigate to="?scope=me" replace />
  }

  const scope = context.space ? `space-${context.space.id}` : 'private'
  const isContributorOrHigher = context.space
    ? ['lead', 'admin', 'contributor'].includes(context.space.current_user_membership.role)
    : undefined
  return <SpaceReportList scope={scope} isContributorOrHigher={isContributorOrHigher} />
}

export const TrackInHomePage = () => {
  const context = useUnifiedRouteContext()

  return <TrackInHome homeContext={context.homeContext} spaceId={context.space?.id} />
}

export const TrackDatabaseInHomePage = () => {
  const context = useUnifiedRouteContext()

  return <TrackInHome entityType="database" homeContext={context.homeContext} spaceId={context.space?.id} />
}

export const TrackExecutionInHomePage = () => {
  const context = useUnifiedRouteContext()

  return <TrackInHome entityType="execution" homeContext={context.homeContext} spaceId={context.space?.id} />
}

export const MembersListPage = () => {
  const spaceContext = useOutletContext<SpaceOutletContext | undefined>()

  if (!spaceContext?.space) {
    return <Navigate to=".." replace />
  }

  return <MembersList space={spaceContext.space} />
}
