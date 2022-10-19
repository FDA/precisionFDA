import React, { useLayoutEffect } from 'react'
import { useQuery } from 'react-query'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { isActiveLink } from '../../helpers'
import NavigationBar from '../../views/components/NavigationBar/NavigationBar'
import PublicLayout from '../../views/layouts/PublicLayout'
import { fetchCurrentUser } from '../auth/api'
import { useAuthUser } from '../auth/useAuthUser'
import { Apps } from './pages/Apps'
import { ChallengeWorkbench } from './pages/ChallengeWorkbench'
import { CLI } from './pages/CLI'
import { Comparisons } from './pages/Comparisons'
import { CreatingApps } from './pages/CreatingApps'
import { Discussions } from './pages/Discussions'
import { Files } from './pages/Files'
import { Intro } from './pages/Intro'
import { Licenses } from './pages/Licenses'
import { Notes } from './pages/Notes'
import { OrganizationsDeprecation } from './pages/OrganizationsDeprecation'
import { Publishing } from './pages/Publishing'
import { ReviewSpaces } from './pages/ReviewSpaces'
import { SiteActivityReporting } from './pages/SiteActivityReporting'
import { SiteAdministration } from './pages/SiteAdministration'
import { SiteCustomization } from './pages/SiteCustomization'
import { Tracking } from './pages/Tracking'
import { VideoTutorials } from './pages/VideoTutorials'
import { Workflows } from './pages/Workflows'
import { Workstations } from './pages/Workstations'
import { DocsContent, DocsLayout, DocsNav, DocsTitle, NavItem } from './styles'

const Docs = () => {
  const user = useAuthUser()
  const { pathname } = useLocation()
  const { data } = useQuery(['user'], () => fetchCurrentUser())
  const isAdmin = data?.admin

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <PublicLayout>
      <NavigationBar
        title="Documentation"
        subtitle=""
        user={user}
      />
      <DocsLayout>
        <DocsNav>
          <DocsTitle>Guides</DocsTitle>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/introduction', pathname)}
            to="/docs/introduction"
          >
            Introduction
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/video-tutorials', pathname)}
            to="/docs/video-tutorials"
          >
            Video Tutorials
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/discussions', pathname)}
            to="/docs/discussions"
          >
            Discussions
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/notes', pathname)}
            to="/docs/notes"
          >
            Notes
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/files', pathname)}
            to="/docs/files"
          >
            Files
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/comparisons', pathname)}
            to="/docs/comparisons"
          >
            Comparisons
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/apps', pathname)}
            to="/docs/apps"
          >
            Apps
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/creating-apps', pathname)}
            to="/docs/creating-apps"
          >
            Creating Apps
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/workstations', pathname)}
            to="/docs/workstations"
          >
            Workstations
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/workflows', pathname)}
            to="/docs/workflows"
          >
            Workflows
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/tracking', pathname)}
            to="/docs/tracking"
          >
            Tracking
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/publishing', pathname)}
            to="/docs/publishing"
          >
            Publishing
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/licenses', pathname)}
            to="/docs/licenses"
          >
            Licenses
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/cli', pathname)} to="/docs/cli"
          >
            Command Line Interface
          </NavItem>
          <NavItem
            activeClassName='active'
            $active={isActiveLink('/docs/spaces', pathname)}
            to="/docs/spaces"
          >
            Spaces
          </NavItem>
          {isAdmin && (
            <>
              <DocsTitle>Administrator Features</DocsTitle>
              <NavItem
                activeClassName='active'
                $active={isActiveLink('/docs/challenge-workbench', pathname)}
                to="/docs/challenge-workbench"
              >
                Challenge Workbench
              </NavItem>
              <NavItem
                activeClassName='active'
                $active={isActiveLink('/docs/site-activity-reporting', pathname)}
                to="/docs/site-activity-reporting"
              >
                Site Activity Reporting
              </NavItem>
              <NavItem
                activeClassName='active'
                $active={isActiveLink('/docs/site-customization', pathname)}
                to="/docs/site-customization"
              >
                Site Customization
              </NavItem>
              <NavItem
                activeClassName='active'
                $active={isActiveLink('/docs/site-administration', pathname)}
                to="/docs/site-administration"
              >
                Site Administration
              </NavItem>
              <DocsTitle>Deprecated Features</DocsTitle>
              <NavItem
                activeClassName='active'
                $active={isActiveLink(
                  '/docs/organizations-deprecation',
                  pathname,
                )}
                to="/docs/organizations-deprecation"
              >
                Organizations Deprecation
              </NavItem>
            </>
          )}
        </DocsNav>
        <DocsContent>
          <Switch>
            <Route exact path="/docs/introduction">
              <Intro />
            </Route>
            <Route exact path="/docs/video-tutorials">
              <VideoTutorials />
            </Route>
            <Route exact path="/docs/discussions">
              <Discussions />
            </Route>
            <Route exact path="/docs/notes">
              <Notes />
            </Route>
            <Route exact path="/docs/files">
              <Files />
            </Route>
            <Route exact path="/docs/comparisons">
              <Comparisons />
            </Route>
            <Route exact path="/docs/apps">
              <Apps />
            </Route>
            <Route exact path="/docs/creating-apps">
              <CreatingApps />
            </Route>
            <Route exact path="/docs/workstations">
              <Workstations />
            </Route>
            <Route exact path="/docs/workflows">
              <Workflows />
            </Route>
            <Route exact path="/docs/tracking">
              <Tracking />
            </Route>
            <Route exact path="/docs/publishing">
              <Publishing />
            </Route>
            <Route exact path="/docs/licenses">
              <Licenses />
            </Route>
            <Route exact path="/docs/spaces">
              <ReviewSpaces />
            </Route>
            <Route exact path="/docs/cli">
              <CLI />
            </Route>

            <Route exact path="/docs/challenge-workbench">
              <ChallengeWorkbench />
            </Route>
            <Route exact path="/docs/site-activity-reporting">
              <SiteActivityReporting />
            </Route>
            <Route exact path="/docs/site-customization">
              <SiteCustomization />
            </Route>
            <Route exact path="/docs/site-administration">
              <SiteAdministration />
            </Route>
            <Route exact path="/docs/organizations-deprecation">
              <OrganizationsDeprecation />
            </Route>
            <Route path="/docs">
              <Redirect to="/docs/introduction" />
            </Route>
          </Switch>
        </DocsContent>
      </DocsLayout>
    </PublicLayout>
  )
}

export default Docs
