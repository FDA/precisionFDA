import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeAppsFeaturedIsFetchingSelector,
  homeAppsFeaturedIsCheckedAllSelector,
} from '../../../../../reducers/home/apps/selectors'
import {
  toggleAllAppsFeaturedCheckboxes,
  toggleAppFeaturedCheckbox,
} from '../../../../../actions/home'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'


const HomeAppsFeaturedTable = ({ apps, isFetching, isCheckedAll, toggleAllAppsCheckboxes, toggleAppCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'home-page-layout__data-table_checkbox')

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  const sortType = null
  const sortDir = null
  const pagination = {
    currentPage: 1,
    nextPage: null,
    prevPage: null,
    totalPages: 3,
  }

  if (apps.length) {
    return (
      <div className="home-page-layout__data-table">
        <Table>
          <Thead>
            <th className="pfda-padded-l10">
              <Icon onClick={toggleAllAppsCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDir} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDir} type='location'>title</Th>
            <Th sortType={sortType} sortDir={sortDir} type='added by'>revision</Th>
            <Th sortType={sortType} sortDir={sortDir} type='size'>added by</Th>
            <Th sortType={sortType} sortDir={sortDir} type='created'>location</Th>
            <Th sortType={sortType} sortDir={sortDir} type='origin'>created</Th>
            <Th sortType={sortType} sortDir={sortDir} type='tags'>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow />
              {apps.map((app) => <Row app={app} key={app.id} toggleAppCheckbox={toggleAppCheckbox} />)}
            </>
          </Tbody>
        </Table>
        <div className='home-page-layout__data-table_count'>
          1-2/2
        </div>
        <div className='pfda-padded-t20'>
          <Pagination data={pagination} />
        </div>
      </div>
    )
  }

  return <div className='text-center'>No apps found.</div>
}

const Row = ({ app, toggleAppCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !app.isChecked,
    'fa-check-square-o': app.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  return (
    <tr>
      <td>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleAppCheckbox(app.id)}
        />
      </td>
      <td>{app.name}</td>
      <td>
        <a href={app.links.show}>
          <Icon icon={getSpacesIcon('apps')} fw />
          <span>{app.title}</span>
        </a>
      </td>
      <td>{app.revision}</td>
      <td>
        <a href={app.links.user}>
          <span>{app.addedBy}</span>
        </a>
      </td>
      <td>{app.location}</td>
      <td>
        {app.createdAtDateTime}
      </td>
      <td><TagsList tags={app.tags} /></td>
    </tr>
  )
}

const FilterRow = () => {
  const filtersConfig = ['name', 'title', 'revision', 'addedBy', 'location', 'created', 'tags']
  const filters = filtersConfig.map((e) => {
    return (
      <td key={e}>
        <Input
          name={e}
          placeholder='--'
        />
      </td>
    )
  })

  return (
    <tr>
      <td></td>
      {filters}
    </tr>
  )
}

HomeAppsFeaturedTable.propTypes = {
  isFetching: PropTypes.bool,
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllAppsCheckboxes: PropTypes.func,
  toggleAppCheckbox: PropTypes.func,
}

HomeAppsFeaturedTable.defaultProps = {
  apps: [],
  sortHandler: () => { },
  toggleAppCheckbox: () => { },
  toggleAllAppsCheckboxes: () => { },
}

Row.propTypes = {
  app: PropTypes.exact(HomeAppShape),
  toggleAppCheckbox: PropTypes.func,
}

const mapStateToProps = (state) => ({
  isFetching: homeAppsFeaturedIsFetchingSelector(state),
  isCheckedAll: homeAppsFeaturedIsCheckedAllSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllAppsCheckboxes: () => dispatch(toggleAllAppsFeaturedCheckboxes()),
  toggleAppCheckbox: (id) => dispatch(toggleAppFeaturedCheckbox(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsFeaturedTable)

export {
  HomeAppsFeaturedTable,
}