import { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSpaceIdFromScope } from '../../utils'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { getBaseLink } from '../apps/run/utils'
import { useAuthUser } from '../auth/useAuthUser'
import { Action } from '../home/action-types'
import { extractModalsFromActions } from '../home/extractModalsFromActions'
import { HomeScope } from '../home/types'
import { copyJobsRequest } from './executions.api'
import { IExecution } from './executions.types'
import { getExecutionJobsList, isOpenExternalAvailable, isPublishable } from './executions.util'
import { useSnapshotModal } from './useSnapshotModal'
import { useTerminateModal } from './useTerminateModal'

export interface UseExecutionSelectActionsResult {
  actions: Action[]
  modals: Record<string, ReactNode>
}

export const useExecutionSelectActions = ({
  homeScope,
  selectedItems,
  resourceKeys,
}: {
  homeScope?: HomeScope
  selectedItems: IExecution[]
  resourceKeys: string[]
}): UseExecutionSelectActionsResult => {
  const queryClient = useQueryClient()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user ? user.admin : false
  const isJobOwner = user?.dxuser === selected[0]?.launchedByDxuser

  const featureMutation = useFeatureMutation({
    resource: 'jobs',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const selectedJobs = getExecutionJobsList(selected)

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({
    resource: 'jobs',
    selected: selectedJobs.map(jobUid => ({ id: jobUid })),
    updateFunction: copyJobsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IExecution>({
    resource: 'jobs',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: propertiesModal,
    setShowModal: setPropertiesModal,
    isShown: isShownPropertiesModal,
  } = useEditPropertiesModal<IExecution>({
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

  const {
    modalComp: terminateModal,
    setShowModal: setTerminateModal,
    isShown: isShownTerminateModal,
  } = useTerminateModal({ selected })

  const {
    modalComp: snapshotModal,
    setShowModal: setSnapshotModal,
    isShown: isSnapshotModal,
  } = useSnapshotModal({ selected: selected[0] })

  const spaceId = getSpaceIdFromScope(selected[0]?.scope)

  let actions: Action[] = [
    {
      name: 'Terminate',
      type: 'modal',
      func: () => setTerminateModal(true),
      isDisabled:
        selected.length === 0 || selected.some(item => ['terminated', 'failed', 'done', undefined].includes(item?.state)),
      modal: terminateModal,
      showModal: isShownTerminateModal,
    },
    {
      name: 'Track',
      type: 'route',
      to: `/${getBaseLink(spaceId)}/executions/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1,
    },
    {
      name: 'Copy to space',
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0,
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    {
      name: 'Feature',
      type: 'modal',
      func: () => featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || selected.every(e => e.featured),
      shouldHide: !isAdmin || homeScope !== 'everybody',
    },
    {
      name: 'Unfeature',
      type: 'modal',
      func: () => featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || selected.every(e => !e.featured),
      shouldHide: !isAdmin || (homeScope !== 'everybody' && homeScope !== 'featured'),
    },
    {
      name: 'Make Public',
      type: 'route',
      isDisabled:
        selected.length !== 1 ||
        !isPublishable(selected[0], user?.dxuser) ||
        (selected[0].jobs && selected[0].scope === 'private') ||
        !user?.allowed_to_publish,
      to: `/publish?identifier=${selected[0]?.uid}&type=job`,
      shouldHide: selected.length !== 1 || homeScope !== 'me',
    },
    {
      name: 'Snapshot',
      type: 'modal',
      func: () => setSnapshotModal(true),
      isDisabled: selected.length !== 1 || selected.some(e => !isOpenExternalAvailable(e)),
      shouldHide: selected.some(e => !e.snapshot),
      modal: snapshotModal,
      showModal: isSnapshotModal,
    },
    {
      name: 'Comments',
      type: 'link',
      isDisabled: selected.length !== 1,
      link: `/jobs/${selected[0]?.uid}/comments`,
    },
    {
      name: 'Edit tags',
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && !isJobOwner) || selected.length !== 1,
    },
    {
      name: 'Edit properties',
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: selected.length === 0,
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
      shouldHide: !isAdmin && !isJobOwner,
    },
  ]

  if (homeScope === 'spaces') {
    if (isJobOwner) {
      actions = actions.filter(action => !['Make Public', 'Feature', 'Unfeature'].includes(action.name))
    } else {
      actions = actions.filter(action =>
        ['Track', 'Copy to space', 'Comments', 'Edit tags', 'Edit properties'].includes(action.name),
      )
    }
  }

  const modals = extractModalsFromActions(actions)

  return { actions, modals }
}
