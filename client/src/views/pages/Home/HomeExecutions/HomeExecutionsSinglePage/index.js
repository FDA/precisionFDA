import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeLayout from '../../../../layouts/HomeLayout'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import TabsSwitch from '../../../../components/TabsSwitch'
import Loader from '../../../../components/Loader'
import TagsList from '../../../../components/TagsList'
import HomeLabel from '../../../../components/Home/HomeLabel'
import HomeExecutionInputsOutputs from '../../../../components/Home/Executions/HomeExecutionInputsOutputs'
import ActionsDropdown from '../../../../components/Home/Executions/ActionsDropdown'
import {
  homeExecutionsDetailsSelector,
} from '../../../../../reducers/home/executions/selectors'
import { homeCurrentTabSelector } from '../../../../../reducers/home/page/selectors'
import { HOME_TABS } from '../../../../../constants'
import {
  fetchExecutionDetails,
  setCurrentTab,
  copyToSpaceExecutions,
  executionsAttachTo,
  terminateExecutions,
  editExecutionTags,
} from '../../../../../actions/home'
import { getSelectedTab } from '../../../../../helpers/home'


const HomeExecutionsSinglePage = (props) => {
  const { currentTab, uid, fetchExecutionDetails, executionDetails = {}, setCurrentTab, copyToSpace, attachTo, terminateExecutions, editTags } = props

  useLayoutEffect(() => {
    if (uid) fetchExecutionDetails(uid).then(({ status, payload }) => {
      if (status) {
        const selectedTab = getSelectedTab(payload.job.location, payload.job.links.space)
        setCurrentTab(selectedTab)
      }
    })
  }, [uid])

  const { execution, isFetching, meta } = executionDetails

  if (isFetching) {
    return (
      <HomeLayout hideTabs>
        <div className='text-center'>
          <Loader />
        </div>
      </HomeLayout>
    )
  }

  if (!execution || !execution.id) return <HomeLayout><span>Execution not found</span></HomeLayout>

  const renderAppOptions = () => {
    const firstColumns = [
      {
        header: 'location',
        value: 'location',
        link: execution.links.space && `${execution.links.space}/jobs`,
      },
      {
        header: 'app',
        value: 'appTitle',
        link: `/home${execution.links.app}`,
      },
      {
        header: 'id',
        value: 'uid',
      },
      {
        header: 'launched by',
        value: 'launchedBy',
        link: execution.links.user,
      },
      {
        header: 'created on',
        value: 'createdAtDateTime',
      },
      {
        header: 'instance type',
        value: 'instanceType',
      },
    ]

    const secondColumns = [
      {
        header: 'duration',
        value: 'duration',
      },
      {
        header: 'energy consumed',
        value: 'energyConsumption',
      },
      {
        header: 'app revision',
        value: 'appRevision',
      },
    ]

    const mapToColumns = (e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        {
          (e.header === 'location' && !e.link ) ?
            <Link to={`/home/jobs${tab}`} className='home-single-page__object-options_value'>{execution[e.value]}</Link>
            :
            e.link ?
              <Link to={e.link} target='_blank' className='home-single-page__object-options_value'>{execution[e.value]}</Link> :
              <div className='home-single-page__object-options_value'>{execution[e.value]}</div>}
      </li>
    )

    const firstList = firstColumns.map(mapToColumns)
    const secondList = secondColumns.map(mapToColumns)

    return <>
      <div className='home-single-page__main-info-container_item'>
        <ul className='home-single-page__object-options'>{firstList}</ul>
      </div>
      <div className='home-single-page__main-info-container_item'>
        <ul className='home-single-page__object-options home-single-page__object-options--second-line'>{secondList}</ul>
      </div>
    </>
  }

  const tabsConfig = [
    {
      header: 'Inputs and Outputs',
      tab:
        <div className='pfda-padded-t20'>
          <HomeExecutionInputsOutputs
            runInputData={execution.runInputData}
            runOutputData={execution.runOutputData}
          />
        </div>,
    },
  ]

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''

  return (
    <HomeLayout hideTabs>
      <div className='home-single-page'>
        <div className='home-single-page__back-buttons'>
          <Link to={`/home/jobs${tab}`}>
            <Icon icon='fa-arrow-left' />&nbsp;
            Back to Executions
          </Link>
          <Link to={`/home/jobs${tab}`} className='home-single-page__back-buttons_cross'>
            <Icon icon='fa-times' />
          </Link>
        </div>
        <div className='home-single-page__main-info-container'>
          <div className='home-single-page__main-info-container_item'>
            <div className='home-single-page__header-section'>
              <div className='home-single-page__header-section_left-block'>
                <div className='home-single-page__header-section_title'>
                  <Icon icon='fa-tasks' />
                  <HomeLabel value={execution.state} state={execution.state} style={{ textTransform: 'uppercase' }} />&nbsp;
                  {execution.name}
                </div>
              </div>
              <div className='home-single-page__header-section_right-block'>
                <a href={execution.links.run_job} className='pfda-mr-r20'>
                  <Button type='primary'>Re-Run Execution</Button>
                </a>
                <ActionsDropdown
                  executions={[execution]}
                  page='details'
                  copyToSpace={copyToSpace}
                  attachTo={attachTo}
                  terminateExecutions={terminateExecutions}
                  comments={meta.links.comments}
                  editTags={meta.links.edit_tags && editTags}
                />
              </div>
            </div>
          </div>
          {renderAppOptions()}
          {execution.tags.length > 0 &&
            <div className='home-single-page__main-info-container_item'>
              <div className='home-single-page__main-info-container_tags-container'>
                <TagsList tags={execution.tags} />
              </div>
            </div>
          }
        </div>
        <div className='pfda-padded-t40'>
          <TabsSwitch tabsConfig={tabsConfig} />
        </div>
      </div>
    </HomeLayout>
  )
}

HomeExecutionsSinglePage.propTypes = {
  uid: PropTypes.string,
  fetchExecutionDetails: PropTypes.func,
  currentTab: PropTypes.string,
  executionDetails: PropTypes.object,
  setCurrentTab: PropTypes.func,
  copyToSpace: PropTypes.func,
  attachTo: PropTypes.func,
  terminateExecutions: PropTypes.func,
  editTags: PropTypes.func,
}

HomeExecutionsSinglePage.defaultProps = {
  appDetails: {},
}

const mapStateToProps = (state) => ({
  executionDetails: homeExecutionsDetailsSelector(state),
  currentTab: homeCurrentTabSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchExecutionDetails: (uid) => dispatch(fetchExecutionDetails(uid)),
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceExecutions(scope, ids)),
  attachTo: (items, noteUids) => dispatch(executionsAttachTo(items, noteUids)),
  terminateExecutions: (link, ids) => dispatch(terminateExecutions(link, ids)).then(({ status }) => {
    if (status) dispatch(fetchExecutionDetails(ownProps.uid))
  }),
  editTags: (uid, tags, suggestedTags) => dispatch(editExecutionTags(uid, tags, suggestedTags)).then(({ status }) => {
    if (status) dispatch(fetchExecutionDetails(ownProps.uid))
  }),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeExecutionsSinglePage)

export {
  HomeExecutionsSinglePage,
}
