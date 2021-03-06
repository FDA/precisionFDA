import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import Loader from '../../../Loader'
import TagsList from '../../../TagsList'
import {
  homeFilesEverybodyIsFetchingSelector,
  homeFilesEverybodyIsCheckedAllSelector,
  homeFilesEverybodyFiltersSelector,
  homePathEverybodySelector,
} from '../../../../../reducers/home/files/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import {
  toggleAllFilesEverybodyCheckboxes,
  toggleFileEverybodyCheckbox,
  setFileEverybodyFilterValue,
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
import { debounce } from '../../../../../utils'


const breadcrumbs = (path) => (
  <div className="space-files-table__breadcrumbs">
    <span className="space-files-table__breadcrumbs-label">You are here:</span>
    {
      ([{ id: 0, name: 'Files', href: '/home/files/everybody' }]
        .concat((path || [])
          .map(folder => ({
            id: folder.id,
            name: folder.name,
            href: `/home/files/everybody?folderId=${folder.id}`,
          }))).map(folder => <Link key={`folder-${folder.id}`} to={folder.href || ''}>{folder.name}</Link>)
      ).reduce((prev, curr) => [prev, <span key={`divider-${prev.id}`} className="space-files-table__breadcrumbs-divider">/</span>, curr])
    }
  </div>
)

const HomeFilesEverybodyTable = ({ files, isFetching, isCheckedAll, toggleAllFilesCheckboxes, toggleFileCheckbox, filters, context, makeFeatured, handleFilterValue, path }) => {
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
  const [fieldsSearchTwo, setFieldsSearchTwo] = useState(fields)
  const deboFields = useCallback(debounce((value) => handleFilterValue({ fields: value,  currentPage: 1 }), 400), [])
  const deboFieldsTwo = useCallback(debounce((value) => handleFilterValue({ fields: value,  currentPage: 1 }), 400), [])

  const pagination = {
    currentPage,
    nextPage,
    prevPage,
    totalPages,
  }

  const sortFilesHandler = (newType) => {
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
  const onChangeFieldsValueTwo = (fields) => {
    setFieldsSearchTwo(new Map(fields))
    deboFieldsTwo(fields)
  }

  let content = <div className="text-center">No files found.</div>
  content = (
    <div className="home-page-layout__data-table">
      <div className="home-page-layout__table-wrapper">
        <Table>
          <Thead>
            <th className="pfda-padded-l10">
              <Icon onClick={toggleAllFilesCheckboxes} icon={checkboxClasses} />
            </th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortFilesHandler} type='name'>name</Th>
            <Th>featured</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortFilesHandler} type='username'>added by</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortFilesHandler} type='size'>size</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortFilesHandler} type='created_at'>created</Th>
            <Th>origin</Th>
            <Th sortType={sortType} sortDir={sortDirection} sortHandler={sortFilesHandler} type='tags'>tags</Th>
          </Thead>
          <Tbody>
            <>
            <FilterRow fieldsSearch={fieldsSearch} fieldsSearchTwo={fieldsSearchTwo} onChangeFieldsValue={onChangeFieldsValue} onChangeFieldsValueTwo={onChangeFieldsValueTwo}/>
              {files.map((file) => {
                return (
                  <Row
                    file={file}
                    key={file.id}
                    toggleFileCheckbox={toggleFileCheckbox}
                    makeFeatured={makeFeatured}
                    context={context}
                  />
                )
              })}
            </>
          </Tbody>
        </Table>
      </div>
      {files.length ? 
      <Counters 
        currentPage={currentPage}
        nextPage={nextPage}
        totalPages={totalPages}
        totalCount={totalCount}
        count={files.length}
      /> :
      <div className='pfda-padded-t20 text-center'>No files found.</div>
      }
      <div className='pfda-padded-t20'>
        <Pagination data={pagination} setPageHandler={(page) => handleFilterValue({ currentPage: page })} />
      </div>
    </div>
  )

  return (
    <div>
      {breadcrumbs(path)}
      {content}
    </div>
  )
}

const Row = ({ file, toggleFileCheckbox, context = {}, makeFeatured }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !file.isChecked,
    'fa-check-square-o': file.isChecked,
  }, 'home-page-layout__data-table_checkbox')

  const linkUser = file.links ? file.links.user : null
  const isAdmin = context.user && context.user.admin

  const FolderLink = ({ file }) => {
    return (
      <Link to={{ pathname: '/home/files/everybody', search: `?folderId=${file.id}` } || ''}>
        <Icon icon='fa-folder' fw />
        {file.name}
      </Link>
    )
  }
  
  const FileLink = ({ file }) => {
    if (file.type === 'Folder') return <FolderLink file={file} />
  
    if (!file.links.show) {
      return (
        <span>
          <Icon icon='fa-file-o' fw />
          {file.name}
        </span>
      )
    }
  
    return (
      <Link to={`/home${file.links.show}` || ''}>
        <Icon icon='fa-file-o' fw />
        <span>{file.name}</span>
      </Link>
    )
  }
  
  const heartClasses = classNames({
    'far fa-heart-o': !file.featured,
    'fas fa-heart': file.featured,
  })

  const onHeartClick = () => {
    if (isAdmin) makeFeatured(file.links.feature, [file.uid], !file.featured)
  }

  let originLink = ''
  if (typeof file.origin === 'object') {
    originLink = file.links.origin_object.origin_type === 'Job' ?
      `/home/jobs/${file.links.origin_object.origin_uid}` :
      `/home${file.origin.href}`
  }

  return (
    <tr>
      <td>
        <Icon
          icon={checkboxClasses}
          onClick={() => toggleFileCheckbox(file.id)}
        />
      </td>

      <td>
        <FileLink file={file} />
      </td>
      <td className='home-page-layout__data-table_featured'>
        <span className={classNames({ 'home-page-layout__data-table_action': isAdmin })}>
          <Icon icon={heartClasses} onClick={() => onHeartClick()} />
        </span>
      </td>
      <td>
        <a href={linkUser}>
          {file.addedBy}
        </a>
      </td>
      <td style={{ width: 200 }}>
        <span>{file.size}</span>
      </td>
      <td className='home-page-layout__data-table_created'>{file.createdAtDateTime}</td>
      {file.origin && typeof file.origin === 'object' ? 
          <td>
            <Link target='_blank' to={originLink}>
              <i className={file.origin.fa} />
              {file.origin.text}
            </Link>
          </td>
          :
          <td>
            {file.origin}
          </td>
      }
      <td><TagsList tags={file.tags} /></td>
    </tr>
  )
}

const FilterRow = ({ fieldsSearch, fieldsSearchTwo, onChangeFieldsValue, onChangeFieldsValueTwo }) => {
  const filtersConfig = ['', 'name', 'featured', 'username', 'size', '', '', 'tags']
  const filters = filtersConfig.map((filter, i) => {
    if (!filter) return <td key={i}></td>

    if (filter === 'size') return (
      <td key={i} style={{ display: 'flex' }}>
        <Input
          style={{ maxWidth: 100 }}
          name={filter}
          placeholder='--'
          value={fieldsSearch.get(filter) || ''}
          autoComplete='off'
          onChange={(e) => {
            onChangeFieldsValue(fieldsSearch.set(filter, e.target.value))
          }}
        />
        <Input
          style={{ maxWidth: 100 }}
          name={filter + 2}
          placeholder='--'
          value={fieldsSearchTwo.get(filter + 2) || ''}
          autoComplete='off'
          onChange={(e) => {
            onChangeFieldsValueTwo(fieldsSearchTwo.set(filter + 2, e.target.value))
          }}
        />
      </td>
    )

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
            autoComplete='off'
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

HomeFilesEverybodyTable.propTypes = {
  isFetching: PropTypes.bool,
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  isCheckedAll: PropTypes.bool,
  toggleAllFilesCheckboxes: PropTypes.func,
  toggleFileCheckbox: PropTypes.func,
  filters: PropTypes.object,
  setFileFilterValue: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
  handleFilterValue: PropTypes.func,
  path: PropTypes.array,
}

HomeFilesEverybodyTable.defaultProps = {
  files: [],
  sortHandler: () => { },
  filters: {},
  toggleFileCheckbox: () => { },
  toggleAllFilesCheckboxes: () => { },
}

Row.propTypes = {
  file: PropTypes.exact(HomeFileShape),
  toggleFileCheckbox: PropTypes.func,
  context: PropTypes.object,
  makeFeatured: PropTypes.func,
}

FilterRow.propTypes = {
  onChangeFieldsValue: PropTypes.func,
  onChangeFieldsValueTwo: PropTypes.func,
  fieldsSearch: PropTypes.object,
  fieldsSearchTwo: PropTypes.object,
}

const mapStateToProps = (state) => ({
  isFetching: homeFilesEverybodyIsFetchingSelector(state),
  isCheckedAll: homeFilesEverybodyIsCheckedAllSelector(state),
  filters: homeFilesEverybodyFiltersSelector(state),
  context: contextSelector(state),
  path: homePathEverybodySelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  toggleAllFilesCheckboxes: () => dispatch(toggleAllFilesEverybodyCheckboxes()),
  toggleFileCheckbox: (id) => dispatch(toggleFileEverybodyCheckbox(id)),
  setFileFilterValue: (filter, value) => dispatch(setFileEverybodyFilterValue(filter, value)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.FILE, uids, featured)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeFilesEverybodyTable)

export {
  HomeFilesEverybodyTable,
}
