import React, { useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { isActiveLink } from '../../helpers'
import { usePageMeta } from '../../hooks/usePageMeta'
import PublicLayout from '../../layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { Apps } from './pages/Apps'
import { Assets } from './pages/Assets'
import { CLI } from './pages/CLI'
import { ChallengeWorkbench } from './pages/ChallengeWorkbench'
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
import { Workflows } from './pages/Workflows'
import { Workstations } from './pages/Workstations'
import { DocsContent, DocsMainContainer, DocsNav, DocsPageContainer, DocsTitle, NavItem } from './styles'
import PFDAFooter from '../../components/Footer'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import { TutorialMarkdown } from './tutorials/TutorialMarkdown'

const Docs = () => {
  usePageMeta({ title: 'Docs - precisionFDA' })
  const user = useAuthUser()
  const { pathname } = useLocation()
  const scrollContentRef = useRef()
  const isAdmin = user?.isAdmin ?? false

  useLayoutEffect(() => {
    if(scrollContentRef?.current) {
      scrollContentRef.current.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <PublicLayout innerScroll showFooter={false}>
      <NavigationBar title="Documentation" subtitle="" user={user} />
      <DocsPageContainer>
        <DocsNav>
          <DocsTitle>Tutorials</DocsTitle>

          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/tutorials/apps-workflows', pathname)}
            to="/docs/tutorials/apps-workflows"
            data-turbolinks="false"
          >
            Design Patterns for Apps and Workflows
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/tutorials/workstations-databases', pathname)}
            to="/docs/tutorials/workstations-databases"
            data-turbolinks="false"
          >
            Collaborative Data Science with Interactive Workstations and Databases
          </NavItem>

          <DocsTitle>Guides</DocsTitle>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/introduction', pathname)}
            to="/docs/introduction"
            data-turbolinks="false"
          >
            Introduction
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/discussions', pathname)}
            to="/docs/discussions"
            data-turbolinks="false"
          >
            Discussions
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/notes', pathname)}
            to="/docs/notes"
            data-turbolinks="false"
          >
            Notes
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/files', pathname)}
            to="/docs/files"
            data-turbolinks="false"
          >
            Files
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/comparisons', pathname)}
            to="/docs/comparisons"
            data-turbolinks="false"
          >
            Comparisons
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/apps', pathname)}
            to="/docs/apps"
            data-turbolinks="false"
          >
            Apps
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/creating-apps', pathname)}
            to="/docs/creating-apps"
            data-turbolinks="false"
          >
            Creating Apps
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/assets', pathname)}
            to="/docs/assets"
            data-turbolinks="false"
          >
            Assets
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/workstations', pathname)}
            to="/docs/workstations"
            data-turbolinks="false"
          >
            Workstations
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/workflows', pathname)}
            to="/docs/workflows"
            data-turbolinks="false"
          >
            Workflows
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/tracking', pathname)}
            to="/docs/tracking"
            data-turbolinks="false"
          >
            Tracking
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/publishing', pathname)}
            to="/docs/publishing"
            data-turbolinks="false"
          >
            Publishing
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/licenses', pathname)}
            to="/docs/licenses"
            data-turbolinks="false"
          >
            Licenses
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/cli', pathname)}
            to="/docs/cli"
            data-turbolinks="false"
          >
            Command Line Interface
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={isActiveLink('/docs/spaces', pathname)}
            to="/docs/spaces"
            data-turbolinks="false"
          >
            Spaces
          </NavItem>
          <NavItem
            activeClassName="active"
            $active={false}
            to="https://www.fda.gov/media/169513/download?attachment"
            data-turbolinks="false"
          >
            GSRS Substance Submission
          </NavItem>
          {isAdmin && (
            <>
              <DocsTitle>Administrator Features</DocsTitle>
              <NavItem
                activeClassName="active"
                $active={isActiveLink('/docs/challenge-workbench', pathname)}
                to="/docs/challenge-workbench"
                data-turbolinks="false"
              >
                Challenge Workbench
              </NavItem>
              <NavItem
                activeClassName="active"
                $active={isActiveLink('/docs/site-activity-reporting', pathname)}
                to="/docs/site-activity-reporting"
                data-turbolinks="false"
              >
                Site Activity Reporting
              </NavItem>
              <NavItem
                activeClassName="active"
                $active={isActiveLink('/docs/site-customization', pathname)}
                to="/docs/site-customization"
                data-turbolinks="false"
              >
                Site Customization
              </NavItem>
              <NavItem
                activeClassName="active"
                $active={isActiveLink('/docs/site-administration', pathname)}
                to="/docs/site-administration"
                data-turbolinks="false"
              >
                Site Administration
              </NavItem>
              <DocsTitle>Deprecated Features</DocsTitle>
              <NavItem
                activeClassName="active"
                $active={isActiveLink('/docs/organizations-deprecation', pathname)}
                to="/docs/organizations-deprecation"
                data-turbolinks="false"
              >
                Organizations Deprecation
              </NavItem>
            </>
          )}
        </DocsNav>
        <DocsMainContainer ref={scrollContentRef}>
          <DocsContent>
            <Routes>
              <Route path="/" element={<Navigate to="/docs/introduction" replace />} />
              <Route path="/introduction" element={<Intro />} />
              <Route path="/tutorials/apps-workflows" element={<TutorialMarkdown fileName="apps.md" />} />
              <Route
                path="/tutorials/workstations-databases"
                element={<TutorialMarkdown fileName="workstations-databases.md" />}
              />
              <Route path="/discussions" element={<Discussions />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/files" element={<Files />} />
              <Route path="/comparisons" element={<Comparisons />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/creating-apps" element={<CreatingApps />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/workstations" element={<Workstations />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/publishing" element={<Publishing />} />
              <Route path="/licenses" element={<Licenses />} />
              <Route path="/spaces" element={<ReviewSpaces />} />
              <Route path="/cli" element={<CLI />} />
              <Route path="/challenge-workbench" element={<ChallengeWorkbench />} />
              <Route path="/site-activity-reporting" element={<SiteActivityReporting />} />
              <Route path="/site-customization" element={<SiteCustomization />} />
              <Route path="/site-administration" element={<SiteAdministration />} />
              <Route path="/organizations-deprecation" element={<OrganizationsDeprecation />} />
            </Routes>
          </DocsContent>
          <PFDAFooter />
        </DocsMainContainer>
      </DocsPageContainer>
    </PublicLayout>
  )
}

export default Docs
