import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'

import {
  spaceFilesSelector,
  spaceIsFetchingFilesSelector,
  spaceFilesListSortTypeSelector,
  spaceFilesListSortDirectionSelector,
  spaceFilesCheckedAllSelector,
  spacePathSelector,
  spaceFilesListPaginationSelector,
} from '../../../../../reducers/spaces/files/selectors'
import FileShape from '../../../../shapes/FileShape'
import PaginationShape from '../../../../shapes/PaginationShape'
import Loader from '../../../Loader'
import Icon from '../../../Icon'
import LinkTargetBlank from '../../../LinkTargetBlank'
import { Table, Tbody, Thead, Th } from '../../../TableComponents'
import { toggleFileCheckbox, toggleAllFileCheckboxes } from '../../../../../actions/spaces'
import { STATE_REMOVING, STATE_COPYING } from '../../../../../constants'
import './style.sass'
import Counters from '../../../TableComponents/Counters'
import Pagination from '../../../TableComponents/Pagination'
import TagsList from '../../../TagsList'


const FolderLink = ({ file, spaceId, isDisabled, ariaLabel }) => {
  if (isDisabled) {
    return (
      <span>
        <Icon icon='fa-folder' fw />
        {file.name}
      </span>
    )
  }

  return (
    <Link to={{ pathname: `/spaces/${spaceId}/files`, search: `?folderId=${file.id}` }} aria-label={ariaLabel}>
      <Icon icon='fa-folder' fw />
      {file.name}
    </Link>
  )
}

const FileLink = ({ file, spaceId, isDisabled, ariaLabel }) => {
  if (file.isFolder) return <FolderLink file={file} spaceId={spaceId} isDisabled={isDisabled} aria-label={ariaLabel} />

  if (!file.links.filePath || isDisabled) {
    return (
      <span>
        <Icon icon='fa-file-o' fw />
        {file.name}
      </span>
    )
  }

  const linkShow = file.links.filePath ? `/home${file.links.filePath}` : null

  return (
    <LinkTargetBlank url={linkShow} aria-label={ariaLabel}>
      <Icon icon='fa-file-o' fw />
      <span>{file.name}</span>
    </LinkTargetBlank>
  )
}

const OriginalLink = ({ file }) => {
  const originPath = file.origin
  const url = originPath?.href ? `/home${originPath.href}` : null

  switch (typeof originPath) {
    case 'object':
      return file.state === 'closed' ? (
        <LinkTargetBlank url={url}>
          <i className={originPath.fa} />
          <span>{originPath.text}</span>
        </LinkTargetBlank>
      ) :
        <span>
          <i className={originPath.fa} />
          <span>{originPath.text}</span>
        </span>
    case 'string':
      return (<span>{(originPath.length) ? originPath : '-'}</span>)
    default:
      return <span>-</span>
  }
}

const Row = ({ file, spaceId, toggleCheckbox }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !file.isChecked,
    'fa-check-square-o': file.isChecked,
  }, 'space-files-table__checkbox')

  const toggleHandler = () => toggleCheckbox(file.id)
  const isDisabled = [STATE_REMOVING, STATE_COPYING].includes(file.state)
  const rowClasses = classNames({ 'disabled-row': isDisabled })
  const ariaLabel = `View ${file.name} file details in new window`

  return (
    <tr className={rowClasses}>
      <td>
        {!isDisabled ? <Icon icon={checkboxClasses} onClick={toggleHandler} /> : null}
      </td>
      <td>
        <FileLink file={file} spaceId={spaceId} isDisabled={isDisabled} ariaLabel={ariaLabel}/>
      </td>
      <td>{file.type}</td>
      <td>{file.org}</td>
      <td>
        <LinkTargetBlank url={file.links.user}>
          <span>{file.addedBy}</span>
        </LinkTargetBlank>
      </td>
      <td>{file.size}</td>
      <td>
        <OriginalLink file={file} />
      </td>
      <td>{file.created}</td>
      <td>{file.state}</td>
      <td><TagsList tags={file.tags} /></td>
    </tr>
  )
}

const breadcrumbs = (path, spaceId) => (
  <div className="space-files-table__breadcrumbs">
    <span className="space-files-table__breadcrumbs-label page-tracker">You are here:</span>
    {
      ([{ id: 0, name: 'Files', href: `/spaces/${spaceId}/files` }]
        .concat((path || [])
          .map(folder => ({
            id: folder.id,
            name: folder.name,
            href: `/spaces/${spaceId}/files?folderId=${folder.id}`,
          }))).map(folder => <Link key={`folder-${folder.id}`} to={folder.href}>{folder.name}</Link>)
      ).reduce((prev, curr) => [prev, <span key={`divider-${prev.id}`} className="space-files-table__breadcrumbs-divider">/</span>, curr])
    }
  </div>
)

const FilesTable = ({ sortHandler, toggleCheckbox, toggleAllCheckboxes, spaceId, files, path, isCheckedAll, isFetching, sortType, sortDir, pagination, pageHandler }) => {
  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'space-files-table__checkbox')

  if (isFetching) {
    return (
      <div className="text-center">
        <Loader />
      </div>
    )
  }

  const { currentPage, nextPage, totalPages, totalCount } = pagination


  let content = <div className="text-center">No files found.</div>
  if (files.length) {
    content = (
      <div className="space-files-table">
        <div className='space-page-layout__list-wrapper'>
          <Table>
            <Thead>
              <th className="pfda-padded-l10">
                <Icon onClick={toggleAllCheckboxes} icon={checkboxClasses} />
              </th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir} type='name' class_name="spaces-list-headers-blue">name</Th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir} type='type' class_name="spaces-list-headers-blue">type</Th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir} type='org' class_name="spaces-list-headers-blue">org</Th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir} type='added_by' class_name="spaces-list-headers-blue">added
              by</Th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir} type='size' class_name="spaces-list-headers-blue">size</Th>
              <Th class_name="spaces-list-headers-grey">origin</Th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir}
                type='created_at' class_name="spaces-list-headers-blue">created</Th>
              <Th sortHandler={sortHandler} sortType={sortType} sortDir={sortDir}
                type='state' class_name="spaces-list-headers-blue">state</Th>
              <Th class_name="spaces-list-headers-grey">tags</Th>
            </Thead>
            <Tbody>
              {files.map((file) => <Row file={file} toggleCheckbox={toggleCheckbox} spaceId={spaceId}
                key={file.id} />)}
            </Tbody>
          </Table>
        </div>
        <Counters
          currentPage={currentPage}
          nextPage={nextPage}
          totalPages={totalPages}
          totalCount={totalCount}
          count={files.length}
        />
        <div className='pfda-padded-t20'>
          <Pagination data={pagination} setPageHandler={pageHandler} />
        </div>
      </div>
    )
  }

  return (
    <div>
      {breadcrumbs(path, spaceId)}
      {content}
    </div>
  )
}

FilesTable.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(FileShape)),
  isCheckedAll: PropTypes.bool,
  path: PropTypes.array,
  isFetching: PropTypes.bool,
  spaceId: PropTypes.string,
  folderId: PropTypes.string,
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  sortHandler: PropTypes.func,
  toggleCheckbox: PropTypes.func,
  toggleAllCheckboxes: PropTypes.func,
  pagination: PropTypes.exact(PaginationShape),
  pageHandler: PropTypes.func,
}

FilesTable.defaultProps = {
  files: [],
  sortHandler: () => { },
  toggleCheckbox: () => { },
  toggleAllCheckboxes: () => { },
  pagination: {},
}

const mapStateToProps = state => ({
  files: spaceFilesSelector(state),
  path: spacePathSelector(state),
  isCheckedAll: spaceFilesCheckedAllSelector(state),
  isFetching: spaceIsFetchingFilesSelector(state),
  sortType: spaceFilesListSortTypeSelector(state),
  sortDir: spaceFilesListSortDirectionSelector(state),
  pagination: spaceFilesListPaginationSelector(state),
})

const mapDispatchToProps = dispatch => ({
  toggleCheckbox: (id) => dispatch(toggleFileCheckbox(id)),
  toggleAllCheckboxes: () => dispatch(toggleAllFileCheckboxes()),
})

export default connect(mapStateToProps, mapDispatchToProps)(FilesTable)

export {
  FilesTable,
}

Row.propTypes = {
  file: PropTypes.exact(FileShape),
  spaceId: PropTypes.string,
  toggleCheckbox: PropTypes.func,
}

FileLink.propTypes = {
  file: PropTypes.exact(FileShape),
  spaceId: PropTypes.string,
  isDisabled: PropTypes.bool,
  ariaLabel: PropTypes.string,
}

FolderLink.propTypes = {
  file: PropTypes.exact(FileShape),
  spaceId: PropTypes.string,
  isDisabled: PropTypes.bool,
  ariaLabel: PropTypes.string,
}

OriginalLink.propTypes = {
  file: PropTypes.object,
}
