import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import JobShape from '../../../../shapes/JobShape'
import Loader from '../../../Loader'
import {
  spaceJobsListSelector,
  spaceJobsListIsFetchingSelector,
  spaceJobsListSortTypeSelector,
  spaceJobsListSortDirectionSelector,
} from '../../../../../reducers/spaces/jobs/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import { fetchJobs, sortJobs } from '../../../../../actions/spaces/jobs'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Icon from '../../../Icon'
import TagsList from '../../../TagsList'
import './style.sass'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import LinkTargetBlank from '../../../LinkTargetBlank'


const SpaceJobsList = ({ spaceId, jobs, isFetching, sortType, sortDir, sortHandler }) => {
  const classes = classNames({
    'space-jobs-list': true,
  })

  const sortJobsHandler = (type) => sortHandler(spaceId, type)

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
    )
  }

  return <div className='text-center'>No jobs found.</div>
}

const WorkflowLinkShow = ({ link, title }) => {
  if (typeof link === 'string' && link === 'N/A') {
    return (
      <span>{link}</span>
    )
  } else {
    return (
      <LinkTargetBlank url={link}>
        <Icon icon={getSpacesIcon('workflows')} fw/>
        <span>{title}</span>
      </LinkTargetBlank>
    )
  }
}

const Row = ({ job }) => (
  <tr>
    <td className={`col-state__state-${job.state}`}>{job.state}</td>
    <td>
      <LinkTargetBlank url={job.links.show}>
        <Icon icon={getSpacesIcon('jobs')} fw/>
        <span>{job.name}</span>
      </LinkTargetBlank>
    </td>
    <td>
      <LinkTargetBlank url={job.links.app}>
        <Icon icon={getSpacesIcon('apps')} fw/>
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
    <td><TagsList tags={job.tags}/></td>
  </tr>
)

SpaceJobsList.propTypes = {
  spaceId: PropTypes.number.isRequired,
  jobs: PropTypes.arrayOf(PropTypes.exact(JobShape)),
  isFetching: PropTypes.bool,
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  sortHandler: PropTypes.func,
}

SpaceJobsList.defaultProps = {
  jobs: [],
  sortHandler: () => {},
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
})

const mapDispatchToProps = dispatch => ({
  sortHandler: (spaceId, type) => {
    dispatch(sortJobs(type))
    dispatch(fetchJobs(spaceId))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceJobsList)

export {
  SpaceJobsList,
}
