import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { OBJECT_TYPES, useAttachToModal } from "../actionModals/useAttachToModal";
import { useDeleteModal } from "../actionModals/useDeleteModal";
import { useEditTagsModal } from "../actionModals/useEditTagsModal";
import { useFeatureMutation } from "../actionModals/useFeatureMutation";
import { ActionFunctionsType, ResourceScope } from "../types";
import { useDownloadAssetsModal } from "./actionModals/useDownloadAssetsModal";
import { useEditAssetModal } from "./actionModals/useEditAssetModal";
import { deleteAssetsRequest } from "./assets.api";
import { IAsset } from "./assets.types";
import { useAttachLicensesModal } from '../licenses/useAttachLicensesModal';
import { useDetachLicenseModal } from '../licenses/useDetachLicenseModal';
import { useQueryClient } from 'react-query';
import { useAcceptLicensesModal } from '../licenses/useAcceptLicensesModal';
import { pick } from 'ramda';

export enum AssetActions {
  "Rename" = "Rename",
  "Download" = "Download",
  "Feature" = "Feature",
  "Unfeature" = "Unfeature",
  "Make Public" = "Make Public",
  "Attach to..." = "Attach to...",
  "Delete" = "Delete",
  "Attach License" = "Attach License",
  "Detach License" = "Detach License",
  "Request license approval" = "Request license approval",
  "Accept License" = "Accept License",
  "Edit tags" = "Edit tags",
  "Comments" = "Comments",
}

export const useAssetActions = ({ scope, selectedItems, resourceKeys, resetSelected }: { scope?: ResourceScope, selectedItems: IAsset[], resourceKeys: string[], resetSelected?: () => void }) => {
  const queryClient = useQueryClient()
  const history = useHistory()
  const selected = selectedItems.filter(x => x !== undefined)
  const user = useSelector((state: RootState) => state.context.user)
  const isAdmin: boolean = user?.admin

  const featureMutation = useFeatureMutation({
    resource: 'assets',
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })
  const {
    modalComp: attachToModal,
    setShowModal: setAttachToModal,
    isShown: isShownAttachToModal,
  } = useAttachToModal(selected.map(s => s.id), OBJECT_TYPES.ASSET)
  const {
    modalComp: downloadModal,
    setShowModal: setDownloadModal,
    isShown: isShownDownloadModal,
  } = useDownloadAssetsModal(selected)
  const {
    modalComp: deleteModal,
    setShowModal: setDeleteModal,
    isShown: isShownDeleteModal,
  } = useDeleteModal({
    resource: 'assets',
    selected: selected.map(s => ({ id: s.uid, name: s.name })),
    scope,
    request: deleteAssetsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries('assets')
      history.push(`/home/assets`)
      resetSelected && resetSelected()
    }
  })
  const {
    modalComp: editModal,
    setShowModal: setEditModal,
    isShown: isShownEditModal,
  } = useEditAssetModal(selected[0])

  const {
    modalComp: tagsModal,
    setShowModal: setTagsModal,
    isShown: isShownTagsModal,
  } = useEditTagsModal<IAsset>({
    resource: 'assets',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })

  const {
    modalComp: attachLicensesModal,
    setShowModal: setAttachLicensesModal,
    isShown: isShownAttachLicensesModal,
  } = useAttachLicensesModal<IAsset>({
    resource: 'assets',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })

  const {
    modalComp: acceptLicensesModal,
    setShowModal: setAcceptLicensesModal,
    isShown: isShownAcceptLicensesModal,
  } = useAcceptLicensesModal<IAsset>({
    selected: selected[0],
    resource: 'assets',
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    },
  })

  const {
    modalComp: detachLicensesModal,
    setShowModal: setDetachLicensesModal,
    isShown: isShownDetachLicensesModal,
  } = useDetachLicenseModal<IAsset>({
    resource: 'assets',
    selected: selected[0],
    onSuccess: () => {
      queryClient.invalidateQueries(resourceKeys)
    }
  })

  const availableLicenses = user?.links?.licenses ? user.links.licenses : false


  let actions: ActionFunctionsType<AssetActions> = {
    "Rename": {
      isDisabled: selected.length !== 1,
      func: () => setEditModal(true),
      modal: editModal,
      showModal: isShownEditModal,
    },
    "Download": {
      isDisabled: selected.length === 0 || selected.some(e => !e.links?.download),
      func: () => setDownloadModal(true),
      modal: downloadModal,
      showModal: isShownDownloadModal,
    },
    "Feature": {
      func: () => {
        featureMutation.mutateAsync({ featured: true, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => !e.featured || !e.links.feature),
      hide: !isAdmin || scope !== 'everybody',
    },
    "Unfeature": {
      func: () => {
        featureMutation.mutateAsync({ featured: false, uids: selected.map(f => f.uid) })
      },
      isDisabled: selected.length === 0 || !selected.every(e => e.featured || !e.links.feature),
      hide: !isAdmin || (scope !== 'featured' && scope !== 'everybody'),
    },
    "Make Public": {
      func: () => { },
      isDisabled: selected.length !== 1 || !selected[0]?.links?.publish,
      link: {
        method: 'POST',
        url: `${selected[0]?.links?.publish}&scope=public`,
      }
    },
    "Attach to...": {
      isDisabled: selected.length === 0 || selected.some(e => !e?.links?.attach_to),
      func: () => setAttachToModal(true),
      modal: attachToModal,
      showModal: isShownAttachToModal,
    },
    "Delete": {
      isDisabled: selected.length !== 1 || !selected[0]?.links.remove,
      func: () => setDeleteModal(true),
      modal: deleteModal,
      showModal: isShownDeleteModal,
      hide: scope === 'spaces'
    },
    "Attach License": {
      isDisabled: selected.length !== 1 || !selected[0]?.links?.license || !availableLicenses,
      func: () => setAttachLicensesModal(true),
      modal: attachLicensesModal,
      showModal: isShownAttachLicensesModal,
    },
    "Detach License": {
      isDisabled: selected.length !== 1 ||
        !selected[0].links.license ||
        !availableLicenses,
      func: () => setDetachLicensesModal(true),
      modal: detachLicensesModal,
      showModal: isShownDetachLicensesModal,
      hide: selected.length !== 1 || !selected[0]?.links?.detach_license,
    },
    "Request license approval": {
      isDisabled: selected.length !== 1,
      func: () => { },
      link: selected[0]?.links.request_approval_license,
      hide: !selected[0]?.links.request_approval_license,
    },
    "Accept License": {
      func: () => setAcceptLicensesModal(true),
      modal: acceptLicensesModal,
      showModal: isShownAcceptLicensesModal,
      isDisabled: false,
      hide: selected.length !== 1 || !selected[0]?.links.accept_license_action,
    },
    'Edit tags': {
      func: () => setTagsModal(true),
      isDisabled: false,
      modal: tagsModal,
      showModal: isShownTagsModal,
      hide: (!isAdmin && selected[0]?.added_by !== user.full_name) || (selected.length !== 1)
    },
    "Comments": {
      isDisabled: selected.length !== 1,
      func: () => { },
      hide: selected.length !== 1,
      link: `/assets/${selected[0]?.uid}/comments`
    },
  }

  if(scope === 'spaces') {
    actions = pick(['Download', 'Attach to...'], actions)
  }

  return actions
}
