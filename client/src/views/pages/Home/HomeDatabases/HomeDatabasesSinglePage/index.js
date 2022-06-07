import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import capitalize from 'capitalize'

import HomeLayout from '../../../../layouts/HomeLayout'
import Icon from '../../../../components/Icon'
import Loader from '../../../../components/Loader'
import TagsList from '../../../../components/TagsList'
import HomeEditTagsModal from '../../../../components/Home/HomeEditTagsModal'
import {
  homeDatabaseDetailsSelector,
  homeDatabasesEditTagsModalSelector,
} from '../../../../../reducers/home/databases/selectors'
import { homeCurrentTabSelector } from '../../../../../reducers/home/page/selectors'
import {
  HOME_TABS,
  HOME_DATABASE_LABELS,
} from '../../../../../constants'
import {
  fetchDatabaseDetails,
  setCurrentTab,
  editDatabaseTags,
  showDatabaseEditTagsModal,
  hideDatabaseEditTagsModal,
  editDatabaseInfo,
  runDatabasesAction,
  // copyToSpaceDatabases,
} from '../../../../../actions/home'
import { getSelectedTab } from '../../../../../helpers/home'
import ActionsDropdown from '../../../../components/Home/Databases/ActionsDropdown'
import HomeLabel from '../../../../components/Home/HomeLabel'


const HomeDatabasesSingleDetailsPage = ({
  databaseDetails,
  currentTab,
  dxid,
  fetchDatabaseDetails,
  setCurrentTab,
  editTagsModal,
  showDatabaseEditTagsModal,
  hideDatabaseEditTagsModal,
  editDatabaseTags,
  editDatabaseInfo,
  runDatabasesAction,
  // copyToSpace,
}) => {

  useLayoutEffect(() => {
    if (dxid) fetchDatabaseDetails(dxid).then(({ status, payload }) => {
      if (status) {
        const selectedTab = getSelectedTab(capitalize(payload.db_cluster.scope_name), payload.db_cluster.links.space)
        setCurrentTab(selectedTab)
      }
    })
  }, [dxid])

  const { database, isFetching } = databaseDetails
  if (isFetching) {
    return (
      <HomeLayout hideTabs>
        <div className='text-center'>
          <Loader />
        </div>
      </HomeLayout>
    )
  }

  if (!database || !database.dxid) return <HomeLayout><span>Database not found</span></HomeLayout>

  const renderDatabaseOptions = () => {
    const columnsMain = [
      {
        header: 'location',
        value: 'scopeName',
        link: database.links.space && `${database.links.space}/databases`,
      },
      {
        header: 'id',
        value: 'dxid',
      },
      {
        header: 'added by',
        value: 'addedByFullname',
        link: database.links.user,
      },
      {
        header: 'created on',
        value: 'createdAtDateTime',
      },
    ]

    const columnsSub = [
      {
        header: 'db status',
        value: 'status',
      },
      {
        header: 'db port',
        value: 'port',
      },
      {
        header: 'engine',
        value: 'engine',
      },
      {
        header: 'version',
        value: 'version',
      },
      {
        header: 'instance',
        value: 'dxInstanceClass',
      },
    ]

    const columnsBottom = [
      {
        header: 'status updated',
        value: 'statusUpdatedDateTime',
      },
      {
        header: 'host endpoint',
        value: 'host',
      },
    ]

    const listMain = columnsMain.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        {
          (e.header === 'location' && !e.link ) ?
          <Link to={`/home/databases${tab}`} className='home-single-page__object-options_value'>{capitalize(database[e.value])}</Link>
          :
          e.link ?
            <Link to={e.link} target='_blank' className='home-single-page__object-options_value'>{database[e.value]}</Link>
            :
            <div className='home-single-page__object-options_value'>{database[e.value]}</div>
        }
      </li>
    ))
    const listSub = columnsSub.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        {
          (e.header === 'instance' || e.header === 'engine' || e.header === 'db status') ?
            <div className='home-single-page__object-options_value'>{HOME_DATABASE_LABELS[database[e.value]]}</div>
          :
            <div className='home-single-page__object-options_value'>{database[e.value]}</div>
        }
      </li>
    ))
    const listBottom = columnsBottom.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        <div className='home-single-page__object-options_value'>{database[e.value]}</div>
      </li>
    ))

    return (
      <>
        <ul className='home-single-page__object-options'>{listMain}</ul>
        <ul className='home-single-page__object-options--second-line'>{listSub}</ul>
        <ul className='home-single-page__object-options--third-line'>{listBottom}</ul>
      </>
    )
  }

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''

  return (
    <HomeLayout hideTabs={true}>
      <div className='home-single-page'>
        <div className='home-single-page__back-buttons'>
          <Link to={'/home/databases'}>
            <Icon icon='fa-arrow-left' />&nbsp;
            Back to Databases
          </Link>
          <Link to={'/home/databases'} className='home-single-page__back-buttons_cross'>
            <Icon icon='fa-times' />
          </Link>
        </div>
        <div className='home-single-page__main-info-container'>
          <div className='home-single-page__main-info-container_item'>
            <div className='home-single-page__header-section'>
              <div className='home-single-page__header-section_left-block'>
                <div className='home-single-page__header-section_title'>
                  <Icon icon='fa-cubes' />&nbsp;
                  {database.name}
                  {database.showLicensePending && <HomeLabel value='License Pending Approval' icon='fa-clock-o' type='warning'/>}
                </div>
                <div className='home-single-page__header-section_description'>{database.description ? database.description : 'This database has no description.'}</div>
              </div>
              <div className='home-single-page__header-section_right-block'>
                <ActionsDropdown
                  databases={[database]}
                  editDatabaseInfo={editDatabaseInfo}
                  runDatabasesAction={runDatabasesAction}
                  editTags={showDatabaseEditTagsModal}
                  page='details'
                  // copyToSpace={copyToSpace}
                />
              </div>
            </div>
          </div>
          <div className='home-single-page__main-info-container_item'>
            {renderDatabaseOptions()}
          </div>
          {database.tags.length > 0 &&
            <div className='home-single-page__main-info-container_item'>
              <div className='home-single-page__main-info-container_tags-container'>
                <TagsList tags={database.tags} />
              </div>
            </div>
          }
        </div>
        <HomeEditTagsModal
          isOpen={editTagsModal.isOpen}
          isLoading={editTagsModal.isLoading}
          name={database.name}
          tags={database.tags}
          showSuggestedTags
          hideAction={hideDatabaseEditTagsModal}
          updateAction={(tags, suggestedTags) => editDatabaseTags(database.uid, tags, suggestedTags)}
        />
      </div>
    </HomeLayout>
  )
}

HomeDatabasesSingleDetailsPage.propTypes = {
  databaseDetails: PropTypes.object,
  currentTab: PropTypes.string,
  dxid: PropTypes.string,
  fetchDatabaseDetails: PropTypes.func,
  setCurrentTab: PropTypes.func,
  editTagsModal: PropTypes.object,
  showDatabaseEditTagsModal: PropTypes.func,
  hideDatabaseEditTagsModal: PropTypes.func,
  editDatabaseTags: PropTypes.func,
  editDatabaseInfo: PropTypes.func,
  runDatabasesAction: PropTypes.func,
  // copyToSpace: PropTypes.func,
}

HomeDatabasesSingleDetailsPage.defaultProps = {
  databaseDetails: {},
}

const mapStateToProps = (state) => ({
  currentTab: homeCurrentTabSelector(state),
  databaseDetails: homeDatabaseDetailsSelector(state),
  editTagsModal: homeDatabasesEditTagsModalSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchDatabaseDetails: (dxid) => dispatch(fetchDatabaseDetails(dxid)),
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
  editDatabaseTags: (uid, tags, suggestedTags) => dispatch(editDatabaseTags(uid, tags, suggestedTags)).then(({ status }) => {
    if (status) dispatch(fetchDatabaseDetails(ownProps.dxid))
  }),
  showDatabaseEditTagsModal: () => dispatch(showDatabaseEditTagsModal()),
  hideDatabaseEditTagsModal: () => dispatch(hideDatabaseEditTagsModal()),
  editDatabaseInfo: (link, name, description, type, folder) => dispatch(editDatabaseInfo(link, name, description, type, folder)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchDatabaseDetails(ownProps.dxid))
  }),
  runDatabasesAction: (link, api_method, dxids) => dispatch(runDatabasesAction(link, api_method, dxids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchDatabaseDetails(ownProps.dxid))
  }),
  // copyToSpace: (scopeName, ids) => dispatch(copyToSpaceDatabases(scopeName, ids)),
})

export const HomeDatabasesSinglePage = connect(mapStateToProps, mapDispatchToProps)(HomeDatabasesSingleDetailsPage)
