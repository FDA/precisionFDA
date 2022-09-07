import React, { Fragment, useState, useCallback, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'

import { HomeJobShape, HomeWorkflowShape } from '../../../../shapes/HomeJobShape'
import Loader from '../../../Loader'
import {
  homeWorkflowsWorkflowExecutionsSelector,
  homeWorkflowsWorkflowExecutionsIsExpandedAllSelector,
  homeWorkflowsWorkflowExecutionsFiltersSelector,
} from '../../../../../reducers/home/workflows/selectors'
import {
  fetchWorkflowExecutions,
  resetWorkflowExecutionsFiltersValue,
  setWorkflowExecutionsFilterValue,
} from '../../../../../actions/home'
import {
  expandExecution,
  expandAllExecutions,
} from '../../../../../actions/home/workflows'
import { getOrder, convertSecondsToDhms } from '../../../../../helpers'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { debounce } from '../../../../../utils'
import './styles.sass'


const HomeWorkflowExecutionsTable = ({ uid, workflowExecutions, resetWorkflowExecutionsFiltersValue, fetchWorkflowExecutions, setWorkflowExecutionsFilterValue, isExpandedAll, expandExecution, expandAllExecutions, space }) => {
  useLayoutEffect(() => {
    if (uid) {
      resetWorkflowExecutionsFiltersValue()
      fetchWorkflowExecutions(uid)
    }
  }, [uid])

  const handleFilterValue = (value) => {
    setWorkflowExecutionsFilterValue(value)
    fetchWorkflowExecutions(uid)
  }

  const { isFetching, jobs, filters } = workflowExecutions
  const { sortType, sortDirection, currentPage, nextPage, prevPage, totalPages, totalCount, fields } = filters

  const [fieldsSearch, setFieldsSearch] = useState(fields)
  const deboFields = useCallback(debounce((value) => handleFilterValue({ fields: value, currentPage: 1 }), 400), [])

  const pagination = {
    currentPage,
    nextPage,
    prevPage,
    totalPages,
  }

  const sortWorkflowsHandler = (newType) => {
    const { type, direction } = getOrder(sortType, newType, sortDirection)
    handleFilterValue({
      sortType: type,
      sortDirection: direction,
    })
  }

  const onChangeFieldsValue = (fields) => {
    setFieldsSearch(new Map(fields))
    deboFields(fields)
  }

  const workflowSpaceUri = () => {
    if (jobs && jobs[0] && jobs[0].inSpace) {
      return jobs[0].links.space + '/workflows'
    } else {
      return ''
    }
  }

  const caretClasses = 'fa-caret-up'
    classNames({
    'fa-caret-up': isExpandedAll,
    'fa-caret-down': !isExpandedAll,
  }, 'home-page-layout__data-table_checkbox')

  const WorkflowExecutionsRows = ({ jobs }) => {
    if (jobs && jobs.length) {
      return jobs.map((job, i) => {
        if (!job.isWorkflow) {
          return (
            <Row job={job} key={job.uid} idx={i} space={workflowSpaceUri()} />
          )
        } else {
          return (
            <Fragment key={job.uid + i}>
              <WorkflowRow
                idx={i}
                execution={job}
                expandExecution={expandExecution}
              />
              {job.isExpanded &&
                  job.executions.map((e) => {
                    return <Row job={e} key={e.id} idx={i} isWorkflowExecution />
                  })
              }
            </Fragment>
          )
        }
      })
    } else {
      return null
    }
  }

  const loader = isFetching ? <div className='text-center pfda-loader'> <Loader /> </div> : null
  const executions = <WorkflowExecutionsRows jobs={jobs} />
  const tableFilters = <FilterRow
    fieldsSearch={fieldsSearch}
    onChangeFieldsValue={onChangeFieldsValue}
    space={space}
  />

  const executionsList = isFetching ? null : executions

  return (
    <div>
      <div className='home-page-layout__data-table'>
        <div className='home-page-layout__table-wrapper'>
          <Table>
            <Thead>
              <th className="pfda-padded-l10">
                <Icon onClick={expandAllExecutions} icon={caretClasses} />
              </th>
              <Th>state</Th>
              <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='name'>name</Th>
              <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='apptitle'>app name</Th>
              <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='username'>launched by</Th>
              {space && <Th>location</Th>}
              <Th>instance type</Th>
              <Th>duration</Th>
              <Th>energy</Th>
              <Th
                sortType={sortType}
                sortDir={sortDirection}
                sortHandler={sortWorkflowsHandler}
                type='created_at'
              >
                launched on
              </Th>
            </Thead>
            <Tbody>
              <>
                {tableFilters}
                {executionsList}
              </>
            </Tbody>
          </Table>
        </div>
        {jobs && jobs.length > 0 ?
          <Counters
            currentPage={currentPage}
            nextPage={nextPage}
            totalPages={totalPages}
            totalCount={totalCount}
            count={jobs.length}
          /> : null }

        {!isFetching && jobs && jobs.length == 0 ?
          <div className='pfda-padded-t20 text-center'>No executions found.</div> : null
        }
        <div className='pfda-padded-t20'>
          <Pagination
            data={pagination}
            setPageHandler={(page) => handleFilterValue({ currentPage: page })}
          />
        </div>
      </div>
      {loader}
    </div>
  )
}

const Row = ({ job, idx }) => {
  const rowClass = idx % 2 === 0 ? 'pfda-table-components__even-row' : ''
  const jobUri = '/home' + (job.links && job.links.show)

  return (
    <tr className={rowClass}>
      <td style={{ width: 40 }}>
      </td>
      <td style={{ minWidth: 100 }} className={`col-state__state-${job.state}`}>{job.state}</td>
      <td className='home-page-layout__data-table_title'>
        <Link to={jobUri}>
          <Icon icon={getSpacesIcon('jobs')} fw />
          <span>{job.name}</span>
        </Link>
      </td>
      <td>
        {job.links.workflow === 'N/A' ?
          <span>N/A</span> :
          <Link to={`/home${job.links && job.links.app}`}>
            <Icon icon={getSpacesIcon('apps')} fw />
            <span>{job.appTitle}</span>
          </Link>
        }
      </td>
      <td className='home-page-layout__data-table_full-name'>
        <a href={job.links && job.links.user}>
          <span>{job.launchedBy}</span>
        </a>
      </td>
      {job.links.space && <td></td>}
      <td>{job.instanceType}</td>
      <td>{job.duration}</td>
      <td>{job.energyConsumption}</td>
      <td>{job.createdAtDateTime}</td>
    </tr>
  )
}


const FilterRow = ({ fieldsSearch, onChangeFieldsValue, space }) => {
  const filtersConfig = ['', 'state', 'workflow_title', 'app_title', 'launched_by', 'instance_type', 'duration', 'energy_consumption', '']

  if (space && space.length > 0) filtersConfig.splice(5, 0, 'location')

  const filters = filtersConfig.map((filter, i) => {
    if (!filter) return <td key={i}></td>

    return (
      <td key={i}>
        <Input
          name={filter}
          placeholder='--'
          value={fieldsSearch.get(filter) || ''}
          autoComplete='off'
          onChange={(e) => {
            onChangeFieldsValue(fieldsSearch.set(filter, e.target.value))
          }}
        />
      </td>
    )
  })

  return (
    <tr>
      {filters}
    </tr>
  )
}

const WorkflowRow = ({ execution, expandExecution, idx }) => {

  const caretClasses = classNames({
    'fa-caret-up': execution.isExpanded,
    'fa-caret-down': !execution.isExpanded,
  }, 'home-page-layout__data-table_checkbox')

  const links = execution.links || {}
  const linkWorkflow = links ? `/home${execution.links.show}` : null
  const spaceLocation = execution.workflow_uid === 'N/A' ? 'jobs' : 'workflows'

  return (
    <tr className={idx%2 === 0 ? 'pfda-table-components__even-row' : ''}>
      <td style={{ width: 40 }}>
        <Icon
          icon={caretClasses}
          onClick={() => expandExecution(execution.key)
          }
        />
      </td>
      <td className={`col-state__state-${execution.state}`}>{execution.state}</td>
      <td>
        <Link to={linkWorkflow}>
          <Icon icon={getSpacesIcon('workflows')} fw />
          <span>{execution.workflowTitle}</span>
        </Link>
      </td>
      <td></td>
      <td>
        <a href={links.user}>
          <span>{execution.addedBy}</span>
        </a>
      </td>
      {execution.links.space &&
        <td>
          <Link to={`${execution.links && execution.links.space}/${spaceLocation}`} target='_blank'>
            <Icon icon={getSpacesIcon('space')} fw />
            <span>{execution.jobs[0].location}</span>
          </Link>
        </td>
      }
      <td></td>
      <td>{convertSecondsToDhms(execution.duration)}</td>
      <td>{execution.energy}</td>
      <td>{execution.launchedOn}</td>
    </tr>
  )
}

HomeWorkflowExecutionsTable.propTypes = {
  jobs: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ])),
  isFetching: PropTypes.bool,
  isExpandedAll: PropTypes.bool,
  filters: PropTypes.object,
  setAppFilterValue: PropTypes.func,
  expandAllExecutions: PropTypes.func,
  expandExecution: PropTypes.func,
  handleFilterValue: PropTypes.func,
  workflowExecutions: PropTypes.object,
  fetchWorkflowExecutions: PropTypes.func,
  resetWorkflowExecutionsFiltersValue: PropTypes.func,
  setWorkflowExecutionsFilterValue: PropTypes.func,
  uid: PropTypes.string,
  space: PropTypes.string,
}

HomeWorkflowExecutionsTable.defaultProps = {
  workflowExecutions: {
    jobs: [],
    filters: {},
  },
}

Row.propTypes = {
  job: PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ]),
  isWorkflowExecution: PropTypes.bool,
  idx: PropTypes.number,
}

FilterRow.propTypes = {
  fieldsSearch: PropTypes.object,
  onChangeFieldsValue: PropTypes.func,
  space: PropTypes.string,
}

WorkflowRow.propTypes = {
  execution: PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ]),
  idx: PropTypes.number,
  expandExecution: PropTypes.func,
}
const mapStateToProps = (state) => ({
  workflowExecutions: homeWorkflowsWorkflowExecutionsSelector(state),
  isExpandedAll: homeWorkflowsWorkflowExecutionsIsExpandedAllSelector(state),
  filters: homeWorkflowsWorkflowExecutionsFiltersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchWorkflowExecutions: (uid) => dispatch(fetchWorkflowExecutions(uid)),
  resetWorkflowExecutionsFiltersValue: () => dispatch(resetWorkflowExecutionsFiltersValue()),
  setWorkflowExecutionsFilterValue: (value) => dispatch(setWorkflowExecutionsFilterValue(value)),
  expandExecution: (key) => dispatch(expandExecution(key)),
  expandAllExecutions: () => dispatch(expandAllExecutions()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowExecutionsTable)

export {
  HomeWorkflowExecutionsTable,
}
