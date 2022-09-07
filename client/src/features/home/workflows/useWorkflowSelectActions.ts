import { pick } from 'ramda'
import { useQueryClient } from 'react-query'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { useAuthUser } from '../../auth/useAuthUser'
import { useCopyToSpaceModal } from '../actionModals/useCopyToSpace'
import { useDeleteModal } from '../actionModals/useDeleteModal'
import { useEditTagsModal } from '../actionModals/useEditTagsModal'
import { useFeatureMutation } from '../actionModals/useFeatureMutation'
import { useExportToModal } from '../apps/useExportToModal'
import { ActionFunctionsType, ResourceScope } from '../types'
import { copyWorkflowsRequest, deleteWorkflowRequest } from './workflows.api'
import { IWorkflow, WorkflowActions } from './workflows.types'

export const useWorkflowSelectActions = ({ scope, spaceId, selectedItems, resourceKeys, resetSelected }: { scope?: ResourceScope, spaceId?: string, selectedItems: IWorkflow[], resourceKeys: string[], resetSelected?: () => void }) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useAuthUser()
  const isAdmin = user ? user.admin : false

  const featureMutation = useFeatureMutation({ resource: 'workflows', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  } })

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal<IWorkflow>({ resource: 'workflows', selected, updateFunction: copyWorkflowsRequest, 
  onSuccess: (res: any) => {
    toast.success('The workflow has been published successfully!')
    queryClient.invalidateQueries(resourceKeys).then(() => {
      if (Array.isArray(res.workflows)) {
        history.push(`/home/workflows/${res.workflows[0].uid}`)
      }
    },
    )
  } })

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal({
    resource: 'workflows',
    selected: { uid: `workflow-series-${selected[0]?.workflow_series_id}`, name: selected[0]?.name, tags: selected[0]?.tags },
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'workflow',
    selected: selected.map(s => ({ name: s.name, id: s.uid, location: s.location })),
    request: deleteWorkflowRequest,
    onSuccess: () => {
      queryClient.invalidateQueries('workflows')
      if(spaceId) {
        history.push(`/spaces/${spaceId}/workflows`)
      } else {
        history.push('/home/workflows')
      }
      if(resetSelected) resetSelected()
    },
  })

  const {
    modalComp: exportToModal,
    setShowModal: setExportToModal,
    isShown: isShownExportToModal,
  } = useExportToModal({ selected: selected[0] })

  const links = selected[0]?.links

  let actions: ActionFunctionsType<WorkflowActions> = {
    'Run': {
      type: 'link',
      link: `${links?.show}/analyses/new`,
      isDisabled: selected.length !== 1 || !links?.run_workflow,
      cloudResourcesConditionType: 'all',
    },
    'Run Batch': {
      type: 'link',
      link: links?.batch_run_workflow,
      isDisabled: selected.length !== 1 || !links?.batch_run_workflow,
      cloudResourcesConditionType: 'all',
    },
    'Diagram': {
      type: 'link',
      link: links?.diagram,
      isDisabled: selected.length !== 1 || !links?.diagram,
    },
    'Edit': {
      type: 'link',
      link: links?.edit,
      isDisabled: selected.length !== 1 || !links?.edit,
    },
    'Fork': {
      type: 'link',
      link: links?.fork,
      isDisabled: selected.length !== 1 || !links?.fork,
    },
    'Export to': {
      type: 'modal',
      func: () => setExportToModal(true),
      modal: exportToModal,
      showModal: isShownExportToModal,
      isDisabled: selected.length !== 1,
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
      modal: deleteModal,
      showModal: isShownDeleteModal,
      shouldHide: scope === 'spaces',
      isDisabled: selected.some((e) => !e.links?.delete) || selected.length === 0,
    },
    'Copy to space': {
      type: 'modal',
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links?.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Comments': {
      type: 'link',
      link: `/workflows/${selected[0]?.uid}/comments`,
      isDisabled: false,
      shouldHide: selected.length !== 1,
    },
    'Edit tags': {
      type: 'modal',
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      shouldHide: (!isAdmin && selected[0]?.added_by !== user.full_name) || (selected.length !== 1),
    },
  }

  if(scope === 'spaces') {
    actions = pick(['Fork', 'Export to', 'Copy to space'], actions)
  }

  return actions
}
