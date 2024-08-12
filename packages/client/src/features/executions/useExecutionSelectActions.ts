import { useQueryClient } from '@tanstack/react-query'
import { omit, pick } from 'ramda'
import { getSpaceIdFromScope } from '../../utils'
import { useAttachToModal } from '../actionModals/useAttachToModal'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useEditPropertiesModal } from '../actionModals/useEditPropertiesModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { getBaseLink } from '../apps/run/utils'
import { useAuthUser } from '../auth/useAuthUser'
import { ActionFunctionsType, HomeScope } from '../home/types'
import { copyJobsRequest } from './executions.api'
import { IExecution } from './executions.types'
import { getExecutionJobsList } from './executions.util'
import { useSnapshotModal } from './useSnapshotModal'
import { useTerminateModal } from './useTerminateModal'

export type ExecutionAction =
  'Terminate' |
  'Track' |
  'Copy to space' |
  'Feature' |
  'Snapshot' |
  'Unfeature' |
  'Make Public' |
  'Attach to...' |
  'Comments' |
  'Edit tags' |
  'Edit properties'

export const useExecutionActions = ({
  homeScope,
  selectedItems,
  resourceKeys,
}: {
  homeScope?: HomeScope
  selectedItems: IExecution[]
  resourceKeys: string[]
}) => {
  const queryClient = useQueryClient()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user ? user.admin : false
  const isJobOwner = user?.dxuser === selected[0]?.launched_by_dxuser

  const featureMutation = useFeatureMutation({
    resource: 'jobs',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })

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
    type: 'job',
    selected: selected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys })
    },
  })
  // "Items need to be an array of objects with id and type (one of App, Comparison, Job, or UserFile)"
  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(
    selected.map(s => s.id),
    'JOB',
  )

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

  const links = selected[0]?.links
  const spaceId = getSpaceIdFromScope(selected[0]?.scope)

  let actions: ActionFunctionsType<ExecutionAction> = {
    Terminate: {
      type: 'modal',
      func: () => setTerminateModal(true),
      isDisabled:
        selected.length === 0 || selected.some(item => ['terminated', 'failed', 'done', undefined].includes(item?.state)),
      modal: terminateModal,
      showModal: isShownTerminateModal,
    },
    Track: {
      type: 'route',
      to: `/${getBaseLink(spaceId)}/executions/${selected[0]?.uid}/track`,
      isDisabled: selected.length !== 1,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled: selected.length === 0 || selected.some(e => !e.links?.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    Feature: {
      type: 'modal',
      func: () => featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      shouldHide: !isAdmin || homeScope !== 'everybody',
    },
    Unfeature: {
      type: 'modal',
      func: () => featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      shouldHide: !isAdmin || (homeScope !== 'everybody' && homeScope !== 'featured'),
    },
    'Make Public': {
      type: 'link',
      isDisabled:
        selected.length !== 1 ||
        !selected[0]?.links?.publish ||
        (selected[0].jobs && selected[0].scope === 'private') ||
        !user?.allowed_to_publish,
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
    Snapshot: {
      type: 'modal',
      func: () => setSnapshotModal(true),
      isDisabled: selected.length !== 1 || selected.some(e => !e.links?.open_external),
      shouldHide: selected.some(e => !e.workstation_api_version),
      modal: snapshotModal,
      showModal: isSnapshotModal,
    },
    Comments: {
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
      shouldHide: (!isAdmin && !isJobOwner) || selected.length !== 1,
    },
    'Edit properties': {
      type: 'modal',
      func: () => setPropertiesModal(true),
      isDisabled: false,
      modal: propertiesModal,
      showModal: isShownPropertiesModal,
      shouldHide: (!isAdmin && !isJobOwner) || selected.length !== 1,
    },
  }

  if (homeScope === 'spaces') {
    if (isJobOwner) {
      actions = omit(['Make Public', 'Feature', 'Unfeature'], actions)
    } else {
      // If the user is not the owner of the job in a space, they cannot connect
      // to the workstation or perform other actions where ownership is needed
      actions = pick(['Track', 'Copy to space', 'Attach to...', 'Comments', 'Edit tags', 'Edit properties'], actions)
    }
  }

  return actions
}
