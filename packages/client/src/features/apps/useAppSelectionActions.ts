import { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { IChallenge } from '../../types/challenge'
import { useCopyToPrivateModal } from '../actionModals/useCopyToPrivateModal'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useDeleteModal } from '../actionModals/useDeleteModal'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useForkAppToModal } from '../actionModals/useForkAppToModal'
import { useAuthUser } from '../auth/useAuthUser'
import { useComparatorModal } from '../comparators/useComparatorModal'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { HomeScope } from '../home/types'
import { copyAppsRequest, copyAppsToPrivate, deleteAppsRequest } from './apps.api'
import { IApp } from './apps.types'
import { getBaseLink } from './run/utils'
import { useAttachToChallengeModal } from './useAttachToChallengeModal'
import { useExportToModal } from './useExportToModal'
import { toastSuccess } from '../../components/NotificationCenter/ToastHelper'

export interface UseAppSelectionActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useAppSelectionActions = ({
  homeScope,
  spaceId,
  selectedItems,
  resourceKeys,
  resetSelected,
  comparatorLinks,
  challenges,
  isContributorOrHigher,
}: {
  homeScope?: HomeScope
  spaceId?: string
  selectedItems: IApp[]
  resourceKeys: string[]
  resetSelected?: () => void
  comparatorLinks: { [key: string]: string }
  challenges: IChallenge[] | undefined
  isContributorOrHigher?: boolean
}): UseAppSelectionActionsResult => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin
  const canDeleteApp = selected.every(
    app =>
      app.added_by === user?.dxuser ||
      (isAdmin && app.scope === 'public') ||
      (isContributorOrHigher && app.scope === `space-${spaceId}`),
  )

  const featureMutation = useFeatureMutation({
    resource: 'apps',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: comparatorAddModal,
    setShowModal: setShowComparatorAddModal,
    isShown: isShownComparatorAddModal,
  } = useComparatorModal({
    actionType: 'add_to_comparators',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: comparatorSetModal,
    setShowModal: setShowComparatorSetModal,
    isShown: isShownComparatorSetModal,
  } = useComparatorModal({
    actionType: 'set_app',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  const {
    modalComp: comparatorRemoveModal,
    setShowModal: setShowComparatorRemoveModal,
    isShown: isShownComparatorRemoveModal,
  } = useComparatorModal({
    actionType: 'remove_from_comparators',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal<IApp>({
    resource: 'apps',
    selected,
    updateFunction: copyAppsRequest,
    onSuccess: () => {
      toastSuccess('The app has been copied to the space successfully.')
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: copyToPrivateModal,
    setShowModal: setCopyToPrivateModal,
    isShown: isShownCopyToPrivateModal,
  } = useCopyToPrivateModal({
    resource: 'apps',
    selected,
    copyFunction: copyAppsToPrivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: attachToChallengeModal,
    setShowModal: setAttachToChallengeModal,
    isShown: isShownAttachToChallengeModal,
  } = useAttachToChallengeModal({
    resource: 'apps',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'app',
    selected: selected.map(s => ({ name: s.name, location: s.location, id: s.uid })),
    request: () => deleteAppsRequest(selected.map(s => s.uid)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['apps'],
      })
      if (spaceId) {
        navigate(`/spaces/${spaceId}/apps`)
      } else {
        navigate(`/home/apps?scope=${homeScope}`)
      }
      if (resetSelected) resetSelected()
    },
  })

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal({
    resource: 'apps',
    selected: { uid: `app-series-${selected[0]?.app_series_id}`, name: selected[0]?.name, tags: selected[0]?.tags },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: propertiesModal,
    setShowModal: setPropertiesModal,
    isShown: isShownPropertiesModal,
  } = useEditPropertiesModal<IApp>({
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties'] })
    },
  })

  const {
    modalComp: exportToModal,
    setShowModal: setExportToModal,
    isShown: isShownExportToModal,
  } = useExportToModal({ selected: selected[0], resource: 'apps' })

  const {
    modalComp: forkToModal,
    setShowModal: setForkToModal,
    isShown: isShownForkToModal,
  } = useForkAppToModal({ selectedApp: selected[0] })

  const actions: Action[] = [
    {
      name: 'Run',
      type: 'route',
      to: `/${getBaseLink(spaceId)}/apps/${selected[0]?.uid}/jobs/new`,
      isDisabled: selected.length !== 1 || !selected[0].links.run_job,
      cloudResourcesConditionType: 'all',
    },
    {
      name: 'Track',
      type: 'route',
      to: `/${getBaseLink(spaceId)}/apps/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1,
    },
    {
      name: 'Edit',
      type: 'route',
      to: `/${getBaseLink(spaceId)}/apps/${selected[0]?.uid}/edit`,
      isDisabled: selected.length !== 1 || !selected[0].latest_revision || selected[0].added_by !== user?.dxuser,
    },
    {
      name: 'Fork to',
      type: 'modal',
      func: () => setForkToModal(true),
      modal: forkToModal,
      showModal: isShownForkToModal,
      isDisabled: selected.length !== 1 || selected[0]?.entity_type === 'https',
    },
    {
      name: 'Export to',
      type: 'modal',
      func: () => setExportToModal(true),
      modal: exportToModal,
      showModal: isShownExportToModal,
      isDisabled: selected.length !== 1,
    },
    {
      name: 'Make public',
      type: 'route',
      to: `/publish?identifier=${selected[0]?.uid}&type=app`,
      isDisabled: selected.length !== 1 || !user?.allowed_to_publish,
      shouldHide: selected[0]?.location !== 'Private',
    },
    {
      name: 'Feature',
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      shouldHide: !isAdmin || homeScope !== 'everybody',
    },
    {
      name: 'Unfeature',
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      shouldHide: !isAdmin || (homeScope !== 'everybody' && homeScope !== 'featured'),
    },
    {
      name: 'Delete',
      type: 'modal',
      func: () => setDeleteModal(true),
      isDisabled: selected.length === 0 || !canDeleteApp,
      modal: deleteModal,
      showModal: isShownDeleteModal,
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
      name: 'Copy to My Home (private)',
      type: 'modal',
      func: () => setCopyToPrivateModal(true),
      isDisabled: selected.length === 0,
      modal: copyToPrivateModal,
      showModal: isShownCopyToPrivateModal,
      shouldHide: ['private', 'public'].includes(selected[0]?.scope),
    },
    {
      name: 'Comments',
      type: 'link',
      link: `/apps/${selected[0]?.uid}/comments`,
      isDisabled: selected.length !== 1,
    },
    {
      name: 'Set as Challenge App',
      type: 'modal',
      func: () => setAttachToChallengeModal(true),
      isDisabled: selected.length !== 1,
      modal: attachToChallengeModal,
      showModal: isShownAttachToChallengeModal,
      shouldHide: !challenges || challenges.length === 0 || !selected[0]?.links?.assign_app,
    },
    {
      name: 'Edit tags',
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.dxuser) || selected.length !== 1,
    },
    {
      name: 'Edit properties',
      type: 'modal',
      func: () => setPropertiesModal(true),
      modal: propertiesModal,
      isDisabled: selected.length === 0,
      showModal: isShownPropertiesModal,
      shouldHide: !isAdmin && selected[0]?.added_by !== user?.dxuser,
    },
    {
      name: 'Add to Comparators',
      type: 'modal',
      func: () => setShowComparatorAddModal(true, 'add_to_comparators'),
      isDisabled: false,
      shouldHide: !comparatorLinks?.add_to_comparators,
      showModal: isShownComparatorAddModal,
      modal: comparatorAddModal,
    },
    {
      name: 'Set this app as comparison default',
      type: 'modal',
      func: () => setShowComparatorSetModal(true, 'set_app'),
      isDisabled: false,
      shouldHide: !comparatorLinks?.set_app,
      showModal: isShownComparatorSetModal,
      modal: comparatorSetModal,
    },
    {
      name: 'Remove from Comparators',
      type: 'modal',
      func: () => setShowComparatorRemoveModal(true, 'remove_from_comparators'),
      isDisabled: false,
      shouldHide: !comparatorLinks?.remove_from_comparators,
      showModal: isShownComparatorRemoveModal,
      modal: comparatorRemoveModal,
    },
  ]

  let filteredActions = actions

  if (homeScope) {
    filteredActions = filteredActions.filter(action => action.name !== 'Copy to My Home (private)')
  } else {
    filteredActions = filteredActions.filter(action => action.name !== 'Make public')
  }

  if (homeScope === 'spaces') {
    const allowedNames = ['Copy to space']
    filteredActions = filteredActions.filter(action => allowedNames.includes(action.name))
  }

  const modals = extractModalsFromActions(actions)

  return { actions: filteredActions, modals }
}
