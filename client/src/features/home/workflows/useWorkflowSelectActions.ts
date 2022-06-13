import { pick } from "ramda";
import { useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import { RootState } from "../../../store";
import { useCopyToSpaceModal } from "../actionModals/useCopyToSpace";
import { useDeleteModal } from "../actionModals/useDeleteModal";
import { useEditTagsModal } from "../actionModals/useEditTagsModal";
import { useFeatureMutation } from "../actionModals/useFeatureMutation";
import { useExportToModal } from "../apps/useExportToModal";
import { ActionFunctionsType, ResourceScope } from "../types";
import { copyWorkflowsRequest, deleteWorkflowRequest } from "./workflows.api";
import { IWorkflow, WorkflowActions } from "./workflows.types";

export const useWorkflowSelectActions = ({ scope, selectedItems, resourceKeys, resetSelected }: { scope?: ResourceScope, selectedItems: IWorkflow[], resourceKeys: string[], resetSelected?: () => void }) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useSelector((state: RootState) => state.context.user)
  const isAdmin = user ? user.admin : false

  const featureMutation = useFeatureMutation({resource: 'workflows', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal<IWorkflow>({ resource: 'workflows', selected, updateFunction: copyWorkflowsRequest, 
  onSuccess: (res: any) => {
    toast.success("The workflow has been published successfully!")
    queryClient.invalidateQueries(resourceKeys).then(() => {
      if (Array.isArray(res.workflows)) {
        history.push(`/home/workflows/${res.workflows[0].uid}`)
      }
    }
    )
  }})

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal({
    resource: 'workflows',
    selected: { uid: `workflow-series-${selected[0]?.workflow_series_id}`, name: selected[0]?.name, tags: selected[0]?.tags },
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'workflows',
    selected: selected.map(s => ({ name: s.name, id: s.uid })),
    scope,
    request: deleteWorkflowRequest,
    onSuccess: () => {
      queryClient.invalidateQueries('workflows')
      history.push(`/home/workflows`)
      resetSelected && resetSelected()
    }
  })

  const {
    modalComp: exportToModal,
    setShowModal: setExportToModal,
    isShown: isShownExportToModal,
  } = useExportToModal({ selected: selected[0] })

  const links = selected[0]?.links

  let actions: ActionFunctionsType<WorkflowActions> = {
    'Run': {
      func: () => { },
      link: `${links?.show}/analyses/new`,
      isDisabled: selected.length !== 1 || !links?.run_workflow,
    },
    'Run Batch': {
      func: () => { },
      link: links?.batch_run_workflow,
      isDisabled: selected.length !== 1 || !links?.batch_run_workflow,
    },
    'Diagram': {
      func: () => { },
      link: links?.diagram,
      isDisabled: selected.length !== 1 || !links?.diagram,
    },
    'Edit': {
      func: () => { },
      link: links?.edit,
      isDisabled: selected.length !== 1 || !links?.edit,
    },
    'Fork': {
      func: () => { },
      link: links?.fork,
      isDisabled: selected.length !== 1 || !links?.fork,
    },
    'Export to': {
      func: () => setExportToModal(true),
      modal: exportToModal,
      showModal: isShownExportToModal,
      isDisabled: selected.length !== 1,
    },
    'Feature': {
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      hide: !isAdmin || scope !== 'everybody',
    },
    'Unfeature': {
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      hide: !isAdmin || scope !== 'everybody' && scope !== 'featured',
    },
    'Delete': {
      func: () => setDeleteModal(true),
      modal: deleteModal,
      showModal: isShownDeleteModal,
      hide: scope === 'spaces',
      isDisabled: selected.some((e) => !e.links?.delete) || selected.length === 0,
    },
    "Copy to space": {
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links?.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Comments': {
      func: () => { },
      link: `/workflows/${selected[0]?.uid}/comments`,
      isDisabled: false,
      hide: selected.length !== 1
    },
    'Edit tags': {
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      hide: (!isAdmin && selected[0]?.added_by !== user.full_name) || (selected.length !== 1)
    },
  }

  if(scope === 'spaces') {
    actions = pick(['Fork', 'Export to', 'Copy to space'], actions)
  }

  return actions
}
