import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeAppShape from '../../../../shapes/HomeAppShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeAppsEverybodyIsFetchingSelector,
  homeAppsEverybodyIsCheckedAllSelector,
  homeAppsEverybodyFiltersSelector,
} from '../../../../../reducers/home/apps/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import {
  toggleAllAppsEverybodyCheckboxes,
  toggleAppEverybodyCheckbox,
  makeFeatured,
} from '../../../../../actions/home'
import { getOrder } from '../../../../../helpers'
import { OBJECT_TYPES } from '../../../../../constants'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Select from '../../../FormComponents/Select'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { getSpacesIcon } from '../../../../../helpers/spaces'
import { debounce } from '../../../../../utils'


const HomeAppsEverybodyTable = (props) => {
  const { apps, isFetching, isCheckedAll, toggleAllAppsCheckboxes, toggleAppCheckbox, filters, handleFilterValue, context, makeFeatured } = props

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

  return (
    <div className="home-page-layout__data-table">
      <div className="home-page-layout__table-wrapper">
        <Table>
          <Thead>
            <th className="pfda-padded-l10">
              <Icon onClick={toggleAllAppsCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='title'>title</Th>
            <Th>featured</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='revision'>revision</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='username'>added by</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortAppsHandler} type='created_at'>created</Th>
            <Th>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {apps.length ?
                apps.map((app) => {
                  return (
                    <Row
                      context={context}
                      app={app}
                      key={app.id}
                      toggleAppCheckbox={toggleAppCheckbox}
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
      {apps.length ?
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={apps.length}
        /> :
        <div className='pfda-padded-t20 text-center'>No apps found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
  )
}

const Row = ({ app, toggleAppCheckbox, context = {}, makeFeatured }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !app.isChecked,
    'fa-check-square-o': app.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  const isAdmin = context.user && context.user.admin

  const heartClasses = classNames({
    'far fa-heart-o': !app.featured,
    'fas fa-heart': app.featured,
  })

  const onHeartClick = () => {
    if (isAdmin) makeFeatured(app.links.feature, [app.uid], !app.featured)
  }

  return (
    <tr>
      <td>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleAppCheckbox(app.id)}
        />
      </td>
      <td className='home-page-layout__data-table_name'>{app.name}</td>
      <td className='home-page-layout__data-table_title'>
        <Link to={`/home${app.links.show}`}>
          <Icon icon={getSpacesIcon('apps')} fw />
          <span>{app.title}</span>
        </Link>
      </td>
      <td align='center' className='home-page-layout__data-table_featured'>
        <span className={classNames({ 'home-page-layout__data-table_action': isAdmin })} >
          <Icon icon={heartClasses} onClick={() => onHeartClick()} />
        </span>
      </td>
      <td align='center' style={{ width: 150 }}>{app.revision}</td>
      <td className='home-page-layout__data-table_full-name'>
        <a href={app.links.user}>
          <span>{app.addedByFullname}</span>
        </a>
      </td>
      <td>
        {app.createdAtDateTime}
      </td>
      <td><TagsList tags={app.tags} /></td>
    </tr>
  )
}

const FilterRow = ({ fieldsSearch, onChangeFieldsValue }) => {
  const filtersConfig = ['', 'name', 'title', 'featured', 'revision', 'username', '', 'tags']

  const filters = filtersConfig.map((filter, i) => {
    if (!filter) return <td key={i}></td>

    if (filter === 'featured') {
      const options = [
        {
          value: '',
          label: '--',
        },
        {
          value: true,
          label: 'yes',
        },
        {
          value: false,
          label: 'no',
        },
      ]

      return (
        <td key={i}>
          <Select
            name={filter}
            options={options}
            value={fieldsSearch.get(filter) || ''}
            autoComplete='off'
            onChange={(e) => {
              onChangeFieldsValue(fieldsSearch.set(filter, e.target.value))
            }}
          />
        </td>
      )
    }

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

HomeAppsEverybodyTable.propTypes = {
  isFetching: PropTypes.bool,
  apps: PropTypes.arrayOf(PropTypes.exact(HomeAppShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllAppsCheckboxes: PropTypes.func,
  toggleAppCheckbox: PropTypes.func,
  filters: PropTypes.object,
  setAppFilterValue: PropTypes.func,
  handleFilterValue: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
}

HomeAppsEverybodyTable.defaultProps = {
  apps: [],
  sortHandler: () => { },
  filters: {},
  toggleAppCheckbox: () => { },
  toggleAllAppsCheckboxes: () => { },
}

Row.propTypes = {
  app: PropTypes.exact(HomeAppShape),
  toggleAppCheckbox: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeAppsEverybodyIsFetchingSelector(state),
  isCheckedAll: homeAppsEverybodyIsCheckedAllSelector(state),
  filters: homeAppsEverybodyFiltersSelector(state),
  context: contextSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllAppsCheckboxes: () => dispatch(toggleAllAppsEverybodyCheckboxes()),
  toggleAppCheckbox: (id) => dispatch(toggleAppEverybodyCheckbox(id)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.APP, uids, featured)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAppsEverybodyTable)

export {
  HomeAppsEverybodyTable,
}
