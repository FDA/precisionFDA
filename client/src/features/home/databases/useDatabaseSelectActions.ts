import { useQueryClient } from 'react-query'
import { useAuthUser } from '../../auth/useAuthUser'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { ActionFunctionsType } from '../types'
import { copyDatabasesRequest } from './databases.api'
import { DBStatus, IDatabase } from './databases.types'
import { useEditDatabaseModal } from './useEditDatabaseModal'
import { useMethodModal } from './useMethodModal'

export const HOME_DATABASES_ACTIONS = {
  START: 'start',
  STOP: 'stop',
  TERMINATE: 'terminate',
  CREATE: 'create',
  EDIT: 'edit',
}

export enum DatabaseActions {
  'Start' = 'Start',
  'Stop' = 'Stop',
  'Terminate' = 'Terminate',
  'Track' = 'Track',
  'Copy to space' = 'Copy to space',
  'Move to Archive' = 'Move to Archive',
  'Attach License' = 'Attach License',
  'Detach License' = 'Detach License',
  'Edit Database Info' = 'Edit Database Info',
  'Edit tags' = 'Edit tags',
}

export const useDatabaseSelectActions = (selectedItems: IDatabase[], resourceKeys: string[]) => {
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const selected = selectedItems.filter(x => x !== undefined)
  const availableLicenses = user?.links?.licenses ? user.links.licenses : false

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({ resource: 'dbclusters', selected, updateFunction: copyDatabasesRequest, onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal({ selected: selected[0], resource: 'dbclusters', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: detachLicenseModal,
    setShowModal: setDetachLicenseModal,
    isShown: isShownDetachLicenseModal,
  } = useDetachLicenseModal({ selected: selected[0], resource: 'dbclusters', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: methodStartModal,
    setShowModal: setMethodStartModal,
    isShown: isShownMethodStartModal,
  } = useMethodModal<IDatabase>({ method: 'start', selected })
  const {
    modalComp: methodStopModal,
    setShowModal: setMethodStopModal,
    isShown: isShownMethodStopModal,
  } = useMethodModal<IDatabase>({ method: 'stop', selected })
  const {
    modalComp: methodTerminateModal,
    setShowModal: setMethodTerminateModal,
    isShown: isShownMethodTerminateModal,
  } = useMethodModal<IDatabase>({ method: 'terminate', selected })

  const {
    modalComp: editDBModal,
    setShowModal: setEditDBModal,
    isShown: isShownEditDBModal,
  } = useEditDatabaseModal(selected[0])

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IDatabase>({
    resource: 'dbclusters', selected: selected[0], onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const isDisabledByStatus = (status: DBStatus) => {
    let actionsDisabled = {
      start: true,
      stop: true,
      terminate: true,
    }

    switch (status) {
      case 'available':
        actionsDisabled = { start: true, stop: false, terminate: false }
        break
      case 'stopped':
        actionsDisabled = { start: false, stop: true, terminate: true }
        break
      case 'stopping' || 'starting' || 'terminating' || 'terminated':
        actionsDisabled = { start: true, stop: true, terminate: true }
        break
      default:
        break
    }
    return actionsDisabled
  }

  const actionFunctions: ActionFunctionsType<DatabaseActions> = {
    'Start': {
      isDisabled: selected.length !== 1 || !selected[0]?.links.start || isDisabledByStatus(selected[0].status).start,
      func: () => setMethodStartModal(true),
      modal: methodStartModal,
      showModal: isShownMethodStartModal,
    },
    'Stop': {
      isDisabled: selected.length !== 1 || !selected[0]?.links.stop || isDisabledByStatus(selected[0].status).stop,
      func: () => setMethodStopModal(true),
      modal: methodStopModal,
      showModal: isShownMethodStopModal,
    },
    'Terminate': {
      isDisabled: selected.length !== 1 || !selected[0]?.links.terminate || isDisabledByStatus(selected[0].status).terminate,
      func: () => setMethodTerminateModal(true),
      modal: methodTerminateModal,
      showModal: isShownMethodTerminateModal,
    },
    'Track': {
      func: () => { },
      isDisabled: selected.length !== 1 || !selected[0]?.links.track,
      link: selected[0]?.links?.track,
    },
    'Copy to space': {
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Move to Archive': {
      shouldHide: true,
      isDisabled: true, // databases.length !== 1,
      func: () => { },
    },
    'Attach License': {
      isDisabled: selected.length !== 1 || !selected[0]?.links.license || !availableLicenses,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    'Detach License': {
      isDisabled: selected.length !== 1,
      shouldHide: selected.length !== 1 || !selected[0]?.links.detach_license,
      func: () => setDetachLicenseModal(true),
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
    },
    'Edit Database Info': {
      isDisabled: selected.length !== 1 || !selected[0]?.links.update,
      func: () => setEditDBModal(true),
      modal: editDBModal,
      showModal: isShownEditDBModal,
    },
    'Edit tags': {
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1,
      modal: tagsModal,
      showModal: isShownTagsModal,
    },
  }

  return actionFunctions
}
