import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import AppShape from '../../../../shapes/AppShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import './style.sass'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'


const HomeAppsTable = ({ apps, isFetching }) => {
  const isCheckedAll = false

  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'home-apps-table__checkbox')

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
      <div className="home-apps-table">
        <Table>
          <Thead>
            <th className="pfda-padded-l10">
              <Icon icon={checkboxClasses} />
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
              {apps.map((app) => <Row app={app} key={app.id} />)}
            </>
          </Tbody>
        </Table>
        <div className='home-apps-table__count'>
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

const Row = ({ app }) => {
  app.isChecked = false
  const checkboxClasses = classNames({
    'fa-square-o': !app.isChecked,
    'fa-check-square-o': app.isChecked,
  }, 'home-apps-table__checkbox')

  return (
    <tr>
      <td>
        <Icon icon={checkboxClasses} />
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
        {app.createdAt}
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
    <tr className='home-apps-table__filters-row'>
      <td></td>
      {filters}
    </tr>
  )
}

HomeAppsTable.propTypes = {
  isFetching: PropTypes.bool,
  apps: PropTypes.arrayOf(PropTypes.exact(AppShape)),
}

HomeAppsTable.defaultProps = {
  apps: [],
  sortHandler: () => { },
  toggleCheckbox: () => { },
  toggleAllCheckboxes: () => { },
  isFetching: false,
}

Row.propTypes = {
  app: PropTypes.exact(AppShape),
}

export default HomeAppsTable
