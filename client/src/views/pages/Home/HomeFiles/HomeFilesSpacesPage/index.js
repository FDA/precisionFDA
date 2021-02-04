import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import { homeFilesSpacesListSelector } from '../../../../../reducers/home/files/selectors'
import {
  fetchFilesSpaces,
  resetFilesModals,
  resetFilesSpacesFiltersValue,
  deleteObjects,
  filesAttachTo,
  setFileSpacesFilterValue,
  copyToSpaceFiles,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeFilesSpacesTable from '../../../../components/Home/Files/HomeFilesSpacesTable'
import ActionsDropdown from '../../../../components/Home/Files/ActionsDropdown'
import { OBJECT_TYPES } from '../../../../../constants'
import { getFolderId } from '../../../../../helpers/home'


const HomeFilesSpacesPage = ({ files = [], fetchFilesSpaces, resetFilesModals, resetFilesSpacesFiltersValue, location, deleteFiles, filesAttachTo, setFileSpacesFilterValue, copyToSpace }) => {
  const folderId = getFolderId(location)
  useLayoutEffect(() => {
    resetFilesModals()
  }, [])

  const handleFilterValue = (value) => {
    setFileSpacesFilterValue(value)
    fetchFilesSpaces(folderId)
  }

  useLayoutEffect(() => {
    resetFilesSpacesFiltersValue()
    fetchFilesSpaces(folderId)
  }, [folderId])

  const checkedFiles = files.filter(file => file.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className="home-page-layout__actions" />
        <div className='home-page-layout__actions--right'>
        <ActionsDropdown
          files={checkedFiles}
          filesAttachTo={filesAttachTo}
          deleteFiles={(link, ids) => deleteFiles(link, ids)}
          page='spaces'
          copyToSpace={copyToSpace} />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeFilesSpacesTable files={files} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeFilesSpacesPage.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  fetchFilesSpaces: PropTypes.func,
  resetFilesModals: PropTypes.func,
  resetFilesSpacesFiltersValue: PropTypes.func,
  location: PropTypes.object,
  deleteFiles: PropTypes.func,
  filesAttachTo: PropTypes.func,
  setFileSpacesFilterValue: PropTypes.func,
  copyToSpace: PropTypes.func,
}

const mapStateToProps = (state) => ({
  files: homeFilesSpacesListSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchFilesSpaces: (folderId) => dispatch(fetchFilesSpaces(folderId)),
  resetFilesModals: () => dispatch(resetFilesModals()),
  resetFilesSpacesFiltersValue: () => dispatch(resetFilesSpacesFiltersValue()),
  deleteFiles: (link, ids, folderId) => dispatch(deleteObjects(link, OBJECT_TYPES.FILE, ids)).then(({ status }) => {
    if (status) dispatch(fetchFilesSpaces(folderId))
  }),
  filesAttachTo: (items, noteUids) => dispatch(filesAttachTo(items, noteUids)),
  setFileSpacesFilterValue: (value) => dispatch(setFileSpacesFilterValue(value)),
  copyToSpace: (scope, ids, folderId) => dispatch(copyToSpaceFiles(scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFilesSpaces(folderId))
  }),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeFilesSpacesPage))

export {
  HomeFilesSpacesPage,
}
