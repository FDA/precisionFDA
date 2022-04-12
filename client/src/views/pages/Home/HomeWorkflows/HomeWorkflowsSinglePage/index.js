import React, { useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import HomeLayout from '../../../../layouts/HomeLayout'
import Icon from '../../../../components/Icon'
import Button from '../../../../components/Button'
import RevisionDropdown from '../../../../components/Home/Workflows/RevisionDropdown'
import HomeWorkflowsSpec from '../../../../components/Home/Workflows/HomeWorkflowsSpec'
import TabsSwitch from '../../../../components/TabsSwitch'
import Loader from '../../../../components/Loader'
import TagsList from '../../../../components/TagsList'
import HomeEditTagsModal from '../../../../components/Home/HomeEditTagsModal'
import HomeWorkflowExecutionsTable from '../../../../components/Home/Workflows/HomeWorkflowsExecutionsTable'
import {
  homeWorkflowsWorkflowDetailsSelector,
  homeWorkflowsEditTagsModalSelector,
} from '../../../../../reducers/home/workflows/selectors'
import { homeCurrentTabSelector } from '../../../../../reducers/home/page/selectors'
import { HOME_TABS } from '../../../../../constants'
import {
  fetchWorkflowDetails,
  setCurrentTab,
  copyToSpaceWorkflows,
  editWorkflowTags,
  showWorkflowEditTagsModal,
  hideWorkflowEditTagsModal,
  deleteObjects,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import { getSelectedTab } from '../../../../../helpers/home'
import ActionsDropdown from '../../../../components/Home/Workflows/ActionsDropdown'
import HomeWorkflowsDiagram from '../../../../components/Home/Workflows/HomeWorkflowsDiagram'
import Markdown from '../../../../components/Markdown'


const HomeWorkflowsSinglePage = (props) => {
  const { workflowDetails, currentTab, uid, fetchWorkflowDetails, setCurrentTab, copyToSpace, deleteWorkflows } = props
  const { editTagsModal, showWorkflowEditTagsModal, hideWorkflowEditTagsModal, editWorkflowTags } = props

  useLayoutEffect(() => {
    if (uid) fetchWorkflowDetails(uid).then(({ status, payload }) => {
      if (status) {
        const selectedTab = getSelectedTab(payload.workflow.location, payload.workflow.links.space)
        setCurrentTab(selectedTab)
      }
    })
  }, [uid])

  const { workflow, meta, isFetching } = workflowDetails

  if (isFetching) {
    return (
      <HomeLayout hideTabs>
        <div className='text-center'>
          <Loader />
        </div>
      </HomeLayout>
    )
  }

  if (!workflow || !workflow.id) return <HomeLayout><span>Workflow not found</span></HomeLayout>

  const renderWorkflowOptions = () => {
    const columns = [
      {
        header: 'location',
        value: 'location',
        link: workflow.links.space && `${workflow.links.space}/workflows`,
      },
      {
        header: 'name',
        value: 'name',
      },
      {
        header: 'id',
        value: 'uid',
      },
      {
        header: 'added by',
        value: 'addedBy',
        link: workflow.links.user,
      },
      {
        header: 'created on',
        value: 'createdAt',
      },
    ]

    const list = columns.map((e) => (
      <li key={e.header}>
        <div className='home-single-page__object-options_header'>{e.header}</div>
        {
          (e.header === 'location' && !e.link ) ?
          <Link to={`/home/workflows${tab}`} className='home-single-page__object-options_value'>{workflow[e.value]}</Link>
          :
          e.link ?
            <Link
              to={e.link}
              target='_blank'
              className='home-single-page__object-options_value'
            >
              {workflow[e.value]}
            </Link> :
            <div className='home-single-page__object-options_value'>{workflow[e.value]}</div>
        }
      </li>
    ))

    return <ul className='home-single-page__object-options'>{list}</ul>
  }

  const tabsConfig = [
    {
      header: 'Spec',
      tab: <HomeWorkflowsSpec spec={meta.spec} />,
    },
    {
      header: `Executions (${Object.keys(meta.executions).length})`,
      tab: <HomeWorkflowExecutionsTable
        uid={uid}
        space={workflow.links.space && workflow.location}
      />,
    },
    {
      header: 'Diagram',
      tab: <HomeWorkflowsDiagram uid={workflow.uid}/>,
    },
    {
      header: 'Readme',
      tab: <Markdown data={workflow.readme}/>,
    },
  ]

  const tab = currentTab && currentTab !== HOME_TABS.PRIVATE ? `/${currentTab.toLowerCase()}` : ''
  const workflowTitle = workflow.title ? workflow.title : workflow.name

  return (
    <HomeLayout hideTabs>
      <div className='home-single-page'>
        <div className='home-single-page__back-buttons'>
          <Link to={`/home/workflows${tab}`}>
            <Icon icon='fa-arrow-left' />&nbsp;
            Back to Workflows
          </Link>
          <Link to={`/home/workflows${tab}`} className='home-single-page__back-buttons_cross'>
            <Icon icon='fa-times' />
          </Link>
        </div>
        <div className='home-single-page__main-info-container'>
          <div className='home-single-page__main-info-container_item'>
            <div className='home-single-page__header-section'>
              <div className='home-single-page__header-section_left-block'>
                <div className='home-single-page__header-section_title'>
                  <Icon icon='fa-flash' />&nbsp;
                  {workflowTitle}
                </div>
                <RevisionDropdown
                  revisions={meta.revisions}
                  revision={workflow.revision}
                  className='pfda-mr-t10'
                />
              </div>
              <div className='home-single-page__header-section_right-block'>
                <a href={`${workflow.links.show}/analyses/new`}>
                  <Button type='primary'>
                    <>
                      {'Run Workflow'}&nbsp;
                      <span className='badge'>rev{workflow.revision}</span>
                    </>
                  </Button>
                </a>
                <a href={workflow.links.batch_run_workflow}>
                  <Button type='primary' className='pfda-mr-r20'>
                    <>
                      {'Run Batch Workflow'}&nbsp;
                      <span className='badge'>rev{workflow.revision}</span>
                    </>
                  </Button>
                </a>
                <ActionsDropdown
                  workflows={[workflow]}
                  copyToSpace={copyToSpace}
                  comments={meta.links.comments}
                  deleteWorkflows={(link, uids) => deleteWorkflows(link, uids)}
                  editTags={meta.links.edit_tags && showWorkflowEditTagsModal}
                  page='details'
                />
              </div>
            </div>
          </div>
          <div className='home-single-page__main-info-container_item'>
            {renderWorkflowOptions()}
          </div>
          {workflow.tags.length > 0 &&
            <div className='home-single-page__main-info-container_item'>
              <div className='home-single-page__main-info-container_tags-container'>
                <TagsList tags={workflow.tags} />
              </div>
            </div>
          }
        </div>
        <div className='pfda-padded-t40'>
          <TabsSwitch tabsConfig={tabsConfig} />
        </div>
        <HomeEditTagsModal
          isOpen={editTagsModal.isOpen}
          isLoading={editTagsModal.isLoading}
          name={workflow.title}
          tags={workflow.tags}
          showSuggestedTags
          hideAction={hideWorkflowEditTagsModal}
          updateAction={(tags, suggestedTags) => {
            editWorkflowTags(workflow.links.set_tags_target, tags, suggestedTags)
          }}
        />
      </div>
    </HomeLayout>
  )
}

HomeWorkflowsSinglePage.propTypes = {
  workflowDetails: PropTypes.object,
  currentTab: PropTypes.string,
  uid: PropTypes.string,
  fetchWorkflowDetails: PropTypes.func,
  setCurrentTab: PropTypes.func,
  copyToSpace: PropTypes.func,
  assignToChallenge: PropTypes.func,
  assignToChallengeModal: PropTypes.object,
  editTagsModal: PropTypes.object,
  showWorkflowEditTagsModal: PropTypes.func,
  hideWorkflowEditTagsModal: PropTypes.func,
  editWorkflowTags: PropTypes.func,
  workflowsAttachTo: PropTypes.func,
  comparisonAction: PropTypes.func,
  deleteWorkflows: PropTypes.func,
}

HomeWorkflowsSinglePage.defaultProps = {
  workflowDetails: {},
}

const mapStateToProps = (state) => ({
  currentTab: homeCurrentTabSelector(state),
  workflowDetails: homeWorkflowsWorkflowDetailsSelector(state),
  editTagsModal: homeWorkflowsEditTagsModalSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchWorkflowDetails: (uid) => dispatch(fetchWorkflowDetails(uid)),
  setCurrentTab: (tab) => dispatch(setCurrentTab(tab)),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceWorkflows(scope, ids)),
  editWorkflowTags: (workflowSeriesId, tags, suggestedTags) => dispatch(editWorkflowTags(workflowSeriesId, tags, suggestedTags)).then(({ status }) => {
    if (status) dispatch(fetchWorkflowDetails(ownProps.uid))
  }),
  deleteWorkflows: (link, uids) => dispatch(deleteObjects(link, OBJECT_TYPES.WORKFLOW, uids)).then(({ status, payload }) => {
    if (status) {
      const selectedTab = getSelectedTab(payload.items[0].location, payload.items[0].links.space)
      const tab = selectedTab && selectedTab !== HOME_TABS.PRIVATE ? `/${selectedTab.toLowerCase()}` : ''
      ownProps.history.push(`/home/workflows${tab}`)
    }
  }),
  showWorkflowEditTagsModal: () => dispatch(showWorkflowEditTagsModal()),
  hideWorkflowEditTagsModal: () => dispatch(hideWorkflowEditTagsModal()),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsSinglePage))

export {
  HomeWorkflowsSinglePage,
}
