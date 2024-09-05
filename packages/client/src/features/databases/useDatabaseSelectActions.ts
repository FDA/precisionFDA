import { useQueryClient } from '@tanstack/react-query'
import { useAuthUser } from '../auth/useAuthUser'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { ActionFunctionsType } from '../home/types'
import { copyDatabasesRequest } from './databases.api'
import { DBStatus, IDatabase } from './databases.types'
import { useEditDatabaseModal } from './useEditDatabaseModal'
import { useMethodModal } from './useMethodModal'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'

export type DatabaseActions =
  'Start' |
  'Stop' |
  'Terminate' |
  'Track' |
  'Copy to space' |
  'Move to Archive' |
  'Attach License' |
  'Detach License' |
  'Edit Database Info' |
  'Edit tags' |
  'Edit properties'

export const useDatabaseSelectActions = (selectedItems: IDatabase[], resourceKeys: string[]) => {
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const selected = selectedItems.filter(x => x !== undefined)
  const availableLicenses = user?.links?.licenses ? user.links.licenses : false

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({
    resource: 'dbclusters',
    selected,
    updateFunction: copyDatabasesRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal({
    selected: selected[0],
    resource: 'dbclusters',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: detachLicenseModal,
    setShowModal: setDetachLicenseModal,
    isShown: isShownDetachLicenseModal,
  } = useDetachLicenseModal({
    selected: selected[0],
    resource: 'dbclusters',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

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

  const { modalComp: editDBModal, setShowModal: setEditDBModal, isShown: isShownEditDBModal } = useEditDatabaseModal(selected[0])

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IDatabase>({
    resource: 'dbclusters',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: propertiesModal,
    setShowModal: setPropertiesModal,
    isShown: isShownPropertiesModal,
  } = useEditPropertiesModal<IDatabase>({
    type: 'dbCluster',
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties', 'dbCluster'] })
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
    Start: {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.start || isDisabledByStatus(selected[0].status).start,
      func: () => setMethodStartModal(true),
      modal: methodStartModal,
      showModal: isShownMethodStartModal,
    },
    Stop: {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.stop || isDisabledByStatus(selected[0].status).stop,
      func: () => setMethodStopModal(true),
      modal: methodStopModal,
      showModal: isShownMethodStopModal,
    },
    Terminate: {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.terminate || isDisabledByStatus(selected[0].status).terminate,
      func: () => setMethodTerminateModal(true),
      modal: methodTerminateModal,
      showModal: isShownMethodTerminateModal,
    },
    Track: {
      type: 'route',
      to: `/home/databases/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Move to Archive': {
      type: 'modal',
      shouldHide: true,
      isDisabled: true, // databases.length !== 1,
      func: () => {},
    },
    'Attach License': {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.license || !availableLicenses,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    'Detach License': {
      type: 'modal',
      isDisabled: selected.length !== 1,
      shouldHide: selected.length !== 1 || !selected[0]?.links.detach_license,
      func: () => setDetachLicenseModal(true),
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
    },
    'Edit Database Info': {
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.update,
      func: () => setEditDBModal(true),
      modal: editDBModal,
      showModal: isShownEditDBModal,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1,
      modal: tagsModal,
      showModal: isShownTagsModal,
    },
    'Edit properties': {
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: false,
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
    },
  }

  return actionFunctions
}
