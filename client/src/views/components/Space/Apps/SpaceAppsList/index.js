import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import AppShape from '../../../../shapes/AppShape'
import PaginationShape from '../../../../shapes/PaginationShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  spaceAppsListIsFetchingSelector,
  spaceAppsListSortTypeSelector,
  spaceAppsListSortDirectionSelector,
  spaceAppsCheckedAllSelector,
  spaceAppsListPaginationSelector,
} from '../../../../../reducers/spaces/apps/selectors'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import {
  fetchApps,
  sortApps,
  toggleAppCheckbox,
  toggleAllAppCheckboxes,
  setAppsCurrentPageValue,
} from '../../../../../actions/spaces'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import './style.sass'
import Icon from '../../../Icon'
import LinkTargetBlank from '../../../LinkTargetBlank'
import Button from '../../../Button'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import Counters from '../../../TableComponents/Counters'
import Pagination from '../../../TableComponents/Pagination'


const SpaceAppsList = ({ spaceId, apps, isFetching, sortType, sortDir, sortHandler, toggleCheckbox, toggleAllCheckboxes, isCheckedAll, pagination, pageHandler }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'space-apps-list__checkbox')

  const { currentPage, nextPage, totalPages, totalCount } = pagination

  const sortAppsHandler = (type) => sortHandler(spaceId, type)
  const pageAppsHandler = (value) => pageHandler(spaceId, value)

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (apps.length) {
    return (
      <div className="space-apps-list">
        <div className='space-page-layout__list-wrapper'>
          <Table>
            <Thead>
              <th className="pfda-padded-l10">
                <Icon onClick={toggleAllCheckboxes} icon={checkboxClasses} />
              </th>
              <Th sortType={sortType} sortDir={sortDir} type='name' sortHandler={sortAppsHandler}>name</Th>
              <Th sortType={sortType} sortDir={sortDir} type='title' sortHandler={sortAppsHandler}>title</Th>
              <Th sortType={sortType} sortDir={sortDir} type='revision' sortHandler={sortAppsHandler}>revision</Th>
              <Th>explorers</Th>
              <Th sortType={sortType} sortDir={sortDir} type='org' sortHandler={sortAppsHandler}>org</Th>
              <Th sortType={sortType} sortDir={sortDir} type='added_by' sortHandler={sortAppsHandler}>added by</Th>
              <Th sortType={sortType} sortDir={sortDir} type='created_at' sortHandler={sortAppsHandler}>created</Th>
              <Th>run by you?</Th>
              <Th sortType={sortType} sortDir={sortDir} type='tags' sortHandler={sortAppsHandler}>tags</Th>
            </Thead>
            <Tbody>
              {apps.map((app) => <Row app={app} key={app.id} toggleCheckbox={toggleCheckbox} />)}
            </Tbody>
          </Table>
        </div>
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={apps.length}
        />
        <div className='pfda-padded-t20'>
          <Pagination data={pagination} setPageHandler={pageAppsHandler} />
        </div>
      </div>
    )
  }

  return <div className='text-center'>No apps found.</div>
}

const RunLinkShow = ({ runByYou, link }) => {
  if (typeof runByYou === 'string' && runByYou === 'Try' && link) {
    return (
      <Link to={link} target='_blank' rel='noopener noreferrer'>
        <Button type="primary" size="xs">{runByYou}</Button>
      </Link>
    )
  } else {
    return (
      <span>{runByYou}</span>
    )
  }
}

const Row = ({ app, toggleCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !app.isChecked,
    'fa-check-square-o': app.isChecked,
  }, 'space-apps-list__checkbox')

  const toggleHandler = () => toggleCheckbox(app.id)
  const linkShow = app.links.show ? `/home${app.links.show}` : null

  return (
    <tr>
      <td>
        <Icon icon={checkboxClasses} onClick={toggleHandler} />
      </td>
      <td>{app.name}</td>
      <td>
        <LinkTargetBlank url={linkShow}>
          <Icon icon={getSpacesIcon('apps')} fw />
          <span>{app.title}</span>
        </LinkTargetBlank>
      </td>
      <td>{app.revision}</td>
      <td>{app.explorers}</td>
      <td>{app.org}</td>
      <td>
        <LinkTargetBlank url={app.links.user}>
          <span>{app.addedBy}</span>
        </LinkTargetBlank>
      </td>
      <td>{app.createdAt}</td>
      <td>
        <RunLinkShow
          runByYou={app.runByYou}
          link={app.links.run_job}
        />
      </td>
      <td><TagsList tags={app.tags} /></td>
    </tr>
  )
}

SpaceAppsList.propTypes = {
  spaceId: PropTypes.number.isRequired,
  apps: PropTypes.arrayOf(PropTypes.exact(AppShape)),
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

SpaceAppsList.defaultProps = {
  apps: [],
  sortHandler: () => {},
  toggleCheckbox: () => {},
  toggleAllCheckboxes: () => {},
  pageHandler: () => {},
  pagination: {},
}

Row.propTypes = {
  app: PropTypes.exact(AppShape),
  toggleCheckbox: PropTypes.func,
}

RunLinkShow.propTypes = {
  link: PropTypes.string,
  runByYou: PropTypes.string,
}

const mapStateToProps = state => ({
  isFetching: spaceAppsListIsFetchingSelector(state),
  sortType: spaceAppsListSortTypeSelector(state),
  sortDir: spaceAppsListSortDirectionSelector(state),
  spaceId: spaceDataSelector(state).id,
  isCheckedAll: spaceAppsCheckedAllSelector(state),
  pagination: spaceAppsListPaginationSelector(state),
})

const mapDispatchToProps = dispatch => ({
  sortHandler: (spaceId, type) => {
    dispatch(sortApps(type))
    dispatch(fetchApps(spaceId))
  },
  pageHandler: (spaceId, value) => {
    dispatch(setAppsCurrentPageValue(value))
    dispatch(fetchApps(spaceId))
  },
  toggleCheckbox: (id) => dispatch(toggleAppCheckbox(id)),
  toggleAllCheckboxes: () => dispatch(toggleAllAppCheckboxes()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceAppsList)

export {
  SpaceAppsList,
}
