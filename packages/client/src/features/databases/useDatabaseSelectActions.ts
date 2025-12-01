import { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { copyDatabasesRequest } from './databases.api'
import { DBStatus, IDatabase } from './databases.types'
import { useEditDatabaseModal } from './useEditDatabaseModal'
import { useMethodModal } from './useMethodModal'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useLicensesListQuery } from '../licenses/queries'

export interface UseDatabaseSelectActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useDatabaseSelectActions = ({
  selectedItems,
  resourceKeys,
}: {
  selectedItems: IDatabase[]
  resourceKeys: string[]
}): UseDatabaseSelectActionsResult => {
  const queryClient = useQueryClient()
  const { data: licenses } = useLicensesListQuery()
  const selected = selectedItems.filter(x => x !== undefined)
  const availableLicenses = Boolean(licenses?.licenses.length !== 0)

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
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties'] })
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
      case 'stopping':
      case 'starting':
      case 'terminating':
      case 'terminated':
        actionsDisabled = { start: true, stop: true, terminate: true }
        break
      default:
        break
    }
    return actionsDisabled
  }

  const actions: Action[] = [
    {
      name: 'Start',
      type: 'modal',
      isDisabled:
        selected.length !== 1 ||
        !selected[0]?.links.start ||
        isDisabledByStatus(selected[0].status).start ||
        selected[0]?.currentUserRole === 'Viewer',
      func: () => setMethodStartModal(true),
      modal: methodStartModal,
      showModal: isShownMethodStartModal,
    },
    {
      name: 'Stop',
      type: 'modal',
      isDisabled:
        selected.length !== 1 ||
        !selected[0]?.links.stop ||
        isDisabledByStatus(selected[0].status).stop ||
        selected[0]?.currentUserRole === 'Viewer',
      func: () => setMethodStopModal(true),
      modal: methodStopModal,
      showModal: isShownMethodStopModal,
    },
    {
      name: 'Terminate',
      type: 'modal',
      isDisabled:
        selected.length !== 1 ||
        !selected[0]?.links.terminate ||
        isDisabledByStatus(selected[0].status).terminate ||
        selected[0]?.currentUserRole === 'Viewer',
      func: () => setMethodTerminateModal(true),
      modal: methodTerminateModal,
      showModal: isShownMethodTerminateModal,
    },
    {
      name: 'Track',
      type: 'route',
      to: `/home/databases/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1,
    },
    {
      name: 'Copy to space',
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    {
      name: 'Move to Archive',
      type: 'modal',
      shouldHide: true,
      isDisabled: true,
      func: () => {},
    },
    {
      name: 'Attach License',
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.license || !availableLicenses,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    {
      name: 'Detach License',
      type: 'modal',
      isDisabled: selected.length !== 1,
      shouldHide: selected.length !== 1 || !selected[0]?.links.detach_license,
      func: () => setDetachLicenseModal(true),
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
    },
    {
      name: 'Edit Database Info',
      type: 'modal',
      isDisabled: selected.length !== 1 || !selected[0]?.links.update || selected[0]?.currentUserRole === 'Viewer',
      func: () => setEditDBModal(true),
      modal: editDBModal,
      showModal: isShownEditDBModal,
    },
    {
      name: 'Edit tags',
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1 || selected[0]?.currentUserRole === 'Viewer',
      modal: tagsModal,
      showModal: isShownTagsModal,
    },
    {
      name: 'Edit properties',
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: selected.length === 0 || selected[0]?.currentUserRole === 'Viewer',
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
    },
  ]

  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
