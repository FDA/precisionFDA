import { pick } from 'ramda'
import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router'
import { IChallenge } from '../../../types/challenge'
import { useAuthUser } from '../../auth/useAuthUser'
import { useAttachToModal } from '../actionModals/useAttachToModal'
import { useCopyToPrivateModal } from '../actionModals/useCopyToPrivateModal'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useDeleteModal } from '../actionModals/useDeleteModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useComparatorModal } from '../comparators/useComparatorModal'
import { ActionFunctionsType, ResourceScope } from '../types'
import { copyAppsRequest, copyAppsToPrivate, deleteAppsRequest } from './apps.api'
import { IApp } from './apps.types'
import { useAttachToChallengeModal } from './useAttachToChallengeModal'
import { useExportToModal } from './useExportToModal'

export enum AppActions {
  'Run' = 'Run',
  'Run batch' = 'Run batch',
  'Track' = 'Track',
  'Edit' = 'Edit',
  'Fork' = 'Fork',
  'Export to' = 'Export to',
  'Make public' = 'Make public',
  'Feature' = 'Feature',
  'Unfeature' = 'Unfeature',
  'Delete' = 'Delete',
  'Copy to space' = 'Copy to space',
  'Copy to My Home (private)' = 'Copy to My Home (private)',
  'Attach to...' = 'Attach to...',
  'Comments' = 'Comments',
  'Set as Challenge App' = 'Set as Challenge App',
  'Edit tags' = 'Edit tags',
  'Add to Comparators' = 'Add to Comparators',
  'Set this app as comparison default' = 'Set this app as comparison default',
  'Remove from Comparators' = 'Remove from Comparators',
}

export const useAppSelectionActions = ({
  scope,
  spaceId,
  selectedItems,
  resourceKeys,
  resetSelected,
  comparatorLinks,
  challenges,
}: {
  scope?: ResourceScope,
  spaceId?: string,
  selectedItems: IApp[],
  resourceKeys: string[],
  resetSelected?: () => void,
    comparatorLinks: { [key: string]: string },
  challenges: IChallenge[] | undefined
}) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user?.admin

  const featureMutation = useFeatureMutation({ resource: 'apps', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: comparatorAddModal,
    setShowModal: setShowComparatorAddModal,
    isShown: isShownComparatorAddModal,
  } = useComparatorModal({ actionType: 'add_to_comparators', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })
  const {
    modalComp: comparatorSetModal,
    setShowModal: setShowComparatorSetModal,
    isShown: isShownComparatorSetModal,
  } = useComparatorModal({ actionType: 'set_app', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })
  const {
    modalComp: comparatorRemoveModal,
    setShowModal: setShowComparatorRemoveModal,
    isShown: isShownComparatorRemoveModal,
  } = useComparatorModal({ actionType: 'remove_from_comparators', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(selected.map(s => s.id), 'APP')

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal<IApp>({ resource: 'apps', selected, updateFunction: copyAppsRequest, onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: copyToPrivateModal,
    setShowModal: setCopyToPrivateModal,
    isShown: isShownCopyToPrivateModal,
  } = useCopyToPrivateModal({
    resource: 'apps',
    selected,
    request: copyAppsToPrivate,
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const {
    modalComp: attachToChallengeModal,
    setShowModal: setAttachToChallengeModal,
    isShown: isShownAttachToChallengeModal,
  } = useAttachToChallengeModal<IApp>({ resource: 'apps', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'app',
    selected: selected.map(s => ({ name: s.name, location: s.location, id: s.uid })),
    request: deleteAppsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['apps'])
      if(spaceId) {
        history.push(`/spaces/${spaceId}/apps`)
      } else {
        history.push('/home/apps')
      }
      if(resetSelected) resetSelected()
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
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const {
    modalComp: exportToModal,
    setShowModal: setExportToModal,
    isShown: isShownExportToModal,
  } = useExportToModal({ selected: selected[0] })

  let actions: ActionFunctionsType<AppActions> = {
    'Run': {
      type: 'link',
      link: `/apps/${selected[0]?.uid}/jobs/new`,
      isDisabled: selected.length !== 1 || !selected[0].links.run_job,
      cloudResourcesConditionType: 'all',
    },
    'Run batch': {
      type: 'link',
      link: `/apps/${selected[0]?.uid}/batch_app`,
      isDisabled: selected.length !== 1 || !selected[0].links.batch_run,
      cloudResourcesConditionType: 'all',
    },
    'Track': {
      type: 'link',
      link: selected[0]?.links?.track,
      isDisabled: selected.length !== 1 || !selected[0].links.track,
    },
    'Edit': {
      type: 'link',
      link: selected[0]?.links?.edit,
      isDisabled: selected.length !== 1 || !selected[0].links.edit || !selected[0].latest_revision,
    },
    'Fork': {
      type: 'link',
      link: selected[0]?.links?.fork,
      isDisabled: selected.length !== 1 || !selected[0].links.fork,
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
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
      isDisabled: selected.length !== 1 || !selected[0].links.publish,
      shouldHide: selected[0]?.location !== 'Private',
    },
    'Feature': {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      shouldHide: !isAdmin || scope !== 'everybody',
    },
    'Unfeature': {
      type: 'modal',
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      shouldHide: !isAdmin || scope !== 'everybody' && scope !== 'featured',
    },
    'Delete': {
      type: 'modal',
      func: () => setDeleteModal(true),
      isDisabled: selected.some((e) => !e.links.delete) || selected.length === 0,
      modal: deleteModal,
      showModal: isShownDeleteModal,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Copy to My Home (private)': {
      type: 'modal',
      func: () => setCopyToPrivateModal(true),
      isDisabled: selected.length === 0,
      modal: copyToPrivateModal,
      showModal: isShownCopyToPrivateModal,
    },
    'Attach to...': {
      type: 'modal',
      func: () => setAttachToModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.attach_to),
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    'Comments': {
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
      shouldHide: (!isAdmin && selected[0]?.added_by !== user?.dxuser) || (selected.length !== 1),
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

  if(scope === 'spaces') {
    actions = pick(['Copy to space', 'Attach to...'], actions)
  }

  return actions
}
