import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeAssetsIsFetchingSelector,
  homeAssetsIsCheckedAllSelector,
  homeAssetsFiltersSelector,
} from '../../../../../reducers/home/assets/selectors'
import {
  toggleAllAssetsCheckboxes,
  toggleAssetCheckbox,
} from '../../../../../actions/home'
import { getOrder } from '../../../../../helpers'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { debounce } from '../../../../../utils'
import LinkTargetBlank from '../../../LinkTargetBlank'


const HomeAssetsTable = ({ assets, isFetching, isCheckedAll, toggleAllAssetsCheckboxes, toggleAssetCheckbox, filters, handleFilterValue }) => {
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
    <div className='home-page-layout__data-table'>
      <div className='home-page-layout__table-wrapper'>
        <Table>
          <Thead>
            <th className='pfda-padded-l10'>
              <Icon onClick={toggleAllAssetsCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='name'>name</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='username'>added by</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='size'>size</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='created_at'>created</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='tags'>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {assets.length ?
                assets.map((asset) => <Row asset={asset} key={asset.id} toggleAssetCheckbox={toggleAssetCheckbox} />) : null
              }
            </>
          </Tbody>
        </Table>
      </div>
      {assets.length ?
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={assets.length}
        /> :
        <div className='pfda-padded-t20 text-center'>No assets found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
  )
}

const Row = ({ asset, toggleAssetCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !asset.isChecked,
    'fa-check-square-o': asset.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  return (
    <tr>
      <td>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleAssetCheckbox(asset.id)}
        />
      </td>
      <td className='home-page-layout__data-table_title'>
        <Link to={`/home/assets/${asset.uid}`}>
          <Icon icon='fa-file-zip-o' fw />
          <span>{asset.name}</span>
        </Link>
      </td>
      <td className='home-page-layout__data-table_full-name'>
        <LinkTargetBlank url={asset.links.user}>
          <span>{asset.addedBy}</span>
        </LinkTargetBlank>
      </td>
      <td>{asset.size}</td>
      <td>{asset.createdAtDateTime}</td>
      <td><TagsList tags={asset.tags} /></td>
    </tr>
  )
}


const FilterRow = ({ fieldsSearch, onChangeFieldsValue }) => {
  const filtersConfig = ['', 'name', 'username', 'size', '', 'tags']

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

HomeAssetsTable.propTypes = {
  isFetching: PropTypes.bool,
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllAssetsCheckboxes: PropTypes.func,
  toggleAssetCheckbox: PropTypes.func,
  filters: PropTypes.object,
  handleFilterValue: PropTypes.func,
}

HomeAssetsTable.defaultProps = {
  assets: [],
  filters: {},
}

Row.propTypes = {
  asset: PropTypes.exact(HomeAssetShape),
  toggleAssetCheckbox: PropTypes.func,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeAssetsIsFetchingSelector(state),
  isCheckedAll: homeAssetsIsCheckedAllSelector(state),
  filters: homeAssetsFiltersSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllAssetsCheckboxes: () => dispatch(toggleAllAssetsCheckboxes()),
  toggleAssetCheckbox: (id) => dispatch(toggleAssetCheckbox(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAssetsTable)

export {
  HomeAssetsTable,
}
