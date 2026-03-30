import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal'
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal'
import type { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import type { DBStatus, IDatabase } from './databases.types'
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
  const selectedDb = selected[0]
  const availableLicenses = Boolean(licenses?.licenses.length !== 0)

  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal({
    selected: selectedDb,
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
    selected: selectedDb,
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

  const {
    modalComp: editDBModal,
    setShowModal: setEditDBModal,
    isShown: isShownEditDBModal,
  } = useEditDatabaseModal(selectedDb)

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IDatabase>({
    resource: 'dbclusters',
    selected: selectedDb,
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

  const isDisabledByStatus = (status: DBStatus): { start: boolean; stop: boolean; terminate: boolean } => {
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

  const canRunAction = (action: 'start' | 'stop' | 'terminate'): boolean => {
    if (selected.length !== 1 || !selectedDb) return false
    if (selectedDb.currentUserRole === 'Viewer') return false

    const capabilityByAction = {
      start: selectedDb.canStart,
      stop: selectedDb.canStop,
      terminate: selectedDb.canTerminate,
    }

    // Prefer server capability flags when present, otherwise use status-based fallback.
    const capability = capabilityByAction[action]
    if (typeof capability === 'boolean') return capability

    return !isDisabledByStatus(selectedDb.status)[action]
  }

  const hasAttachedLicense = !!selectedDb?.fileLicense?.id

  const actions: Action[] = [
    {
      name: 'Start',
      type: 'modal',
      isDisabled: !canRunAction('start'),
      func: () => setMethodStartModal(true),
      modal: methodStartModal,
      showModal: isShownMethodStartModal,
    },
    {
      name: 'Stop',
      type: 'modal',
      isDisabled: !canRunAction('stop'),
      func: () => setMethodStopModal(true),
      modal: methodStopModal,
      showModal: isShownMethodStopModal,
    },
    {
      name: 'Terminate',
      type: 'modal',
      isDisabled: !canRunAction('terminate'),
      func: () => setMethodTerminateModal(true),
      modal: methodTerminateModal,
      showModal: isShownMethodTerminateModal,
    },
    {
      name: 'Track',
      type: 'route',
      to: `/home/databases/${selectedDb?.uid}/track`,
      isDisabled: selected.length !== 1,
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
      isDisabled: selected.length !== 1 || !availableLicenses,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    {
      name: 'Detach License',

      type: 'modal',
      isDisabled: selected.length !== 1 || !hasAttachedLicense,
      shouldHide: selected.length !== 1 || !hasAttachedLicense,
      func: () => setDetachLicenseModal(true),
      modal: detachLicenseModal,
      showModal: isShownDetachLicenseModal,
    },
    {
      name: 'Edit Database Info',
      type: 'modal',
      isDisabled: selected.length !== 1 || selectedDb?.currentUserRole === 'Viewer',
      func: () => setEditDBModal(true),
      modal: editDBModal,
      showModal: isShownEditDBModal,
    },
    {
      name: 'Edit tags',
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1 || selectedDb?.currentUserRole === 'Viewer',
      modal: tagsModal,
      showModal: isShownTagsModal,
    },
    {
      name: 'Edit properties',
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: selected.length === 0 || selectedDb?.currentUserRole === 'Viewer',
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
    },
  ]

  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
