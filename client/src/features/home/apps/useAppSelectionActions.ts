import { useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { RootState } from "../../../store";
import { IUser } from "../../../types/user";
import { OBJECT_TYPES, useAttachToModal } from "../actionModals/useAttachToModal";
import { useAttachToChallengeModal } from "./useAttachToChallengeModal";
import { useCopyToSpaceModal } from "../actionModals/useCopyToSpace";
import { useDeleteModal } from "../actionModals/useDeleteModal";
import { useEditTagsModal } from "../actionModals/useEditTagsModal";
import { useFeatureMutation } from "../actionModals/useFeatureMutation";
import { ActionFunctionsType, ResourceScope } from "../types";
import { copyAppsRequest, deleteAppsRequest } from "./apps.api";
import { IApp } from "./apps.types";
import { useExportToModal } from "./useExportToModal";
import { useComparatorModal } from "../comparators/useComparatorModal";
import { pick } from "ramda";

export enum AppActions {
  "Run" = "Run",
  "Run batch" = "Run batch",
  "Track" = "Track",
  "Edit" = "Edit",
  "Fork" = "Fork",
  "Export to" = "Export to",
  "Make public" = "Make public",
  "Feature" = "Feature",
  "Unfeature" = "Unfeature",
  "Delete" = "Delete",
  "Copy to space" = "Copy to space",
  "Attach to..." = "Attach to...",
  "Comments" = "Comments",
  'Set as Challenge App' = 'Set as Challenge App',
  "Edit tags" = "Edit tags",
  'Add to Comparators' = 'Add to Comparators',
  'Set this app as comparison default' = 'Set this app as comparison default',
  'Remove from Comparators' = 'Remove from Comparators',
}

export const useAppSelectionActions = ({ scope, selectedItems, resourceKeys, resetSelected, comparatorLinks }: { scope?: ResourceScope, selectedItems: IApp[], resourceKeys: string[], resetSelected?: () => void, comparatorLinks: {[key: string]: string} }) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)
  const user: IUser = useSelector((state: RootState) => state.context.user)
  const isAdmin: boolean = user?.admin

  const featureMutation = useFeatureMutation({resource: 'apps', onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})

  const {
    modalComp: comparatorAddModal,
    setShowModal: setShowComparatorAddModal,
    isShown: isShownComparatorAddModal,
  } = useComparatorModal({ actionType: 'add_to_comparators', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})
  const {
    modalComp: comparatorSetModal,
    setShowModal: setShowComparatorSetModal,
    isShown: isShownComparatorSetModal,
  } = useComparatorModal({ actionType: 'set_app', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})
  const {
    modalComp: comparatorRemoveModal,
    setShowModal: setShowComparatorRemoveModal,
    isShown: isShownComparatorRemoveModal,
  } = useComparatorModal({ actionType: 'remove_from_comparators', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})

  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(selected.map(s => s.id), OBJECT_TYPES.APP)

  const {
    modalComp: copyToSpaceModal,
    setShowModal: setCopyToSpaceModal,
    isShown: isShownCopyToSpaceModal,
  } = useCopyToSpaceModal<IApp>({ resource: 'apps', selected, updateFunction: copyAppsRequest, onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})

  const {
    modalComp: attachToChallengeModal,
    setShowModal: setAttachToChallengeModal,
    isShown: isShownAttachToChallengeModal,
  } = useAttachToChallengeModal<IApp>({ resource: 'apps', selected: selected[0], onSuccess: () => {
    queryClient.invalidateQueries(resourceKeys)
  }})

  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'apps',
    selected: selected.map(s => ({ name: s.name, id: s.uid })),
    scope,
    request: deleteAppsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries('apps')
      history.push(`/home/apps`)
      resetSelected && resetSelected()
    }
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
    }
  })

  const {
    modalComp: exportToModal,
    setShowModal: setExportToModal,
    isShown: isShownExportToModal,
  } = useExportToModal({ selected: selected[0] })

  let actions: ActionFunctionsType<AppActions> = {
    "Run": {
      func: () => { },
      link: `/apps/${selected[0]?.uid}/jobs/new`,
      isDisabled: selected.length !== 1 || !selected[0].links.run_job,
    },
    "Run batch": {
      func: () => { },
      link: `/apps/${selected[0]?.uid}/batch_app`,
      isDisabled: selected.length !== 1 || !selected[0].links.batch_run,
    },
    "Track": {
      func: () => { },
      link: selected[0]?.links?.track,
      isDisabled: selected.length !== 1 || !selected[0].links.track,
    },
    "Edit": {
      func: () => { },
      link: selected[0]?.links?.edit,
      isDisabled: selected.length !== 1 || !selected[0].links.edit,
    },
    "Fork": {
      func: () => { },
      link: selected[0]?.links?.fork,
      isDisabled: selected.length !== 1 || !selected[0].links.fork,
    },
    "Export to": {
      func: () => setExportToModal(true),
      modal: exportToModal,
      showModal: isShownExportToModal,
      isDisabled: selected.length !== 1,
    },
    "Make public": {
      func: () => { },
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      },
      isDisabled: selected.length !== 1 || !selected[0].links.publish,
      hide: selected[0]?.location !== 'Private'
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
      isDisabled: selected.some((e) => !e.links.delete) || selected.length === 0,
      modal: deleteModal,
      showModal: isShownDeleteModal,
    },
    "Copy to space": {
      func: () => setCopyToSpaceModal(true),
      isDisabled:
        selected.length === 0 || selected.some(e => !e.links.copy),
      modal: copyToSpaceModal,
      showModal: isShownCopyToSpaceModal,
    },
    'Attach to...': {
      func: () => setAttachToModal(true),
      isDisabled:
        selected.length === 0 ||
        selected.some(e => !e.links.attach_to),
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    "Comments": {
      func: () => { },
      link: `/apps/${selected[0]?.uid}/comments`,
      isDisabled: selected.length !== 1
    },
    'Set as Challenge App': {
      func: () => setAttachToChallengeModal(true),
      isDisabled: selected.length !== 1,
      modal: attachToChallengeModal,
      showModal: isShownAttachToChallengeModal,
      hide: !selected[0]?.links?.assign_app,
    },
    'Edit tags': {
      func: () => setTagsModal(true),
      isDisabled: selected.length !== 1,
      modal: tagsModal,
      showModal: isShownTagsModal,
      hide: (!isAdmin && selected[0]?.added_by !== user.dxuser) || (selected.length !== 1)
    },
    'Add to Comparators': {
      func: () => setShowComparatorAddModal(true, 'add_to_comparators'),
      isDisabled: false,
      hide: !comparatorLinks?.add_to_comparators,
      showModal: isShownComparatorAddModal,
      modal: comparatorAddModal,
    },
    'Set this app as comparison default': {
      func: () => setShowComparatorSetModal(true, 'set_app'),
      isDisabled: false,
      hide: !comparatorLinks?.set_app,
      showModal: isShownComparatorSetModal,
      modal: comparatorSetModal,
    },
    'Remove from Comparators': {
      func: () => setShowComparatorRemoveModal(true, 'remove_from_comparators'),
      isDisabled: false,
      hide: !comparatorLinks?.remove_from_comparators,
      showModal: isShownComparatorRemoveModal,
      modal: comparatorRemoveModal,
    }
  }

  if(scope === 'spaces') {
    actions = pick(['Copy to space', 'Attach to...'], actions)
  }

  return actions
}
