import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HomeDatabasesShape from '../../../../shapes/HomeDatabaseShape'
import {
  showDatabasesEditInfoModal,
  hideDatabasesEditInfoModal,
} from '../../../../../actions/home'
import {
  homeDatabasesRunActionModalSelector,
} from '../../../../../reducers/home/databases/selectors'
import {
  contextSelector,
} from '../../../../../reducers/context/selectors'
import { HOME_DATABASES_ACTIONS } from '../../../../../constants'
import { DropdownMenu } from '../../../DropdownMenu'
import DatabasesActionModal from '../DatabasesActionModal'
import { homeDatabasesEditInfoModalSelector } from '../../../../../reducers/home/databases/selectors'
import RenameObjectModal from '../../../RenameObjectModal'
import {
  hideRunDatabasesActionModal,
  showRunDatabasesActionModal,
} from '../../../../../actions/home/databases'
// import CopyToSpaceModal from '../../CopyToSpaceModal'


const ACTIONS_TO_REMOVE = {
  private: ['Unfeature', 'Edit Database Info'],
  details: ['Run', 'Run batch', 'Unfeature'],
  spaces: ['Run', 'Run batch', 'Track', 'Edit', 'Fork', 'Export to', 'Make public', 'Delete', 'Attach License', 'Comments', 'Unfeature'],
}

const ActionsDropdown = (props) => {
  const [actionSelected, setActionSelected] = useState('')

  const [actionsDisablingStates, setActionsDisablingStates] = useState({
    start: true,
    stop: true,
    terminate: true,
  })

  const [multiActionsDisabling, setMultiActionsDisabling] = useState({
    start: true,
    stop: true,
    terminate: true,
  })

  useEffect(() => { actionDisabling(props.databases) }, [props.databases])

  const { databases, page = 'private' } = props
  const databasesDxids = databases.map(database => database.dxid)
  const availableLicenses = props.context.user ? props.context.user.links.licenses : false

  const links = {}
  if (databases[0] && databases[0].links) {
    Object.assign(links, databases[0].links)
  }

  // for future admin's actions
  // const isAdmin = props.context.user ? props.context.user.admin : false
  const selectOption = (action) => {
    setActionSelected(action)
    props.showRunDatabasesActionModal()
  }

  // eslint-disable-next-line no-unused-vars
  let uniqueMultiStatus = ''
  const findUniqueStateSelection = () => {
    const databasesStates = databases.map(database => database.status)
    const unique = [...new Set(databasesStates)]
    if (unique.length > 1) { // NOT unique STATES selected
      return false
    } else { // unique STATE selected
      uniqueMultiStatus = unique[0]
      return true
    }
  }

  const selectActionDisabling = (databaseStatus) => {
    setActionsDisablingStates({ start: true, stop: true, terminate: true })
    setMultiActionsDisabling({ start: true, stop: true, terminate: true })

    switch (databaseStatus) {
      case 'available':
        setActionsDisablingStates({ start: true, stop: false, terminate: false })
        setMultiActionsDisabling({ start: true, stop: false, terminate: false })
        return
      case 'stopped':
        setActionsDisablingStates({ start: false, stop: true, terminate: true })
        setMultiActionsDisabling({ start: false, stop: true, terminate: true })
        return
      case 'stopping' || 'starting' || 'terminating' || 'terminated':
        setActionsDisablingStates({ start: true, stop: true, terminate: true })
        setMultiActionsDisabling({ start: true, stop: true, terminate: true })
        return
      default:
        return
    }
  }

  const actionDisabling = (databases) => {
    if (databases && databases.length === 1) { // for Details or List pages case with one selected database
      selectActionDisabling(databases[0].status)
    } else if (databases && databases.length > 1) { // for List page case with databases Multi-selected
      if (findUniqueStateSelection()) {
        selectActionDisabling(databases[0].status)
      } else {
        setMultiActionsDisabling({ start: true, stop: true, terminate: true })
      }
    }
  }

  const actions = [
    {
      text: 'Start',
      isDisabled: !links.start || (page === 'details' && actionsDisablingStates.start) ||
        (page === 'private' && multiActionsDisabling.start),
      onClick: () => selectOption(HOME_DATABASES_ACTIONS.START),
    },
    {
      text: 'Stop',
      isDisabled: !links.stop || (page === 'details' && actionsDisablingStates.stop) ||
        (page === 'private' &&  multiActionsDisabling.stop),
      onClick: () => selectOption(HOME_DATABASES_ACTIONS.STOP),
    },
    {
      text: 'Terminate',
      isDisabled: !links.terminate || (page === 'details' && actionsDisablingStates.terminate) ||
        (page === 'private' && multiActionsDisabling.terminate),
      onClick: () => selectOption(HOME_DATABASES_ACTIONS.TERMINATE),
    },
    {
      text: 'Track',
      isDisabled: databases.length !== 1 || !links.track,
      link: links.track,
    },
    {
      text: 'Copy to space',
      isDisabled: true, // databases.length === 0,
      onClick: () => props.showCopyToSpaceModal(),
    },
    {
      text: 'Move to Archive',
      isDisabled: true, // databases.length !== 1,
      onClick: () => props.showCopyToArchive(),
    },
    {
      text: 'Attach License',
      isDisabled: databases.length !== 1 || !links.license || !availableLicenses,
      onClick: () => props.showAttachLicenseModal(),
    },
    {
      text: 'Detach License',
      isDisabled: databases.length !== 1,
      onClick: () => props.showFilesLicenseModal(),
      hide: databases.length !== 1 || !links.detach_license,
    },
    {
      text: 'Edit Database Info',
      isDisabled: databases.length !== 1 || !links.update,
      onClick: () => props.showDatabasesEditInfoModal(),
    },
    {
      text: 'Edit tags',
      onClick: () => props.editTags(),
      hide: !props.editTags,
    },
  ]

  const availableActions = actions.filter(action => !ACTIONS_TO_REMOVE[page].includes(action.text))

  return (
    <>
      <DropdownMenu
        title='Actions'
        options={availableActions}
        message={page === 'spaces' ? 'To perform other actions on this app, access it from the Space' : ''}
      />
      {/*<CopyToSpaceModal*/}
      {/*  isLoading={props.copyToSpaceModal.isLoading}*/}
      {/*  isOpen={props.copyToSpaceModal.isOpen}*/}
      {/*  hideAction={() => props.hideCopyToSpaceModal()}*/}
      {/*  ids={appsIds}*/}
      {/*  copyAction={(scope, ids) => props.copyToSpace(scope, ids)}*/}
      {/*/>*/}
      {databases.length === 1 &&
        <RenameObjectModal
          isDatabase
          defaultFileName={databases[0].name}
          defaultFileDescription={databases[0].description ? databases[0].description : ''}
          isOpen={props.editDatabaseInfoModal.isOpen}
          isLoading={props.editDatabaseInfoModal.isLoading}
          hideAction={() => props.hideDatabasesEditInfoModal()}
          renameAction={(name, description) => props.editDatabaseInfo(
            databases[0].links.show, name, description,
          )}
        />
      }
      <DatabasesActionModal
        isOpen={props.runActionModal.isOpen}
        isLoading={props.runActionModal.isLoading}
        hideAction={() => props.hideRunDatabasesActionModal()}
        modalAction={() => props.runDatabasesAction(`/api/dbclusters/${actionSelected}`, actionSelected, databasesDxids)}
        databases={databases}
        action={actionSelected}
      />
    </>
  )
}

ActionsDropdown.propTypes = {
  databases: PropTypes.arrayOf(PropTypes.exact(HomeDatabasesShape)),
  editTags: PropTypes.func,
  editDatabaseInfo: PropTypes.func,
  editDatabaseInfoModal: PropTypes.object,
  showDatabasesEditInfoModal: PropTypes.func,
  hideDatabasesEditInfoModal: PropTypes.func,
  page: PropTypes.string,
  runActionModal: PropTypes.object,
  showRunDatabasesActionModal: PropTypes.func,
  hideRunDatabasesActionModal: PropTypes.func,
  runDatabasesAction: PropTypes.func,
  context: PropTypes.object,
  showFilesLicenseModal: PropTypes.func,
  showAttachLicenseModal: PropTypes.func,
  showCopyToArchive: PropTypes.func,
  showCopyToSpaceModal: PropTypes.func,
  // copyToSpace: PropTypes.func,
  // copyToSpaceModal: PropTypes.object,
  // hideCopyToSpaceModal: PropTypes.func,
  // comments: PropTypes.string,
}

ActionsDropdown.defaultProps = {
  databases: [],
  context: {},
  page: 'private',
  editDatabaseInfoModal: {},
  comparisonModal: {},
  runActionModal: {},
  // copyToSpaceModal: {},
}

const mapStateToProps = (state) => ({
  editDatabaseInfoModal: homeDatabasesEditInfoModalSelector(state),
  runActionModal: homeDatabasesRunActionModalSelector(state),
  context: contextSelector(state),
  // copyToSpaceModal: homeAppsCopyToSpaceModalSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  // showCopyToSpaceModal: () => dispatch(showCopyToSpaceModal()),
  // hideCopyToSpaceModal: () => dispatch(hideCopyToSpaceModal()),
  showDatabasesEditInfoModal: () => dispatch(showDatabasesEditInfoModal()),
  hideDatabasesEditInfoModal: () => dispatch(hideDatabasesEditInfoModal()),
  showRunDatabasesActionModal: () => dispatch(showRunDatabasesActionModal()),
  hideRunDatabasesActionModal: () => dispatch(hideRunDatabasesActionModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ActionsDropdown)

export {
  ActionsDropdown,
}
