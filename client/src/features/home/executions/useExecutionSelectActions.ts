import { pick } from 'ramda'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthUser } from '../../auth/useAuthUser'
import { useAttachToModal } from '../actionModals/useAttachToModal'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { ActionFunctionsType, ResourceScope } from '../types'
import { copyJobsRequest } from './executions.api'
import { IExecution } from './executions.types'
import { getExecutionJobsList } from './executions.util'
import { useTerminateModal } from './useTerminateModal'
import { useSnapshotModal } from './useSnapshotModal'

export enum ExecutionAction {
  'View Logs' = 'View Logs',
  'Terminate' = 'Terminate',
  'Track' = 'Track',
  'Copy to space' = 'Copy to space',
  'Feature' = 'Feature',
  'Snapshot' = 'Snapshot',
  'Unfeature' = 'Unfeature',
  'Make Public' = 'Make Public',
  'Attach to...' = 'Attach to...',
  'Comments' = 'Comments',
  'Edit tags' = 'Edit tags',
}

export const useExecutionActions = ({ scope, selectedItems, resourceKeys }: { scope?: ResourceScope, selectedItems: IExecution[], resourceKeys: string[]}) => {
  const queryClient = useQueryClient()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user ? user.admin : false

  const featureMutation = useFeatureMutation({ resource: 'jobs', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  // An IExecution can be either a job (app) or workflow, in the case of the workflow
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
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IExecution>({
    resource: 'jobs', selected: selected[0], onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })
// "Items need to be an array of objects with id and type (one of App, Comparison, Job, or UserFile)"
  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(selected.map(s => s.id), 'JOB')

  const {
    modalComp: terminateoModal,
    setShowModal: setTerminateModal,
    isShown: isShownTerminateModal,
  } = useTerminateModal({ selected })

  const {
    modalComp: snapshotModal,
    setShowModal: setSnapshotModal,
    isShown: isSnapshotModal,
  } = useSnapshotModal({ selected: selected[0] })

  const attachLicenseMutation = useMutation({
    mutationKey: ['attach-license'],
    mutationFn: async (id: string) => { }
  })

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false
  const links = selected[0]?.links

  let actions: ActionFunctionsType<ExecutionAction> = {
    'View Logs': {
      type: 'link',
      link: links?.log,
      isDisabled: selected.length !== 1 || !links.log,
    },
    'Terminate': {
      type: 'modal',
      func: () => setTerminateModal(true),
      isDisabled: selected.length !== 1,
      modal: terminateoModal,
      showModal: isShownTerminateModal,
    },
    'Track': {
      type: 'link',
      link: links?.track,
      isDisabled: selected.length !== 1 || !links.track,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links?.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Feature': {
      type: 'modal',
      func: () => featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      shouldHide: !isAdmin || scope !== 'everybody',
    },
    'Unfeature': {
      type: 'modal',
      func: () => featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      shouldHide: !isAdmin || scope !== 'everybody' && scope !== 'featured',
    },
    'Make Public': {
      type: 'link',
      isDisabled: selected.length !== 1 || !selected[0]?.links?.publish || (selected[0].jobs && selected[0].scope === 'private'),
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
    },
    'Attach to...': {
      type: 'modal',
      func: () => setAttachToModal(true),
      isDisabled: selected.length === 0 || selected.length > 1,
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    'Snapshot': {
      type: 'modal',
      func: () => setSnapshotModal(true),
      isDisabled: selected.length !== 1 || selected.some(e => !e.links?.open_external),
      shouldHide: selected.some(e => !e.workstation_api_version),
      modal: snapshotModal,
      showModal: isSnapshotModal,
    },
    'Comments': {
      type: 'link',
      isDisabled: selected.length !== 1,
      link: `/jobs/${selected[0]?.uid}/comments`,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.launched_by !== user?.full_name) || (selected.length !== 1),
    },
  }

  if(scope === 'spaces') {
    actions = pick(['Terminate', 'Copy to space', 'Attach to...'], actions)
  }

  return actions
}
