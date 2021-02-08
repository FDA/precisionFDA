import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import JobShape from '../../../../shapes/JobShape'
import PaginationShape from '../../../../shapes/PaginationShape'
import Loader from '../../../Loader'
import {
  spaceJobsListSelector,
  spaceJobsListIsFetchingSelector,
  spaceJobsListSortTypeSelector,
  spaceJobsListSortDirectionSelector,
  spaceJobsListPaginationSelector,
} from '../../../../../reducers/spaces/jobs/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import { fetchJobs, sortJobs, setJobsCurrentPageValue } from '../../../../../actions/spaces/jobs'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Icon from '../../../Icon'
import TagsList from '../../../TagsList'
import './style.sass'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import LinkTargetBlank from '../../../LinkTargetBlank'
import Counters from '../../../TableComponents/Counters'
import Pagination from '../../../TableComponents/Pagination'


const SpaceJobsList = ({ spaceId, jobs, isFetching, sortType, sortDir, sortHandler, pagination, pageHandler }) => {
  const classes = classNames({
    'space-jobs-list': true,
  })

  const { currentPage, nextPage, totalPages, totalCount } = pagination

  const sortJobsHandler = (type) => sortHandler(spaceId, type)
  const pageJobsHandler = (value) => pageHandler(spaceId, value)

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (jobs.length) {
    return (
      <div className={classes}>
        <div className='space-page-layout__list-wrapper'>
          <Table>
            <Thead>
              <Th sortType={sortType} sortDir={sortDir} type='state' sortHandler={sortJobsHandler}
              >state</Th>
              <Th sortType={sortType} sortDir={sortDir} type='name' sortHandler={sortJobsHandler}
              >job</Th>
              <Th sortType={sortType} sortDir={sortDir} type='app_title' sortHandler={sortJobsHandler}
              >app</Th>
              <Th sortType={sortType} sortDir={sortDir} type='workflow_title' sortHandler={sortJobsHandler}
              >workflow</Th>
              <Th sortType={sortType} sortDir={sortDir} type='instance_type' sortHandler={sortJobsHandler}
              >instance type</Th>
              <Th sortType={sortType} sortDir={sortDir} type='duration' sortHandler={sortJobsHandler}
              >duration</Th>
              <Th sortType={sortType} sortDir={sortDir} type='energy_consumption' sortHandler={sortJobsHandler}
              >energy cons.</Th>
              <Th sortType={sortType} sortDir={sortDir} type='created_at' sortHandler={sortJobsHandler}
              >created</Th>
              <Th>tags</Th>
            </Thead>
            <Tbody>
              {jobs.map((job) => <Row job={job} key={job.id} />)}
            </Tbody>
          </Table>
        </div>
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={jobs.length}
        />
        <div className='pfda-padded-t20'>
          <Pagination data={pagination} setPageHandler={pageJobsHandler} />
        </div>
      </div>
    )
  }

  return <div className='text-center'>No jobs found.</div>
}

const WorkflowLinkShow = ({ link, title }) => {
  if (link === undefined || typeof link === 'string' && link === 'N/A') {
    return (
      <span></span>
    )
  } else {
    return (
      <LinkTargetBlank url={`/home${link}`}>
        <Icon icon={getSpacesIcon('workflows')} fw />
        <span>{title}</span>
      </LinkTargetBlank>
    )
  }
}

const Row = ({ job }) => {
  const linkShow = job.links.show ? `/home${job.links.show}` : null
  const linkApp = job.links.app ? `/home${job.links.app}` : null

  return (
    <tr>
      <td className={`col-state__state-${job.state}`}>{job.state}</td>
      <td>
        <LinkTargetBlank url={linkShow}>
          <Icon icon={getSpacesIcon('jobs')} fw />
          <span>{job.name}</span>
        </LinkTargetBlank>
      </td>
      <td>
        <LinkTargetBlank url={linkApp}>
          <Icon icon={getSpacesIcon('apps')} fw />
          <span>{job.appTitle}</span>
        </LinkTargetBlank>
      </td>
      <td>
        <WorkflowLinkShow
          link={job.links.workflow}
          title={job.workflowTitle}
        />
      </td>
      <td>{job.instanceType}</td>
      <td>{job.duration}</td>
      <td>{job.energyConsumption}</td>
      <td>{job.createdAt}</td>
      <td><TagsList tags={job.tags} /></td>
    </tr>
  )
}

SpaceJobsList.propTypes = {
  spaceId: PropTypes.number.isRequired,
  jobs: PropTypes.arrayOf(PropTypes.exact(JobShape)),
  isFetching: PropTypes.bool,
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  sortHandler: PropTypes.func,
  pagination: PropTypes.exact(PaginationShape),
  pageHandler: PropTypes.func,
}

SpaceJobsList.defaultProps = {
  jobs: [],
  sortHandler: () => { },
  pagination: {},
}

Row.propTypes = {
  job: PropTypes.exact(JobShape),
}

WorkflowLinkShow.propTypes = {
  link: PropTypes.string,
  title: PropTypes.string,
}

const mapStateToProps = state => ({
  jobs: spaceJobsListSelector(state),
  isFetching: spaceJobsListIsFetchingSelector(state),
  sortType: spaceJobsListSortTypeSelector(state),
  sortDir: spaceJobsListSortDirectionSelector(state),
  spaceId: spaceDataSelector(state).id,
  pagination: spaceJobsListPaginationSelector(state),
})

const mapDispatchToProps = dispatch => ({
  sortHandler: (spaceId, type) => {
    dispatch(sortJobs(type))
    dispatch(fetchJobs(spaceId))
  },
  pageHandler: (spaceId, value) => {
    dispatch(setJobsCurrentPageValue(value))
    dispatch(fetchJobs(spaceId))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceJobsList)

export {
  SpaceJobsList,
}
