import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEmpty } from 'ramda'

import SpaceShape from '../../../../shapes/SpaceShape'
import { spaceDataSelector } from '../../../../../reducers/spaces/space/selectors'
import SpaceLayout from '../../../../layouts/SpaceLayout'
import {
  fetchFiles,
  sortFiles,
  resetSpaceFilesFilters,
  showFilesAddFolderModal,
} from '../../../../../actions/spaces'
import Button from '../../../../components/Button'
import Icon from '../../../../components/Icon'
import FilesTable from '../../../../components/Space/Files/FilesTable'
import AddFolderModal from '../../../../components/Space/Files/AddFolderModal'
import AddDataModal from '../../../../components/Space/AddDataModal'
import MoveModal from '../../../../components/Space/Files/MoveModal'
import ActionsDropdown from '../../../../components/Space/Files/ActionsDropdown'
import { getQueryParam } from '../../../../../utils'
import { getSpacePageTitle } from '../../../../../helpers/spaces'
import { showSelectResourceTypeModal } from '../../../../../features/space/fileUpload/actions'
import SelectResourceTypeModal
  from '../../../../../features/space/fileUpload/SelectResourceTypeModal'
import UploadModal from '../../../../../features/space/fileUpload/UploadModal'


class SpaceFilesPage extends Component {
  getFolderId = () => {
    const { location } = this.props
    const folderId = getQueryParam(location.search, 'folderId')
    return folderId ? parseInt(folderId) : folderId
  }

  loadSpaceFiles = () => {
    const { loadFiles, resetFilters, spaceId } = this.props
    const folderId = this.getFolderId()
    resetFilters()
    return loadFiles(spaceId, folderId)
  }

  componentDidMount() {
    if (!isEmpty(this.props.space)) {
      this.loadSpaceFiles()
    }
  }

  componentDidUpdate(prevProps) {
    const { search } = this.props.location
    if (search !== prevProps.location.search || prevProps.space !== this.props.space) {
      this.loadSpaceFiles()
    }
  }

  render() {
    const { spaceId, space, sortFiles, showAddFolderModal, showAddFilesModal } = this.props
    const folderId = this.getFolderId()
    const sortHandler = (type) => sortFiles(spaceId, folderId, type)
    const title = getSpacePageTitle('Files', space.isPrivate)

    return (
      <SpaceLayout spaceId={spaceId} space={space}>
        <div className="space-page-layout__header-row">
          <h2 className="space-page-layout__sub-title">{title}</h2>
          <div className="space-page-layout__actions">
            <ActionsDropdown loadFilesHandler={this.loadSpaceFiles} />
            { space.links?.add_data &&
              <>
                <Button type="primary" onClick={showAddFolderModal}>
                  <span>
                    <Icon icon="fa-plus" />&nbsp;
                    Add Folder
                  </span>
                </Button>
                <Button type="primary" onClick={showAddFilesModal}>
                  <span>
                    <Icon icon="fa-plus" />&nbsp;
                    Add Files
                  </span>
                </Button>
              </>
            }
          </div>
        </div>

        <div className="pfda-padded-t20">
          <FilesTable spaceId={spaceId} sortHandler={sortHandler} />
        </div>

        <AddFolderModal loadFilesHandler={this.loadSpaceFiles} folderId={folderId} />
        <AddDataModal space={space} folderId={folderId} loadFilesHandler={this.loadSpaceFiles} />
        <MoveModal space={space} currentFolderId={folderId} />
        <SelectResourceTypeModal />
        <UploadModal />
      </SpaceLayout>
    )
  }
}

SpaceFilesPage.propTypes = {
  spaceId: PropTypes.string,
  space: PropTypes.shape(SpaceShape),
  loadFiles: PropTypes.func,
  sortFiles: PropTypes.func,
  resetFilters: PropTypes.func,
  showAddFolderModal: PropTypes.func,
  showAddFilesModal: PropTypes.func,
  location: PropTypes.object,
}

SpaceFilesPage.defaultProps = {
  loadFiles: () => { },
  sortFiles: () => { },
  resetFilters: () => { },
  showAddFolderModal: () => { },
  showAddFilesModal: () => { },
}

const mapStateToProps = (state) => ({
  space: spaceDataSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadFiles: (spaceId, folderId) => dispatch(fetchFiles(spaceId, folderId)),
  sortFiles: (spaceId, folderId, type) => {
    dispatch(sortFiles(type))
    dispatch(fetchFiles(spaceId, folderId))
  },
  resetFilters: () => dispatch(resetSpaceFilesFilters()),
  showAddFolderModal: () => dispatch(showFilesAddFolderModal()),
  showAddFilesModal: () => dispatch(showSelectResourceTypeModal()),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SpaceFilesPage))

export {
  SpaceFilesPage,
}
