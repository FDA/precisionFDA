import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeWorkflowsShape from '../../../../shapes/HomeWorkflowsShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeWorkflowsEveryoneIsFetchingSelector,
  homeWorkflowsEveryoneIsCheckedAllSelector,
  homeWorkflowsEveryoneFiltersSelector,
} from '../../../../../reducers/home/workflows/selectors'
import {
  toggleAllWorkflowsEveryoneCheckboxes,
  toggleWorkflowEveryoneCheckbox,
  makeFeatured,
} from '../../../../../actions/home'
import { getOrder } from '../../../../../helpers'
import { OBJECT_TYPES } from '../../../../../constants'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { debounce } from '../../../../../utils'


const HomeWorkflowsEveryoneTable = ({ workflows, isFetching, isCheckedAll, toggleAllWorkflowsEveryoneCheckboxes, toggleWorkflowEveryoneCheckbox, filters, handleFilterValue, context, makeFeatured }) => {
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
              <Icon onClick={toggleAllWorkflowsEveryoneCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='title'>title</Th>
            <Th>featured</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='username'>added by</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='created_at'>created</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortWorkflowsHandler} type='tags'>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {workflows.length ?
                workflows.map((workflow) => {
                  return (
                    <Row
                      context={context}
                      workflow={workflow}
                      key={workflow.id}
                      toggleWorkflowCheckbox={toggleWorkflowEveryoneCheckbox}
                      makeFeatured={makeFeatured}
                    />
                  )
                }) : null
              }
              { }
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

const Row = ({ workflow, toggleWorkflowCheckbox, context = {}, makeFeatured }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !workflow.isChecked,
    'fa-check-square-o': workflow.isChecked,
  }, 'home-page-layout__data-table_checkbox')
  const isAdmin = context.user && context.user.admin
  const linkUser = workflow.links ? workflow.links.user : null
  const linkShow = workflow.links ? `/home${workflow.links.show}` : null
  const linkFeature = workflow.links && workflow.links.feature ? '/api/workflows/feature' : '/api/workflows/feature'

  const heartClasses = classNames({
    'far fa-heart-o': !workflow.featured,
    'fas fa-heart': workflow.featured,
  })

  const onHeartClick = () => {
    // maybe rename makeFeatured -> toggleFeatured
    makeFeatured(linkFeature, [workflow.uid], !workflow.featured)
  }

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

      <td className='home-page-layout__data-table_featured'>
        <span className={classNames({ 'home-page-layout__data-table_action': isAdmin })} >
          <Icon icon={heartClasses} onClick={() => onHeartClick()} />
        </span>
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
  const filtersConfig = ['', 'name', 'title', 'addedBy', '', 'tags']

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

HomeWorkflowsEveryoneTable.propTypes = {
  isFetching: PropTypes.bool,
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllWorkflowsCheckboxes: PropTypes.func,
  toggleWorkflowCheckbox: PropTypes.func,
  filters: PropTypes.object,
  handleFilterValue: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
  toggleAllWorkflowsEveryoneCheckboxes: PropTypes.func,
  toggleWorkflowEveryoneCheckbox: PropTypes.func,
  }

HomeWorkflowsEveryoneTable.defaultProps = {
  workflows: [],
  sortHandler: () => { },
  filters: {},
  toggleWorkflowCheckbox: () => { },
  toggleAllWorkflowsCheckboxes: () => { },
}

Row.propTypes = {
  workflow: PropTypes.exact(HomeWorkflowsShape),
  toggleAppCheckbox: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
  toggleWorkflowCheckbox: PropTypes.func,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeWorkflowsEveryoneIsFetchingSelector(state),
  isCheckedAll: homeWorkflowsEveryoneIsCheckedAllSelector(state),
  filters: homeWorkflowsEveryoneFiltersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllWorkflowsEveryoneCheckboxes: () => dispatch(toggleAllWorkflowsEveryoneCheckboxes()),
  toggleWorkflowEveryoneCheckbox: (id) => dispatch(toggleWorkflowEveryoneCheckbox(id)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.WORKFLOW, uids, featured)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeWorkflowsEveryoneTable)

export {
  HomeWorkflowsEveryoneTable,
}
