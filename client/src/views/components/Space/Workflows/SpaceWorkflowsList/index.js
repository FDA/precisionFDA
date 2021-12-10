import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import WorkflowShape from '../../../../shapes/WorkflowShape'
import PaginationShape from '../../../../shapes/PaginationShape'
import Loader from '../../../Loader'
import {
  spaceWorkflowsListIsFetchingSelector,
  spaceWorkflowsListSortTypeSelector,
  spaceWorkflowsListSortDirectionSelector,
  spaceWorkflowsCheckedAllSelector,
  spaceWorkflowsListPaginationSelector,
} from '../../../../../reducers/spaces/workflows/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  fetchWorkflows,
  sortWorkflows,
  toggleWorkflowCheckbox,
  toggleAllWorkflowCheckboxes,
  setWorkflowsCurrentPageValue,
} from '../../../../../actions/spaces'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Icon from '../../../Icon'
import './style.sass'
import LinkTargetBlank from '../../../LinkTargetBlank'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import Counters from '../../../TableComponents/Counters'
import Pagination from '../../../TableComponents/Pagination'
import TagsList from '../../../TagsList'


const SpaceWorkflowsList = ({ spaceId, workflows, isFetching, sortType, sortDir, sortHandler, toggleCheckbox, toggleAllCheckboxes, isCheckedAll, pagination, pageHandler }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'space-workflows-list__checkbox')

  const { currentPage, nextPage, totalPages, totalCount } = pagination

  const sortWorkflowsHandler = (type) => sortHandler(spaceId, type)
  const pageWorkflowsHandler = (value) => pageHandler(spaceId, value)

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (workflows.length) {
    return (
      <div className="space-workflows-list">
        <div className='space-page-layout__list-wrapper  shared_area_workflows'>
          <Table>
            <Thead>
              <th className="pfda-padded-l10">
                <Icon onClick={toggleAllCheckboxes} icon={checkboxClasses} />
              </th>
              <Th sortType={sortType} sortDir={sortDir} type='name' sortHandler={sortWorkflowsHandler}>name</Th>
              <Th sortType={sortType} sortDir={sortDir} type='added_by' sortHandler={sortWorkflowsHandler}>ADDED BY</Th>
              <Th sortType={sortType} sortDir={sortDir} type='created_at' sortHandler={sortWorkflowsHandler}>CREATED</Th>
              <Th sortType={sortType} sortDir={sortDir} type='tags' sortHandler={sortWorkflowsHandler}>tags</Th>
            </Thead>
            <Tbody>
              {workflows.map((workflow) => <Row workflow={workflow} key={workflow.id} toggleCheckbox={toggleCheckbox} />)}
            </Tbody>
          </Table>
        </div>
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={workflows.length}
        />
        <div className='pfda-padded-t20'>
          <Pagination data={pagination} setPageHandler={pageWorkflowsHandler} />
        </div>
      </div>
    )
  }

  return <div className='text-center'>No workflows found.</div>
}

const Row = ({ workflow, toggleCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !workflow.isChecked,
    'fa-check-square-o': workflow.isChecked,
  }, 'space-workflows-list__checkbox')

  const toggleHandler = () => toggleCheckbox(workflow.id)
  const linkShow = workflow.links.show ? `/home${workflow.links.show}` : null

  return (
    <tr>
      <td>
        <Icon icon={checkboxClasses} onClick={toggleHandler} />
      </td>
      <td>
        <a href={linkShow} target='_blank' rel='noopener noreferrer' aria-label={`Click this link to view the workflow ${workflow.name} in a new tab`}>
          <Icon icon={getSpacesIcon('workflows')} fw />
          <span>{workflow.name}</span>
        </a>
      </td>
      <td>
        <LinkTargetBlank url={workflow.links.user}>
          <span>{workflow.addedBy}</span>
        </LinkTargetBlank>
      </td>
      <td>{workflow.createdAt}</td>
      <td><TagsList tags={workflow.tags} /></td>
    </tr>
  )
}

SpaceWorkflowsList.propTypes = {
  spaceId: PropTypes.number.isRequired,
  workflows: PropTypes.arrayOf(PropTypes.exact(WorkflowShape)),
  isFetching: PropTypes.bool,
  isCheckedAll: PropTypes.bool,
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  sortHandler: PropTypes.func,
  toggleCheckbox: PropTypes.func,
  toggleAllCheckboxes: PropTypes.func,
  pagination: PropTypes.exact(PaginationShape),
  pageHandler: PropTypes.func,
}

SpaceWorkflowsList.defaultProps = {
  workflows: [],
  sortHandler: () => { },
  toggleCheckbox: () => { },
  toggleAllCheckboxes: () => { },
  pagination: {},
}

Row.propTypes = {
  workflow: PropTypes.exact(WorkflowShape),
  toggleCheckbox: PropTypes.func,
}

const mapStateToProps = state => ({
  isFetching: spaceWorkflowsListIsFetchingSelector(state),
  sortType: spaceWorkflowsListSortTypeSelector(state),
  sortDir: spaceWorkflowsListSortDirectionSelector(state),
  spaceId: spaceDataSelector(state).id,
  isCheckedAll: spaceWorkflowsCheckedAllSelector(state),
  pagination: spaceWorkflowsListPaginationSelector(state),
})

const mapDispatchToProps = dispatch => ({
  sortHandler: (spaceId, type) => {
    dispatch(sortWorkflows(type))
    dispatch(fetchWorkflows(spaceId))
  },
  pageHandler: (spaceId, value) => {
    dispatch(setWorkflowsCurrentPageValue(value))
    dispatch(fetchWorkflows(spaceId))
  },
  toggleCheckbox: (id) => dispatch(toggleWorkflowCheckbox(id)),
  toggleAllCheckboxes: () => dispatch(toggleAllWorkflowCheckboxes()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceWorkflowsList)

export {
  SpaceWorkflowsList,
}
