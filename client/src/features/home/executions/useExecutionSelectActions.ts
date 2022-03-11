import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { OBJECT_TYPES, useAttachToModal } from "../actionModals/useAttachToModal";
import { useCopyToSpaceModal } from "../actionModals/useCopyToSpace";
import { useEditTagsModal } from "../actionModals/useEditTagsModal";
import { useFeatureMutation } from "../actionModals/useFeatureMutation";
import { useTerminateModal } from "./useTerminateModal";
import { ActionFunctionsType, ResourceScope } from "../types";
import { copyJobsRequest } from "./executions.api";
import { IExecution } from "./executions.types";
import { pick } from "ramda";

export enum ExecutionAction {
  "View Logs" = "View Logs",
  "Terminate" = "Terminate",
  "Track" = "Track",
  "Copy to space" = "Copy to space",
  "Feature" = "Feature",
  "Unfeature" = "Unfeature",
  "Make Public" = "Make Public",
  "Attach to..." = "Attach to...",
  "Comments" = "Comments",
  "Edit tags" = "Edit tags",
}

export const useExecutionActions = ({ scope, selectedItems, resourceKeys }: { scope?: ResourceScope, selectedItems: IExecution[], resourceKeys: string[]}) => {
  const queryClient = useQueryClient()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useSelector((state: RootState) => state.context.user)
  const isAdmin = user ? user.admin : false

  const featureMutation = useFeatureMutation({resource: 'jobs', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal({
    resource: 'jobs',
    selected: selected.map(s => ({ id: s.uid })),
    updateFunction: copyJobsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IExecution>({
    resource: 'jobs', selected: selected[0], onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })
// "Items need to be an array of objects with id and type (one of App, Comparison, Job, or UserFile)"
  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(selected.map(s => s.id), OBJECT_TYPES.JOB)

  const {
    modalComp: terminateoModal,
    setShowModal: setTerminateModal,
    isShown: isShownTerminateModal,
  } = useTerminateModal({ selected })

  const attachLicenseMutation = useMutation({ mutationFn: async (id: string) => { } })

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false
  const links = selected[0]?.links

  let actions: ActionFunctionsType<ExecutionAction> = {
    "View Logs": {
      func: () => { },
      link: links?.log,
      isDisabled: selected.length !== 1 || !links.log,
    },
    "Terminate": {
      func: () => setTerminateModal(true),
      isDisabled: selected.length !== 1,
      modal: terminateoModal,
      showModal: isShownTerminateModal,
    },
    "Track": {
      func: () => { },
      link: links?.track,
      isDisabled: selected.length !== 1 || !links.track,
    },
    "Copy to space": {
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links?.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    "Feature": {
      func: () => featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      hide: !isAdmin || scope !== 'everybody',
    },
    "Unfeature": {
      func: () => featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) }),
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      hide: !isAdmin || scope !== 'everybody' && scope !== 'featured',
    },
    "Make Public": {
      func: () => { },
      isDisabled: selected.length !== 1 || !selected[0]?.links?.publish || (selected[0].jobs && selected[0].scope === 'private'),
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      }
    },
    "Attach to...": {
      func: () => setAttachToModal(true),
      isDisabled: selected.length === 0 || selected.some(e => !e.links?.attach_to),
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    "Comments": {
      func: () => { },
      isDisabled: selected.length !== 1,
      link: `/jobs/${selected[0]?.uid}/comments`
    },
    "Edit tags": {
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      hide: (!isAdmin && selected[0]?.launched_by !== user.full_name) || (selected.length !== 1)
    },
  }

  if(scope === 'spaces') {
    actions = pick(['Terminate', 'Copy to space', 'Attach to...'], actions)
  }

  return actions
}
