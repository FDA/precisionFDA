import React, { useState, useCallback, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { HomeJobShape, HomeWorkflowShape } from '../../../../shapes/HomeJobShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeAppsAppExecutionsSelector,
} from '../../../../../reducers/home/apps/selectors'
import {
  fetchAppExecutions,
  resetAppExecutionsFiltersValue,
  setAppExecutionsFilterValue,
} from '../../../../../actions/home'
import { getOrder } from '../../../../../helpers'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { debounce } from '../../../../../utils'


const HomeAppsExecutionsTable = ({ uid, appExecutions, resetAppExecutionsFiltersValue, fetchAppExecutions, setAppExecutionsFilterValue, space }) => {
  useLayoutEffect(() => {
    if (uid) {
      resetAppExecutionsFiltersValue()
      fetchAppExecutions(uid)
    }
  }, [uid])

  const handleFilterValue = (value) => {
    setAppExecutionsFilterValue(value)
    fetchAppExecutions(uid)
  }
  
  const { isFetching, jobs, filters } = appExecutions
  const { sortType, sortDirection, currentPage, nextPage, prevPage, totalPages, totalCount, fields } = filters

  const [fieldsSearch, setFieldsSearch] = useState(fields)
  const deboFields = useCallback(debounce((value) => handleFilterValue({ fields: value, currentPage: 1 }), 400), [])

  const pagination = {
    currentPage,
    nextPage,
    prevPage,
    totalPages,
  }

  const sortAppsHandler = (newType) => {
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

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='home-page-layout__data-table'>
      <div className='home-page-layout__table-wrapper'>
        <Table>
          <Thead>
            <Th>state</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='workflow'>workflow</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='username'>launched by</Th>
            {space && <Th>location</Th>}
            <Th>instance type</Th>
            <Th>duration</Th>
            <Th>energy</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='created_at'>launched on</Th>
            <Th>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} space={space} />
              {jobs.length ?
                jobs.map((job) => <Row job={job} key={job.uid} space={space} />) : null
              }
            </>
          </Tbody>
        </Table>
      </div>
      {jobs.length ?
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={jobs.length}
        /> :
        <div className='pfda-padded-t20 text-center'>No executions found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
  )
}

const Row = ({ job, space }) => {
  const spaceLocation = job.workflowUid === 'N/A' ? 'jobs' : 'workflows'

  return (
    <tr>
      <td style={{ minWidth: 100 }} className={`col-state__state-${job.state}`}>{job.state}</td>
      <td className='home-page-layout__data-table_title'>
        <Link to={`/home${job.links && job.links.show}`}>
          <Icon icon={getSpacesIcon('jobs')} fw />
          <span>{job.name}</span>
        </Link>
      </td>
      <td>
        {job.links.workflow === 'N/A' ?
          <span>N/A</span> :
          <Link to={`/home${job.links && job.links.workflow}`}>
            <Icon icon={getSpacesIcon('workflows')} fw />
            <span>{job.workflowTitle}</span>
          </Link>
        }
      </td>
      <td className='home-page-layout__data-table_full-name'>
        <a href={job.links && job.links.user}>
          <span>{job.launchedBy}</span>
        </a>
      </td>
      {space &&
        <td>
          <Link to={`${job.links && job.links.space}/${spaceLocation}`} target='_blank'>
            <Icon icon={getSpacesIcon('space')} fw />
            <span>{job.location}</span>
          </Link>
        </td>
      }
      <td>{job.instanceType}</td>
      <td>{job.duration}</td>
      <td>{job.energyConsumption}</td>
      <td>{job.createdAtDateTime}</td>
      <td><TagsList tags={job.tags} /></td>
    </tr>
  )
}


const FilterRow = ({ fieldsSearch, onChangeFieldsValue, space }) => {
  const filtersConfig = ['state', 'name', 'workflow', 'username', '', '', '', '', 'tags']

  if (space) filtersConfig.splice(4, 0, '')

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

HomeAppsExecutionsTable.propTypes = {
  isFetching: PropTypes.bool,
  jobs: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ])),
  filters: PropTypes.object,
  handleFilterValue: PropTypes.func,
  appExecutions: PropTypes.object,
  fetchAppExecutions: PropTypes.func,
  resetAppExecutionsFiltersValue: PropTypes.func,
  setAppExecutionsFilterValue: PropTypes.func,
  uid: PropTypes.string,
  space: PropTypes.string,
}

HomeAppsExecutionsTable.defaultProps = {
  appExecutions: {
    jobs: [],
    filters: {},
  },
}

Row.propTypes = {
  job: PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ]),
  space: PropTypes.string,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
  space: PropTypes.string,
}

const mapStateToProps = (state) => ({
  appExecutions: homeAppsAppExecutionsSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAppExecutions: (uid) => dispatch(fetchAppExecutions(uid)),
  resetAppExecutionsFiltersValue: () => dispatch(resetAppExecutionsFiltersValue()),
  setAppExecutionsFilterValue: (value) => dispatch(setAppExecutionsFilterValue(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsExecutionsTable)

export {
  HomeAppsExecutionsTable,
}
