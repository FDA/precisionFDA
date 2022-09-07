import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeAssetShape from '../../../../shapes/HomeAssetShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeAssetsEverybodyIsFetchingSelector,
  homeAssetsEverybodyIsCheckedAllSelector,
  homeAssetsEverybodyFiltersSelector,
} from '../../../../../reducers/home/assets/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import {
  toggleAllAssetsEverybodyCheckboxes,
  toggleAssetEverybodyCheckbox,
  makeFeatured,
} from '../../../../../actions/home'
import { OBJECT_TYPES } from '../../../../../constants'
import { getOrder } from '../../../../../helpers'
import { Table, Thead, Tbody, Th } from '../../../TableComponents'
import Input from '../../../FormComponents/Input'
import Select from '../../../FormComponents/Select'
import Pagination from '../../../../components/TableComponents/Pagination'
import Counters from '../../../../components/TableComponents/Counters'
import Icon from '../../../Icon'
import { debounce } from '../../../../../utils'
import LinkTargetBlank from '../../../LinkTargetBlank'


const HomeAssetsEverybodyTable = ({ assets, isFetching, isCheckedAll, toggleAllAssetsCheckboxes, toggleAssetCheckbox, filters, handleFilterValue, context, makeFeatured }) => {
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
    <div className='home-page-layout__data-table'>
      <div className='home-page-layout__table-wrapper'>
        <Table>
          <Thead>
            <th className='pfda-padded-l10'>
              <Icon onClick={toggleAllAssetsCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='name'>name</Th>
            <Th>featured</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='username'>added by</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='size'>size</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortHandler} type='created_at'>created</Th>
            <Th>tags</Th>
          </Thead>
          <Tbody>
            <>
              <FilterRow fieldsSearch={fieldsSearch} onChangeFieldsValue={onChangeFieldsValue} />
              {assets.length ?
                assets.map((asset) => (
                  <Row
                    asset={asset}
                    key={asset.id}
                    toggleAssetCheckbox={toggleAssetCheckbox}
                    context={context}
                    makeFeatured={makeFeatured}
                  />
                )) : null
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

const Row = ({ asset, toggleAssetCheckbox, context, makeFeatured }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !asset.isChecked,
    'fa-check-square-o': asset.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  const isAdmin = context.user && context.user.admin

  const heartClasses = classNames({
    'far fa-heart-o': !asset.featured,
    'fas fa-heart': asset.featured,
  })

  const onHeartClick = () => {
    if (isAdmin) makeFeatured(asset.links.feature, [asset.uid], !asset.featured)
  }

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
      <td align='center' className='home-page-layout__data-table_featured'>
        <span className={classNames({ 'home-page-layout__data-table_action': isAdmin })} >
          <Icon icon={heartClasses} onClick={() => onHeartClick()} />
        </span>
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
  const filtersConfig = ['', 'name', 'featured', 'username', 'size', '', 'tags']

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

HomeAssetsEverybodyTable.propTypes = {
  isFetching: PropTypes.bool,
  assets: PropTypes.arrayOf(PropTypes.exact(HomeAssetShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllAssetsCheckboxes: PropTypes.func,
  toggleAssetCheckbox: PropTypes.func,
  filters: PropTypes.object,
  handleFilterValue: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
}

HomeAssetsEverybodyTable.defaultProps = {
  assets: [],
  filters: {},
  context: {},
}

Row.propTypes = {
  asset: PropTypes.exact(HomeAssetShape),
  toggleAssetCheckbox: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  fieldsSearch: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeAssetsEverybodyIsFetchingSelector(state),
  isCheckedAll: homeAssetsEverybodyIsCheckedAllSelector(state),
  filters: homeAssetsEverybodyFiltersSelector(state),
  context: contextSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllAssetsCheckboxes: () => dispatch(toggleAllAssetsEverybodyCheckboxes()),
  toggleAssetCheckbox: (id) => dispatch(toggleAssetEverybodyCheckbox(id)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.ASSET, uids, featured)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeAssetsEverybodyTable)

export {
  HomeAssetsEverybodyTable,
}
