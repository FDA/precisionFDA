import React, { useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import HomeFileShape from '../../../../shapes/HomeFileShape'
import { homeFilesFeaturedListSelector } from '../../../../../reducers/home/files/selectors'
import {
  fetchFilesFeatured,
  resetFilesModals,
  resetFilesFeaturedFiltersValue,
  deleteObjects,
  copyToSpaceFiles,
  filesAttachTo,
  setFileFeaturedFilterValue,
  makeFeatured,
  renameFile,
  filesMove,
  attachLicenseFiles,
  filesLicenseAction,
} from '../../../../../actions/home'
import HomeLayout from '../../../../layouts/HomeLayout'
import HomeFilesFeaturedTable from '../../../../components/Home/Files/HomeFilesFeaturedTable'
import ActionsDropdown from '../../../../components/Home/Files/ActionsDropdown'
import { OBJECT_TYPES } from '../../../../../constants'
import { getFolderId } from '../../../../../helpers/home'


const HomeFilesFeaturedPage = ({ files = [], fetchFilesFeatured, resetFilesModals, resetFilesFeaturedFiltersValue, location, deleteFiles, copyToSpace, filesAttachTo, makeFeatured, setFileFeaturedFilterValue, renameFile, filesMove, attachLicense, filesLicenseAction }) => {
  const folderId = getFolderId(location)
  useLayoutEffect(() => {
    resetFilesModals()
  }, [])

  
  const handleFilterValue = (value) => {
    setFileFeaturedFilterValue(value)
    fetchFilesFeatured(folderId)
  }

  useLayoutEffect(() => {
    resetFilesFeaturedFiltersValue()
    fetchFilesFeatured(folderId)
  }, [folderId])

  const checkedFiles = files.filter(file => file.isChecked)

  return (
    <HomeLayout>
      <div className='home-page-layout__header-row'>
        <div className="home-page-layout__actions" />
        <div className='home-page-layout__actions--right'>
        <ActionsDropdown
          files={checkedFiles}
          copyToSpace={copyToSpace}
          filesAttachTo={filesAttachTo}
          makeFeatured={makeFeatured}
          page='featured'
          deleteFiles={(link, ids) => deleteFiles(link, ids)}
          renameFile={renameFile} 
          filesMove={filesMove}
          attachLicense={attachLicense}
          filesLicenseAction={filesLicenseAction}
        />
        </div>
      </div>
      <div className='pfda-padded-t20'>
        <HomeFilesFeaturedTable files={files} handleFilterValue={handleFilterValue} />
      </div>
    </HomeLayout>
  )
}

HomeFilesFeaturedPage.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  fetchFilesFeatured: PropTypes.func,
  resetFilesModals: PropTypes.func,
  resetFilesFeaturedFiltersValue: PropTypes.func,
  location: PropTypes.object,
  deleteFiles: PropTypes.func,
  copyToSpace: PropTypes.func,
  filesAttachTo: PropTypes.func,
  setFileFeaturedFilterValue: PropTypes.func,
  makeFeatured: PropTypes.func,
  renameFile: PropTypes.func,
  filesMove: PropTypes.func,
  attachLicense: PropTypes.func,
  filesLicenseAction: PropTypes.func,
}

const mapStateToProps = (state) => ({
  files: homeFilesFeaturedListSelector(state),
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchFilesFeatured: (folderId) => dispatch(fetchFilesFeatured(folderId)),
  resetFilesModals: () => dispatch(resetFilesModals()),
  resetFilesFeaturedFiltersValue: () => dispatch(resetFilesFeaturedFiltersValue()),
  deleteFiles: (link, ids, folderId) => dispatch(deleteObjects(link, OBJECT_TYPES.FILE, ids)).then(({ status }) => {
    if (status) dispatch(fetchFilesFeatured(folderId))
  }),
  copyToSpace: (scope, ids) => dispatch(copyToSpaceFiles(scope, ids)).then(({ status }) => {
    if (status) dispatch(fetchFilesFeatured())
  }),
  filesAttachTo: (items, noteUids) => dispatch(filesAttachTo(items, noteUids)),
  setFileFeaturedFilterValue: (value) => dispatch(setFileFeaturedFilterValue(value)),
  makeFeatured: (link, uids, featured) => dispatch(makeFeatured(link, OBJECT_TYPES.FILE, uids, featured)).then(({ status }) => {
    if (status) dispatch(fetchFilesFeatured())
  }),
  renameFile: (link, name, type, folder) => dispatch(renameFile(link, name, type, folder)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFilesFeatured(folderId))
  }),
  filesMove: (nodeIds, targetId, link) => dispatch(filesMove(nodeIds, targetId, link)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFilesFeatured(folderId))
  }),
  attachLicense: (link, scope, ids, folderId) => dispatch(attachLicenseFiles(link, scope, ids)).then(({ statusIsOK }) => {
    if (statusIsOK) dispatch(fetchFilesFeatured(folderId))
  }),
  filesLicenseAction: (link) => dispatch(filesLicenseAction(link)).then(({ statusIsOK }) => {
    const folderId = getFolderId(ownProps.location)
    if (statusIsOK) dispatch(fetchFilesFeatured(folderId))
  }),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeFilesFeaturedPage))

export {
  HomeFilesFeaturedPage,
}
