import { useQueryClient } from '@tanstack/react-query'
import { pick } from 'ramda'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
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
import { ActionFunctionsType, HomeScope } from '../home/types'
import { copyAppsRequest, copyAppsToPrivate, deleteAppsRequest } from './apps.api'
import { AppActions, IApp } from './apps.types'
import { getBaseLink } from './run/utils'
import { useAttachToChallengeModal } from './useAttachToChallengeModal'
import { useExportToModal } from './useExportToModal'

export const useAppSelectionActions = ({
  homeScope,
  spaceId,
  selectedItems,
  resourceKeys,
  resetSelected,
  comparatorLinks,
  challenges,
}: {
  homeScope?: HomeScope
  spaceId?: number
  selectedItems: IApp[]
  resourceKeys: string[]
  resetSelected?: () => void
  comparatorLinks: { [key: string]: string }
  challenges: IChallenge[] | undefined
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin

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
      toast.success('The app has been copied to the space successfully.')
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
  } = useAttachToChallengeModal<IApp>({
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
    request: deleteAppsRequest,
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
  } = useEditPropertiesModal({
    type: 'appSeries',
    selected: selected.map(app => ({ ...app, id: app.app_series_id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
      queryClient.invalidateQueries({ queryKey: ['edit-resource-properties', 'appSeries'] })
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

  let actions: ActionFunctionsType<AppActions> = {
    Run: {
      type: 'route',
      to: `/${getBaseLink(spaceId)}/apps/${selected[0]?.uid}/jobs/new`,
      isDisabled: selected.length !== 1 || !selected[0].links.run_job,
      cloudResourcesConditionType: 'all',
    },
    Track: {
      type: 'route',
      to: `/${getBaseLink(spaceId)}/apps/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1,
    },
    Edit: {
      type: 'route',
      to: `/${getBaseLink(spaceId)}/apps/${selected[0]?.uid}/edit`,
      isDisabled: selected.length !== 1 || !selected[0].latest_revision || selected[0].added_by !== user?.dxuser,
    },
    'Fork to': {
      type: 'modal',
      func: () => setForkToModal(true),
      modal: forkToModal,
      showModal: isShownForkToModal,
      isDisabled: selected.length !== 1 || selected[0]?.entity_type === 'https',
    },
    'Export to': {
      type: 'modal',
      func: () => setExportToModal(true),
      modal: exportToModal,
      showModal: isShownExportToModal,
      isDisabled: selected.length !== 1,
    },
    'Make public': {
      type: 'link',
      link: {
        method: 'GET',
        url: `/publish?identifier=${selected[0]?.uid}&type=app`,
      },
      isDisabled: selected.length !== 1 || !selected[0].links.publish || !user?.allowed_to_publish,
      shouldHide: selected[0]?.location !== 'Private',
    },
    Feature: {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      shouldHide: !isAdmin || homeScope !== 'everybody',
    },
    Unfeature: {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      shouldHide: !isAdmin || (homeScope !== 'everybody' && homeScope !== 'featured'),
    },
    Delete: {
      type: 'modal',
      func: () => setDeleteModal(true),
      isDisabled: selected.some(e => !e.links.delete) || selected.length === 0,
      modal: deleteModal,
      showModal: isShownDeleteModal,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Copy to My Home (private)': {
      type: 'modal',
      func: () => setCopyToPrivateModal(true),
      isDisabled: selected.length === 0,
      modal: copyToPrivateModal,
      showModal: isShownCopyToPrivateModal,
      shouldHide: ['private', 'public'].includes(selected[0]?.scope),
    },
    Comments: {
      type: 'link',
      link: `/apps/${selected[0]?.uid}/comments`,
      isDisabled: selected.length !== 1,
    },
    'Set as Challenge App': {
      type: 'modal',
      func: () => setAttachToChallengeModal(true),
      isDisabled: selected.length !== 1,
      modal: attachToChallengeModal,
      showModal: isShownAttachToChallengeModal,
      shouldHide: !challenges || challenges.length === 0 || !selected[0]?.links?.assign_app,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.dxuser) || selected.length !== 1,
    },
    'Edit properties': {
      type: 'modal',
      func: () => setPropertiesModal(true),
      modal: propertiesModal,
      isDisabled: selected.length === 0,
      showModal: isShownPropertiesModal,
      shouldHide: !isAdmin && selected[0]?.added_by !== user?.dxuser,
    },
    'Add to Comparators': {
      type: 'modal',
      func: () => setShowComparatorAddModal(true, 'add_to_comparators'),
      isDisabled: false,
      shouldHide: !comparatorLinks?.add_to_comparators,
      showModal: isShownComparatorAddModal,
      modal: comparatorAddModal,
    },
    'Set this app as comparison default': {
      type: 'modal',
      func: () => setShowComparatorSetModal(true, 'set_app'),
      isDisabled: false,
      shouldHide: !comparatorLinks?.set_app,
      showModal: isShownComparatorSetModal,
      modal: comparatorSetModal,
    },
    'Remove from Comparators': {
      type: 'modal',
      func: () => setShowComparatorRemoveModal(true, 'remove_from_comparators'),
      isDisabled: false,
      shouldHide: !comparatorLinks?.remove_from_comparators,
      showModal: isShownComparatorRemoveModal,
      modal: comparatorRemoveModal,
    },
  }

  if (homeScope === 'spaces') {
    actions = pick(['Copy to space'], actions)
  }

  return actions
}
