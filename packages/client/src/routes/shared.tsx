import React from 'react'
import { type RouteObject, Navigate } from 'react-router'

import {
  FilesListPage,
  FileShowPage,
  AppsListPage,
  AppShowPage,
  AppSpecPage,
  AppSpecRedirect,
  AppReadmePage,
  AppJobsPage,
  EditAppPageWrapper,
  ForkAppPageWrapper,
  RunJobPageWrapper,
  DatabaseListPage,
  DatabaseShowPage,
  CreateDatabasePage,
  WorkflowListPage,
  WorkflowShowPage,
  ExecutionListPage,
  ExecutionDetailsPage,
  DiscussionListPage,
  DiscussionShowPage,
  CreateDiscussionPageWrapper,
  SpaceReportListPage,
  TrackInHomePage,
  TrackExecutionInHomePage,
} from './resource-pages'

/**
 * Common routes shared between home and spaces.
 * These routes work with the unified context system.
 */
export const commonResourceRoutes: RouteObject[] = [
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
    Component: RunJobPageWrapper,
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
    path: 'apps/:appUid',
    Component: AppShowPage,
    children: [
      {
        index: true,
        Component: AppSpecPage,
      },
      {
        path: 'spec',
        Component: AppSpecRedirect,
      },
      {
        path: 'readme',
        Component: AppReadmePage,
      },
      {
        path: 'jobs',
        Component: AppJobsPage,
      },
    ],
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
    Component: CreateDiscussionPageWrapper,
  },
  {
    path: 'discussions/:discussionId/*',
    Component: DiscussionShowPage,
  },
]
