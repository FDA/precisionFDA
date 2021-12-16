import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeDatabasesShape from '../../../../shapes/HomeDatabaseShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeDatabasesIsFetchingSelector,
  homeDatabasesIsCheckedAllSelector,
  homeDatabasesFiltersSelector,
} from '../../../../../reducers/home/databases/selectors'
import {
  toggleAllDatabasesCheckboxes,
  toggleDatabaseCheckbox,
} from '../../../../../actions/home'
import { getOrder } from '../../../../../helpers'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { debounce } from '../../../../../utils'
import { HOME_DATABASE_LABELS } from '../../../../../constants'


const HomeDatabasesListTable = ({
    databases,
    isFetching,
    isCheckedAll,
    toggleAllDatabasesCheckboxes,
    toggleDatabaseCheckbox,
    filters,
    handleFilterValue,
  }) => {
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

  const { sortType, sortDirection, currentPage, nextPage, prevPage, totalPages, totalCount, fields } = filters
  const [fieldsSearch, setFieldsSearch] = useState(fields)
  const deboFields = useCallback(debounce((value) => handleFilterValue({ fields: value,  currentPage: 1 }), 400), [])

  const pagination = {
    currentPage,
    nextPage,
    prevPage,
    totalPages,
  }

  const sortDatabasesHandler = (newType) => {
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

  return (
    <>
    <div className='home-page-layout__data-table'>
      <div className='home-page-layout__table-wrapper'>
        <Table>
          <Thead>
            <th className='pfda-padded-l10'>
              <Icon onClick={toggleAllDatabasesCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortDatabasesHandler} type='status'>status</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortDatabasesHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortDatabasesHandler} type='engine'>type</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortDatabasesHandler} type='instance'>instance</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortDatabasesHandler} type='created'>created</Th>
            <Th>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {databases.length ?
                databases.map((database) => <Row database={database} key={database.dxid} toggleDatabaseCheckbox={toggleDatabaseCheckbox} />) : null
              }
            </>
          </Tbody>
        </Table>
      </div>
      {databases.length ?
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={databases.length}
        /> :
        <div className='pfda-padded-t20 text-center'>No databases found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
    </>
  )
}

const Row = ({ database, toggleDatabaseCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !database.isChecked,
    'fa-check-square-o': database.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  return (
    <tr>
      <td>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleDatabaseCheckbox(database.id)}
        />
      </td>
      <td className='home-page-layout__data-table_narrow_field'>{HOME_DATABASE_LABELS[database.status]}</td>
      <td className='home-page-layout__data-table_title'>
        <Link to={`/home/databases/${database.dxid}`}>
          <Icon icon={getSpacesIcon('databases')} fw />
          <span>{database.name}</span>
        </Link>
      </td>
      <td className='home-page-layout__data-table_full-narrow_field'>{HOME_DATABASE_LABELS[database.engine]}</td>
      <td className='home-page-layout__data-table_full-name'>{HOME_DATABASE_LABELS[database.dxInstanceClass]}</td>
      <td>
        {database.createdAtDateTime}
      </td>
      <td><TagsList tags={database.tags} /></td>
    </tr>
  )
}

const FilterRow = ({ fieldsSearch, onChangeFieldsValue }) => {
  const filtersConfig = ['', 'status', 'name', 'type', 'instance', '', 'tags']

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

HomeDatabasesListTable.propTypes = {
  isFetching: PropTypes.bool,
  databases: PropTypes.arrayOf(PropTypes.exact(HomeDatabasesShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllDatabasesCheckboxes: PropTypes.func,
  toggleDatabaseCheckbox: PropTypes.func,
  filters: PropTypes.object,
  handleFilterValue: PropTypes.func,
}

HomeDatabasesListTable.defaultProps = {
  databases: [],
  sortHandler: () => { },
  filters: {},
  toggleDatabaseCheckbox: () => { },
  toggleAllDatabasesCheckboxes: () => { },
}

Row.propTypes = {
  databases: PropTypes.exact(HomeDatabasesShape),
  toggleDatabaseCheckbox: PropTypes.func,
  database: PropTypes.object,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeDatabasesIsFetchingSelector(state),
  isCheckedAll: homeDatabasesIsCheckedAllSelector(state),
  filters: homeDatabasesFiltersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllDatabasesCheckboxes: () => dispatch(toggleAllDatabasesCheckboxes()),
  toggleDatabaseCheckbox: (id) => dispatch(toggleDatabaseCheckbox(id)),
})

export const HomeDatabasesTable = connect(mapStateToProps, mapDispatchToProps)(HomeDatabasesListTable )
