import { Navigate, RouteObject } from "react-router";
import { commonResourceRoutes } from "../shared";
import { AssetShowPage, AssetsListPage, TrackDatabaseInHomePage } from "../resource-pages";
import NavigateWithParams from "../../utils/NavigateWithParams";
import React from "react";

const CreateAppPage = React.lazy(() => import("../../features/apps/form/CreateAppPage").then(m => ({ default: m.CreateAppPage })));

export const homeRoutes: RouteObject[] = [
  ...commonResourceRoutes,
  {
    path: 'apps/create',
    Component: CreateAppPage,
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
    path: 'databases/:identifier/track',
    Component: TrackDatabaseInHomePage,
  },
  // Legacy job routes redirect
  {
    path: 'jobs/:executionUid',
    element: <NavigateWithParams to="/home/executions/:executionUid" replace />,
  },
  {
    path: 'jobs',
    element: <Navigate to="/home/executions" replace />,
  },
]
