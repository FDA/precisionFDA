import React, { Fragment, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import { HomeJobShape, HomeWorkflowShape } from '../../../../shapes/HomeJobShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Icon from '../../../Icon'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import {
  homeExecutionsFeaturedIsFetchingSelector,
  homeExecutionsFeaturedIsCheckedAllSelector,
  homeExecutionsFeaturedIsExpandedAllSelector,
  homeExecutionsFeaturedFiltersSelector,
} from '../../../../../reducers/home/executions/selectors'
import {
  expandExecutionFeatured,
  expandAllExecutionsFeatured,
  toggleExecutionFeaturedCheckbox,
  toggleAllExecutionsFeaturedCheckboxes,
} from '../../../../../actions/home'
import { debounce } from '../../../../../utils'
import { getOrder, convertSecondsToDhms } from '../../../../../helpers'


const HomeExecutionsFeaturedTable = (props) => {
  const { executions, isFetching, isCheckedAll, toggleAllExecutionsCheckboxes, toggleExecutionCheckbox, filters, expandAllExecutions, expandExecution, isExpandedAll, handleFilterValue } = props

  const caretClasses = classNames({
    'fa-caret-up': isExpandedAll,
    'fa-caret-down': !isExpandedAll,
  }, 'home-page-layout__data-table_checkbox')

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
  const deboFields = useCallback(debounce((value) => handleFilterValue({ fields: value, currentPage: 1 }), 400), [])

  const pagination = {
    currentPage,
    nextPage,
    prevPage,
    totalPages,
  }

  const sortHandler = (newType) => {
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
    <div className="home-page-layout__data-table">
      <div className="home-page-layout__table-wrapper">
        <Table>
          <Thead>
            <th className="pfda-padded-l10">
              <Icon onClick={toggleAllExecutionsCheckboxes} icon={checkboxClasses} />
            </th>
            <th className="pfda-padded-l10">
              <Icon onClick={expandAllExecutions} icon={caretClasses} />
            </th>
            <Th>state</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='apptitle'>app title</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='username'>launched by</Th>
            <Th>instance type</Th>
            <Th>duration</Th>
            <Th>energy</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='created_at'>launched on</Th>
            <Th>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {executions.map((execution, i) => {
                if (!execution.isWorkflow) {
                  return <Row execution={execution} key={execution.id} toggleExecutionCheckbox={toggleExecutionCheckbox} />
                }

                return (
                  <Fragment key={execution.uid + i}>
                    <WorkflowRow
                      execution={execution}
                      expandExecution={expandExecution}
                      toggleExecutionCheckbox={toggleExecutionCheckbox}
                    />
                    {execution.isExpanded &&
                      execution.executions.map((e) => {
                        return <Row execution={e} key={e.id} toggleExecutionCheckbox={toggleExecutionCheckbox} isWorkflowExecution />
                      })
                    }
                  </Fragment>
                )
              })}
            </>
          </Tbody>
        </Table>
      </div>
      {executions.length ?
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={executions.length}
        /> :
        <div className='pfda-padded-t20 text-center'>No executions found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
  )
}

const WorkflowRow = ({ execution, expandExecution, toggleExecutionCheckbox }) => {
  const caretClasses = classNames({
    'fa-caret-up': execution.isExpanded,
    'fa-caret-down': !execution.isExpanded,
  }, 'home-page-layout__data-table_checkbox')

  const checkboxClasses = classNames({
    'fa-square-o': !execution.isChecked,
    'fa-check-square-o': execution.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  const links = execution.links || {}
  const linkWorkflow = links.show ? `/home${execution.links.show}` : null

  return (
    <tr>
      <td style={{ width: 40 }}>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleExecutionCheckbox(execution.key)}
        />
      </td>
      <td style={{ width: 40 }}>
        <Icon
          icon={caretClasses}
          onClick={() => expandExecution(execution.key)}
        />
      </td>
      <td className={`col-state__state-${execution.state}`}>{execution.state}</td>
      <td>
        <Link to={linkWorkflow}>
          <Icon icon={getSpacesIcon('workflows')} fw />
          <span>{execution.title}</span>
        </Link>
      </td>
      <td>
      </td>
      <td>
        <a href={links.user}>
          <span>{execution.addedBy}</span>
        </a>
      </td>
      <td></td>
      <td>{convertSecondsToDhms(execution.duration)}</td>
      <td>{execution.energy}</td>
      <td>{execution.launchedOn}</td>
      <td></td>
    </tr>
  )
}

const Row = ({ toggleExecutionCheckbox, execution, isWorkflowExecution }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !execution.isChecked,
    'fa-check-square-o': execution.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  const links = execution.links || {}
  const linkShow = links.show ? `/home${links.show}` : null
  const linkApp = links.app ? `/home${links.app}` : null

  return (
    <tr>
      <td style={{ width: 40 }}>
        {!isWorkflowExecution &&
          <Icon
            icon={checkboxClasses}
            onClick={() => toggleExecutionCheckbox(execution.key)}
          />
        }
      </td>
      <td style={{ width: 40 }}>
      </td>
      <td className={`col-state__state-${execution.state}`}>{execution.state}</td>
      <td>
        <Link to={linkShow}>
          <Icon icon={getSpacesIcon('jobs')} fw />
          <span>{execution.name}</span>
        </Link>
      </td>
      <td>
        <Link to={linkApp}>
          <Icon icon={getSpacesIcon('apps')} fw />
          <span>{execution.appTitle}</span>
        </Link>
      </td>
      <td>
        {!isWorkflowExecution &&
          <a href={links.user}>
            <span>{execution.launchedBy}</span>
          </a>
        }
      </td>
      <td>{execution.instanceType}</td>
      <td>{execution.duration}</td>
      <td>{execution.energyConsumption}</td>
      <td>{execution.createdAtDateTime}</td>
      <td><TagsList tags={execution.tags} /></td>
    </tr>
  )
}

const FilterRow = ({ fieldsSearch, onChangeFieldsValue }) => {
  const filtersConfig = ['', '', 'state', 'name', 'apptitle', 'username', '', '', '', '', 'tags']

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

HomeExecutionsFeaturedTable.propTypes = {
  executions: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ])),
  isFetching: PropTypes.bool,
  isCheckedAll: PropTypes.bool,
  isExpandedAll: PropTypes.bool,
  toggleAllExecutionsCheckboxes: PropTypes.func,
  toggleExecutionCheckbox: PropTypes.func,
  filters: PropTypes.object,
  setAppFilterValue: PropTypes.func,
  expandAllExecutions: PropTypes.func,
  expandExecution: PropTypes.func,
  handleFilterValue: PropTypes.func,
}

HomeExecutionsFeaturedTable.defaultProps = {
  executions: [],
  sortHandler: () => { },
  filters: {},
}

Row.propTypes = {
  execution: PropTypes.oneOfType([
    PropTypes.shape(HomeWorkflowShape),
    PropTypes.shape(HomeJobShape),
  ]),
  toggleExecutionCheckbox: PropTypes.func,
  isWorkflowExecution: PropTypes.bool,
}

FilterRow.propTypes = {
  fieldsSearch: PropTypes.object,
  onChangeFieldsValue: PropTypes.func,
}

WorkflowRow.propTypes = {
  execution: PropTypes.shape(HomeWorkflowShape),
  expandExecution: PropTypes.func,
  toggleExecutionCheckbox: PropTypes.func,
}

const mapStateToProps = (state) => ({
  isFetching: homeExecutionsFeaturedIsFetchingSelector(state),
  isCheckedAll: homeExecutionsFeaturedIsCheckedAllSelector(state),
  isExpandedAll: homeExecutionsFeaturedIsExpandedAllSelector(state),
  filters: homeExecutionsFeaturedFiltersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  expandExecution: (key) => dispatch(expandExecutionFeatured(key)),
  expandAllExecutions: () => dispatch(expandAllExecutionsFeatured()),
  toggleExecutionCheckbox: (key) => dispatch(toggleExecutionFeaturedCheckbox(key)),
  toggleAllExecutionsCheckboxes: () => dispatch(toggleAllExecutionsFeaturedCheckboxes()),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeExecutionsFeaturedTable)

export {
  HomeExecutionsFeaturedTable,
}
