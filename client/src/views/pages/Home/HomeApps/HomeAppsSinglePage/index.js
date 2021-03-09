import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import HomeLayout from '../../../../layouts/HomeLayout'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import RevisionDropdown from '../../../../components/Home/Apps/RevisionDropdown'
import HomeAppsSpec from '../../../../components/Home/Apps/HomeAppsSpec'
import TabsSwitch from '../../../../components/TabsSwitch'
import Loader from '../../../../components/Loader'
import TagsList from '../../../../components/TagsList'
import AssignToChallengeModal from '../../../../components/Home/Apps/AssignToChallengeModal'
import HomeEditTagsModal from '../../../../components/Home/HomeEditTagsModal'
import HomeLabel from '../../../../components/Home/HomeLabel'
import HomeAppExecutionsTable from '../../../../components/Home/Apps/HomeAppExecutionsTable'
import {
  homeAppsAppDetailsSelector,
  homeAppsAssignToChallengeModalSelector,
  homeAppsEditTagsModalSelector,
} from '../../../../../reducers/home/apps/selectors'
import { homeCurrentTabSelector } from '../../../../../reducers/home/page/selectors'
import { HOME_TABS } from '../../../../../constants'
import {
  fetchAppDetails,
  setCurrentTab,
  copyToSpaceApps,
  assignToChallenge,
  editAppTags,
  comparisonAction,
  appsAttachTo,
  showAppsAssignToChallengeModal,
  hideAppsAssignToChallengeModal,
  showAppEditTagsModal,
  hideAppEditTagsModal,
  deleteObjects,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import { getSelectedTab } from '../../../../../helpers/home'
import ActionsDropdown from '../../../../components/Home/Apps/ActionsDropdown'
import Markdown from '../../../../components/Markdown'


const HomeAppsSinglePage = (props) => {
  const { appDetails, currentTab, uid, fetchAppDetails, setCurrentTab, copyToSpace, deleteApps } = props
  const { showAppsAssignToChallengeModal, hideAppsAssignToChallengeModal, assignToChallengeModal, assignToChallenge } = props
  const { editTagsModal, showAppEditTagsModal, hideAppEditTagsModal, editAppTags, appsAttachTo, comparisonAction } = props

  useLayoutEffect(() => {
    if (uid) fetchAppDetails(uid).then(({ status, payload }) => {
      if (status) {
        const selectedTab = getSelectedTab(payload.app.location, payload.app.links.space)
        setCurrentTab(selectedTab)
      }
    })
  }, [uid])

  const { app, meta, isFetching } = appDetails

  if (isFetching) {
    return (
      <HomeLayout hideTabs>
        <div className='text-center'>
          <Loader />
        </div>
      </HomeLayout>
    )
  }

  if (!app || !app.id) return <HomeLayout><span>App not found</span></HomeLayout>

  const renderAppOptions = () => {
    const columns = [
      {
        header: 'location',
        value: 'location',
        link: app.links.space && `${app.links.space}/apps`,
      },
      {
        header: 'id',
        value: 'uid',
      },
      {
        header: 'added by',
        value: 'addedByFullname',
        link: app.links.user,
      },
      {
        header: 'created on',
        value: 'createdAtDateTime',
      },
    ]

    const list = columns.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        {
          (e.header === 'location' && !e.link ) ?
          <Link to={`/home/apps${tab}`} className='home-single-page__object-options_value'>{app[e.value]}</Link>
          :
          e.link ?
            <Link to={e.link} target='_blank' className='home-single-page__object-options_value'>{app[e.value]}</Link> :
            <div className='home-single-page__object-options_value'>{app[e.value]}</div>
        }
      </li>
    ))

    return <ul className='home-single-page__object-options'>{list}</ul>
  }

  const tabsConfig = [
    {
      header: 'Spec',
      tab: <HomeAppsSpec spec={meta.spec} />,
    },
    {
      header: `Executions (${meta.jobs.length})`,
      tab: <div className='pfda-padded-t20'><HomeAppExecutionsTable uid={uid} space={app.links.space}/></div>,
    },
    {
      header: 'Readme',
      tab: <Markdown data={app.readme} />,
    },
  ]

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''

  const assignedChallenges = meta.assigned_challenges.length ? meta.assigned_challenges.map((item) => {
    return (
      <HomeLabel
        type='warning'
        icon='fa-trophy'
        value={item.name}
        key={item.id}
      />
    )
  }) : null
  const assignToChallengeFunc = () => showAppsAssignToChallengeModal()

  return (
    <HomeLayout hideTabs>
      <div className='home-single-page'>
        <div className='home-single-page__back-buttons'>
          <Link to={`/home/apps${tab}`}>
            <Icon icon='fa-arrow-left' />&nbsp;
            Back to Apps
          </Link>
          <Link to={`/home/apps${tab}`} className='home-single-page__back-buttons_cross'>
            <Icon icon='fa-times' />
          </Link>
        </div>
        <div className='home-single-page__main-info-container'>
          <div className='home-single-page__main-info-container_item'>
            <div className='home-single-page__header-section'>
              <div className='home-single-page__header-section_left-block'>
                <div className='home-single-page__header-section_title'>
                  <Icon icon='fa-cubes' />&nbsp;
                  {app.title}
                  {meta.comparator && <HomeLabel value='Comparator' icon='fa-bullseye' type='success' />}
                  {meta.default_comparator && <HomeLabel value='Default comparator' icon='fa-bullseye' />}
                  {assignedChallenges}
                </div>
                <RevisionDropdown
                  revisions={meta.revisions}
                  revision={app.revision}
                  className='pfda-mr-t10'
                />
              </div>
              <div className='home-single-page__header-section_right-block'>
                <a href={app.links.run_job}>
                  <Button type='primary' disabled={!app.links.run_job}>
                    <>
                      {'Run App'}&nbsp;
                      <span className='badge'>rev{app.revision}</span>
                    </>
                  </Button>
                </a>
                <a href={app.links.batch_run}>
                  <Button type='primary' className='pfda-mr-r20' disabled={!app.links.batch_run}>
                    <>
                      {'Run Batch'}&nbsp;
                      <span className='badge'>rev{app.revision}</span>
                    </>
                  </Button>
                </a>
                <ActionsDropdown
                  apps={[app]}
                  copyToSpace={copyToSpace}
                  appsAttachTo={appsAttachTo}
                  comments={meta.links.comments}
                  setAsChallengeApp={meta.challenges && meta.challenges.length ? assignToChallengeFunc : null}
                  editTags={meta.links.edit_tags && showAppEditTagsModal}
                  comparisonLinks={meta.links.comparators}
                  comparisonAction={(link) => comparisonAction(link, app.dxid)}
                  deleteApps={(link, uids) => deleteApps(link, uids)}
                  page='details'
                />
              </div>
            </div>
          </div>
          <div className='home-single-page__main-info-container_item'>
            {renderAppOptions()}
          </div>
          {app.tags.length > 0 &&
            <div className='home-single-page__main-info-container_item'>
              <div className='home-single-page__main-info-container_tags-container'>
                <TagsList tags={app.tags} />
              </div>
            </div>
          }
        </div>
        <div className='pfda-padded-t40'>
          <TabsSwitch tabsConfig={tabsConfig} />
        </div>
        <AssignToChallengeModal
          isOpen={assignToChallengeModal.isOpen}
          isLoading={assignToChallengeModal.isLoading}
          challenges={meta.challenges}
          hideAction={() => hideAppsAssignToChallengeModal()}
          assignAction={(challengeId) => assignToChallenge(app.links.assign_app, challengeId, app.id)}
        />
        <HomeEditTagsModal
          isOpen={editTagsModal.isOpen}
          isLoading={editTagsModal.isLoading}
          name={app.title}
          tags={app.tags}
          showSuggestedTags
          hideAction={hideAppEditTagsModal}
          updateAction={(tags, suggestedTags) => editAppTags(`app-series-${app.appSeriesId}`, tags, suggestedTags)}
        />
      </div>
    </HomeLayout>
  )
}

HomeAppsSinglePage.propTypes = {
  appDetails: PropTypes.object,
  currentTab: PropTypes.string,
  uid: PropTypes.string,
  fetchAppDetails: PropTypes.func,
  setCurrentTab: PropTypes.func,
  copyToSpace: PropTypes.func,
  assignToChallenge: PropTypes.func,
  showAppsAssignToChallengeModal: PropTypes.func,
  hideAppsAssignToChallengeModal: PropTypes.func,
  assignToChallengeModal: PropTypes.object,
  editTagsModal: PropTypes.object,
  showAppEditTagsModal: PropTypes.func,
  hideAppEditTagsModal: PropTypes.func,
  editAppTags: PropTypes.func,
  appsAttachTo: PropTypes.func,
  comparisonAction: PropTypes.func,
  deleteApps: PropTypes.func,
}

HomeAppsSinglePage.defaultProps = {
  appDetails: {},
}

const mapStateToProps = (state) => ({
  currentTab: homeCurrentTabSelector(state),
  appDetails: homeAppsAppDetailsSelector(state),
  assignToChallengeModal: homeAppsAssignToChallengeModalSelector(state),
  editTagsModal: homeAppsEditTagsModalSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchAppDetails: (uid) => dispatch(fetchAppDetails(uid)),
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceApps(scope, ids)),
  assignToChallenge: (link, challengeId, appUid) => dispatch(assignToChallenge(link, challengeId, appUid)).then(({ status }) => {
    if (status) dispatch(fetchAppDetails(ownProps.uid))
  }),
  editAppTags: (appSeriesId, tags, suggestedTags) => dispatch(editAppTags(appSeriesId, tags, suggestedTags)).then(({ status }) => {
    if (status) dispatch(fetchAppDetails(ownProps.uid))
  }),
  comparisonAction: (link, dxid) => dispatch(comparisonAction(link, dxid)).then(({ status }) => {
    if (status === 200) dispatch(fetchAppDetails(ownProps.uid))
  }),
  deleteApps: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.APP, uids)).then(({ status, payload }) => {
    if (status) {
      const selectedTab = getSelectedTab(payload.items[0].location, payload.items[0].links.space)
      const tab = selectedTab && selectedTab !== HOME_TABS.PRIVATE ? `/${selectedTab.toLowerCase()}` : ''
      ownProps.history.push(`/home/apps${tab}`)
    }
  }),
  appsAttachTo: (items, noteUids) => dispatch(appsAttachTo(items, noteUids)),
  showAppsAssignToChallengeModal: () => dispatch(showAppsAssignToChallengeModal()),
  hideAppsAssignToChallengeModal: () => dispatch(hideAppsAssignToChallengeModal()),
  showAppEditTagsModal: () => dispatch(showAppEditTagsModal()),
  hideAppEditTagsModal: () => dispatch(hideAppEditTagsModal()),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeAppsSinglePage))

export {
  HomeAppsSinglePage,
}
