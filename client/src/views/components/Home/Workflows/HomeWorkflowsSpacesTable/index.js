import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeWorkflowsSpacesIsFetchingSelector,
  homeWorkflowsSpacesIsCheckedAllSelector,
  homeWorkflowsSpacesFiltersSelector,
} from '../../../../../reducers/home/workflows/selectors'
import {
  toggleAllWorkflowsSpacesCheckboxes,
  toggleWorkflowSpacesCheckbox,
} from '../../../../../actions/home'
import { getOrder } from '../../../../../helpers'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { debounce } from '../../../../../utils'


const HomeWorkflowsSpacesTable = ({ workflows, isFetching, isCheckedAll, toggleAllWorkflowsSpacesCheckboxes, toggleWorkflowSpacesCheckbox, filters, handleFilterValue }) => {
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

  const {
    sortType, sortDirection, currentPage, nextPage, prevPage, totalPages, totalCount, fields,
  } = filters

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

  return (
    <div className='home-page-layout__data-table'>
      <div className='home-page-layout__table-wrapper'>
        <Table>
          <Thead>
            <th className='pfda-padded-l10'>
              <Icon onClick={toggleAllWorkflowsSpacesCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='name'>title</Th>
            <Th>location</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='username'>added by</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='created_at'>created</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='tags'>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {workflows.length ?
                 workflows.map((workflow) => <Row workflow={workflow} key={workflow.id} toggleWorkflowCheckbox={toggleWorkflowSpacesCheckbox} />) : null
              }
            </>
          </Tbody>
        </Table>
      </div>
      {workflows.length ?
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={workflows.length}
        /> :
        <div className='pfda-padded-t20 text-center'>No workflows found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
  )
}

const Row = ({ workflow, toggleWorkflowCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !workflow.isChecked,
    'fa-check-square-o': workflow.isChecked,
  }, 'home-page-layout__data-table_checkbox')

const linkUser = workflow.links ? workflow.links.user : null
const linkLocation = workflow.links ? `${workflow.links.space}/workflows` : null
const linkShow = workflow.links ? `/home${workflow.links.show}` : null

  return (
    <tr>
      <td>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleWorkflowCheckbox(workflow.id)}
        />
      </td>
      <td>
        <Link to={linkShow}>
          <Icon icon={getSpacesIcon('workflows')} fw />
          <span>{workflow.name}</span>
        </Link>
      </td>
      <td className='home-page-layout__data-table_name'>
        <span>
          {workflow.title}
        </span>
      </td>

      <td>
        <Link target="_blank" to={linkLocation}>
          <Icon icon={getSpacesIcon('space')} />
          {workflow.location}
        </Link>
      </td>

      <td>
        <a href={linkUser}>
          {workflow.addedBy}
        </a>
      </td>

      <td>
        {workflow.createdAt}
      </td>

      <td><TagsList tags={workflow.tags} /></td>
    </tr>
  )
}

const FilterRow = ({ fieldsSearch, onChangeFieldsValue }) => {
  const filtersConfig = ['', 'name', 'title', '', 'addedBy', '', 'tags']

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

HomeWorkflowsSpacesTable.propTypes = {
  isFetching: PropTypes.bool,
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllWorkflowsCheckboxes: PropTypes.func,
  toggleWorkflowCheckbox: PropTypes.func,
  filters: PropTypes.object,
  handleFilterValue: PropTypes.func,
  toggleAllWorkflowsSpacesCheckboxes: PropTypes.func,
  toggleWorkflowSpacesCheckbox: PropTypes.func,
}

HomeWorkflowsSpacesTable.defaultProps = {
  workflows: [],
  sortHandler: () => { },
  filters: {},
  toggleWorkflowCheckbox: () => { },
  toggleAllWorkflowsCheckboxes: () => { },
}

Row.propTypes = {
  workflow: PropTypes.exact(HomeWorkflowsShape),
  toggleWorkflowCheckbox: PropTypes.func,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeWorkflowsSpacesIsFetchingSelector(state),
  isCheckedAll: homeWorkflowsSpacesIsCheckedAllSelector(state),
  filters: homeWorkflowsSpacesFiltersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllWorkflowsSpacesCheckboxes: () => dispatch(toggleAllWorkflowsSpacesCheckboxes()),
  toggleWorkflowSpacesCheckbox: (id) => dispatch(toggleWorkflowSpacesCheckbox(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsSpacesTable)

export {
  HomeWorkflowsSpacesTable,
}
